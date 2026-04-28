from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from datetime import datetime, timedelta

class OTP(db.Model, BaseModel):
    __tablename__ = 'otp'

    otp_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.user_id'), nullable=False)
    code = Column(String(10), nullable=False)
    is_verified = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def is_expired(self):
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            "otp_id": self.otp_id,
            "user_id": self.user_id,
            "code": self.code,
            "is_verified": self.is_verified,
            "expires_at": self.expires_at.isoformat(),
            "created_at": self.created_at.isoformat()
        }
