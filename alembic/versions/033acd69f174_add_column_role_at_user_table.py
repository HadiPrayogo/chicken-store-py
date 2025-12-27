"""add column role at user table

Revision ID: 033acd69f174
Revises: a9c44213a323
Create Date: 2025-12-20 11:46:26.400606

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "033acd69f174"
down_revision: Union[str, Sequence[str], None] = "a9c44213a323"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    role_enum = sa.Enum("admin", "user", name="userrole")
    role_enum.create(op.get_bind())

    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.Enum("user", "admin", name="userrole"),
            nullable=False,
            server_default="user",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("users", "role")
