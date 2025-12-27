"""create column status at product table

Revision ID: 49ccb53c7af4
Revises: 93d132618676
Create Date: 2025-12-18 22:29:33.890380

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "49ccb53c7af4"
down_revision: Union[str, Sequence[str], None] = "93d132618676"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    status_enum = sa.Enum("Bertumbuh", "Siap Jual", name="statusproduk")
    status_enum.create(op.get_bind())

    op.add_column(
        "products",
        sa.Column(
            "status",
            sa.Enum("Bertumbuh", "Siap Jual", name="statusproduk"),
            nullable=False,
            server_default="Bertumbuh",
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("products", "status")
