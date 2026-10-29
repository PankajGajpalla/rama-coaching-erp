import os
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import engine
from models import UserDB, Base

Base.metadata.create_all(bind=engine)

password = os.getenv("ADMIN_PASSWORD")
if not password:
    raise SystemExit("Set ADMIN_PASSWORD first")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = Session(engine)

admin = db.query(UserDB).filter(UserDB.username == "admin").first()
if admin:
    admin.password = pwd_context.hash(password)
    print("Admin password reset!")
else:
    db.add(UserDB(username="admin", password=pwd_context.hash(password), role="admin", student_id=None))
    print("Admin created!")
db.commit()
db.close()

