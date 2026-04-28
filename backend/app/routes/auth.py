from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from app.extensions import db
from app.models import User, Notification, Payment
import random
from app.services.sms_service import send_sms

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = (data.get("email") or "").lower().strip()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    # Accept both 'name' and 'first_name'+'last_name'
    if data.get("name"):
        full_name = data["name"].strip()
    else:
        first = (data.get("first_name") or "").strip()
        last = (data.get("last_name") or "").strip()
        full_name = f"{first} {last}".strip()

    user = User(
        name=full_name,
        email=email,
        phone=data.get("phone"), # Allow setting phone during register
        role=data.get("role", "user"),
    )
    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already registered"}), 409
    except Exception as e:
        db.session.rollback()
        print("REGISTER ERROR:", str(e))
        return jsonify({"error": "Internal server error"}), 500

    access_token = create_access_token(identity=str(user.user_id))
    refresh_token = create_refresh_token(identity=str(user.user_id))

    return jsonify({
        "message": "Registration successful",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"].lower().strip()).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user.user_id))
    refresh_token = create_refresh_token(identity=str(user.user_id))

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    return jsonify({"access_token": access_token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if "name" in data:
        user.name = data["name"].strip()
    elif "first_name" in data or "last_name" in data:
        first = (data.get("first_name") or user.first_name).strip()
        last = (data.get("last_name") or user.last_name).strip()
        user.name = f"{first} {last}".strip()

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200


@auth_bp.route("/me/password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if not data.get("current_password") or not data.get("new_password"):
        return jsonify({"error": "current_password and new_password are required"}), 400

    if not user.check_password(data["current_password"]):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(data["new_password"]) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user.set_password(data["new_password"])
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.route("/forgot-password-sms", methods=["POST"])
def forgot_password_sms():
    data = request.get_json() or {}
    phone = data.get("phone")
    if not phone:
        return jsonify({"error": "Phone number is required"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        # For security, don't reveal if user exists, but we are in dev/simulation mode
        return jsonify({"error": "No user found with this phone number"}), 404

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    user.reset_code = otp
    db.session.commit()

    message = f"Your Spendio password reset code is: {otp}. Valid for 10 minutes."
    success = send_sms(phone, message)
    
    if success:
        return jsonify({"message": "Reset code sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send SMS. Please try again later."}), 500


@auth_bp.route("/reset-password-sms", methods=["POST"])
def reset_password_sms():
    data = request.get_json() or {}
    phone = data.get("phone")
    code = data.get("code")
    new_password = data.get("new_password")

    if not all([phone, code, new_password]):
        return jsonify({"error": "phone, code, and new_password are required"}), 400

    user = User.query.filter_by(phone=phone, reset_code=code).first()
    if not user:
        return jsonify({"error": "Invalid reset code or phone number"}), 401

    if len(new_password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    user.set_password(new_password)
    user.reset_code = None # Clear code after use
    db.session.commit()
    
    print(f"DEBUG: Password reset successful for user: {user.email} (Phone: {phone})")

    return jsonify({"message": "Password reset successful"}), 200
