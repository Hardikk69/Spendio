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
    """List shared subscriptions for the current user (both as member and owner)."""
    user_id = get_jwt_identity()

    # 1. Find subscriptions where user is a MEMBER
    member_shares = SharedSubscription.query.filter_by(member_user_id=user_id).all()
    sub_ids_as_member = [s.subscription_id for s in member_shares]

    # 2. Find subscriptions where user is the OWNER and has invited others
    owned_subs_with_shares = db.session.query(Subscription.subscription_id).join(
        SharedSubscription, Subscription.subscription_id == SharedSubscription.subscription_id
    ).filter(Subscription.user_id == user_id).distinct().all()
    sub_ids_as_owner = [s[0] for s in owned_subs_with_shares]

    # Combine all unique subscription IDs that are shared
    all_shared_sub_ids = list(set(sub_ids_as_member + sub_ids_as_owner))

    result = []
    for sub_id in all_shared_sub_ids:
        sub_data = db.session.query(Subscription, Service).join(
            Service, Subscription.service_id == Service.service_id
        ).filter(Subscription.subscription_id == sub_id).first()

        if not sub_data:
            continue

        sub, service = sub_data
        is_owner = str(sub.user_id) == str(user_id)

        # Get all active members for this subscription
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

        if is_owner:
            member_total = sum(float(s.amount_owned) for s in all_shares)
            your_share = float(service.base_price) - member_total
        else:
            share_record = next((s for s in all_shares if str(s.member_user_id) == str(user_id)), None)
            your_share = float(share_record.amount_owned) if share_record else float(service.base_price)

        result.append({
            "id": sub_id, # Use sub_id as the primary identifier here
            "subscription_id": sub_id,
            "subscription_name": service.name,
            "total_amount": float(service.base_price),
            "your_share": round(your_share, 2),
            "member_count": len(all_shares),
            "role": "Owner" if is_owner else "Member",
            "status": sub.status,
            "billing_cycle": service.billing_cycle,
            "members": members,
        })

    return jsonify({"shares": result}), 200


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

    # Check if an invitation is already pending
    from app.models import Notification
    existing_pending = Notification.query.filter(
        Notification.user_id == invitee.user_id,
        Notification.type == "share",
        Notification.is_read == False,
        Notification.message.like(f"INVITE:{subscription_id}|%")
    ).first()
    if existing_pending:
        return jsonify({"error": "An invitation is already pending for this user"}), 409

    # Get service info
    service = Service.query.get(sub.service_id)
    if not service:
        return jsonify({"error": "Service info not found"}), 404

    # Calculate potential split including both active members and other pending invites
    from app.models import Notification
    active_count = SharedSubscription.query.filter_by(subscription_id=subscription_id).count()
    pending_count = Notification.query.filter(
        Notification.type == "share",
        Notification.is_read == False,
        Notification.message.like(f"INVITE:{subscription_id}|%")
    ).count()
    
    # +1 for owner, +1 for this new invitee
    total_potential_members = active_count + pending_count + 1
    split_amount = round(float(service.base_price) / total_potential_members, 2)

    # Trigger notification to the invitee (This acts as our 'Pending' state)
    inviter = User.query.get(user_id)
    inviter_name = f"{inviter.first_name or ''} {inviter.last_name or ''}".strip() or inviter.email

    create_notification(
        user_id=invitee.user_id,
        n_type="share",
        title="Shared Subscription Invite",
        message=f"INVITE:{subscription_id}|{inviter_name} has invited you to share the cost of {service.name}. If you accept, your estimated share will be \u20b9{split_amount} per cycle."
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


@shared_bp.route("/invitations", methods=["GET"])
@jwt_required()
def list_invitations():
    """List pending invitations from notifications."""
    from app.models import Notification
    user_id = get_jwt_identity()
    
    # Find unread share notifications that start with INVITE:
    notifs = Notification.query.filter(
        Notification.user_id == user_id,
        Notification.type == "share",
        Notification.is_read == False,
        Notification.message.like("INVITE:%")
    ).all()
    
    invites = []
    for n in notifs:
        try:
            # Flexible parsing for "INVITE:sub_id|message" or just "INVITE:sub_id"
            msg_content = n.message.split(":", 1)[1]
            if "|" in msg_content:
                parts = msg_content.split("|", 1)
                sub_id = int(parts[0])
                text = parts[1]
            else:
                sub_id = int(msg_content)
                text = n.message
            
            sub_data = db.session.query(Subscription, Service, User).join(
                Service, Subscription.service_id == Service.service_id
            ).join(
                User, Subscription.user_id == User.user_id
            ).filter(Subscription.subscription_id == sub_id).first()
            
            if sub_data:
                sub, service, owner = sub_data
                
                # Calculate current split for display (Owner + Active Members + All Pending Invites)
                active_count = SharedSubscription.query.filter_by(subscription_id=sub_id).count()
                pending_count = Notification.query.filter(
                    Notification.type == "share",
                    Notification.is_read == False,
                    Notification.message.like(f"INVITE:{sub_id}|%")
                ).count()
                
                # We are one of the pending invites, so active_count + pending_count + 1 (owner)
                # is already the total potential group size.
                total_people = active_count + pending_count + 1
                share_amount = round(float(service.base_price) / total_people, 2)
                
                # Defensive fallbacks
                s_name = service.name if service and service.name else "Unknown Service"
                o_name = owner.name if owner and owner.name else (owner.email if owner else "Unknown User")
                
                invites.append({
                    "id": n.notification_id,
                    "subscription_id": sub_id,
                    "subscription_name": s_name,
                    "inviter_name": o_name,
                    "owner_email": owner.email if owner else "",
                    "message": text or "No message provided",
                    "share_amount": float(share_amount),
                    "status": "Pending",
                    "sent_at": n.sent_at.isoformat() if n.sent_at else None
                })
                # Log for debugging (will show in flask logs)
                print(f"DEBUG: Found Invite - Sub: {s_name}, From: {o_name}, Share: {share_amount}")
        except:
            continue
            
    return jsonify({"invitations": invites}), 200


@shared_bp.route("/invitations/<int:notif_id>/accept", methods=["POST"])
@jwt_required()
def accept_invitation(notif_id):
    """Accept a shared subscription invitation."""
    from app.models import Notification
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    notif = Notification.query.filter_by(notification_id=notif_id, user_id=user_id).first_or_404()
    
    # Parse sub_id
    try:
        sub_id = int(notif.message.split(":", 1)[1].split("|", 1)[0])
    except:
        return jsonify({"error": "Invalid invitation format"}), 400
        
    sub = Subscription.query.get_or_404(sub_id)
    service = Service.query.get(sub.service_id)
    
    # Add to SharedSubscription (Now officially a member)
    # Recalculate all splits for this sub
    all_active_members = SharedSubscription.query.filter_by(subscription_id=sub_id).all()
    total_active_members = len(all_active_members) + 2 # owner + new member + existing members
    
    new_split_percent = int(100 / total_active_members)
    new_amount_owned = round(float(service.base_price) / total_active_members, 2)
    
    # Update existing members
    for member in all_active_members:
        member.shared_percent = new_split_percent
        member.amount_owned = new_amount_owned
        
    # Add new member
    shared = SharedSubscription(
        subscription_id=sub_id,
        member_user_id=user_id,
        shared_percent=new_split_percent,
        amount_owned=new_amount_owned
    )
    db.session.add(shared)
    
    # Mark invite as read
    notif.is_read = True
    
    # Notify owner
    create_notification(
        user_id=sub.user_id,
        n_type="success",
        title="Invite Accepted",
        message=f"{user.name} has accepted your invitation to share {service.name}. Costs will be split starting next cycle."
    )
    
    db.session.commit()
    return jsonify({"message": "Invitation accepted"}), 200


@shared_bp.route("/invitations/<int:notif_id>/reject", methods=["POST"])
@jwt_required()
def reject_invitation(notif_id):
    """Reject/decline a shared subscription invitation."""
    from app.models import Notification
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    notif = Notification.query.filter_by(notification_id=notif_id, user_id=user_id).first_or_404()
    
    # Parse sub_id to notify owner
    try:
        sub_id = int(notif.message.split(":", 1)[1].split("|", 1)[0])
        sub = Subscription.query.get(sub_id)
        if sub:
            create_notification(
                user_id=sub.user_id,
                n_type="warning",
                title="Invite Declined",
                message=f"{user.name} has declined your invitation to share costs."
            )
    except:
        pass
        
    notif.is_read = True # Effectively removing it from 'Pending'
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
    """Calculate total savings from all shared subscriptions."""
    user_id = get_jwt_identity()
    
    # Savings from being a MEMBER (Base Price - Your Reduced Share)
    member_shares = SharedSubscription.query.filter_by(member_user_id=user_id).all()
    member_savings = 0
    for share in member_shares:
        sub_data = db.session.query(Service.base_price).join(
            Subscription, Subscription.service_id == Service.service_id
        ).filter(Subscription.subscription_id == share.subscription_id).first()
        if sub_data:
            member_savings += (float(sub_data[0]) - float(share.amount_owned))

    # Savings from being an OWNER (Sum of what others are paying you)
    owned_shares = db.session.query(SharedSubscription.amount_owned).join(
        Subscription, SharedSubscription.subscription_id == Subscription.subscription_id
    ).filter(Subscription.user_id == user_id).all()
    owner_savings = sum(float(s[0]) for s in owned_shares)

    total_savings = member_savings + owner_savings

    return jsonify({
        "shared_subscriptions": len(member_shares) + Subscription.query.join(
            SharedSubscription, Subscription.subscription_id == SharedSubscription.subscription_id
        ).filter(Subscription.user_id == user_id).distinct().count(),
        "monthly_savings": round(total_savings, 2),
    }), 200