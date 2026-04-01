from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func, extract
from app.extensions import db
from app.models import Subscription, Transaction, User

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

    subs = Subscription.query.filter_by(user_id=user_id).all()
    active_subs = [s for s in subs if s.status == "Active"]
    shared_subs = [s for s in active_subs if s.shared_subscription is not None]

    monthly_spend = sum(float(s.amount) for s in active_subs if s.billing_cycle == "Monthly")
    monthly_spend += sum(float(s.amount) / 12 for s in active_subs if s.billing_cycle == "Yearly")
    monthly_spend += sum(float(s.amount) / 3 for s in active_subs if s.billing_cycle == "Quarterly")

    today = datetime.utcnow().date()
    in_7_days = today + timedelta(days=7)
    upcoming_count = sum(
        1 for s in active_subs
        if s.next_billing and today <= s.next_billing <= in_7_days
    )

    return jsonify({
        "active_subscriptions": len(active_subs),
        "monthly_spending": round(monthly_spend, 2),
        "upcoming_payments": upcoming_count,
        "shared_subscriptions": len(shared_subs),
    }), 200


@analytics_bp.route("/spending-trend", methods=["GET"])
@jwt_required()
def spending_trend():
    """Monthly spending breakdown for the current user."""
    user_id = get_jwt_identity()
    months = _months_back(7)
    result = []

    for y, m in months:
        total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.status == "Success",
            extract("year", Transaction.payment_date) == y,
            extract("month", Transaction.payment_date) == m,
        ).scalar()
        result.append({"month": _month_label(y, m), "amount": float(total)})

    return jsonify({"spending_trend": result}), 200


@analytics_bp.route("/subscriber-growth", methods=["GET"])
@jwt_required()
def subscriber_growth():
    """Admin/enterprise: total registered users per month."""
    months = _months_back(7)
    result = []
    cumulative = 0
    for y, m in months:
        count = db.session.query(func.count(User.id)).filter(
            extract("year", User.created_at) < y,
            db.or_(
                extract("year", User.created_at) < y,
                db.and_(
                    extract("year", User.created_at) == y,
                    extract("month", User.created_at) <= m,
                ),
            ),
        ).scalar() or 0
        result.append({"month": _month_label(y, m), "subscribers": count})

    return jsonify({"subscriber_growth": result}), 200


@analytics_bp.route("/revenue", methods=["GET"])
@jwt_required()
def revenue():
    """Admin: total platform revenue per month."""
    months = _months_back(7)
    result = []
    for y, m in months:
        total = db.session.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.status == "Success",
            extract("year", Transaction.payment_date) == y,
            extract("month", Transaction.payment_date) == m,
        ).scalar()
        result.append({"month": _month_label(y, m), "revenue": float(total)})

    return jsonify({"revenue": result}), 200


@analytics_bp.route("/churn", methods=["GET"])
@jwt_required()
def churn():
    """Admin: cancelled/expired subscriptions as % of total per month."""
    months = _months_back(7)
    result = []
    for y, m in months:
        total = Subscription.query.filter(
            extract("year", Subscription.created_at) <= y,
        ).count() or 1
        churned = Subscription.query.filter(
            Subscription.status.in_(["Cancelled", "Expired"]),
            extract("year", Subscription.updated_at) == y,
            extract("month", Subscription.updated_at) == m,
        ).count()
        rate = round((churned / total) * 100, 1)
        result.append({"month": _month_label(y, m), "rate": rate})

    return jsonify({"churn": result}), 200


@analytics_bp.route("/categories", methods=["GET"])
@jwt_required()
def categories():
    """Category distribution of active subscriptions for the current user."""
    user_id = get_jwt_identity()
    rows = db.session.query(
        Subscription.category,
        func.count(Subscription.id).label("count"),
        func.sum(Subscription.amount).label("total_amount"),
    ).filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
    ).group_by(Subscription.category).all()

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
    rows = db.session.query(
        Transaction.subscription_name,
        func.count(Transaction.id).label("payment_count"),
        func.sum(Transaction.amount).label("total_revenue"),
    ).filter(
        Transaction.user_id == user_id,
        Transaction.status == "Success",
    ).group_by(Transaction.subscription_name).order_by(
        func.sum(Transaction.amount).desc()
    ).limit(5).all()

    result = [
        {
            "name": r.subscription_name,
            "payment_count": r.payment_count,
            "total_revenue": float(r.total_revenue or 0),
        }
        for r in rows
    ]
    return jsonify({"top_subscriptions": result}), 200
