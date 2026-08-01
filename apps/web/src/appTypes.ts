/** Contratos compartidos por el orquestador y las pantallas de la aplicación. */

import type {
  CompleteSessionInput,
  SessionTurnInput,
  SpeakFlowApiClient,
} from "@speakflow/api-client";
import type { PreferencesStorage } from "@speakflow/configuration";

/** Pantallas posibles de la navegación local; no se usa un router externo. */
export type View =
  "home" | "catalog" | "setup" | "session" | "review" | "progress" | "settings";

/** Porción del cliente HTTP que necesita la interfaz, útil para inyectar dobles. */
export type ApiClient = Pick<
  SpeakFlowApiClient,
  "saveLocalProfile" | "completeSession" | "getProgress"
>;

/** Dependencias opcionales que permiten probar App sin red ni navegador real. */
export interface AppProps {
  apiClient?: ApiClient;
  storage?: PreferencesStorage;
}

/** Decisiones del alumno necesarias para iniciar una práctica. */
export interface SessionSetup {
  scenarioId: string;
  difficulty: "a2" | "b1" | "b2" | "c1";
  duration: number;
  provider: "realtime" | "deterministic";
}

/** Resultado neutral producido tanto por el tutor local como por WebRTC. */
export interface CompletedSession {
  setup: SessionSetup;
  startedAtUtc: string;
  endedAtUtc: string;
  turns: SessionTurnInput[];
  inputTokens: number;
  outputTokens: number;
}

/** Sesión pendiente que puede reintentarse después de un fallo de API. */
export type PendingSession = CompleteSessionInput | null;

/** Origen público de FastAPI; nunca contiene credenciales. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
