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

def check_upcoming_payments(user_id):
    """
    Checks for subscriptions due in exactly 7 days and creates a reminder notification
    if one hasn't been sent for that billing cycle.
    """
    from datetime import date, timedelta
    from app.models import Subscription, Service
    
    target_date = date.today() + timedelta(days=7)
    
    # Find active subscriptions due in 7 days
    upcoming = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(
        Subscription.user_id == user_id,
        Subscription.status == "Active",
        Subscription.next_billing_date == target_date
    ).all()
    
    for sub, service in upcoming:
        # Check if we already sent a reminder for this specific date
        existing = Notification.query.filter_by(
            user_id=user_id,
            type="reminder"
        ).filter(Notification.message.like(f"%{service.name}%")).filter(Notification.message.like(f"%{target_date.strftime('%b %d')}%")).first()
        
        if not existing:
            create_notification(
                user_id=user_id,
                n_type="reminder",
                title="Upcoming Payment Reminder",
                message=f"Your subscription for {service.name} (\u20b9{service.base_price}) is due on {target_date.strftime('%b %d, %Y')} (in 7 days)."
            )
