from database import engine, SessionLocal, Base
from passlib.context import CryptContext
from models import UserDB

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()

existing = db.query(UserDB).filter(UserDB.username == "admin").first()

if existing:
    print("Admin already exists!")
else:
    admin = UserDB(
        username="admin",
        password=pwd_context.hash("admin123"),
        role="admin",
        student_id=None
    )
    db.add(admin)
    db.commit()
    print("Admin created! Login with: admin / admin123")

db.close()
