base_model.py
from sqlalchemy.exc import SQLAlchemyError

class BaseModel:
    @classmethod
    def create(cls, session, **kwargs):
        """Create a new record and save it to the database."""
        instance = cls(**kwargs)
        try:
            session.add(instance)
            session.commit()
            return instance
        except SQLAlchemyError:
            session.rollback()
            return None

    def update(self, session, **kwargs):
        """Update fields of the instance."""
        for attr, value in kwargs.items():
            setattr(self, attr, value)
        try:
            session.commit()
            return self
        except SQLAlchemyError:
            session.rollback()
            return None

    def delete(self, session):
        """Delete the instance from the database."""
        try:
            session.delete(self)
            session.commit()
            return True
        except SQLAlchemyError:
            session.rollback()
            return False

    @classmethod
    def get_by_id(cls, session, id):
        """Fetch a record by its primary key."""
        # Note: We use the class name to get the primary key column dynamically 
        # but the user didn't specify that logic, just 'by primary key'.
        # Most models here have user_id, subscription_id etc.
        # SQLAlchemy's session.get() handles this if passed the pk value.
        return session.get(cls, id)

    @classmethod
    def all(cls, session):
        """Fetch all records of this model."""
        return session.query(cls).all()

    def to_dict(self):
        """Serialize columns to a dictionary."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}