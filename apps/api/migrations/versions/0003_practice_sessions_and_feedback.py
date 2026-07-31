"""Add practice sessions and structured feedback.

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-31
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | Sequence[str] | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "practice_sessions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("learner_id", sa.String(length=36), nullable=False),
        sa.Column("scenario_id", sa.String(length=120), nullable=False),
        sa.Column("mode_id", sa.String(length=120), nullable=False),
        sa.Column("provider", sa.String(length=30), nullable=False),
        sa.Column("difficulty", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=False),
        sa.Column("started_at_utc", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at_utc", sa.DateTime(timezone=True), nullable=False),
        sa.Column("retain_transcript", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("input_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("output_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.CheckConstraint(
            "provider IN ('deterministic', 'openai-realtime')",
            name="ck_practice_sessions_provider",
        ),
        sa.CheckConstraint(
            "status IN ('completed', 'abandoned', 'failed')",
            name="ck_practice_sessions_status",
        ),
        sa.ForeignKeyConstraint(["learner_id"], ["learner_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_practice_sessions_scenario_id"),
        "practice_sessions",
        ["scenario_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_practice_sessions_mode_id"),
        "practice_sessions",
        ["mode_id"],
        unique=False,
    )
    op.create_table(
        "session_turns",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("speaker", sa.String(length=20), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("ordinal", sa.Integer(), nullable=False),
        sa.CheckConstraint("speaker IN ('learner', 'tutor')", name="ck_session_turns_speaker"),
        sa.ForeignKeyConstraint(["session_id"], ["practice_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "ordinal", name="uq_session_turns_ordinal"),
    )
    op.create_table(
        "session_feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("session_id", sa.String(length=36), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("strength", sa.Text(), nullable=False),
        sa.Column("focus_area", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["practice_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id"),
    )
    op.create_table(
        "feedback_corrections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_id", sa.Integer(), nullable=False),
        sa.Column("original", sa.Text(), nullable=False),
        sa.Column("improved", sa.Text(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["feedback_id"], ["session_feedback.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "vocabulary_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_id", sa.Integer(), nullable=False),
        sa.Column("term", sa.String(length=120), nullable=False),
        sa.Column("meaning_es", sa.String(length=240), nullable=False),
        sa.Column("example", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["feedback_id"], ["session_feedback.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "improved_phrases",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_id", sa.Integer(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("ordinal", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["feedback_id"], ["session_feedback.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("feedback_id", "ordinal", name="uq_improved_phrases_ordinal"),
    )
    op.create_table(
        "feedback_observations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["feedback_id"], ["session_feedback.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("feedback_observations")
    op.drop_table("improved_phrases")
    op.drop_table("vocabulary_items")
    op.drop_table("feedback_corrections")
    op.drop_table("session_feedback")
    op.drop_table("session_turns")
    op.drop_index(op.f("ix_practice_sessions_mode_id"), table_name="practice_sessions")
    op.drop_index(op.f("ix_practice_sessions_scenario_id"), table_name="practice_sessions")
    op.drop_table("practice_sessions")
