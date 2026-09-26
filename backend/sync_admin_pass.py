import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.database.session import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash, verify_password

db = SessionLocal()

# Set demo passwords
demo_passwords = {
    "admin@gmail.com": "Admin@2026!",
    "admin@aaip.edu": "Admin@2026!",
    "hod.cse@aaip.edu": "Hod@2026!",
    "dr.elena@aaip.edu": "Faculty@2026!",
    "aarav.sharma@aaip.edu": "Student@2026!",
    "examcell@aaip.edu": "ExamCell@2026!",
}

# Ensure admin@aaip.edu exists
admin_aaip = db.query(User).filter(User.email == "admin@aaip.edu").first()
if not admin_aaip:
    admin_gmail = db.query(User).filter(User.email == "admin@gmail.com").first()
    if admin_gmail:
        admin_gmail.email = "admin@aaip.edu"
        admin_gmail.full_name = "Ram"
        admin_gmail.role = "admin"
        admin_gmail.department_id = None
        admin_gmail.approval_status = "Approved"
        admin_gmail.is_active = True
        admin_gmail.hashed_password = get_password_hash("Admin@2026!")
        print("Updated admin@gmail.com -> admin@aaip.edu with password Admin@2026!")

for email, pwd in demo_passwords.items():
    u = db.query(User).filter(User.email == email).first()
    if u:
        u.hashed_password = get_password_hash(pwd)
        u.approval_status = "Approved"
        u.is_active = True
        print(f"Synced {email} with password: {pwd}")

db.commit()
db.close()
print("Passwords synced successfully.")
