settings.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User

settings_bp = Blueprint("settings", __name__)


@settings_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()}), 200


@settings_bp.route("/profile", methods=["PATCH"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    # Support updating by first_name + last_name or by combined name
    if "first_name" in data or "last_name" in data:
        first = data.get("first_name", user.first_name).strip()
        last = data.get("last_name", user.last_name).strip()
        user.name = f"{first} {last}".strip()
    elif "name" in data:
        user.name = data["name"].strip()

    # phone is not in schema yet — silently ignore
    db.session.commit()
    return jsonify({"message": "Profile updated successfully", "user": user.to_dict()}), 200


@settings_bp.route("/password", methods=["PATCH"])
@jwt_required()
def update_password():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"error": "current_password and new_password are required"}), 400

    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200


@settings_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    return jsonify({
        "notifications": {
            "renewal_reminders": True,
            "payment_confirmations": True,
            "payment_failure_alerts": True,
            "refund_notifications": False,
            "shared_invites": True,
            "spending_insights": True
        }
    }), 200


@settings_bp.route("/notifications", methods=["PUT"])
@jwt_required()
def update_notifications():
    # Placeholder until a user_settings table is added
    return jsonify({"message": "Notification settings saved"}), 200


@settings_bp.route("/payment", methods=["GET"])
@jwt_required()
def get_payment():
    return jsonify({
        "payment_settings": {
            "enable_autopay": False,
            "default_payment_method": "Credit Card",
            "preferred_billing_cycle": "Monthly",
            "auto_retry_failed": True,
            "two_factor_auth": False
        }
    }), 200


@settings_bp.route("/payment", methods=["PUT"])
@jwt_required()
def update_payment():
    # Placeholder until a user_settings table is added
    return jsonify({"message": "Payment settings updated"}), 200