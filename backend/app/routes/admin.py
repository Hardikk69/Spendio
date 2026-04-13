from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from app.extensions import db
from app.models import User, Subscription, Transaction

admin_bp = Blueprint("admin", __name__)


def require_admin(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route("/dashboard", methods=["GET"])
@require_admin
def admin_dashboard():
    total_users = User.query.count()
    total_subs = Subscription.query.count()
    active_subs = Subscription.query.filter_by(status="Active").count()
    total_revenue = db.session.query(
        db.func.coalesce(db.func.sum(Transaction.amount), 0)
    ).filter_by(status="Success").scalar()

    return jsonify({
        "total_users": total_users,
        "total_subscriptions": total_subs,
        "active_subscriptions": active_subs,
        "total_revenue": float(total_revenue),
    }), 200


@admin_bp.route("/users", methods=["GET"])
@require_admin
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    search = request.args.get("search", "").strip()

    query = User.query
    if search:
        query = query.filter(
            db.or_(
                User.email.ilike(f"%{search}%"),
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%"),
            )
        )

    pagination = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        "users": [u.to_dict() for u in pagination.items],
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages,
    }), 200


@admin_bp.route("/users/<user_id>", methods=["GET"])
@require_admin
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    subs = Subscription.query.filter_by(user_id=user_id).all()
    return jsonify({
        "user": user.to_dict(),
        "subscriptions": [s.to_dict() for s in subs],
        "subscription_count": len(subs),
    }), 200


@admin_bp.route("/users/<user_id>/role", methods=["PATCH"])
@require_admin
def update_user_role(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    new_role = data.get("role")
    if new_role not in ("user", "admin", "enterprise"):
        return jsonify({"error": "Role must be: user, admin, or enterprise"}), 400
    user.role = new_role
    db.session.commit()
    return jsonify({"message": "Role updated", "user": user.to_dict()}), 200


@admin_bp.route("/users/<user_id>", methods=["DELETE"])
@require_admin
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    if user_id == current_user_id:
        return jsonify({"error": "Cannot delete your own account"}), 400
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200
