"""edit status column at product table

Revision ID: c57428435c70
Revises: ba215e8cc4bc
Create Date: 2025-12-24 12:38:13.111076

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c57428435c70"
down_revision: Union[str, Sequence[str], None] = "ba215e8cc4bc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE statusproduk ADD VALUE 'Habis'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
