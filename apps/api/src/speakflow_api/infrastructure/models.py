from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from speakflow_api.infrastructure.database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class LearnerProfileModel(Base):
    __tablename__ = "learner_profiles"
    __table_args__ = (
        CheckConstraint(
            "english_level IN ('a2', 'b1', 'b2', 'c1', 'unsure')",
            name="ck_learner_profiles_english_level",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    display_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    native_language: Mapped[str] = mapped_column(String(10), nullable=False)
    english_level: Mapped[str] = mapped_column(String(20), nullable=False)
    preferred_feedback_style: Mapped[str] = mapped_column(
        String(20), nullable=False, default="balanced"
    )
    tutor_voice_id: Mapped[str] = mapped_column(String(80), nullable=False, default="voice-calm-1")
    speaking_speed: Mapped[str] = mapped_column(String(20), nullable=False, default="normal")
    created_at_utc: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
    )
    updated_at_utc: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )
    goals: Mapped[list[LearnerGoalModel]] = relationship(
        back_populates="learner", cascade="all, delete-orphan", order_by="LearnerGoalModel.ordinal"
    )
    topics: Mapped[list[LearnerTopicModel]] = relationship(
        back_populates="learner", cascade="all, delete-orphan", order_by="LearnerTopicModel.ordinal"
    )
    sessions: Mapped[list[PracticeSessionModel]] = relationship(
        back_populates="learner", cascade="all, delete-orphan"
    )


class LearnerGoalModel(Base):
    __tablename__ = "learner_goals"
    __table_args__ = (UniqueConstraint("learner_id", "value", name="uq_learner_goals_value"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    learner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    learner: Mapped[LearnerProfileModel] = relationship(back_populates="goals")


class LearnerTopicModel(Base):
    __tablename__ = "learner_topics"
    __table_args__ = (UniqueConstraint("learner_id", "value", name="uq_learner_topics_value"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    learner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    learner: Mapped[LearnerProfileModel] = relationship(back_populates="topics")


class PracticeSessionModel(Base):
    __tablename__ = "practice_sessions"
    __table_args__ = (
        CheckConstraint(
            "provider IN ('deterministic', 'openai-realtime')",
            name="ck_practice_sessions_provider",
        ),
        CheckConstraint(
            "status IN ('completed', 'abandoned', 'failed')",
            name="ck_practice_sessions_status",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    learner_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False
    )
    scenario_id: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    mode_id: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(30), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)
    started_at_utc: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at_utc: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    retain_transcript: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    learner_turn_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tutor_turn_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    learner: Mapped[LearnerProfileModel] = relationship(back_populates="sessions")
    turns: Mapped[list[SessionTurnModel]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="SessionTurnModel.ordinal"
    )
    feedback: Mapped[SessionFeedbackModel] = relationship(
        back_populates="session", cascade="all, delete-orphan", uselist=False
    )


class SessionTurnModel(Base):
    __tablename__ = "session_turns"
    __table_args__ = (
        CheckConstraint("speaker IN ('learner', 'tutor')", name="ck_session_turns_speaker"),
        UniqueConstraint("session_id", "ordinal", name="uq_session_turns_ordinal"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("practice_sessions.id", ondelete="CASCADE"), nullable=False
    )
    speaker: Mapped[str] = mapped_column(String(20), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    session: Mapped[PracticeSessionModel] = relationship(back_populates="turns")


class SessionFeedbackModel(Base):
    __tablename__ = "session_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("practice_sessions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    strength: Mapped[str] = mapped_column(Text, nullable=False)
    focus_area: Mapped[str] = mapped_column(Text, nullable=False)
    session: Mapped[PracticeSessionModel] = relationship(back_populates="feedback")
    corrections: Mapped[list[FeedbackCorrectionModel]] = relationship(
        back_populates="feedback",
        cascade="all, delete-orphan",
        order_by="FeedbackCorrectionModel.id",
    )
    vocabulary: Mapped[list[VocabularyItemModel]] = relationship(
        back_populates="feedback", cascade="all, delete-orphan", order_by="VocabularyItemModel.id"
    )
    improved_phrases: Mapped[list[ImprovedPhraseModel]] = relationship(
        back_populates="feedback",
        cascade="all, delete-orphan",
        order_by="ImprovedPhraseModel.ordinal",
    )
    observations: Mapped[list[FeedbackObservationModel]] = relationship(
        back_populates="feedback",
        cascade="all, delete-orphan",
        order_by="FeedbackObservationModel.id",
    )


class FeedbackCorrectionModel(Base):
    __tablename__ = "feedback_corrections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feedback_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("session_feedback.id", ondelete="CASCADE"), nullable=False
    )
    original: Mapped[str] = mapped_column(Text, nullable=False)
    improved: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    feedback: Mapped[SessionFeedbackModel] = relationship(back_populates="corrections")


class VocabularyItemModel(Base):
    __tablename__ = "vocabulary_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feedback_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("session_feedback.id", ondelete="CASCADE"), nullable=False
    )
    term: Mapped[str] = mapped_column(String(120), nullable=False)
    meaning_es: Mapped[str] = mapped_column(String(240), nullable=False)
    example: Mapped[str] = mapped_column(Text, nullable=False)
    feedback: Mapped[SessionFeedbackModel] = relationship(back_populates="vocabulary")


class ImprovedPhraseModel(Base):
    __tablename__ = "improved_phrases"
    __table_args__ = (
        UniqueConstraint("feedback_id", "ordinal", name="uq_improved_phrases_ordinal"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feedback_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("session_feedback.id", ondelete="CASCADE"), nullable=False
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback: Mapped[SessionFeedbackModel] = relationship(back_populates="improved_phrases")


class FeedbackObservationModel(Base):
    __tablename__ = "feedback_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feedback_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("session_feedback.id", ondelete="CASCADE"), nullable=False
    )
    category: Mapped[str] = mapped_column(String(40), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    feedback: Mapped[SessionFeedbackModel] = relationship(back_populates="observations")
