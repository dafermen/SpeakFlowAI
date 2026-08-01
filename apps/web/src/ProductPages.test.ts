import type { LearnerProgress } from "@speakflow/api-client";
import { DEFAULT_PREFERENCES } from "@speakflow/configuration";
import { describe, expect, it } from "vitest";

import { recommendPractice } from "./ProductPages";

describe("recommendPractice", () => {
  it("resumes the last choice before the learner has history", () => {
    const recommendation = recommendPractice(
      {
        ...DEFAULT_PREFERENCES,
        lastScenarioId: "scenario.it-support.printer-offline",
      },
      null,
    );

    expect(recommendation.scenario.id).toBe(
      "scenario.it-support.printer-offline",
    );
    expect(recommendation.reason).toMatch(/Retoma/);
  });

  it("recommends a mode with less practice when history exists", () => {
    const progress: LearnerProgress = {
      total_sessions: 3,
      total_minutes: 18,
      learner_turns: 12,
      current_streak_days: 2,
      sessions_by_mode: [{ id: "mode.conversation", count: 3 }],
      focus_areas: [],
      recent_sessions: [],
    };

    const recommendation = recommendPractice(DEFAULT_PREFERENCES, progress);

    expect(recommendation.scenario.modeId).not.toBe("mode.conversation");
    expect(recommendation.reason).toMatch(/equilibrar/);
  });
});
