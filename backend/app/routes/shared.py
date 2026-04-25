from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import SharedSubscription, Subscription, User, Service
from app.services.notification_service import create_notification

shared_bp = Blueprint("shared", __name__)


def _recalculate_equal_split(subscription_id, base_price):
    """Recalculate equal split amounts for all members of a shared subscription."""
    all_shares = SharedSubscription.query.filter_by(subscription_id=subscription_id).all()
    if not all_shares:
        return
    count = len(all_shares)
    equal_percent = round(100.0 / count, 2)
    equal_amount = round(float(base_price) / count, 2)
    for s in all_shares:
        s.shared_percent = equal_percent
        s.amount_owned = equal_amount


def _recalculate_after_custom(subscription_id, base_price, exclude_id=None):
    """After a member leaves, redistribute their share equally among remaining members."""
    all_shares = SharedSubscription.query.filter_by(subscription_id=subscription_id).all()
    if exclude_id:
        all_shares = [s for s in all_shares if s.id != exclude_id]
    if not all_shares:
        return
    count = len(all_shares)
    equal_percent = round(100.0 / count, 2)
    equal_amount = round(float(base_price) / count, 2)
    for s in all_shares:
        s.shared_percent = equal_percent
        s.amount_owned = equal_amount


def _get_service_for_subscription(subscription_id):
    """Get the Service object for a given subscription_id."""
    result = db.session.query(Service).join(
        Subscription, Subscription.service_id == Service.service_id
    ).filter(Subscription.subscription_id == subscription_id).first()
    return result


