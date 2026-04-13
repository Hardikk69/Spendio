import uuid
from datetime import datetime
from app.extensions import db


class SharedSubscription(db.Model):
    __tablename__ = "shared_subscriptions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = db.Column(
        db.String(36), db.ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    owner_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    total_cost = db.Column(db.Numeric(12, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    members = db.relationship(
        "SharedSubscriptionMember", backref="shared_sub", lazy="dynamic", cascade="all, delete-orphan"
    )
    invitations = db.relationship(
        "Invitation", backref="shared_sub", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self):
        members_list = [m.to_dict() for m in self.members.all()]
        return {
            "id": self.id,
            "subscription_id": self.subscription_id,
            "owner_id": self.owner_id,
            "total_cost": float(self.total_cost),
            "members_count": len(members_list),
            "members": members_list,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SharedSubscriptionMember(db.Model):
    __tablename__ = "shared_sub_members"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shared_sub_id = db.Column(
        db.String(36), db.ForeignKey("shared_subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    email = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(200), nullable=True)
    share_amount = db.Column(db.Numeric(12, 2), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="member")  # owner, member
    payment_status = db.Column(db.String(20), nullable=False, default="pending")  # paid, pending

    def to_dict(self):
        return {
            "id": self.id,
            "shared_sub_id": self.shared_sub_id,
            "user_id": self.user_id,
            "email": self.email,
            "name": self.display_name or self.email,
            "share_amount": float(self.share_amount),
            "role": self.role,
            "payment_status": self.payment_status,
        }


class Invitation(db.Model):
    __tablename__ = "invitations"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shared_sub_id = db.Column(
        db.String(36), db.ForeignKey("shared_subscriptions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inviter_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    invitee_email = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")  # pending, accepted, declined
    share_amount = db.Column(db.Numeric(12, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    inviter = db.relationship("User", foreign_keys=[inviter_id])

    def to_dict(self):
        return {
            "id": self.id,
            "shared_sub_id": self.shared_sub_id,
            "inviter_id": self.inviter_id,
            "inviter_name": self.inviter.first_name + " " + self.inviter.last_name if self.inviter else None,
            "invitee_email": self.invitee_email,
            "status": self.status,
            "share_amount": float(self.share_amount),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "subscription_name": (
                self.shared_sub.subscription.name
                if self.shared_sub and self.shared_sub.subscription
                else None
            ),
        }
