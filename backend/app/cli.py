import click
from flask.cli import with_appcontext
from datetime import datetime, date, timedelta
from app.extensions import db
from app.models import Subscription, Notification, Service
from app.services.notification_service import create_notification

@click.command('check-renewals')
@with_appcontext
def check_renewals_command():
    """Check for subscriptions renewing in the next 4 days and create reminders."""
    today = date.today()
    target_date = today + timedelta(days=4)
    
    # Find all active subscriptions billing on the target date
    upcoming_subs = db.session.query(Subscription, Service).join(
        Service, Subscription.service_id == Service.service_id
    ).filter(
        Subscription.status == 'Active'
    ).filter(
        db.func.date(Subscription.next_billing_date) == target_date
    ).all()
    
    count = 0
    for sub, service in upcoming_subs:
        # Check if we already sent a reminder for this subscription recently
        # A simple check: do we have a reminder for this in the last 3 days?
        recent_reminder = Notification.query.filter_by(
            user_id=sub.user_id, 
            type="reminder"
        ).filter(
            Notification.message.like(f"%{service.name}%")
        ).filter(
            Notification.sent_at >= datetime.utcnow() - timedelta(days=3)
        ).first()

        if not recent_reminder:
            amount_str = f"₹{service.base_price}" if service.base_price else "an amount"
            create_notification(
                user_id=sub.user_id,
                n_type="reminder",
                title="Upcoming Renewal",
                message=f"{service.name} will renew in 4 days for {amount_str}."
            )
            count += 1
            
    db.session.commit()
    print(f"Checked renewals. Sent {count} new reminders. [OK]")

def register_commands(app):
    app.cli.add_command(check_renewals_command, name='check-renewals')
