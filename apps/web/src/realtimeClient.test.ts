import { describe, expect, it, vi } from "vitest";

import {
  WebRtcRealtimeClient,
  fetchWithBrowserContext,
  interpretRealtimeEvent,
  normalizeLearnerTranscript,
  normalizeRealtimeError,
  normalizeRealtimeStartError,
  shouldRetryBasicMicrophone,
} from "./realtimeClient";

describe("Realtime event interpreter", () => {
  it("maps connection states without exposing provider details", () => {
    expect(
      interpretRealtimeEvent({ type: "input_audio_buffer.speech_stopped" }),
    ).toEqual({ state: "processing" });
    expect(
      interpretRealtimeEvent({ type: "output_audio_buffer.started" }),
    ).toEqual({ state: "speaking" });
    expect(
      interpretRealtimeEvent({ type: "output_audio_buffer.cleared" }),
    ).toEqual({ state: "listening" });
  });

  it("normalizes learner and tutor transcripts", () => {
    expect(
      interpretRealtimeEvent({
        type: "conversation.item.input_audio_transcription.completed",
        item_id: "learner-1",
        transcript: "I would like a coffee.",
      }),
    ).toEqual({
      transcript: {
        id: "learner-1",
        speaker: "learner",
        text: "I would like a coffee.",
        final: true,
      },
    });
    expect(
      interpretRealtimeEvent({
        type: "response.output_audio_transcript.delta",
        response_id: "response-1",
        delta: "What size",
      }),
    ).toEqual({
      transcript: {
        id: "response-1",
        speaker: "tutor",
        text: "What size",
        final: false,
      },
    });
  });

  it("replaces learner transcripts written in an incompatible script", () => {
    expect(normalizeLearnerTranscript("카푸치노")).toBe(
      "No pude transcribir este turno en inglés. Inténtalo otra vez.",
    );
    expect(normalizeLearnerTranscript("我要一杯咖啡")).toBe(
      "No pude transcribir este turno en inglés. Inténtalo otra vez.",
    );
    expect(normalizeLearnerTranscript(" I would like a cappuccino. ")).toBe(
      "I would like a cappuccino.",
    );
  });

  it("extracts usage for cost visibility", () => {
    expect(
      interpretRealtimeEvent({
        type: "response.done",
        response: {
          usage: { input_tokens: 100, output_tokens: 25, total_tokens: 125 },
        },
      }),
    ).toEqual({
      usage: { inputTokens: 100, outputTokens: 25, totalTokens: 125 },
    });
  });

  it("turns provider errors into safe, actionable categories", () => {
    expect(normalizeRealtimeError({ code: "rate_limit_exceeded" })).toBe(
      "provider_rate_limit",
    );
    expect(normalizeRealtimeError({ type: "insufficient_quota" })).toBe(
      "provider_quota",
    );
    expect(normalizeRealtimeError({ code: "session_expired" })).toBe(
      "connection_lost",
    );
    expect(normalizeRealtimeError({ code: "unexpected_provider_detail" })).toBe(
      "provider_error",
    );
  });

  it("does not expose raw provider error codes", () => {
    expect(
      interpretRealtimeEvent({
        type: "error",
        error: { code: "arbitrary_internal_provider_code" },
      }),
    ).toEqual({ error: "provider_error" });
  });

  it("classifies microphone failures before the API request", () => {
    expect(
      normalizeRealtimeStartError(
        new DOMException("Device is busy", "NotReadableError"),
        "microphone",
      ),
    ).toBe("microphone_unavailable");
    expect(
      normalizeRealtimeStartError(
        new DOMException("No device", "NotFoundError"),
        "microphone",
      ),
    ).toBe("microphone_not_found");
    expect(
      normalizeRealtimeStartError(
        new TypeError("No mediaDevices"),
        "microphone",
      ),
    ).toBe("microphone_unsupported");
  });

  it("retries unsupported enhanced microphone constraints with basic audio", () => {
    expect(
      shouldRetryBasicMicrophone(
        new DOMException("Unsupported constraint", "OverconstrainedError"),
      ),
    ).toBe(true);
    expect(
      shouldRetryBasicMicrophone(
        new DOMException("Device is busy", "NotReadableError"),
      ),
    ).toBe(false);
  });

  it("classifies failures in each WebRTC startup stage", () => {
    expect(
      normalizeRealtimeStartError(
        new TypeError("Failed to fetch"),
        "api-request",
      ),
    ).toBe("api_unreachable");
    expect(
      normalizeRealtimeStartError(
        new DOMException("Invalid SDP", "OperationError"),
        "webrtc-negotiation",
      ),
    ).toBe("webrtc_negotiation_failed");
  });

  it("calls browser fetch with the global receiver", async () => {
    const receiverSensitiveFetch = function (this: unknown): Promise<Response> {
      if (this !== globalThis) throw new TypeError("Illegal invocation");
      return Promise.resolve(new Response(null, { status: 204 }));
    } as unknown as typeof fetch;

    const response = await fetchWithBrowserContext(
      receiverSensitiveFetch,
      "http://api.test/health",
    );

    expect(response.status).toBe(204);
  });

  it("cancels generation and clears buffered audio on deliberate interruption", () => {
    const send = vi.fn();
    const client = new WebRtcRealtimeClient({
      onError: vi.fn(),
      onStateChange: vi.fn(),
      onTranscript: vi.fn(),
      onUsage: vi.fn(),
    });
    Object.defineProperty(client, "dataChannel", {
      value: { readyState: "open", send },
    });

    client.interruptTutor();

    expect(send.mock.calls.map(([message]) => JSON.parse(message))).toEqual([
      { type: "response.cancel" },
      { type: "output_audio_buffer.clear" },
    ]);
  });
});
