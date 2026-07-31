import { describe, expect, it } from "vitest";

import { parseScenario } from "./scenario";
import { parseLearningModeCatalog } from "./learningMode";
import learningModes from "../../../content/learning-modes/learning-modes.json";
import dailyScenario from "../../../content/scenarios/daily-conversation.json";
import interviewScenario from "../../../content/scenarios/software-interviews.json";

const validScenario = {
  schemaVersion: 1,
  id: "scenario.workplace.daily-standup",
  modeId: "mode.workplace",
  status: "published",
  difficulty: ["b1", "b2"],
  durationMinutes: 8,
  titleKey: "scenario.workplace.dailyStandup.title",
  summaryKey: "scenario.workplace.dailyStandup.summary",
  objectiveKey: "scenario.workplace.dailyStandup.objective",
  roles: {
    learner: "team-member",
    tutor: "facilitator",
  },
  promptTemplateId: "prompt.roleplay.workplace.v1",
  tags: ["workplace", "meetings"],
};

describe("parseScenario", () => {
  it("accepts a portable scenario contract", () => {
    const result = parseScenario(validScenario);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("scenario.workplace.daily-standup");
    }
  });

  it("returns controlled errors for invalid content", () => {
    const result = parseScenario({
      ...validScenario,
      id: "Daily Standup",
      durationMinutes: 90,
      privateInstructions: "not allowed",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      expect(result.errors.every((error) => error.message.length > 0)).toBe(
        true,
      );
    }
  });

  it("validates the checked-in content catalog", () => {
    expect(parseLearningModeCatalog(learningModes).ok).toBe(true);
    expect(parseScenario(dailyScenario).ok).toBe(true);
    expect(parseScenario(interviewScenario).ok).toBe(true);
  });
});
