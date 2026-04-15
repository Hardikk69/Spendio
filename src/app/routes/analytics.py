analytics.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from app.extensions import db
from app.models import Subscription, Payment, Billing, User, Service, SharedSubscription

analytics_bp = Blueprint("analytics", __name__)


def _months_back(n=7):
    """Return a list of (year, month) tuples for the last N months including current."""
    now = datetime.utcnow()
    months = []
    for i in range(n - 1, -1, -1):
        m = (now.month - 1 - i) % 12 + 1
        y = now.year + ((now.month - 1 - i) // 12)
        months.append((y, m))
    return months


def _month_label(y, m):
    return datetime(y, m, 1).strftime("%b")


@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
def summary():
    """Key stat cards for the authenticated user's dashboard."""
    user_id = get_jwt_identity()

    # Join Subscription with Service
    results = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(Subscription.user_id == user_id).all()

    active_results = [r for r in results if r[0].status == "Active"]
    
    # Check for shared subscriptions
    shared_subs_count = SharedSubscription.query.filter_by(member_user_id=user_id).count()

    monthly_spend = 0
    for sub, service in active_results:
        amount = float(service.base_price)
        cycle = service.billing_cycle
        if cycle == "Monthly":
            monthly_spend += amount
        elif cycle == "Yearly":
            monthly_spend += amount / 12
        elif cycle == "Quarterly":
            monthly_spend += amount / 3

    today = datetime.utcnow().date()
    in_7_days = today + timedelta(days=7)
    upcoming_count = sum(
        1 for sub, service in active_results
        if sub.next_billing_date and today <= sub.next_billing_date <= in_7_days
    )

    return jsonify({
        "summary": {
            "active_subscriptions": len(active_results),
            "total_subscriptions": len(results),
            "monthly_spending": round(monthly_spend, 2),
            "upcoming_payments": upcoming_count,
            "upcoming_renewals": upcoming_count,
            "shared_subscriptions": shared_subs_count,
            "active_members": len(active_results),
        }
    }), 200


@analytics_bp.route("/spending-trend", methods=["GET"])
@jwt_required()
def spending_trend():
    """Monthly spending breakdown for the current user."""
    user_id = get_jwt_identity()
    months = _months_back(7)
    result = []

    for y, m in months:
        # Sum payments in this month for this user
        total = db.session.query(func.coalesce(func.sum(Payment.amount_paid), 0)).join(
            Billing, Payment.billing_id == Billing.billing_id
        ).filter(
            Billing.user_id == user_id,
            Payment.status == "Success",
            extract("year", Payment.timestamp) == y,
            extract("month", Payment.timestamp) == m,
        ).scalar()
        result.append({"month": _month_label(y, m), "amount": float(total)})

    return jsonify(result), 200


@analytics_bp.route("/subscriber-growth", methods=["GET"])
@jwt_required()
def subscriber_growth():
    """Admin/enterprise: total registered users per month."""
    months = _months_back(7)
    result = []
    for y, m in months:
        count = db.session.query(func.count(User.user_id)).filter(
            db.or_(
                extract("year", User.created_at) < y,
                db.and_(
                    extract("year", User.created_at) == y,
                    extract("month", User.created_at) <= m,
                ),
            ),
        ).scalar() or 0
        result.append({"month": _month_label(y, m), "subscribers": count})

    return jsonify({ "subscriber_growth": result }), 200


@analytics_bp.route("/revenue", methods=["GET"])
@jwt_required()
def revenue():
    """Admin: total platform revenue per month."""
    months = _months_back(7)
    result = []
    for y, m in months:
        total = db.session.query(func.coalesce(func.sum(Payment.amount_paid), 0)).filter(
            Payment.status == "Success",
            extract("year", Payment.timestamp) == y,
            extract("month", Payment.timestamp) == m,
        ).scalar()
        result.append({"month": _month_label(y, m), "revenue": float(total)})

    return jsonify({"revenue": result}), 200


@analytics_bp.route("/churn-rate", methods=["GET"])
@jwt_required()
def churn():
    """Admin: cancelled/expired subscriptions as % of total per month."""
    months = _months_back(7)
    result = []
    for y, m in months:
        total = Subscription.query.filter(
            extract("year", Subscription.start_date) <= y,
        ).count() or 1
        
        # We don't have a specific cancelled_at, so we might use a status check?
        # For now, following the original logic but adapting to status field.
        # This is an approximation.
        churned = Subscription.query.filter(
            Subscription.status.in_(["Cancelled", "Expired"]),
            # We don't have enough metadata to know exactly when it churned without a log
            # but we can look at some date field if applicable.
        ).count()
        rate = round((churned / total) * 100, 1)
        result.append({"month": _month_label(y, m), "rate": rate})

    return jsonify({ "churn_rate": result }), 200


@analytics_bp.route("/categories", methods=["GET"])
@jwt_required()
def categories():
    """Category distribution of active subscriptions for the current user."""
    user_id = get_jwt_identity()
    rows = db.session.query(
        Service.category,
        func.count(Subscription.subscription_id).label("count"),
        func.sum(Service.base_price).label("total_amount"),
    ).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
    ).group_by(Service.category).all()

    total = sum(r.count for r in rows) or 1
    category_colors = {
        "OTT": "#3b82f6",
        "Music": "#10b981",
        "SaaS": "#8b5cf6",
        "Gaming": "#f59e0b",
        "Utilities": "#ef4444",
        "Other": "#64748b",
    }

    result = [
        {
            "name": r.category,
            "count": r.count,
            "value": round((r.count / total) * 100, 1),
            "total_amount": float(r.total_amount or 0),
            "color": category_colors.get(r.category, "#64748b"),
        }
        for r in rows
    ]
    return jsonify({"categories": result}), 200


@analytics_bp.route("/top-subscriptions", methods=["GET"])
@jwt_required()
def top_subscriptions():
    """Top subscriptions by total payment volume."""
    user_id = get_jwt_identity()
    
    # We join Payment -> Billing -> Subscription -> Service
    rows = db.session.query(
        Service.name,
        func.count(Payment.payment_id).label("payment_count"),
        func.sum(Payment.amount_paid).label("total_revenue"),
    ).join(
        Billing, Payment.billing_id == Billing.billing_id
    ).join(
        Subscription, Billing.subscription_id == Subscription.subscription_id
    ).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(
        Billing.user_id == user_id,
        Payment.status == "Success",
    ).group_by(Service.name).order_by(
        func.sum(Payment.amount_paid).desc()
    ).limit(5).all()

    result = [
        {
            "name": r.name,
            "payment_count": r.payment_count,
            "total_revenue": float(r.total_revenue or 0),
        }
        for r in rows
    ]
    return jsonify({"top_subscriptions": result}), 200