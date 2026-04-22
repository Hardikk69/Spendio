from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, String

class AlembicVersion(db.Model, BaseModel):
    __tablename__ = 'alembic_version'

    version_num = Column(String(32), primary_key=True)
