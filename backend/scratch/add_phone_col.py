from app import create_app
from app.extensions import db
from sqlalchemy import text

app = create_app()
with app.app_context():
    try:
        # Try to add phone column
        db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE"))
        # Try to add reset_code column
        db.session.execute(text("ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS reset_code VARCHAR(6)"))
        db.session.commit()
        print("Columns added successfully!")
    except Exception as e:
        db.session.rollback()
        print(f"Error adding columns: {str(e)}")
