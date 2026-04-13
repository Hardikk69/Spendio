from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from app.extensions import db
from app.models import Subscription

subs_bp = Blueprint("subscriptions", __name__)


def _parse_date(date_str):
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%b %d, %Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


@subs_bp.route("/", methods=["GET"])
@jwt_required()
def list_subscriptions():
    user_id = get_jwt_identity()
    status_filter = request.args.get("status", "").strip().lower()
    search = request.args.get("search", "").strip().lower()

    query = Subscription.query.filter_by(user_id=user_id)

    if status_filter and status_filter != "all":
        query = query.filter(db.func.lower(Subscription.status) == status_filter)

    if search:
        query = query.filter(
            db.or_(
                Subscription.name.ilike(f"%{search}%"),
                Subscription.category.ilike(f"%{search}%"),
            )
        )

    subs = query.order_by(Subscription.created_at.desc()).all()
    return jsonify({"subscriptions": [s.to_dict() for s in subs]}), 200


@subs_bp.route("/stats", methods=["GET"])
@jwt_required()
def subscription_stats():
    user_id = get_jwt_identity()
    subs = Subscription.query.filter_by(user_id=user_id).all()

    active = [s for s in subs if s.status == "Active"]
    paused = [s for s in subs if s.status == "Paused"]
    expired = [s for s in subs if s.status == "Expired"]
    cancelled = [s for s in subs if s.status == "Cancelled"]

    monthly_total = sum(
        float(s.amount) for s in active
        if s.billing_cycle == "Monthly"
    ) + sum(
        float(s.amount) / 12 for s in active
        if s.billing_cycle == "Yearly"
    ) + sum(
        float(s.amount) / 3 for s in active
        if s.billing_cycle == "Quarterly"
    )

    return jsonify({
        "total": len(subs),
        "active": len(active),
        "paused": len(paused),
        "expired": len(expired),
        "cancelled": len(cancelled),
        "monthly_total": round(monthly_total, 2),
    }), 200


@subs_bp.route("/", methods=["POST"])
@jwt_required()
def create_subscription():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    required = ["name", "amount", "category"]
    missing = [f for f in required if not data.get(f) and data.get(f) != 0]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    sub = Subscription(
        user_id=user_id,
        name=data["name"].strip(),
        category=data["category"].strip(),
        amount=float(data["amount"]),
        billing_cycle=data.get("billing_cycle", "Monthly"),
        next_billing=_parse_date(data.get("next_billing")),
        status=data.get("status", "Active"),
        autopay=bool(data.get("autopay", False)),
        logo_url=data.get("logo_url"),
        brand_color=data.get("brand_color"),
    )
    db.session.add(sub)
    db.session.commit()
    return jsonify({"message": "Subscription created", "subscription": sub.to_dict()}), 201


@subs_bp.route("/<sub_id>", methods=["GET"])
@jwt_required()
def get_subscription(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(id=sub_id, user_id=user_id).first_or_404()
    return jsonify({"subscription": sub.to_dict()}), 200


@subs_bp.route("/<sub_id>", methods=["PUT"])
@jwt_required()
def update_subscription(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(id=sub_id, user_id=user_id).first_or_404()
    data = request.get_json() or {}

    updatable = ["name", "category", "amount", "billing_cycle", "status", "autopay", "logo_url", "brand_color"]
    for field in updatable:
        if field in data:
            setattr(sub, field, data[field])

    if "next_billing" in data:
        sub.next_billing = _parse_date(data["next_billing"])

    db.session.commit()
    return jsonify({"message": "Subscription updated", "subscription": sub.to_dict()}), 200


@subs_bp.route("/<sub_id>/status", methods=["PATCH"])
@jwt_required()
def toggle_status(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(id=sub_id, user_id=user_id).first_or_404()

    if sub.status == "Paused":
        sub.status = "Active"
    elif sub.status == "Active":
        sub.status = "Paused"
    else:
        return jsonify({"error": "Only Active/Paused subscriptions can be toggled"}), 400

    db.session.commit()
    return jsonify({"message": f"Subscription is now {sub.status}", "subscription": sub.to_dict()}), 200


@subs_bp.route("/<sub_id>/autopay", methods=["PATCH"])
@jwt_required()
def toggle_autopay(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(id=sub_id, user_id=user_id).first_or_404()
    sub.autopay = not sub.autopay
    db.session.commit()
    return jsonify({
        "message": f"Auto-pay {'enabled' if sub.autopay else 'disabled'}",
        "subscription": sub.to_dict()
    }), 200


@subs_bp.route("/<sub_id>", methods=["DELETE"])
@jwt_required()
def delete_subscription(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(id=sub_id, user_id=user_id).first_or_404()
    db.session.delete(sub)
    db.session.commit()
    return jsonify({"message": "Subscription deleted"}), 200
