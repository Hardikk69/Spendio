from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey

class Payment(db.Model, BaseModel):
    __tablename__ = 'payment'

    payment_id = Column(Integer, primary_key=True)
    billing_id = Column(Integer, ForeignKey('billing.billing_id'))
    amount_paid = Column(Numeric(10, 2))
    status = Column(String(50))
    timestamp = Column(DateTime)
    method = Column(String(50))
