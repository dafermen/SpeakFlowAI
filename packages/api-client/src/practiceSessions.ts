/** Contratos TypeScript equivalentes a las respuestas de sesiones de FastAPI. */

/** Turno que se envía al cerrar una conversación. */
export interface SessionTurnInput {
  speaker: "learner" | "tutor";
  text: string;
}

/** Entrada completa necesaria para persistir y evaluar una sesión. */
export interface CompleteSessionInput {
  scenario_id: string;
  mode_id: string;
  provider: "deterministic" | "openai-realtime";
  difficulty: "a2" | "b1" | "b2" | "c1";
  duration_seconds: number;
  started_at_utc: string;
  ended_at_utc: string;
  retain_transcript: boolean;
  input_tokens: number;
  output_tokens: number;
  turns: SessionTurnInput[];
}

/** Corrección de lenguaje con explicación pedagógica. */
export interface FeedbackCorrection {
  original: string;
  improved: string;
  explanation: string;
}

/** Término contextual acompañado de significado y ejemplo. */
export interface VocabularyItem {
  term: string;
  meaning_es: string;
  example: string;
}

/** Observación categorizada que puede alimentar métricas. */
export interface FeedbackObservation {
  category: string;
  note: string;
}

/** Revisión que se presenta al finalizar la práctica. */
export interface SessionFeedback {
  summary: string;
  strength: string;
  focus_area: string;
  corrections: FeedbackCorrection[];
  vocabulary: VocabularyItem[];
  improved_phrases: string[];
  observations: FeedbackObservation[];
}

/** Sesión completa devuelta después del guardado o al consultar su detalle. */
export interface PracticeSessionReview extends CompleteSessionInput {
  id: string;
  learner_turn_count: number;
  tutor_turn_count: number;
  feedback: SessionFeedback;
}

/** Proyección compacta utilizada por el historial. */
export interface SessionSummary {
  id: string;
  scenario_id: string;
  mode_id: string;
  provider: "deterministic" | "openai-realtime";
  difficulty: "a2" | "b1" | "b2" | "c1";
  duration_seconds: number;
  ended_at_utc: string;
  learner_turn_count: number;
  summary: string;
  focus_area: string;
  correction_count: number;
  vocabulary_count: number;
}

/** Conteo agrupado por un identificador de modo o área de enfoque. */
export interface ProgressBreakdown {
  id: string;
  count: number;
}

/** Métricas agregadas que consume el dashboard de progreso. */
export interface LearnerProgress {
  total_sessions: number;
  total_minutes: number;
  learner_turns: number;
  current_streak_days: number;
  sessions_by_mode: ProgressBreakdown[];
  focus_areas: ProgressBreakdown[];
  recent_sessions: SessionSummary[];
}
