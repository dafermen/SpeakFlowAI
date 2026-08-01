/** Construye una revisión local cuando la API no puede guardar una práctica. */

import type {
  CompleteSessionInput,
  PracticeSessionReview,
  SessionFeedback,
} from "@speakflow/api-client";

/**
 * Genera feedback pedagógico básico exclusivamente a partir de turnos locales.
 *
 * @param input Sesión terminada que todavía no pudo persistirse.
 * @returns Feedback que permite continuar el flujo sin simular un guardado remoto.
 */
export function buildFallbackFeedback(
  input: CompleteSessionInput,
): SessionFeedback {
  const learnerTurns = input.turns.filter((turn) => turn.speaker === "learner");
  const wordCount = learnerTurns
    .flatMap((turn) => turn.text.trim().split(/\s+/))
    .filter(Boolean).length;

  if (learnerTurns.length === 0) {
    return {
      summary:
        "La sesión terminó antes de registrar una intervención completa.",
      strength: "Abriste el espacio de práctica y preparaste el escenario.",
      focus_area:
        "En la próxima sesión, intenta responder al menos dos preguntas.",
      corrections: [],
      vocabulary: [],
      improved_phrases: ["Could you repeat the question, please?"],
      observations: [
        {
          category: "next_step",
          note: "Completa dos turnos breves en voz alta.",
        },
      ],
    };
  }

  return {
    summary: `Completaste ${learnerTurns.length} intervenciones en inglés.`,
    strength:
      wordCount >= 20
        ? "Sostuviste la conversación con respuestas fáciles de seguir."
        : "Respondiste de forma directa y mantuviste el intercambio en movimiento.",
    focus_area:
      "Conecta tus ideas con “because”, “so” y “then” para ganar fluidez.",
    corrections: [],
    vocabulary: [],
    improved_phrases: [
      "Could you please clarify that?",
      "Let me explain that in another way.",
    ],
    observations: [
      {
        category: "fluency",
        note: `Produjiste aproximadamente ${wordCount} palabras durante la práctica.`,
      },
    ],
  };
}

/**
 * Completa una revisión local con identificador temporal y conteos de turnos.
 *
 * El prefijo `local-` permite distinguir esta copia recuperable de una sesión
 * confirmada por la API.
 */
export function buildFallbackReview(
  input: CompleteSessionInput,
): PracticeSessionReview {
  return {
    ...input,
    id: `local-${Date.now()}`,
    learner_turn_count: input.turns.filter((turn) => turn.speaker === "learner")
      .length,
    tutor_turn_count: input.turns.filter((turn) => turn.speaker === "tutor")
      .length,
    feedback: buildFallbackFeedback(input),
  };
}
