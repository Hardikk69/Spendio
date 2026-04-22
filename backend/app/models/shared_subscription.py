from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, Numeric, ForeignKey

class SharedSubscription(db.Model, BaseModel):
    __tablename__ = 'shared_subscription'

    id = Column(Integer, primary_key=True)
    subscription_id = Column(Integer, ForeignKey('subscription.subscription_id'))
    member_user_id = Column(Integer, ForeignKey('user.user_id'))
    shared_percent = Column(Integer)
    amount_owned = Column(Numeric(10, 2))
