import Ajv2020 from "ajv/dist/2020";

import learningModeSchema from "../../../content/schemas/learning-mode.schema.json";
import type { ContentValidationResult } from "./scenario";

export interface LearningMode {
  schemaVersion: 1;
  id: string;
  titleKey: string;
  summaryKey: string;
  icon: "conversation" | "workplace" | "support" | "interview";
  recommended: boolean;
}

const validator = new Ajv2020({
  allErrors: true,
  strict: true,
}).compile<LearningMode>(learningModeSchema);

export function parseLearningMode(
  input: unknown,
): ContentValidationResult<LearningMode> {
  if (validator(input)) {
    return { ok: true, value: input };
  }
  return {
    ok: false,
    errors: (validator.errors ?? []).map((error) => ({
      path: error.instancePath || "/",
      message: error.message ?? "invalid content",
    })),
  };
}

export function parseLearningModeCatalog(
  input: unknown,
): ContentValidationResult<LearningMode[]> {
  if (!Array.isArray(input)) {
    return { ok: false, errors: [{ path: "/", message: "must be an array" }] };
  }
  const parsed = input.map(parseLearningMode);
  const errors = parsed.flatMap((result, index) =>
    result.ok
      ? []
      : result.errors.map((error) => ({
          path: `/${index}${error.path}`,
          message: error.message,
        })),
  );
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: parsed.flatMap((result) => (result.ok ? [result.value] : [])),
  };
}
