from datetime import datetime
from app.extensions import db
from app.models import Notification

def create_notification(user_id, n_type, title, message):
    """
    Helper function to abstract the creation of notifications.
    :param user_id: ID of the user to notify
    :param n_type: 'payment', 'alert', 'reminder', 'share', 'warning', 'refund'
    :param title: Notification Title
    :param message: Detailed message text
    """
    notification = Notification(
        user_id=user_id,
        type=n_type,
        title=title,
        message=message,
        is_read=False,
        sent_at=datetime.utcnow()
    )
    db.session.add(notification)
    db.session.commit()
    return notification