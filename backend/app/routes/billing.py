from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
from app.extensions import db
from app.models import Transaction, Subscription

billing_bp = Blueprint("billing", __name__)


def _filter_by_period(query, period):
    now = datetime.utcnow()
    if period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0)
        query = query.filter(Transaction.payment_date >= start)
    elif period == "quarter":
        quarter_start_month = ((now.month - 1) // 3) * 3 + 1
        start = now.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0)
        query = query.filter(Transaction.payment_date >= start)
    elif period == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0)
        query = query.filter(Transaction.payment_date >= start)
    return query


@billing_bp.route("/transactions", methods=["GET"])
@jwt_required()
def list_transactions():
    user_id = get_jwt_identity()
    period = request.args.get("period", "all").strip().lower()

    query = Transaction.query.filter_by(user_id=user_id)
    query = _filter_by_period(query, period)
    transactions = query.order_by(Transaction.payment_date.desc()).all()

    return jsonify({"transactions": [t.to_dict() for t in transactions]}), 200


@billing_bp.route("/transactions/<txn_id>", methods=["GET"])
@jwt_required()
def get_transaction(txn_id):
    user_id = get_jwt_identity()
    txn = Transaction.query.filter_by(id=txn_id, user_id=user_id).first_or_404()
    return jsonify({"transaction": txn.to_dict()}), 200


@billing_bp.route("/transactions/<txn_id>/retry", methods=["POST"])
@jwt_required()
def retry_payment(txn_id):
    user_id = get_jwt_identity()
    txn = Transaction.query.filter_by(id=txn_id, user_id=user_id).first_or_404()

    if txn.status != "Failed":
        return jsonify({"error": "Only failed payments can be retried"}), 400

    # Simulate retry — in production this would call a payment gateway
    txn.status = "Success"
    txn.invoice_available = True
    db.session.commit()
    return jsonify({"message": "Payment retry successful", "transaction": txn.to_dict()}), 200


@billing_bp.route("/upcoming", methods=["GET"])
@jwt_required()
def upcoming_bills():
    user_id = get_jwt_identity()
    today = date.today()
    in_30_days = today + timedelta(days=30)

    subs = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.next_billing != None,
        Subscription.next_billing >= today,
        Subscription.next_billing <= in_30_days,
    ).order_by(Subscription.next_billing.asc()).all()

    bills = [
        {
            "subscription_id": s.id,
            "subscription": s.name,
            "amount": float(s.amount),
            "due_date": s.next_billing.strftime("%b %d, %Y"),
            "due_date_iso": s.next_billing.isoformat(),
            "autopay": s.autopay,
            "status": "upcoming",
        }
        for s in subs
    ]

    return jsonify({"upcoming_bills": bills, "count": len(bills)}), 200


@billing_bp.route("/stats", methods=["GET"])
@jwt_required()
def billing_stats():
    user_id = get_jwt_identity()
    current_year = datetime.utcnow().year
    year_start = datetime(current_year, 1, 1)

    all_txns = Transaction.query.filter(
        Transaction.user_id == user_id,
        Transaction.payment_date >= year_start,
    ).all()

    total_spent = sum(float(t.amount) for t in all_txns if t.status == "Success")
    successful = sum(1 for t in all_txns if t.status == "Success")
    failed = sum(1 for t in all_txns if t.status == "Failed")

    today = date.today()
    in_30_days = today + timedelta(days=30)
    pending_bills = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.next_billing != None,
        Subscription.next_billing >= today,
        Subscription.next_billing <= in_30_days,
    ).count()

    return jsonify({
        "total_spent_this_year": round(total_spent, 2),
        "successful_payments": successful,
        "failed_payments": failed,
        "pending_upcoming": pending_bills,
    }), 200
