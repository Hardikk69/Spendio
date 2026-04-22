from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Notification

notifications_bp = Blueprint("notifications", __name__)

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.sent_at.desc()).all()
    
    # Format the notifications for the frontend
    formatted_notifications = []
    for notif in notifications:
        # Check if type determines color or icon
        n_dict = notif.to_dict()
        n_dict["id"] = notif.notification_id
        
        # Mapping for the frontend expectations
        # The frontend uses: type, title, message, time (we use sent_at here), read, icon, color
        # Since icon needs to be a React component we just map type to color
        n_type = n_dict.get("type", "alert")
        if n_type in ["payment", "refund", "success"]:
            color = "green"
        elif n_type in ["warning", "alert"]:
            color = "red"
        elif n_type in ["reminder"]:
            color = "orange"
        else:
            color = "blue"
            
        n_dict["color"] = color
        n_dict["read"] = notif.is_read
        
        # Simple time formatting or let frontend handle
        if notif.sent_at:
            n_dict["time"] = notif.sent_at.isoformat()
        else:
            n_dict["time"] = "Just now"

        formatted_notifications.append(n_dict)

    return jsonify({"notifications": formatted_notifications}), 200

@notifications_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_as_read(notification_id):
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(notification_id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    notification.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read", "notification": notification.to_dict()}), 200

@notifications_bp.route("/read-all", methods=["PUT"])
@jwt_required()
def mark_all_as_read():
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200