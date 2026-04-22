from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey

class Notification(db.Model, BaseModel):
    __tablename__ = 'notification'

    notification_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.user_id'))
    type = Column(String(100))
    title = Column(String(255))
    message = Column(Text)
    is_read = Column(Boolean)
    sent_at = Column(DateTime)
