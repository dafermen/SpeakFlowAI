import { describe, expect, it } from "vitest";

import {
  interpretRealtimeEvent,
  normalizeRealtimeError,
} from "./realtimeClient";

describe("Realtime event interpreter", () => {
  it("maps connection states without exposing provider details", () => {
    expect(
      interpretRealtimeEvent({ type: "input_audio_buffer.speech_stopped" }),
    ).toEqual({ state: "processing" });
    expect(
      interpretRealtimeEvent({ type: "output_audio_buffer.started" }),
    ).toEqual({ state: "speaking" });
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
});
