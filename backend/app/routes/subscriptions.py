from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, datetime
from app.extensions import db
from app.models import Subscription, Service

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

    # Join Subscription with Service to get name, category, etc.
    query = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(Subscription.user_id == user_id)

    if status_filter and status_filter != "all":
        query = query.filter(db.func.lower(Subscription.status) == status_filter)

    if search:
        query = query.filter(
            db.or_(
                Service.name.ilike(f"%{search}%"),
                Service.category.ilike(f"%{search}%"),
            )
        )

    results = query.all()
    
    subscriptions_data = []
    for sub, service in results:
        data = sub.to_dict()
        data.update(service.to_dict())
        data['id'] = sub.subscription_id
        data['amount'] = float(service.base_price)
        data['next_billing'] = sub.next_billing_date.strftime("%b %d, %Y") if sub.next_billing_date else "N/A"
        data['autopay'] = sub.auto_pay
        subscriptions_data.append(data)

    return jsonify({"subscriptions": subscriptions_data}), 200


@subs_bp.route("/stats", methods=["GET"])
@jwt_required()
def subscription_stats():
    user_id = get_jwt_identity()
    results = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(Subscription.user_id == user_id).all()

    active = [r for r in results if r[0].status == "Active"]
    paused = [r for r in results if r[0].status == "Paused"]
    expired = [r for r in results if r[0].status == "Expired"]
    cancelled = [r for r in results if r[0].status == "Cancelled"]

    monthly_total = 0
    for sub, service in active:
        amount = float(service.base_price)
        cycle = service.billing_cycle
        if cycle == "Monthly":
            monthly_total += amount
        elif cycle == "Yearly":
            monthly_total += amount / 12
        elif cycle == "Quarterly":
            monthly_total += amount / 3

    return jsonify({
        "total": len(results),
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

    # Handle payload variations from frontend
    name = data.get("name") or data.get("provider_name")
    amount = data.get("amount")
    category = data.get("category")
    next_billing = data.get("next_billing") or data.get("next_billing_date")
    provider = data.get("provider") or name

    if not name or not amount or not category:
        return jsonify({"error": "Missing name, amount, or category"}), 400

    service = Service(
        name=name.strip(),
        category=category.strip(),
        provider=provider.strip(),
        base_price=float(amount),
        billing_cycle=data.get("billing_cycle", "Monthly"),
        is_active=True
    )
    db.session.add(service)
    db.session.flush()

    sub = Subscription(
        user_id=user_id,
        service_id=service.service_id,
        start_date=date.today(),
        next_billing_date=_parse_date(next_billing),
        status=data.get("status", "Active").capitalize(),
        auto_pay=bool(data.get("autopay", False)),
        is_shared=False,
        split_ratio=100.0
    )
    db.session.add(sub)
    db.session.commit()
    
    res = sub.to_dict()
    res.update(service.to_dict())
    res['id'] = sub.subscription_id
    res['amount'] = float(service.base_price)
    res['next_billing'] = sub.next_billing_date.strftime("%b %d, %Y") if sub.next_billing_date else "N/A"
    res['autopay'] = sub.auto_pay
    
    return jsonify({"message": "Subscription created", "subscription": res}), 201


@subs_bp.route("/<sub_id>", methods=["GET"])
@jwt_required()
def get_subscription(sub_id):
    user_id = get_jwt_identity()
    result = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(Subscription.subscription_id == sub_id, Subscription.user_id == user_id).first_or_404()
    
    sub, service = result
    data = sub.to_dict()
    data.update(service.to_dict())
    data['id'] = sub.subscription_id
    data['amount'] = float(service.base_price)
    data['next_billing'] = sub.next_billing_date.strftime("%b %d, %Y") if sub.next_billing_date else "N/A"
    data['autopay'] = sub.auto_pay
    
    return jsonify({"subscription": data}), 200


@subs_bp.route("/<sub_id>", methods=["PUT"])
@jwt_required()
def update_subscription(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(subscription_id=sub_id, user_id=user_id).first_or_404()
    service = Service.query.get(sub.service_id)
    
    data = request.get_json() or {}

    # Update Service info
    if "name" in data: service.name = data["name"].strip()
    if "category" in data: service.category = data["category"].strip()
    if "amount" in data: service.base_price = float(data["amount"])
    if "billing_cycle" in data: service.billing_cycle = data["billing_cycle"]
    
    # Update Subscription info
    if "status" in data: sub.status = data["status"]
    if "autopay" in data: sub.auto_pay = bool(data["autopay"])
    if "next_billing" in data: sub.next_billing_date = _parse_date(data["next_billing"])

    db.session.commit()
    
    res = sub.to_dict()
    res.update(service.to_dict())
    res['id'] = sub.subscription_id
    res['amount'] = float(service.base_price)
    res['next_billing'] = sub.next_billing_date.strftime("%b %d, %Y") if sub.next_billing_date else "N/A"
    res['autopay'] = sub.auto_pay
    
    return jsonify({"message": "Subscription updated", "subscription": res}), 200


@subs_bp.route("/<sub_id>/status", methods=["PATCH"])
@jwt_required()
def toggle_status(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(subscription_id=sub_id, user_id=user_id).first_or_404()

    if sub.status == "Paused":
        sub.status = "Active"
    elif sub.status == "Active":
        sub.status = "Paused"
    else:
        return jsonify({"error": "Only Active/Paused subscriptions can be toggled"}), 400

    db.session.commit()
    return jsonify({"message": f"Subscription is now {sub.status}"}), 200


@subs_bp.route("/<sub_id>/autopay", methods=["PATCH"])
@jwt_required()
def toggle_autopay(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(subscription_id=sub_id, user_id=user_id).first_or_404()
    sub.auto_pay = not sub.auto_pay
    db.session.commit()
    return jsonify({
        "message": f"Auto-pay {'enabled' if sub.auto_pay else 'disabled'}"
    }), 200


@subs_bp.route("/<sub_id>", methods=["DELETE"])
@jwt_required()
def delete_subscription(sub_id):
    user_id = get_jwt_identity()
    sub = Subscription.query.filter_by(subscription_id=sub_id, user_id=user_id).first_or_404()
    db.session.delete(sub)
    db.session.commit()
    return jsonify({"message": "Subscription deleted"}), 200
