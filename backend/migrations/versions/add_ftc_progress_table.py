"""add ftc progress table

Revision ID: add_ftc_progress_table
Revises: 
Create Date: 2024-12-10 01:23:56.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_ftc_progress_table'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('ftc_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('lesson_id', sa.Integer(), nullable=False),
        sa.Column('completed', sa.Boolean(), default=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ftc_progress_user_id'), 'ftc_progress', ['user_id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_ftc_progress_user_id'), table_name='ftc_progress')
    op.drop_table('ftc_progress')
