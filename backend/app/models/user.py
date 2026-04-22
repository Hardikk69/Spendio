from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime


class User(db.Model, BaseModel):
    __tablename__ = 'user'

    user_id = Column(Integer, primary_key=True)
    name = Column(String(120))
    email = Column(String(255))
    password = Column(String(255))
    role = Column(String(50))
    money = Column(Integer, default=10000)
    created_at = Column(DateTime, default=datetime.utcnow)

    def check_password(self, password):
        return self.password == password

    def set_password(self, password):
        self.password = password

    @property
    def first_name(self):
        """Derive first name from the combined name field."""
        parts = (self.name or "").strip().split(" ", 1)
        return parts[0] if parts else ""

    @property
    def last_name(self):
        """Derive last name from the combined name field."""
        parts = (self.name or "").strip().split(" ", 1)
        return parts[1] if len(parts) > 1 else ""

    @property
    def phone(self):
        """Placeholder - no phone column in DB yet."""
        return ""

    def to_dict(self):
        """Serialize to dict, including derived first_name/last_name."""
        return {
            "user_id": self.user_id,
            "name": self.name,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "role": self.role or "user",
            "phone": self.phone,
            "money": self.money,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
