import type {
  CompleteSessionInput,
  LearnerProgress,
  PracticeSessionReview,
  SessionSummary,
} from "./practiceSessions";

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

export interface LearnerProfile extends LearnerProfileInput {
  id: string;
  updated_at_utc: string;
}

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: "network" | "invalid-response" | "server" };

type Fetcher = typeof fetch;

export class SpeakFlowApiClient {
  constructor(
    private readonly baseUrl = "http://127.0.0.1:8000",
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async getLocalProfile(): Promise<ApiResult<LearnerProfile | null>> {
    return this.request<LearnerProfile | null>("/api/v1/learner-profile");
  }

  async saveLocalProfile(
    input: LearnerProfileInput,
  ): Promise<ApiResult<LearnerProfile>> {
    return this.request<LearnerProfile>("/api/v1/learner-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  async completeSession(
    input: CompleteSessionInput,
  ): Promise<ApiResult<PracticeSessionReview>> {
    return this.request<PracticeSessionReview>("/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  async getSession(
    sessionId: string,
  ): Promise<ApiResult<PracticeSessionReview>> {
    return this.request<PracticeSessionReview>(
      `/api/v1/sessions/${encodeURIComponent(sessionId)}`,
    );
  }

  async listSessions(limit = 20): Promise<ApiResult<SessionSummary[]>> {
    return this.request<SessionSummary[]>(`/api/v1/sessions?limit=${limit}`);
  }

  async getProgress(): Promise<ApiResult<LearnerProgress>> {
    return this.request<LearnerProgress>("/api/v1/sessions/progress");
  }

  private async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<ApiResult<T>> {
    try {
      const response = await this.fetcher(`${this.baseUrl}${path}`, init);
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
