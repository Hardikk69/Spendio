from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from app.extensions import db
from app.models import User, Service, Subscription
from sqlalchemy import func

enterprise_bp = Blueprint("enterprise", __name__)

def require_enterprise(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.get_by_id(db.session, user_id)
        if not user or user.role != "enterprise":
            return jsonify({"error": "Enterprise access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@enterprise_bp.route("/services", methods=["GET"])
@require_enterprise
def list_enterprise_services():
    user_id = get_jwt_identity()
    services = Service.query.filter_by(owner_id=user_id).all()
    return jsonify({"services": [s.to_dict() for s in services]}), 200

@enterprise_bp.route("/services", methods=["POST"])
@require_enterprise
def create_enterprise_service():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    name = data.get("name")
    category = data.get("category")
    provider = data.get("provider")
    description = data.get("description")
    base_price = data.get("base_price")
    billing_cycle = data.get("billing_cycle", "Monthly")

    if not name or not category or not provider or base_price is None:
        return jsonify({"error": "Missing required fields: name, category, provider, and base_price are required"}), 400

    service = Service(
        name=name,
        category=category,
        provider=provider,
        description=description,
        base_price=float(base_price),
        billing_cycle=billing_cycle,
        owner_id=user_id,
        is_active=True
    )
    db.session.add(service)
    db.session.commit()

    return jsonify({"message": "Service created", "service": service.to_dict()}), 201
    
@enterprise_bp.route("/services/<int:service_id>", methods=["PUT"])
@require_enterprise
def update_enterprise_service(service_id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(service_id=service_id, owner_id=user_id).first_or_404()
    data = request.get_json() or {}
    
    if "name" in data: service.name = data["name"]
    if "category" in data: service.category = data["category"]
    if "provider" in data: service.provider = data["provider"]
    if "description" in data: service.description = data["description"]
    if "base_price" in data: service.base_price = float(data["base_price"])
    if "billing_cycle" in data: service.billing_cycle = data["billing_cycle"]
    
    db.session.commit()
    return jsonify({"message": "Service updated", "service": service.to_dict()}), 200

@enterprise_bp.route("/services/<int:service_id>", methods=["DELETE"])
@require_enterprise
def delete_enterprise_service(service_id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(service_id=service_id, owner_id=user_id).first_or_404()
    
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted successfully"}), 200

@enterprise_bp.route("/subscribers", methods=["GET"])
@require_enterprise
def list_subscribers():
    user_id = get_jwt_identity()
    
    # Get all services owned by this enterprise
    service_ids = [s.service_id for s in Service.query.filter_by(owner_id=user_id).all()]
    
    if not service_ids:
        return jsonify({"subscribers": []}), 200

    # Join Subscription with User and Service
    results = db.session.query(Subscription, User, Service).join(
        User, Subscription.user_id == User.user_id
    ).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(Subscription.service_id.in_(service_ids)).all()

    subscribers = []
    for sub, user, service in results:
        subscribers.append({
            "subscription_id": sub.subscription_id,
            "user_id": user.user_id,
            "user_name": user.name,
            "user_email": user.email,
            "service_name": service.name,
            "status": sub.status,
            "start_date": sub.start_date.isoformat() if sub.start_date else None,
            "next_billing_date": sub.next_billing_date.isoformat() if sub.next_billing_date else None,
        })

    return jsonify({"subscribers": subscribers}), 200

@enterprise_bp.route("/stats", methods=["GET"])
@require_enterprise
def enterprise_stats():
    user_id = get_jwt_identity()
    
    services = Service.query.filter_by(owner_id=user_id).all()
    service_ids = [s.service_id for s in services]
    
    if not service_ids:
        return jsonify({
            "total_services": 0,
            "total_subscribers": 0,
            "monthly_revenue": 0.0,
            "active_subscribers": 0
        }), 200

    total_subs = Subscription.query.filter(Subscription.service_id.in_(service_ids)).count()
    active_subs = Subscription.query.filter(
        Subscription.service_id.in_(service_ids),
        Subscription.status == "Active"
    ).count()

    # Calculate revenue
    revenue_results = db.session.query(
        func.sum(Service.base_price)
    ).join(
        Subscription, Service.service_id == Subscription.service_id
    ).filter(
        Service.service_id.in_(service_ids),
        Subscription.status == "Active"
    ).scalar()

    return jsonify({
        "total_services": len(services),
        "total_subscribers": total_subs,
        "active_subscribers": active_subs,
        "monthly_revenue": float(revenue_results or 0),
    }), 200

def _months_back(n=7):
    from datetime import datetime
    now = datetime.utcnow()
    months = []
    for i in range(n - 1, -1, -1):
        m = (now.month - 1 - i) % 12 + 1
        y = now.year + ((now.month - 1 - i) // 12)
        months.append((y, m))
    return months

def _month_label(y, m):
    from datetime import datetime
    return datetime(y, m, 1).strftime("%b")

@enterprise_bp.route("/growth", methods=["GET"])
@require_enterprise
def enterprise_growth():
    user_id = get_jwt_identity()
    months = _months_back(7)
    
    services = Service.query.filter_by(owner_id=user_id).all()
    service_ids = [s.service_id for s in services]
    
    if not service_ids:
        return jsonify([{"month": _month_label(y, m), "subscribers": 0, "revenue": 0} for y, m in months]), 200

    result = []
    for y, m in months:
        # Subscribers for this enterprise's services up to this month
        count = db.session.query(func.count(Subscription.subscription_id)).filter(
            Subscription.service_id.in_(service_ids),
            db.or_(
                func.extract("year", Subscription.start_date) < y,
                db.and_(
                    func.extract("year", Subscription.start_date) == y,
                    func.extract("month", Subscription.start_date) <= m,
                )
            )
        ).scalar() or 0

        # Revenue for this month (approximate based on active subs)
        rev = db.session.query(func.sum(Service.base_price)).join(
            Subscription, Service.service_id == Subscription.service_id
        ).filter(
            Service.service_id.in_(service_ids),
            Subscription.status == "Active",
            func.extract("year", Subscription.start_date) <= y,
            func.extract("month", Subscription.start_date) <= m
        ).scalar() or 0

        result.append({
            "month": _month_label(y, m),
            "subscribers": count,
            "revenue": float(rev)
        })

    return jsonify(result), 200
