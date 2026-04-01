import os
from flask import Flask, jsonify
from dotenv import load_dotenv

load_dotenv()

from app.extensions import db, migrate, jwt, cors
from app.config import config_map
from app.errors import register_error_handlers


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    cfg = config_map.get(config_name, config_map["default"])
    app.config.from_object(cfg)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", ["http://localhost:5173"])}},
        supports_credentials=True,
    )

    # Import models so Flask-Migrate can detect them
    with app.app_context():
        from app.models import (  # noqa: F401
            User, Subscription, Transaction,
            SharedSubscription, SharedSubscriptionMember, Invitation,
            NotificationSettings, PaymentSettings,
        )

    # Register blueprints
    from app.routes import auth_bp, subs_bp, billing_bp, shared_bp, analytics_bp, settings_bp, admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(subs_bp, url_prefix="/api/subscriptions")
    app.register_blueprint(billing_bp, url_prefix="/api/billing")
    app.register_blueprint(shared_bp, url_prefix="/api/shared")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Health check
    @app.route("/api/health")
    def health():
        try:
            db.session.execute(db.text("SELECT 1"))
            db_status = "connected"
        except Exception:
            db_status = "disconnected"
        return jsonify({"status": "ok", "database": db_status}), 200

    # Register error handlers
    register_error_handlers(app)

    return app
