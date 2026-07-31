import { describe, expect, it, vi } from "vitest";

import { SpeakFlowApiClient, type LearnerProfileInput } from "./learnerProfile";

const profile: LearnerProfileInput = {
  display_name: "Alex",
  native_language: "es",
  english_level: "b1",
  goals: ["conversation"],
  topics: ["technology"],
  preferred_feedback_style: "balanced",
  tutor_voice_id: "voice-calm-1",
  speaking_speed: "normal",
};

describe("SpeakFlowApiClient", () => {
  it("saves the local profile through the backend boundary", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          ...profile,
          id: "00000000-0000-4000-8000-000000000001",
          updated_at_utc: "2026-07-31T00:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await new SpeakFlowApiClient(
      "http://api.test",
      fetcher,
    ).saveLocalProfile(profile);

    expect(result.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledWith(
      "http://api.test/api/v1/learner-profile",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("returns a controlled network error", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("offline"));

    await expect(
      new SpeakFlowApiClient("http://api.test", fetcher).getLocalProfile(),
    ).resolves.toEqual({ ok: false, error: "network" });
  });

  it("completes a practice session through the backend boundary", async () => {
    const response = {
      id: "session-1",
      scenario_id: "scenario.daily.coffee-shop",
      mode_id: "mode.daily-conversation",
      provider: "deterministic" as const,
      difficulty: "b1" as const,
      duration_seconds: 25,
      started_at_utc: "2026-07-31T00:00:00Z",
      ended_at_utc: "2026-07-31T00:00:25Z",
      retain_transcript: false,
      input_tokens: 0,
      output_tokens: 0,
      turns: [],
      learner_turn_count: 0,
      tutor_turn_count: 0,
      feedback: {
        summary: "Sesión completada.",
        strength: "Seguiste hablando.",
        focus_area: "Conecta tus ideas.",
        corrections: [],
        vocabulary: [],
        improved_phrases: [],
        observations: [],
      },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new SpeakFlowApiClient("http://api.test", fetcher);

    const result = await client.completeSession({ ...response, turns: [] });

    expect(result).toEqual({ ok: true, value: response });
    expect(fetcher).toHaveBeenCalledWith(
      "http://api.test/api/v1/sessions",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("loads the aggregate progress endpoint", async () => {
    const progress = {
      total_sessions: 2,
      total_minutes: 12,
      learner_turns: 5,
      current_streak_days: 2,
      sessions_by_mode: [],
      focus_areas: [],
      recent_sessions: [],
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify(progress), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      new SpeakFlowApiClient("http://api.test", fetcher).getProgress(),
    ).resolves.toEqual({ ok: true, value: progress });
    expect(fetcher).toHaveBeenCalledWith(
      "http://api.test/api/v1/sessions/progress",
      undefined,
    );
  });
});
