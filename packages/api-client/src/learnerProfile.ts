/** Cliente HTTP tipado que mantiene a React independiente de `fetch` y FastAPI. */

import type {
  CompleteSessionInput,
  LearnerProgress,
  PracticeSessionReview,
  SessionSummary,
} from "./practiceSessions";

/** Datos editables que la API acepta para el perfil local. */
export interface LearnerProfileInput {
  display_name: string | null;
  native_language: string;
  english_level: "a2" | "b1" | "b2" | "c1" | "unsure";
  goals: string[];
  topics: string[];
  preferred_feedback_style: string;
  tutor_voice_id: string;
  speaking_speed: "slow" | "normal" | "fast";
}

/** Perfil confirmado por la API con identidad y fecha de actualización. */
export interface LearnerProfile extends LearnerProfileInput {
  id: string;
  updated_at_utc: string;
}

/**
 * Resultado discriminado de una llamada HTTP.
 *
 * Los consumidores comprueban `ok` y no necesitan capturar excepciones de red o JSON.
 */
export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: "network" | "invalid-response" | "server" };

type Fetcher = typeof fetch;

/** Fachada de las rutas públicas de SpeakFlowAI. */
export class SpeakFlowApiClient {
  /**
   * Crea un cliente configurable y fácil de sustituir en pruebas.
   *
   * @param baseUrl Origen del backend, inyectable para pruebas y despliegues.
   * @param fetcher Implementación de `fetch`; las pruebas proporcionan una controlada.
   */
  constructor(
    private readonly baseUrl = "http://127.0.0.1:8000",
    private readonly fetcher: Fetcher = fetch,
  ) {}

  /** Lee el perfil local; `value` puede ser `null` antes del onboarding. */
  async getLocalProfile(): Promise<ApiResult<LearnerProfile | null>> {
    return this.request<LearnerProfile | null>("/api/v1/learner-profile");
  }

  /** Valida en el servidor y guarda todos los campos editables del perfil. */
  async saveLocalProfile(
    input: LearnerProfileInput,
  ): Promise<ApiResult<LearnerProfile>> {
    return this.request<LearnerProfile>("/api/v1/learner-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  /** Finaliza una práctica y obtiene la revisión pedagógica persistida. */
  async completeSession(
    input: CompleteSessionInput,
  ): Promise<ApiResult<PracticeSessionReview>> {
    return this.request<PracticeSessionReview>("/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  /** Obtiene una revisión por ID, codificando el segmento para evitar rutas inválidas. */
  async getSession(
    sessionId: string,
  ): Promise<ApiResult<PracticeSessionReview>> {
    return this.request<PracticeSessionReview>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  /** Lista resúmenes recientes; el backend vuelve a validar el límite. */
  async listSessions(limit = 20): Promise<ApiResult<SessionSummary[]>> {
    return this.request<SessionSummary[]>(`/api/v1/sessions?limit=${limit}`);
  }

  /** Obtiene métricas agregadas y sesiones recientes para el dashboard. */
  async getProgress(): Promise<ApiResult<LearnerProgress>> {
    return this.request<LearnerProgress>("/api/v1/sessions/progress");
  }

  /**
   * Ejecuta la operación común y convierte fallos en categorías estables.
   *
   * `fetch` se invoca con el receptor global requerido por Chrome. Un estado no
   * exitoso, JSON inválido y fallo de transporte producen resultados diferentes.
   */
  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<ApiResult<T>> {
    try {
      const response = await this.fetcher.call(
        globalThis,
        `${this.baseUrl}${path}`,
        init,
      );
      if (!response.ok) {
        return { ok: false, error: "server" };
      }
      try {
        return { ok: true, value: (await response.json()) as T };
      } catch {
        return { ok: false, error: "invalid-response" };
      }
    } catch {
      return { ok: false, error: "network" };
    }
  }
}
