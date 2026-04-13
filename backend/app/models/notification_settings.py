import uuid
from app.extensions import db


class NotificationSettings(db.Model):
    __tablename__ = "notification_settings"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    renewal_reminders = db.Column(db.Boolean, default=True)
    payment_confirmations = db.Column(db.Boolean, default=True)
    payment_failure_alerts = db.Column(db.Boolean, default=True)
    refund_notifications = db.Column(db.Boolean, default=True)
    shared_invites = db.Column(db.Boolean, default=True)
    spending_insights = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "renewal_reminders": self.renewal_reminders,
            "payment_confirmations": self.payment_confirmations,
            "payment_failure_alerts": self.payment_failure_alerts,
            "refund_notifications": self.refund_notifications,
            "shared_invites": self.shared_invites,
            "spending_insights": self.spending_insights,
        }


class PaymentSettings(db.Model):
    __tablename__ = "payment_settings"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    enable_autopay = db.Column(db.Boolean, default=True)
    default_payment_method = db.Column(db.String(50), default="card1")  # card1, card2
    preferred_billing_cycle = db.Column(db.String(20), default="monthly")  # monthly, quarterly, yearly
    auto_retry_failed = db.Column(db.Boolean, default=True)
    two_factor_auth = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "enable_autopay": self.enable_autopay,
            "default_payment_method": self.default_payment_method,
            "preferred_billing_cycle": self.preferred_billing_cycle,
            "auto_retry_failed": self.auto_retry_failed,
            "two_factor_auth": self.two_factor_auth,
        }
