from datetime import datetime, timedelta, timezone
import os
import secrets
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv
import bcrypt
from jose import jwt
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..models.user import User
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# JWT CONFIGURATION
# ============================================================

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "setu-development-jwt-secret-change-this-in-production"
)

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60


# ============================================================
# SMTP CONFIGURATION
# ============================================================

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

SMTP_SERVER = os.getenv(
    "SMTP_SERVER",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587"
    )
)
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv(
    "RESEND_FROM_EMAIL",
    "onboarding@resend.dev"
)

# ============================================================
# OTP CONFIGURATION
# ============================================================

OTP_EXPIRE_MINUTES = 10


# ============================================================
# REQUEST MODELS
# ============================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    investigatorId: str
    mobile: str
    department: str
    designation: str
    password: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode("utf-8")

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    try:

        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )

    except (ValueError, TypeError):

        return False


# ============================================================
# OTP GENERATOR
# ============================================================
DEMO_OTP_MODE = os.getenv("DEMO_OTP_MODE", "false").lower() == "true"
DEMO_OTP = os.getenv("DEMO_OTP", "123456")


def generate_otp() -> str:
    if DEMO_OTP_MODE:
        return DEMO_OTP

    return str(
        secrets.randbelow(900000) + 100000
    )

def send_otp_email(
    recipient_email: str,
    otp: str
):
    if DEMO_OTP_MODE:
        print(
            f"DEMO OTP MODE: OTP for {recipient_email} is {otp}"
        )
        return
    
    if not RESEND_API_KEY and not (SMTP_EMAIL and SMTP_PASSWORD):
        raise RuntimeError(
            "No email provider is configured. Set RESEND_API_KEY or SMTP credentials."
        )

    subject = "SETU Investigator Account Verification OTP"

    body = f"""Hello Investigator,

Your SETU account verification OTP is:

{otp}

This OTP is valid for {OTP_EXPIRE_MINUTES} minutes.

Please do not share this OTP with anyone.

If you did not request this verification,
please ignore this email.

Regards,
SETU Law-Enforcement Intelligence System
"""

    payload = {
        "from": RESEND_FROM_EMAIL,
        "to": [recipient_email],
        "subject": subject,
        "text": body
    }

    if RESEND_API_KEY:
        request = Request(
            "https://api.resend.com/emails",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "SETU-Backend/1.0"
            },
            method="POST"
        )

        try:
            with urlopen(request, timeout=15) as response:
                response.read()
            return
        except HTTPError as e:
            error_body = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Resend email failed: {error_body}")
        except URLError as e:
            raise RuntimeError(f"Resend network error: {e}")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_EMAIL
    message["To"] = recipient_email
    message.set_content(body)

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(message)


# ============================================================
# JWT TOKEN
# ============================================================

def create_access_token(user: User) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {

        "sub": str(user.id),

        "email": user.email,

        "investigatorId":
            user.investigator_id,

        "role":
            user.role,

        "exp":
            expire
    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    email = (
        str(data.email)
        .lower()
        .strip()
    )

    investigator_id = (
        data.investigatorId.strip()
    )

    # --------------------------------------------------------
    # CHECK EXISTING EMAIL
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing_email:

        raise HTTPException(
            status_code=400,
            detail=(
                "Investigator with this email "
                "is already registered"
            )
        )

    # --------------------------------------------------------
    # CHECK EXISTING INVESTIGATOR ID
    # --------------------------------------------------------

    existing_id = (
        db.query(User)
        .filter(
            User.investigator_id ==
            investigator_id
        )
        .first()
    )

    if existing_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Investigator ID is already registered"
            )
        )

    # --------------------------------------------------------
    # GENERATE OTP
    # --------------------------------------------------------

    otp = generate_otp()

    otp_expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=OTP_EXPIRE_MINUTES
        )
    )

    # --------------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------------

    password_hash = hash_password(
        data.password
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    new_user = User(

        name=data.name.strip(),

        email=email,

        investigator_id=investigator_id,

        mobile=data.mobile.strip(),

        department=data.department.strip(),

        designation=data.designation.strip(),

        password_hash=password_hash,

        role="investigator",

        is_verified=False,

        verification_token=None,

        verification_otp=otp,

        otp_expires_at=otp_expires_at
    )

    # --------------------------------------------------------
    # SAVE USER
    # --------------------------------------------------------

    try:

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

    except Exception as error:

        db.rollback()

        print(
            "DATABASE REGISTER ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to create investigator account"
            )
        )

    # --------------------------------------------------------
    # SEND OTP
    # --------------------------------------------------------

    try:

        send_otp_email(
            recipient_email=email,
            otp=otp
        )

    except Exception as error:

        # Remove account if email sending fails
        try:

            db.delete(new_user)

            db.commit()

        except Exception:

            db.rollback()

        print(
            "OTP EMAIL ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Account could not be created because "
                "OTP email could not be sent. "
                "Please check SMTP configuration."
            )
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "success": True,

        "message": (
            "Investigator registered successfully. "
            "A verification OTP has been sent "
            "to your email."
        ),

        "verification_required": True,

        "investigator": {

            "name":
                new_user.name,

            "email":
                new_user.email,

            "investigatorId":
                new_user.investigator_id,

            "mobile":
                new_user.mobile,

            "department":
                new_user.department,

            "designation":
                new_user.designation,

            "role":
                new_user.role
        }
    }


