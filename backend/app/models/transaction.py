import uuid
from datetime import datetime
from app.extensions import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    txn_ref = db.Column(db.String(20), unique=True, nullable=False)  # TXN001 style display ID
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subscription_id = db.Column(
        db.String(36), db.ForeignKey("subscriptions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    subscription_name = db.Column(db.String(200), nullable=False)  # Snapshot of name at time of payment
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Pending")  # Success, Failed, Pending, Refunded
    method = db.Column(db.String(30), nullable=False, default="Auto-pay")  # Auto-pay, Manual
    invoice_available = db.Column(db.Boolean, default=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "txn_ref": self.txn_ref,
            "user_id": self.user_id,
            "subscription_id": self.subscription_id,
            "subscription": self.subscription_name,
            "amount": float(self.amount),
            "status": self.status,
            "method": self.method,
            "invoice": self.invoice_available,
            "date": self.payment_date.strftime("%b %d, %Y") if self.payment_date else None,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
        }
