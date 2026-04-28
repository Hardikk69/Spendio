import traceback
try:
    from app import create_app
    app = create_app()
    with app.app_context():
        from app.models import *
    print("Success")
except Exception as e:
    traceback.print_exc()
