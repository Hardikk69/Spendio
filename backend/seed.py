"""
Seed script — populate the database with sample data matching the Spendio frontend.
Run: python seed.py
"""
import os
import uuid
from datetime import datetime, date, timedelta
from dotenv import load_dotenv

load_dotenv()

from app import create_app
from app.extensions import db
from app.models import (
    User, Subscription, Transaction,
    SharedSubscription, SharedSubscriptionMember, Invitation,
    NotificationSettings, PaymentSettings,
)


def seed():
    app = create_app()
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        # ── Users ──────────────────────────────────────────────────────────
        admin_user = User(
            id=str(uuid.uuid4()),
            first_name="Admin",
            last_name="Spendio",
            email="admin@spendio.in",
            phone="+91 00000 00000",
            role="admin",
        )
        admin_user.set_password("Admin@1234")

        rajesh = User(
            id=str(uuid.uuid4()),
            first_name="Rajesh",
            last_name="Kumar",
            email="rajesh@example.com",
            phone="+91 98765 43210",
            role="user",
        )
        rajesh.set_password("Test@1234")

        sarah = User(
            id=str(uuid.uuid4()),
            first_name="Sarah",
            last_name="M.",
            email="sarah@example.com",
            phone="+91 91111 11111",
            role="user",
        )
        sarah.set_password("Test@1234")

        db.session.add_all([admin_user, rajesh, sarah])
        db.session.flush()

        # Default settings for each user
        for u in [admin_user, rajesh, sarah]:
            db.session.add(NotificationSettings(user_id=u.id))
            db.session.add(PaymentSettings(user_id=u.id))

        # ── Subscriptions ──────────────────────────────────────────────────
        today = date.today()

        sub_data = [
            dict(name="Netflix Premium",   category="OTT",   amount=649,  billing_cycle="Monthly",  days=4,  status="Active",  autopay=True,  logo="https://logo.clearbit.com/netflix.com",   brand_color="#E50914"),
            dict(name="Spotify Family",    category="Music", amount=1399, billing_cycle="Monthly",  days=6,  status="Active",  autopay=True,  logo="https://logo.clearbit.com/spotify.com",   brand_color="#1DB954"),
            dict(name="Microsoft 365",     category="SaaS",  amount=799,  billing_cycle="Monthly",  days=9,  status="Active",  autopay=True,  logo="https://logo.clearbit.com/microsoft.com", brand_color="#00A4EF"),
            dict(name="Adobe Creative",    category="SaaS",  amount=4599, billing_cycle="Monthly",  days=14, status="Paused",  autopay=False, logo="https://logo.clearbit.com/adobe.com",     brand_color="#FF0000"),
            dict(name="Disney+ Hotstar",   category="OTT",   amount=299,  billing_cycle="Monthly",  days=2,  status="Active",  autopay=True,  logo="https://logo.clearbit.com/hotstar.com",   brand_color="#1F2A3C"),
            dict(name="Amazon Prime",      category="OTT",   amount=1499, billing_cycle="Yearly",   days=25, status="Active",  autopay=True,  logo="https://logo.clearbit.com/amazon.com",    brand_color="#00A8E1"),
            dict(name="Dropbox Plus",      category="SaaS",  amount=800,  billing_cycle="Monthly",  days=3,  status="Active",  autopay=False, logo="https://logo.clearbit.com/dropbox.com",   brand_color="#0061FF"),
            dict(name="YouTube Premium",   category="OTT",   amount=149,  billing_cycle="Monthly",  days=-5, status="Expired", autopay=False, logo="https://logo.clearbit.com/youtube.com",   brand_color="#FF0000"),
        ]

        subscriptions = []
        for d in sub_data:
            s = Subscription(
                user_id=rajesh.id,
                name=d["name"],
                category=d["category"],
                amount=d["amount"],
                billing_cycle=d["billing_cycle"],
                next_billing=today + timedelta(days=d["days"]),
                status=d["status"],
                autopay=d["autopay"],
                logo_url=d["logo"],
                brand_color=d["brand_color"],
            )
            subscriptions.append(s)
            db.session.add(s)

        db.session.flush()

        # ── Transactions ───────────────────────────────────────────────────
        txn_seed = [
            ("TXN001", subscriptions[1], "Spotify Family",     1399, "Success",  "Auto-pay", True,  18),
            ("TXN002", subscriptions[0], "Netflix Premium",     649, "Success",  "Auto-pay", True,  19),
            ("TXN003", subscriptions[2], "Microsoft 365",       799, "Success",  "Auto-pay", True,  22),
            ("TXN004", subscriptions[4], "Disney+ Hotstar",     299, "Success",  "Auto-pay", True,  24),
            ("TXN005", subscriptions[3], "Adobe Creative Cloud",4599,"Failed",   "Manual",   False, 26),
            ("TXN006", subscriptions[5], "Amazon Prime",       1249, "Success",  "Auto-pay", True,  36),
            ("TXN007", subscriptions[6], "Dropbox Plus",        999, "Success",  "Manual",   True,  42),
            ("TXN008", subscriptions[1], "Spotify Family",     1399, "Success",  "Auto-pay", True,  47),
            ("TXN009", subscriptions[0], "Netflix Premium",     649, "Success",  "Auto-pay", True,  49),
            ("TXN010", subscriptions[2], "Microsoft 365",       799, "Refunded", "Auto-pay", True,  52),
        ]
        for ref, sub, name, amount, status, method, invoice, days_ago in txn_seed:
            t = Transaction(
                txn_ref=ref,
                user_id=rajesh.id,
                subscription_id=sub.id,
                subscription_name=name,
                amount=amount,
                status=status,
                method=method,
                invoice_available=invoice,
                payment_date=datetime.utcnow() - timedelta(days=days_ago),
            )
            db.session.add(t)

        # ── Shared Subscriptions ──────────────────────────────────────────
        netflix_sub = subscriptions[0]
        shared_netflix = SharedSubscription(
            subscription_id=netflix_sub.id,
            owner_id=rajesh.id,
            total_cost=netflix_sub.amount,
        )
        db.session.add(shared_netflix)
        db.session.flush()

        members_data = [
            (rajesh.id,  "rajesh@example.com", "You",        162, "owner",  "paid"),
            (sarah.id,   "sarah@example.com",  "Sarah M.",   162, "member", "paid"),
            (None,       "mike@example.com",   "Mike K.",    162, "member", "paid"),
            (None,       "lisa@example.com",   "Lisa R.",    163, "member", "pending"),
        ]
        for uid, email, display, share, role, pstatus in members_data:
            db.session.add(SharedSubscriptionMember(
                shared_sub_id=shared_netflix.id,
                user_id=uid,
                email=email,
                display_name=display,
                share_amount=share,
                role=role,
                payment_status=pstatus,
            ))

        # Pending invitations
        db.session.add(Invitation(
            shared_sub_id=shared_netflix.id,
            inviter_id=rajesh.id,
            invitee_email="rajesh@example.com",
            status="pending",
            share_amount=130,
        ))

        db.session.commit()
        print("\n✅ Seed complete!")
        print(f"   Admin:  admin@spendio.in  /  Admin@1234")
        print(f"   User:   rajesh@example.com  /  Test@1234")
        print(f"   User:   sarah@example.com  /  Test@1234")


if __name__ == "__main__":
    seed()
