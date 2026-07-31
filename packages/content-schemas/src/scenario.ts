import Ajv2020, { type ErrorObject } from "ajv/dist/2020";

import scenarioSchema from "../../../content/schemas/scenario.schema.json";

export interface Scenario {
  schemaVersion: 1;
  id: string;
  modeId: string;
  status: "draft" | "published" | "deprecated";
  difficulty: Array<"a2" | "b1" | "b2" | "c1">;
  durationMinutes: number;
  titleKey: string;
  summaryKey: string;
  objectiveKey: string;
  roles: {
    learner: string;
    tutor: string;
  };
  promptTemplateId: string;
  tags: string[];
}

export interface ContentValidationError {
  path: string;
  message: string;
}

export type ContentValidationResult<T> =
  { ok: true; value: T } | { ok: false; errors: ContentValidationError[] };

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
});
const validateScenario = ajv.compile<Scenario>(scenarioSchema);

function toPublicError(error: ErrorObject): ContentValidationError {
  return {
    path: error.instancePath || "/",
    message: error.message ?? "invalid content",
  };
}

export function parseScenario(
  input: unknown,
): ContentValidationResult<Scenario> {
  if (validateScenario(input)) {
    return { ok: true, value: input };
  }
  return {
    ok: false,
    errors: (validateScenario.errors ?? []).map(toPublicError),
  };
}
