/** Contrato y validador del contenido JSON que define una situación de práctica. */

import Ajv2020, { type ErrorObject } from "ajv/dist/2020";

import scenarioSchema from "../../../content/schemas/scenario.schema.json";

/** Escenario publicado que la web puede presentar y ejecutar. */
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

/** Error seguro con ruta JSON y mensaje comprensible para desarrollo. */
export interface ContentValidationError {
  path: string;
  message: string;
}

/** Resultado discriminado compartido por todos los validadores de contenido. */
export type ContentValidationResult<T> =
  { ok: true; value: T } | { ok: false; errors: ContentValidationError[] };

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
});
const validateScenario = ajv.compile<Scenario>(scenarioSchema);

/** Elimina detalles internos de AJV antes de exponer un error al consumidor. */
function toPublicError(error: ErrorObject): ContentValidationError {
  return {
    path: error.instancePath || "/",
    message: error.message ?? "invalid content",
  };
}

/**
 * Valida un valor desconocido contra el JSON Schema oficial de escenario.
 *
 * @returns El mismo valor ya tipado o todos los errores encontrados por AJV.
 */
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
