import uuid
import bcrypt
from datetime import datetime
from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    role = db.Column(db.String(20), nullable=False, default="user")  # user, admin, enterprise
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    subscriptions = db.relationship("Subscription", backref="owner", lazy="dynamic", cascade="all, delete-orphan")
    transactions = db.relationship("Transaction", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    notification_settings = db.relationship(
        "NotificationSettings", backref="user", uselist=False, cascade="all, delete-orphan"
    )
    payment_settings = db.relationship(
        "PaymentSettings", backref="user", uselist=False, cascade="all, delete-orphan"
    )
    owned_shared_subs = db.relationship(
        "SharedSubscription", backref="owner", lazy="dynamic", cascade="all, delete-orphan"
    )

    def set_password(self, password: str):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "full_name": f"{self.first_name} {self.last_name}",
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
