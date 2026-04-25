from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date, timedelta
import os
import razorpay
from app.extensions import db
from app.models import Payment, Billing, Subscription, Service, User
from app.services.notification_service import create_notification

billing_bp = Blueprint("billing", __name__)


def _filter_by_period(query, period):
    now = datetime.utcnow()
    if period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0)
        query = query.filter(Payment.timestamp >= start)
    elif period == "quarter":
        quarter_start_month = ((now.month - 1) // 3) * 3 + 1
        start = now.replace(month=quarter_start_month, day=1, hour=0, minute=0, second=0)
        query = query.filter(Payment.timestamp >= start)
    elif period == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0)
        query = query.filter(Payment.timestamp >= start)
    return query


@billing_bp.route("/transactions", methods=["GET"])
@jwt_required()
def list_transactions():
    user_id = get_jwt_identity()
    period = request.args.get("period", "all").strip().lower()

    # We join Subscription and Service to get the name
    query = db.session.query(Payment, Service.name).join(
        Billing, Payment.billing_id == Billing.billing_id
    ).join(
        Subscription, Billing.subscription_id == Subscription.subscription_id
    ).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(Billing.user_id == user_id)
    
    query = _filter_by_period(query, period)
    results = query.order_by(Payment.timestamp.desc()).all()

    result = []
    for p, sname in results:
        d = p.to_dict()
        d['id'] = p.payment_id
        d['transaction_id'] = f"TXN-{p.payment_id:06d}"
        d['amount'] = float(p.amount_paid)
        d['date'] = p.timestamp.strftime("%b %d, %Y") if p.timestamp else None
        d['subscription_name'] = sname
        d['payment_method'] = "Credit Card" # Placeholder if not in DB
        result.append(d)

    return jsonify({"transactions": result}), 200


@billing_bp.route("/transactions/<txn_id>", methods=["GET"])
@jwt_required()
def get_transaction(txn_id):
    user_id = get_jwt_identity()
    payment = db.session.query(Payment).join(
        Billing, Payment.billing_id == Billing.billing_id
    ).filter(Payment.payment_id == txn_id, Billing.user_id == user_id).first_or_404()
    
    return jsonify({"transaction": payment.to_dict()}), 200


@billing_bp.route("/transactions/<txn_id>/retry", methods=["POST"])
@jwt_required()
def retry_payment(txn_id):
    user_id = get_jwt_identity()
    payment = db.session.query(Payment).join(
        Billing, Payment.billing_id == Billing.billing_id
    ).filter(Payment.payment_id == txn_id, Billing.user_id == user_id).first_or_404()

    if payment.status != "Failed":
        return jsonify({"error": "Only failed payments can be retried"}), 400

    # Simulate retry
    payment.status = "Success"
    db.session.commit()
    return jsonify({"message": "Payment retry successful", "transaction": payment.to_dict()}), 200


@billing_bp.route("/create-order", methods=["POST"])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    amount = data.get("amount")
    if amount is None:
        return jsonify({"error": "amount is required"}), 400
        
    try:
        # Initialize Razorpay client
        key_id = os.environ.get("RAZORPAY_KEY_ID")
        key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
        
        if not key_id or not key_secret:
            return jsonify({"error": "Razorpay credentials not configured"}), 500

        # Multiply by 100 as razorpay handles amount in subunits (paise)
        order_amount = int(float(amount) * 100)
        
        if order_amount < 100:
            return jsonify({"error": "Minimum amount is 100 paise (₹1)"}), 400

        order_currency = "INR"
        receipt = f"receipt_order_{user_id}_{int(datetime.utcnow().timestamp())}"
        
        client = razorpay.Client(auth=(key_id, key_secret))
        order = client.order.create({
            "amount": order_amount,
            "currency": order_currency,
            "receipt": receipt,
            "payment_capture": "1"
        })
            
        return jsonify({
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": key_id
        }), 200
        
    except Exception as e:
        print("Create Order Error:", str(e))
        return jsonify({"error": str(e) if "razorpay" in str(e).lower() else "Failed to create order"}), 500


@billing_bp.route("/verify-payment", methods=["POST"])
@jwt_required()
def verify_payment():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    transaction_id = data.get("transaction_id")
    
    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
        return jsonify({"error": "Missing required Razorpay payment details"}), 400

    try:
        key_id = os.environ.get("RAZORPAY_KEY_ID")
        key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
        
        if not key_id or not key_secret:
            return jsonify({"error": "Razorpay credentials not configured"}), 500
            
        # Verify signature using Razorpay client
        client = razorpay.Client(auth=(key_id, key_secret))
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
            
        # Signature is valid (or dummy validation passed)
        if transaction_id:
            # Updating a specific failed payment to Success
            payment = db.session.query(Payment).join(
                Billing, Payment.billing_id == Billing.billing_id
            ).filter(Payment.payment_id == transaction_id, Billing.user_id == user_id).first()
            
            if payment:
                payment.status = "Success"
                payment.method = "Razorpay"
                
                # Credit the paid amount to the user's wallet balance
                user = User.query.get(user_id)
                if user:
                    user.money = (user.money or 0) + int(float(payment.amount_paid))
                
                db.session.commit()
                
                # Retrieve subscription/service name
                sub_name = db.session.query(Service.name).join(
                    Subscription, Service.service_id == Subscription.service_id
                ).join(
                    Billing, Subscription.subscription_id == Billing.subscription_id
                ).filter(Billing.billing_id == payment.billing_id).scalar()
                
                create_notification(
                    user_id=user_id,
                    n_type="payment",
                    title="Payment Successful",
                    message=f"Your payment of ₹{payment.amount_paid} for {sub_name or 'subscription'} was processed successfully. Balance updated."
                )

        return jsonify({
            "message": "Payment verified successfully",
            "status": "success"
        }), 200
        
    except razorpay.errors.SignatureVerificationError:
        return jsonify({"error": "Payment signature verification failed"}), 400
    except Exception as e:
        print("Verify Payment Error:", str(e))
        return jsonify({"error": "Failed to verify payment"}), 500

@billing_bp.route("/upcoming", methods=["GET"])
@jwt_required()
def upcoming_bills():
    user_id = get_jwt_identity()
    today = date.today()
    in_30_days = today + timedelta(days=30)

    # Join Subscription with Service to get names/amounts
    results = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.next_billing_date != None,
        Subscription.next_billing_date >= today,
        Subscription.next_billing_date <= in_30_days,
    ).order_by(Subscription.next_billing_date.asc()).all()

    bills = [
        {
            "subscription_id": s.subscription_id,
            "subscription": svc.name,
            "amount": float(svc.base_price),
            "due_date": s.next_billing_date.strftime("%b %d, %Y"),
            "due_date_iso": s.next_billing_date.isoformat(),
            "autopay": s.auto_pay,
            "status": "upcoming",
        }
        for s, svc in results
    ]

    return jsonify({"upcoming_bills": bills, "count": len(bills)}), 200


@billing_bp.route("/stats", methods=["GET"])
@jwt_required()
def billing_stats():
    user_id = get_jwt_identity()
    current_year = datetime.utcnow().year
    year_start = datetime(current_year, 1, 1)

    # All payments for the current year
    all_payments = db.session.query(Payment).join(
        Billing, Payment.billing_id == Billing.billing_id
    ).filter(
        Billing.user_id == user_id,
        Payment.timestamp >= year_start,
    ).all()

    total_spent = sum(float(p.amount_paid) for p in all_payments if p.status == "Success")
    successful = sum(1 for p in all_payments if p.status == "Success")
    failed = sum(1 for p in all_payments if p.status == "Failed")

    today = date.today()
    in_30_days = today + timedelta(days=30)
    pending_bills = Subscription.query.filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.next_billing_date != None,
        Subscription.next_billing_date >= today,
        Subscription.next_billing_date <= in_30_days,
    ).count()

    return jsonify({
        "total_spent_year": round(total_spent, 2),
        "successful_payments": successful,
        "failed_payments": failed,
        "pending_payments": pending_bills,
    }), 200


@billing_bp.route("/simulate-autopay", methods=["POST"])
@jwt_required()
def simulate_autopay():
    """
    Testing endpoint: fast-forwards all active auto-pay subscriptions
    so their next_billing_date becomes today, then processes them —
    creates billing + payment records, credits the user's wallet, and
    advances next_billing_date by one cycle.
    """
    user_id = get_jwt_identity()
    today = date.today()
    now = datetime.utcnow()

    # Get all active auto-pay subscriptions for this user
    subs = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.auto_pay == True,
    ).all()

    if not subs:
        return jsonify({"message": "No active auto-pay subscriptions found", "processed": 0}), 200

    user = User.query.get(user_id)
    processed = []

    for sub, service in subs:
        amount = float(service.base_price)

        # 1. Fast-forward: set next_billing_date to today
        sub.next_billing_date = today

        # 2. Create a Billing record
        billing = Billing(
            subscription_id=sub.subscription_id,
            user_id=user_id,
            amount_due=amount,
            billing_date=today,
            status="Paid",
        )
        db.session.add(billing)
        db.session.flush()  # get billing_id

        # 3. Create a Payment record
        payment = Payment(
            billing_id=billing.billing_id,
            amount_paid=amount,
            status="Success",
            timestamp=now,
            method="Auto-pay (Simulated)",
        )
        db.session.add(payment)

        # 4. Credit the user's wallet balance
        if user:
            user.money = (user.money or 0) + int(amount)

        # 5. Advance next_billing_date by one cycle
        cycle = (service.billing_cycle or "Monthly").strip()
        if cycle == "Monthly":
            # Add ~1 month
            m = sub.next_billing_date.month % 12 + 1
            y = sub.next_billing_date.year + (1 if m == 1 else 0)
            try:
                sub.next_billing_date = sub.next_billing_date.replace(year=y, month=m)
            except ValueError:
                # Handle months with fewer days (e.g. Jan 31 -> Feb 28)
                import calendar
                last_day = calendar.monthrange(y, m)[1]
                sub.next_billing_date = sub.next_billing_date.replace(year=y, month=m, day=min(sub.next_billing_date.day, last_day))
        elif cycle == "Yearly":
            sub.next_billing_date = sub.next_billing_date.replace(year=sub.next_billing_date.year + 1)
        elif cycle == "Quarterly":
            m = sub.next_billing_date.month
            new_m = ((m - 1 + 3) % 12) + 1
            y = sub.next_billing_date.year + (1 if new_m <= m else 0)
            sub.next_billing_date = sub.next_billing_date.replace(year=y, month=new_m)
        else:
            sub.next_billing_date = sub.next_billing_date + timedelta(days=30)

        # 6. Notification
        create_notification(
            user_id=user_id,
            n_type="payment",
            title="Auto-pay Processed",
            message=f"Auto-payment of ₹{amount} for {service.name} was processed. Balance updated."
        )

        processed.append({
            "subscription": service.name,
            "amount": amount,
            "next_billing_date": sub.next_billing_date.isoformat(),
        })

    db.session.commit()

    return jsonify({
        "message": f"Simulated auto-pay for {len(processed)} subscription(s)",
        "processed": len(processed),
        "details": processed,
        "new_balance": user.money if user else 0,
    }), 200