from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import (
    SharedSubscription, SharedSubscriptionMember,
    Invitation, Subscription, User
)

shared_bp = Blueprint("shared", __name__)


@shared_bp.route("/", methods=["GET"])
@jwt_required()
def list_shared():
    user_id = get_jwt_identity()

    # Subscriptions owned by user that are shared
    owned = SharedSubscription.query.filter_by(owner_id=user_id).all()

    # Subscriptions user is a member of (but not owner)
    member_rows = SharedSubscriptionMember.query.filter(
        SharedSubscriptionMember.user_id == user_id,
        SharedSubscriptionMember.role == "member",
    ).all()

    member_shared_ids = {m.shared_sub_id for m in member_rows}
    member_shared = SharedSubscription.query.filter(
        SharedSubscription.id.in_(member_shared_ids)
    ).all() if member_shared_ids else []

    all_shared = {s.id: s for s in owned + member_shared}

    result = []
    for shared in all_shared.values():
        sub = shared.subscription
        members = shared.members.all()
        my_member = next(
            (m for m in members if m.user_id == user_id), None
        )
        owner = shared.owner

        result.append({
            "id": shared.id,
            "subscription_id": shared.subscription_id,
            "name": sub.name if sub else "Unknown",
            "total_cost": float(shared.total_cost),
            "members_count": len(members),
            "your_share": float(my_member.share_amount) if my_member else 0,
            "role": my_member.role if my_member else ("owner" if shared.owner_id == user_id else "member"),
            "status": sub.status if sub else "Unknown",
            "members": [m.to_dict() for m in members],
        })

    return jsonify({"shared_subscriptions": result}), 200


@shared_bp.route("/", methods=["POST"])
@jwt_required()
def create_shared():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    required = ["subscription_id"]
    if not data.get("subscription_id"):
        return jsonify({"error": "subscription_id is required"}), 400

    sub = Subscription.query.filter_by(id=data["subscription_id"], user_id=user_id).first_or_404(
        description="Subscription not found"
    )

    if sub.shared_subscription:
        return jsonify({"error": "Subscription is already shared"}), 409

    shared = SharedSubscription(
        subscription_id=sub.id,
        owner_id=user_id,
        total_cost=sub.amount,
    )
    db.session.add(shared)
    db.session.flush()

    user = User.query.get(user_id)
    # Add owner as first member
    owner_member = SharedSubscriptionMember(
        shared_sub_id=shared.id,
        user_id=user_id,
        email=user.email,
        display_name=f"{user.first_name} {user.last_name}",
        share_amount=sub.amount,
        role="owner",
        payment_status="paid",
    )
    db.session.add(owner_member)
    db.session.commit()

    return jsonify({"message": "Shared subscription created", "shared": shared.to_dict()}), 201


@shared_bp.route("/stats", methods=["GET"])
@jwt_required()
def shared_stats():
    user_id = get_jwt_identity()

    owned = SharedSubscription.query.filter_by(owner_id=user_id).all()
    member_rows = SharedSubscriptionMember.query.filter(
        SharedSubscriptionMember.user_id == user_id
    ).all()

    total_members = sum(s.members.count() for s in owned)
    monthly_savings = sum(
        float(s.total_cost) - float(
            next((m.share_amount for m in s.members.all() if m.user_id == user_id), s.total_cost)
        )
        for s in owned
    )

    all_shared_ids = set(s.id for s in owned) | set(m.shared_sub_id for m in member_rows)
    return jsonify({
        "shared_subscriptions": len(all_shared_ids),
        "monthly_savings": round(monthly_savings, 2),
        "total_members": total_members,
    }), 200


@shared_bp.route("/invitations", methods=["GET"])
@jwt_required()
def list_invitations():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    pending = Invitation.query.filter_by(
        invitee_email=user.email, status="pending"
    ).order_by(Invitation.created_at.desc()).all()

    return jsonify({"invitations": [i.to_dict() for i in pending]}), 200


@shared_bp.route("/invitations/<inv_id>/accept", methods=["POST"])
@jwt_required()
def accept_invitation(inv_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    inv = Invitation.query.filter_by(id=inv_id, invitee_email=user.email, status="pending").first_or_404()

    inv.status = "accepted"

    # Add user as member
    member = SharedSubscriptionMember(
        shared_sub_id=inv.shared_sub_id,
        user_id=user_id,
        email=user.email,
        display_name=f"{user.first_name} {user.last_name}",
        share_amount=inv.share_amount,
        role="member",
        payment_status="pending",
    )
    db.session.add(member)
    db.session.commit()

    return jsonify({"message": "Invitation accepted"}), 200


@shared_bp.route("/invitations/<inv_id>/decline", methods=["POST"])
@jwt_required()
def decline_invitation(inv_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    inv = Invitation.query.filter_by(id=inv_id, invitee_email=user.email, status="pending").first_or_404()
    inv.status = "declined"
    db.session.commit()
    return jsonify({"message": "Invitation declined"}), 200


@shared_bp.route("/<shared_id>/invite", methods=["POST"])
@jwt_required()
def send_invite(shared_id):
    user_id = get_jwt_identity()
    shared = SharedSubscription.query.filter_by(id=shared_id, owner_id=user_id).first_or_404(
        description="Shared subscription not found or you are not the owner"
    )
    data = request.get_json() or {}

    if not data.get("email"):
        return jsonify({"error": "email is required"}), 400

    members_count = shared.members.count()
    new_share = round(float(shared.total_cost) / (members_count + 1), 2)

    inv = Invitation(
        shared_sub_id=shared.id,
        inviter_id=user_id,
        invitee_email=data["email"].lower().strip(),
        status="pending",
        share_amount=new_share,
    )
    db.session.add(inv)
    db.session.commit()

    return jsonify({
        "message": f"Invitation sent to {data['email']}",
        "share_amount": new_share,
        "invitation": inv.to_dict(),
    }), 201
