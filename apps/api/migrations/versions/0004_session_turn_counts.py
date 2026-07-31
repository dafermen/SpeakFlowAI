"""Add privacy-preserving session turn counts.

Revision ID: 0004
Revises: 0003
Create Date: 2026-07-31
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: str | Sequence[str] | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("practice_sessions") as batch:
        batch.add_column(
            sa.Column("learner_turn_count", sa.Integer(), nullable=False, server_default="0")
        )
        batch.add_column(
            sa.Column("tutor_turn_count", sa.Integer(), nullable=False, server_default="0")
        )


def downgrade() -> None:
    with op.batch_alter_table("practice_sessions") as batch:
        batch.drop_column("tutor_turn_count")
        batch.drop_column("learner_turn_count")
