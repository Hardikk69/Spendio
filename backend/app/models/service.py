from app.extensions import db
from app.models.base_model import BaseModel
from sqlalchemy import Column, Integer, String, Numeric, Boolean

class Service(db.Model, BaseModel):
    __tablename__ = 'service'

    service_id = Column(Integer, primary_key=True)
    name = Column(String(200))
    category = Column(String(100))
    provider = Column(String(200))
    base_price = Column(Numeric(10, 2))
    billing_cycle = Column(String(50))
    is_active = Column(Boolean)
