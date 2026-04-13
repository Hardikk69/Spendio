from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import NotificationSettings, PaymentSettings, User

settings_bp = Blueprint("settings", __name__)


def _ensure_notification_settings(user_id):
    ns = NotificationSettings.query.filter_by(user_id=user_id).first()
    if not ns:
        ns = NotificationSettings(user_id=user_id)
        db.session.add(ns)
        db.session.commit()
    return ns


def _ensure_payment_settings(user_id):
    ps = PaymentSettings.query.filter_by(user_id=user_id).first()
    if not ps:
        ps = PaymentSettings(user_id=user_id)
        db.session.add(ps)
        db.session.commit()
    return ps


@settings_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    ns = _ensure_notification_settings(user_id)
    return jsonify({"notifications": ns.to_dict()}), 200


@settings_bp.route("/notifications", methods=["PUT"])
@jwt_required()
def update_notifications():
    user_id = get_jwt_identity()
    ns = _ensure_notification_settings(user_id)
    data = request.get_json() or {}

    bool_fields = [
        "renewal_reminders", "payment_confirmations", "payment_failure_alerts",
        "refund_notifications", "shared_invites", "spending_insights"
    ]
    for field in bool_fields:
        if field in data:
            setattr(ns, field, bool(data[field]))

    db.session.commit()
    return jsonify({"message": "Notification settings updated", "notifications": ns.to_dict()}), 200


@settings_bp.route("/payment", methods=["GET"])
@jwt_required()
def get_payment():
    user_id = get_jwt_identity()
    ps = _ensure_payment_settings(user_id)
    return jsonify({"payment_settings": ps.to_dict()}), 200


@settings_bp.route("/payment", methods=["PUT"])
@jwt_required()
def update_payment():
    user_id = get_jwt_identity()
    ps = _ensure_payment_settings(user_id)
    data = request.get_json() or {}

    if "enable_autopay" in data:
        ps.enable_autopay = bool(data["enable_autopay"])
    if "default_payment_method" in data:
        ps.default_payment_method = data["default_payment_method"]
    if "preferred_billing_cycle" in data:
        ps.preferred_billing_cycle = data["preferred_billing_cycle"]
    if "auto_retry_failed" in data:
        ps.auto_retry_failed = bool(data["auto_retry_failed"])
    if "two_factor_auth" in data:
        ps.two_factor_auth = bool(data["two_factor_auth"])

    db.session.commit()
    return jsonify({"message": "Payment settings updated", "payment_settings": ps.to_dict()}), 200
