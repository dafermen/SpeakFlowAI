"""Expand local learner profile.

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-31
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("learner_profiles") as batch:
        batch.add_column(
            sa.Column(
                "preferred_feedback_style",
                sa.String(length=20),
                nullable=False,
                server_default="balanced",
            )
        )
        batch.add_column(
            sa.Column(
                "tutor_voice_id",
                sa.String(length=80),
                nullable=False,
                server_default="voice-calm-1",
            )
        )
        batch.add_column(
            sa.Column(
                "speaking_speed",
                sa.String(length=20),
                nullable=False,
                server_default="normal",
            )
        )

    op.create_table(
        "learner_goals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("learner_id", sa.String(length=36), nullable=False),
        sa.Column("value", sa.String(length=80), nullable=False),
        sa.Column("ordinal", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["learner_id"], ["learner_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("learner_id", "value", name="uq_learner_goals_value"),
    )
    op.create_table(
        "learner_topics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("learner_id", sa.String(length=36), nullable=False),
        sa.Column("value", sa.String(length=80), nullable=False),
        sa.Column("ordinal", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["learner_id"], ["learner_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("learner_id", "value", name="uq_learner_topics_value"),
    )


def downgrade() -> None:
    op.drop_table("learner_topics")
    op.drop_table("learner_goals")
    with op.batch_alter_table("learner_profiles") as batch:
        batch.drop_column("speaking_speed")
        batch.drop_column("tutor_voice_id")
        batch.drop_column("preferred_feedback_style")
