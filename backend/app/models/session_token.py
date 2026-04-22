from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey

class SessionToken(db.Model, BaseModel):
    __tablename__ = 'session_token'

    token_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.user_id'))
    role = Column(String(50))
    expiry_date_time = Column(DateTime)
    jwt_signature = Column(Text)
