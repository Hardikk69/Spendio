import uuid
from datetime import datetime
from app.extensions import db


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False, default="Other")
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    billing_cycle = db.Column(db.String(20), nullable=False, default="Monthly")  # Monthly, Quarterly, Yearly
    next_billing = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="Active")  # Active, Paused, Expired, Cancelled
    autopay = db.Column(db.Boolean, default=False)
    logo_url = db.Column(db.String(500), nullable=True)
    brand_color = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    transactions = db.relationship("Transaction", backref="subscription", lazy="dynamic", cascade="all, delete-orphan")
    shared_subscription = db.relationship(
        "SharedSubscription", backref="subscription", uselist=False, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "category": self.category,
            "amount": float(self.amount),
            "billing_cycle": self.billing_cycle,
            "next_billing": self.next_billing.isoformat() if self.next_billing else None,
            "status": self.status,
            "autopay": self.autopay,
            "logo_url": self.logo_url,
            "brand_color": self.brand_color,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
