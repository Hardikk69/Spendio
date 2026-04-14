billing.py
from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, Date, Numeric, Text, ForeignKey

class Billing(db.Model, BaseModel):
    __tablename__ = 'billing'

    billing_id = Column(Integer, primary_key=True)
    subscription_id = Column(Integer, ForeignKey('subscription.subscription_id'))
    user_id = Column(Integer, ForeignKey('user.user_id'))
    amount_due = Column(Numeric(10, 2))
    billing_date = Column(Date)
    status = Column(String(50))
    invoice_url = Column(Text)