def _ensure_owner_share(subscription_id, owner_user_id, base_price):
    """Ensure the subscription owner has a SharedSubscription record."""
    existing = SharedSubscription.query.filter_by(
        subscription_id=subscription_id,
        member_user_id=owner_user_id
    ).first()
    if existing:
        return existing

    owner_share = SharedSubscription(
        subscription_id=subscription_id,
        member_user_id=owner_user_id,
        shared_percent=100,
        amount_owned=float(base_price)
    )
    db.session.add(owner_share)
    db.session.flush()
    return owner_share


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
                    "share_percent": float(s.shared_percent) if s.shared_percent else 0,
                    "status": "Accepted",
                })

        result.append({
            "id": share.id,
            "subscription_id": sub_id,
            "subscription_name": service.name,
            "total_amount": float(service.base_price),
            "your_share": float(share.amount_owned),
            "your_percent": float(share.shared_percent) if share.shared_percent else 0,
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
    """Invite a user to share a subscription by email with optional custom percentage."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    subscription_id = data.get("subscription_id")
    email = (data.get("email") or "").strip().lower()
    custom_percent = data.get("share_percent")  # Optional: 1-99

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

    if str(invitee.user_id) == str(user_id):
        return jsonify({"error": "You cannot invite yourself"}), 400

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

    base_price = float(service.base_price)

    # Ensure the owner has a SharedSubscription record
    _ensure_owner_share(subscription_id, user_id, base_price)

    # Validate custom percentage
    if custom_percent is not None:
        try:
            custom_percent = float(custom_percent)
        except (TypeError, ValueError):
            return jsonify({"error": "share_percent must be a number"}), 400
        if custom_percent < 1 or custom_percent > 99:
            return jsonify({"error": "share_percent must be between 1 and 99"}), 400

    if custom_percent:
        # Custom percentage mode: invitee gets the specified percentage
        invitee_percent = custom_percent
        invitee_amount = round(base_price * invitee_percent / 100, 2)

        # Create invitee's share
        shared = SharedSubscription(
            subscription_id=subscription_id,
            member_user_id=invitee.user_id,
            shared_percent=invitee_percent,
            amount_owned=invitee_amount
        )
        db.session.add(shared)
        db.session.flush()

        # Redistribute the remaining percentage equally among existing members (excluding the new invitee)
        all_existing = SharedSubscription.query.filter_by(
            subscription_id=subscription_id
        ).filter(SharedSubscription.member_user_id != invitee.user_id).all()

        if all_existing:
            remaining_percent = 100.0 - invitee_percent
            per_member_percent = round(remaining_percent / len(all_existing), 2)
            for s in all_existing:
                s.shared_percent = per_member_percent
                s.amount_owned = round(base_price * per_member_percent / 100, 2)
    else:
        # Equal split mode
        shared = SharedSubscription(
            subscription_id=subscription_id,
            member_user_id=invitee.user_id,
            shared_percent=0,  # Placeholder, will be recalculated
            amount_owned=0
        )
        db.session.add(shared)
        db.session.flush()

        # Recalculate equal split for everyone
        _recalculate_equal_split(subscription_id, base_price)

    # Mark subscription as shared
    sub.is_shared = True
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
        message=f"{inviter_name} has invited you to share {service.name} ({shared.shared_percent}% — ₹{shared.amount_owned}/mo)."
    )

    return jsonify({
        "message": f"Invitation sent to {email}",
        "share": {
            "id": shared.id,
            "member_email": email,
            "share_percent": float(shared.shared_percent),
            "share_amount": float(shared.amount_owned),
        }
    }), 201


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

    subscription_id = share.subscription_id
    service = _get_service_for_subscription(subscription_id)

    db.session.delete(share)
    db.session.flush()

    # Recalculate splits for remaining members
    if service:
        remaining = SharedSubscription.query.filter_by(subscription_id=subscription_id).all()
        if len(remaining) <= 1:
            # Only owner left or nobody — reset to 100%
            for s in remaining:
                s.shared_percent = 100
                s.amount_owned = float(service.base_price)
        else:
            _recalculate_equal_split(subscription_id, service.base_price)

    db.session.commit()
    return jsonify({"message": "Invitation declined"}), 200


@shared_bp.route("/<int:share_id>", methods=["DELETE"])
@jwt_required()
def leave_shared(share_id):
    """Leave a shared subscription (or dissolve if owner)."""
    user_id = get_jwt_identity()
    share = SharedSubscription.query.filter_by(
        id=share_id, member_user_id=user_id
    ).first_or_404()

    subscription_id = share.subscription_id
    sub = Subscription.query.get(subscription_id)
    service = _get_service_for_subscription(subscription_id)
    is_owner = sub and str(sub.user_id) == str(user_id)

    if is_owner:
        # Owner dissolves — remove ALL shared records for this subscription
        SharedSubscription.query.filter_by(subscription_id=subscription_id).delete()
        if sub:
            sub.is_shared = False
            sub.split_ratio = 100.0
        db.session.commit()
        return jsonify({"message": "Shared subscription dissolved"}), 200

    # Non-owner leaves
    db.session.delete(share)
    db.session.flush()

    # Recalculate splits for remaining members
    if service:
        remaining = SharedSubscription.query.filter_by(subscription_id=subscription_id).all()
        if len(remaining) <= 1:
            for s in remaining:
                s.shared_percent = 100
                s.amount_owned = float(service.base_price)
            # Only owner left, no longer shared
            if sub:
                sub.is_shared = False
                sub.split_ratio = 100.0
        else:
            _recalculate_equal_split(subscription_id, service.base_price)

    db.session.commit()
    return jsonify({"message": "Left shared subscription"}), 200


@shared_bp.route("/<int:share_id>/percent", methods=["PATCH"])
@jwt_required()
def update_member_percent(share_id):
    """Owner can update a member's share percentage."""
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    new_percent = data.get("share_percent")
    if new_percent is None:
        return jsonify({"error": "share_percent is required"}), 400

    try:
        new_percent = float(new_percent)
    except (TypeError, ValueError):
        return jsonify({"error": "share_percent must be a number"}), 400

    if new_percent < 1 or new_percent > 99:
        return jsonify({"error": "share_percent must be between 1 and 99"}), 400

    # Find the share record
    target_share = SharedSubscription.query.get_or_404(share_id)
    subscription_id = target_share.subscription_id

    # Verify the current user owns this subscription
    sub = Subscription.query.filter_by(
        subscription_id=subscription_id,
        user_id=user_id
    ).first()
    if not sub:
        return jsonify({"error": "Only the subscription owner can update shares"}), 403

    service = _get_service_for_subscription(subscription_id)
    if not service:
        return jsonify({"error": "Service not found"}), 404

    base_price = float(service.base_price)

    # Update target member's percent
    target_share.shared_percent = new_percent
    target_share.amount_owned = round(base_price * new_percent / 100, 2)

    # Redistribute remaining percentage equally among other members
    others = SharedSubscription.query.filter_by(
        subscription_id=subscription_id
    ).filter(SharedSubscription.id != share_id).all()

    if others:
        remaining_percent = 100.0 - new_percent
        per_other = round(remaining_percent / len(others), 2)
        for s in others:
            s.shared_percent = per_other
            s.amount_owned = round(base_price * per_other / 100, 2)

    db.session.commit()

    return jsonify({"message": "Share percentage updated"}), 200


@shared_bp.route("/stats", methods=["GET"])
@jwt_required()
def shared_stats():
    user_id = get_jwt_identity()
    shares = SharedSubscription.query.filter_by(member_user_id=user_id).all()

    total_savings = 0
    for share in shares:
        service = _get_service_for_subscription(share.subscription_id)
        if service:
            total_savings += float(service.base_price) - float(share.amount_owned)

    return jsonify({
        "shared_subscriptions": len(shares),
        "monthly_savings": round(total_savings, 2),
    }), 200