from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import SharedSubscription, Subscription, User, Service
from app.services.notification_service import create_notification

shared_bp = Blueprint("shared", __name__)


@shared_bp.route("/", methods=["GET"])
@jwt_required()
def list_shared():
    """List shared subscriptions for the current user."""
    user_id = get_jwt_identity()

    shares = SharedSubscription.query.filter_by(member_user_id=user_id).all()

    result = []
    for share in shares:
        sub_id = share.subscription_id
        sub_data = db.session.query(Subscription, Service).join(
            Service, Subscription.service_id == Service.service_id
        ).filter(Subscription.subscription_id == sub_id).first()

        if not sub_data:
            continue

        sub, service = sub_data

        # Determine role: Owner if the subscription's user_id matches current user
        is_owner = str(sub.user_id) == str(user_id)

        # Get all members for this shared subscription
        all_shares = SharedSubscription.query.filter_by(subscription_id=sub_id).all()
        members = []
        for s in all_shares:
            member_user = User.query.get(s.member_user_id)
            if member_user:
                name = (
                    f"{member_user.first_name or ''} {member_user.last_name or ''}".strip()
                    or member_user.email
                )
                members.append({
                    "id": s.id,
                    "name": name,
                    "email": member_user.email,
                    "share_amount": float(s.amount_owned),
                    "status": "Accepted",
                })

        result.append({
            "id": share.id,
            "subscription_id": sub_id,
            "subscription_name": service.name,
            "total_amount": float(service.base_price),
            "your_share": float(share.amount_owned),
            "member_count": len(all_shares),
            "role": "Owner" if is_owner else "Member",
            "status": sub.status,
            "billing_cycle": service.billing_cycle,
            "members": members,
        })

    return jsonify({"shares": result}), 200


@shared_bp.route("/invitations", methods=["GET"])
@jwt_required()
def list_invitations():
    """Pending invitations stub - returns empty list until invitation model is added."""
    return jsonify({"invitations": []}), 200


@shared_bp.route("/invite", methods=["POST"])
@jwt_required()
def invite_member():
    """Invite a user to share a subscription by email."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    subscription_id = data.get("subscription_id")
    email = (data.get("email") or "").strip().lower()

    if not subscription_id or not email:
        return jsonify({"error": "subscription_id and email are required"}), 400

    # Ensure the current user owns this subscription
    sub = Subscription.query.filter_by(
        subscription_id=subscription_id,
        user_id=user_id
    ).first()
    if not sub:
        return jsonify({"error": "Subscription not found or not owned by you"}), 404

    # Find the invitee
    invitee = User.query.filter_by(email=email).first()
    if not invitee:
        return jsonify({"error": "No user registered with that email address"}), 404

    # Check if already a member
    existing = SharedSubscription.query.filter_by(
        subscription_id=subscription_id,
        member_user_id=invitee.user_id
    ).first()
    if existing:
        return jsonify({"error": "This user already has access to this subscription"}), 409

    # Get service info
    service = Service.query.get(sub.service_id)
    if not service:
        return jsonify({"error": "Service info not found"}), 404

    # Calculate split
    existing_count = SharedSubscription.query.filter_by(subscription_id=subscription_id).count()
    total_members = existing_count + 1
    split_amount = round(float(service.base_price) / total_members, 2)
    split_percent = int(100 / total_members)

    shared = SharedSubscription(
        subscription_id=subscription_id,
        member_user_id=invitee.user_id,
        shared_percent=split_percent,
        amount_owned=split_amount
    )
    db.session.add(shared)
    db.session.commit()

    # Trigger notification to the invitee
    inviter_name = "Someone"
    inviter = User.query.get(user_id)
    if inviter:
        inviter_name = f"{inviter.first_name or ''} {inviter.last_name or ''}".strip() or inviter.email

    create_notification(
        user_id=invitee.user_id,
        n_type="share",
        title="Shared Subscription Invite",
        message=f"{inviter_name} has invited you to share a subscription for {service.name}."
    )

    return jsonify({"message": f"Invitation sent to {email}"}), 201


@shared_bp.route("/<int:share_id>/accept", methods=["POST"])
@jwt_required()
def accept_invitation(share_id):
    """Accept a shared subscription invitation."""
    user_id = get_jwt_identity()
    SharedSubscription.query.filter_by(
        id=share_id, member_user_id=user_id
    ).first_or_404()
    # In this model, the record existing means it's accepted
    return jsonify({"message": "Invitation accepted"}), 200


@shared_bp.route("/<int:share_id>/reject", methods=["POST"])
@jwt_required()
def reject_invitation(share_id):
    """Reject/decline a shared subscription invitation."""
    user_id = get_jwt_identity()
    share = SharedSubscription.query.filter_by(
        id=share_id, member_user_id=user_id
    ).first_or_404()
    db.session.delete(share)
    db.session.commit()
    return jsonify({"message": "Invitation declined"}), 200


@shared_bp.route("/<int:share_id>", methods=["DELETE"])
@jwt_required()
def leave_shared(share_id):
    """Leave a shared subscription."""
    user_id = get_jwt_identity()
    share = SharedSubscription.query.filter_by(
        id=share_id, member_user_id=user_id
    ).first_or_404()
    db.session.delete(share)
    db.session.commit()
    return jsonify({"message": "Left shared subscription"}), 200


@shared_bp.route("/stats", methods=["GET"])
@jwt_required()
def shared_stats():
    user_id = get_jwt_identity()
    shares = SharedSubscription.query.filter_by(member_user_id=user_id).all()

    total_savings = 0
    for share in shares:
        service = db.session.query(Service).join(
            Subscription, Subscription.service_id == Service.service_id
        ).filter(Subscription.subscription_id == share.subscription_id).first()
        if service:
            total_savings += float(service.base_price) - float(share.amount_owned)

    return jsonify({
        "shared_subscriptions": len(shares),
        "monthly_savings": round(total_savings, 2),
    }), 200