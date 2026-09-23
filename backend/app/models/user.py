from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from ..core.database import Base


class User(Base):
    __tablename__ = "users"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ========================================================
    # INVESTIGATOR INFORMATION
    # ========================================================

    name = Column(
        String(150),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    investigator_id = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    mobile = Column(
        String(30),
        nullable=False
    )

    department = Column(
        String(150),
        nullable=False
    )

    designation = Column(
        String(150),
        nullable=False
    )

    # ========================================================
    # PASSWORD
    # ========================================================

    password_hash = Column(
        String(255),
        nullable=False
    )

    # ========================================================
    # ROLE
    # ========================================================

    role = Column(
        String(50),
        nullable=False,
        default="investigator"
    )

    # ========================================================
    # EMAIL / OTP VERIFICATION
    # ========================================================

    is_verified = Column(
        Boolean,
        nullable=False,
        default=False
    )

    # Old verification token.
    # Kept temporarily so existing database records
    # don't break.
    verification_token = Column(
        String(255),
        nullable=True
    )

    # 6-digit OTP
    verification_otp = Column(
        String(6),
        nullable=True
    )

    # OTP expiration time
    otp_expires_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )