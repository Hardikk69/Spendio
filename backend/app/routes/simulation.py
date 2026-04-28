from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import date, timedelta, datetime
from app.extensions import db
from app.models import Subscription, Service, User, Billing, Payment
from app.services.notification_service import create_notification

simulation_bp = Blueprint("simulation", __name__)

# In-memory simulation state (resets on server restart)
# In a real app, this would be in Redis or DB, but we are restricted from schema changes.
sim_state = {
    "is_active": False,
    "current_date": date.today(),
    "logs": []
}

@simulation_bp.route("/status", methods=["GET"])
@jwt_required()
def get_status():
    return jsonify({
        "is_active": sim_state["is_active"],
        "current_date": sim_state["current_date"].isoformat(),
        "logs": sim_state["logs"][-20:] # Return last 20 logs
    }), 200

@simulation_bp.route("/toggle", methods=["POST"])
@jwt_required()
def toggle_simulation():
    data = request.get_json() or {}
    sim_state["is_active"] = data.get("active", not sim_state["is_active"])
    if sim_state["is_active"]:
        sim_state["logs"].append(f"[{datetime.utcnow().isoformat()}] Simulation started.")
    else:
        sim_state["logs"].append(f"[{datetime.utcnow().isoformat()}] Simulation paused.")
    return jsonify({"is_active": sim_state["is_active"]}), 200

@simulation_bp.route("/tick", methods=["POST"])
@jwt_required()
def tick():
    """
    Simulate 1 day passing. 
    1 real second = 1 simulated day.
    """
    if not sim_state["is_active"]:
        return jsonify({"message": "Simulation is not active"}), 400

    user_id = get_jwt_identity()
    sim_state["current_date"] += timedelta(days=1)
    current_sim_date = sim_state["current_date"]
    
    # Find active subscriptions for THIS USER due on or before this simulated date
    due_subs = db.session.query(Subscription, Service, User).join(
        Service, Subscription.service_id == Service.service_id
    ).join(
        User, Subscription.user_id == User.user_id
    ).filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.next_billing_date <= current_sim_date
    ).all()

    processed_count = 0
    for sub, service, user in due_subs:
        price = float(service.base_price)
        
        if user.money >= price:
            # Deduct full balance from owner
            user.money -= int(price)
            
            # Calculate Splits for Ledger
            from app.models import SharedSubscription
            members = SharedSubscription.query.filter_by(subscription_id=sub.subscription_id).all()
            member_count = len(members)
            
            split_info = ""
            if member_count > 0:
                total_people = member_count + 1
                per_person = round(price / total_people, 2)
                split_info = f" (Split: \u20b9{per_person} x {total_people} users)"
                
                # Update SharedSubscription records to reflect this cycle's debt
                for m in members:
                    m.amount_owned = per_person
            
            # Create Billing record
            billing = Billing(
                subscription_id=sub.subscription_id,
                amount_due=price,
                billing_date=current_sim_date,
                status="Paid"
            )
            db.session.add(billing)
            db.session.flush()
            
            # Create Payment record
            payment = Payment(
                billing_id=billing.billing_id,
                amount_paid=price,
                timestamp=datetime.combine(current_sim_date, datetime.min.time()),
                status="Success"
            )
            db.session.add(payment)
            
            # Update next billing date
            sub.next_billing_date = current_sim_date + timedelta(days=30)
            
            log_msg = f"[{current_sim_date.isoformat()}] Owner Paid: \u20b9{price} for {service.name}{split_info}"
            sim_state["logs"].append(log_msg)
            
            # Notify owner
            create_notification(
                user_id=user.user_id,
                n_type="payment",
                title="Shared Payment Processed",
                message=f"[Simulation] Full payment for {service.name} (\u20b9{price}) deducted from your wallet.{split_info}"
            )
            
            # Notify members about their share
            for m in members:
                create_notification(
                    user_id=m.member_user_id,
                    n_type="reminder",
                    title="Shared Subscription Cycle",
                    message=f"[Simulation] Cycle for {service.name} started. Your share for this period is \u20b9{m.amount_owned}."
                )
                
            processed_count += 1
        else:
            # Insufficient funds - Pause subscription
            sub.status = "Paused"
            sim_state["logs"].append(
                f"[{current_sim_date.isoformat()}] FAILED: Insufficient funds for {service.name} ({user.email})"
            )
            create_notification(
                user_id=user.user_id,
                n_type="warning",
                title="Simulation: Payment Failed",
                message=f"[Simulation] Your subscription for {service.name} was paused due to insufficient balance."
            )

    db.session.commit()
    return jsonify({
        "current_date": current_sim_date.isoformat(),
        "processed": processed_count,
        "logs": sim_state["logs"][-5:]
    }), 200

@simulation_bp.route("/reset", methods=["POST"])
@jwt_required()
def reset_simulation():
    sim_state["current_date"] = date.today()
    sim_state["logs"].append(f"[{datetime.utcnow().isoformat()}] Simulation reset to today.")
    return jsonify({"message": "Simulation reset", "current_date": sim_state["current_date"].isoformat()}), 200

@simulation_bp.route("/topup", methods=["POST"])
@jwt_required()
def sim_topup():
    user_id = get_jwt_identity()
    user = User.get_by_id(db.session, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    amount = 5000
    user.money = (user.money or 0) + amount
    db.session.commit()
    
    sim_state["logs"].append(f"[{datetime.utcnow().isoformat()}] Simulated top-up: +\u20b9{amount} for {user.email}")
    return jsonify({"message": "Simulated top-up successful", "new_balance": user.money}), 200