# ============================================================
# VERIFY OTP
# ============================================================

@router.post("/verify-otp")
def verify_otp(
    data: VerifyOTPRequest,
    db: Session = Depends(get_db)
):

    email = (
        str(data.email)
        .lower()
        .strip()
    )

    otp = data.otp.strip()

    # --------------------------------------------------------
    # VALIDATE OTP FORMAT
    # --------------------------------------------------------

    if not otp.isdigit() or len(otp) != 6:

        raise HTTPException(
            status_code=400,
            detail="OTP must be a 6-digit number"
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Investigator account not found"
        )

    # --------------------------------------------------------
    # ALREADY VERIFIED
    # --------------------------------------------------------

    if user.is_verified:

        return {

            "success": True,

            "message":
                "Email is already verified"
        }

    # --------------------------------------------------------
    # CHECK OTP EXISTS
    # --------------------------------------------------------

    if not user.verification_otp:

        raise HTTPException(
            status_code=400,
            detail=(
                "No active OTP found. "
                "Please request a new OTP."
            )
        )

    # --------------------------------------------------------
    # CHECK OTP EXPIRATION
    # --------------------------------------------------------

    now = datetime.now(timezone.utc)
    otp_expires_at = user.otp_expires_at

    # SQLite returns DATETIME values without timezone information, while
    # PostgreSQL preserves it. Normalize both forms before comparing.
    if otp_expires_at and otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)

    if (
        not otp_expires_at
        or otp_expires_at < now
    ):

        user.verification_otp = None

        user.otp_expires_at = None

        db.commit()

        raise HTTPException(
            status_code=400,
            detail=(
                "OTP has expired. "
                "Please request a new OTP."
            )
        )

    # --------------------------------------------------------
    # CHECK OTP
    # --------------------------------------------------------

    if user.verification_otp != otp:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    # --------------------------------------------------------
    # VERIFY ACCOUNT
    # --------------------------------------------------------

    user.is_verified = True

    user.verification_otp = None

    user.otp_expires_at = None

    user.verification_token = None

    try:

        db.commit()

        db.refresh(user)

    except Exception as error:

        db.rollback()

        print(
            "OTP VERIFICATION DATABASE ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to verify account"
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "success": True,

        "message": (
            "Email verified successfully. "
            "You can now login."
        ),

        "investigator": {

            "name":
                user.name,

            "email":
                user.email,

            "investigatorId":
                user.investigator_id,

            "mobile":
                user.mobile,

            "department":
                user.department,

            "designation":
                user.designation,

            "role":
                user.role
        }
    }


# ============================================================
# RESEND OTP
# ============================================================

@router.post("/resend-otp")
def resend_otp(
    email: EmailStr,
    db: Session = Depends(get_db)
):

    email = (
        str(email)
        .lower()
        .strip()
    )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Investigator account not found"
        )

    # --------------------------------------------------------
    # CHECK VERIFIED
    # --------------------------------------------------------

    if user.is_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified"
        )

    # --------------------------------------------------------
    # GENERATE NEW OTP
    # --------------------------------------------------------

    otp = generate_otp()

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=OTP_EXPIRE_MINUTES
        )
    )

    user.verification_otp = otp

    user.otp_expires_at = expires_at

    try:

        db.commit()

    except Exception as error:

        db.rollback()

        print(
            "RESEND OTP DATABASE ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate new OTP"
        )

    # --------------------------------------------------------
    # SEND NEW OTP
    # --------------------------------------------------------

    try:

        send_otp_email(
            recipient_email=email,
            otp=otp
        )

    except Exception as error:

        print(
            "RESEND OTP ERROR:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to send OTP email. "
                "Please check SMTP configuration."
            )
        )

    return {

        "success": True,

        "message": (
            "A new OTP has been sent "
            "to your email."
        )
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    email = (
        str(data.email)
        .lower()
        .strip()
    )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    # --------------------------------------------------------
    # USER NOT FOUND
    # --------------------------------------------------------

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # VERIFY PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # EMAIL VERIFICATION CHECK
    # --------------------------------------------------------

    if not user.is_verified:

        raise HTTPException(
            status_code=403,
            detail=(
                "Email is not verified. "
                "Please verify your email using OTP."
            )
        )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    access_token = create_access_token(
        user
    )

    # --------------------------------------------------------
    # SUCCESS RESPONSE
    # --------------------------------------------------------

    return {

        "success": True,

        "message":
            "Login successful",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "investigator": {

            "name":
                user.name,

            "email":
                user.email,

            "investigatorId":
                user.investigator_id,

            "mobile":
                user.mobile,

            "department":
                user.department,

            "designation":
                user.designation,

            "role":
                user.role
        }
    }


# ============================================================
# LOGOUT
# ============================================================

@router.post("/logout")
def logout():

    return {

        "success": True,

        "message":
            "Investigator logged out successfully"
    }
