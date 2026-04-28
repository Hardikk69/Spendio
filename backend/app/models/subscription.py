from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, Date, Boolean, Numeric, ForeignKey

class Subscription(db.Model, BaseModel):
    __tablename__ = 'subscription'

    subscription_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.user_id'))
    service_id = Column(Integer, ForeignKey('service.service_id'))
    status = Column(String(50))
    start_date = Column(Date)
    next_billing_date = Column(Date)
    auto_pay = Column(Boolean)
    is_shared = Column(Boolean)
