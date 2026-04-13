from app.routes.auth import auth_bp
from app.routes.subscriptions import subs_bp
from app.routes.billing import billing_bp
from app.routes.shared import shared_bp
from app.routes.analytics import analytics_bp
from app.routes.settings import settings_bp
from app.routes.admin import admin_bp

__all__ = [
    "auth_bp", "subs_bp", "billing_bp",
    "shared_bp", "analytics_bp", "settings_bp", "admin_bp",
]
