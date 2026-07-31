import type { LearningMode, Scenario } from "@speakflow/content-schemas";

import learningModes from "../../../content/learning-modes/learning-modes.json";
import coffeeShop from "../../../content/scenarios/daily-conversation.json";
import printerOffline from "../../../content/scenarios/it-support.json";
import backendInterview from "../../../content/scenarios/software-interviews.json";
import dailyStandup from "../../../content/scenarios/workplace.json";

export const modes = learningModes as LearningMode[];
export const scenarios = [
  coffeeShop,
  dailyStandup,
  printerOffline,
  backendInterview,
] as Scenario[];

const copy: Record<string, string> = {
  "mode.conversation.title": "Conversación diaria",
  "mode.conversation.summary": "Gana soltura en situaciones cotidianas.",
  "mode.workplace.title": "Inglés laboral",
  "mode.workplace.summary": "Participa con claridad en reuniones y equipos.",
  "mode.itSupport.title": "Soporte de TI",
  "mode.itSupport.summary": "Explica problemas y guía soluciones técnicas.",
  "mode.softwareInterview.title": "Entrevistas de software",
  "mode.softwareInterview.summary":
    "Practica respuestas técnicas con estructura y confianza.",
  "scenario.daily.coffeeShop.title": "Pedir en una cafetería",
  "scenario.daily.coffeeShop.summary":
    "Pide una bebida, aclara opciones y cierra la conversación.",
  "scenario.daily.coffeeShop.objective":
    "Completar un pedido natural usando preguntas de cortesía.",
  "scenario.workplace.dailyStandup.title": "Actualización diaria",
  "scenario.workplace.dailyStandup.summary":
    "Comparte avances, próximos pasos y un bloqueo.",
  "scenario.workplace.dailyStandup.objective":
    "Dar una actualización breve y fácil de seguir.",
  "scenario.itSupport.printerOffline.title": "Impresora sin conexión",
  "scenario.itSupport.printerOffline.summary":
    "Diagnostica el problema con preguntas simples.",
  "scenario.itSupport.printerOffline.objective":
    "Guiar a una persona hasta recuperar la conexión.",
  "scenario.interview.backendRole.title": "Entrevista backend",
  "scenario.interview.backendRole.summary":
    "Explica decisiones técnicas y experiencias reales.",
  "scenario.interview.backendRole.objective":
    "Responder con contexto, decisión, resultado y aprendizaje.",
};

export function translate(key: string): string {
  return copy[key] ?? key;
}

export function findScenario(id: string): Scenario {
  return scenarios.find((scenario) => scenario.id === id) ?? scenarios[0]!;
}

export const modeIcons = {
  conversation: "💬",
  workplace: "🏢",
  support: "🛠️",
  interview: "⌨️",
} as const;
