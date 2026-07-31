export interface SessionTurnInput {
  speaker: "learner" | "tutor";
  text: string;
}

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

export interface FeedbackCorrection {
  original: string;
  improved: string;
  explanation: string;
}

export interface VocabularyItem {
  term: string;
  meaning_es: string;
  example: string;
}

export interface FeedbackObservation {
  category: string;
  note: string;
}

export interface SessionFeedback {
  summary: string;
  strength: string;
  focus_area: string;
  corrections: FeedbackCorrection[];
  vocabulary: VocabularyItem[];
  improved_phrases: string[];
  observations: FeedbackObservation[];
}

export interface PracticeSessionReview extends CompleteSessionInput {
  id: string;
  learner_turn_count: number;
  tutor_turn_count: number;
  feedback: SessionFeedback;
}

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

export interface ProgressBreakdown {
  id: string;
  count: number;
}

export interface LearnerProgress {
  total_sessions: number;
  total_minutes: number;
  learner_turns: number;
  current_streak_days: number;
  sessions_by_mode: ProgressBreakdown[];
  focus_areas: ProgressBreakdown[];
  recent_sessions: SessionSummary[];
}
