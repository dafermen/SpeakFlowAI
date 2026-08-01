/** Tutor local reproducible que permite practicar sin red ni proveedor de IA. */

import type { Scenario } from "@speakflow/content-schemas";

/** Turno mínimo que renderiza la conversación determinista. */
export interface TutorTurn {
  id: number;
  speaker: "learner" | "tutor";
  text: string;
}

const openings: Record<string, string> = {
  "scenario.daily.coffee-shop":
    "Hi! Welcome in. What would you like to order today?",
  "scenario.workplace.daily-standup":
    "Good morning. Could you share what you completed yesterday?",
  "scenario.it-support.printer-offline":
    "Hi, my printer shows offline and I cannot print. Can you help me?",
  "scenario.interview.backend-role":
    "Thanks for joining. Tell me about a backend system you helped design.",
};

const replies: Record<string, string[]> = {
  "scenario.daily.coffee-shop": [
    "Of course. What size would you prefer?",
    "Great choice. Would you like anything else with that?",
    "Perfect. Your order will be ready shortly. Thank you!",
  ],
  "scenario.workplace.daily-standup": [
    "Thanks. What is your main priority for today?",
    "Understood. Is anything blocking your progress?",
    "That is clear. I will note the next step for the team.",
  ],
  "scenario.it-support.printer-offline": [
    "The cable looks connected. What should I check next?",
    "I can see the printer now, but the queue is paused.",
    "It is working again. Thanks for explaining each step clearly.",
  ],
  "scenario.interview.backend-role": [
    "What trade-off influenced that design decision?",
    "How did you measure whether the solution worked?",
    "What would you change if you built it again today?",
  ],
};

/**
 * Crea el saludo inicial correspondiente al escenario elegido.
 *
 * @param scenario Contenido validado que identifica la situación de práctica.
 * @returns Primer turno del tutor con ID cero.
 */
export function openingFor(scenario: Scenario): TutorTurn {
  return {
    id: 0,
    speaker: "tutor",
    text: openings[scenario.id] ?? "Hello. What would you like to practice?",
  };
}

/**
 * Selecciona una respuesta predecible según el número de turnos del alumno.
 *
 * Las respuestas rotan cuando la conversación supera el guion. Esto mantiene la
 * demo funcional sin introducir aleatoriedad que vuelva frágiles las pruebas.
 */
export function replyFor(
  scenario: Scenario,
  learnerTurnCount: number,
): TutorTurn {
  const options = replies[scenario.id] ?? [
    "Thank you. Could you tell me a little more?",
  ];
  const text = options[(learnerTurnCount - 1) % options.length]!;
  return { id: learnerTurnCount * 2, speaker: "tutor", text };
}
