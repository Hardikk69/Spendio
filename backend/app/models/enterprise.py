enterprise.py
from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

class Enterprise(db.Model, BaseModel):
    __tablename__ = 'enterprise'

    enterprise_id = Column(Integer, primary_key=True)
    name = Column(String(200))
    domain = Column(String(255))
    admin_user_id = Column(Integer, ForeignKey('user.user_id'))
    subscription_limit = Column(Integer)
    plan = Column(String(50))
    created_at = Column(DateTime)