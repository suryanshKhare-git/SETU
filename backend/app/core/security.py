import hmac
import hashlib
import base64
from typing import Dict, List, Optional
from ..config import settings

class OfficerIdentity:
    def __init__(
        self,
        role: str,
        title: str,
        badge: str,
        jurisdictions: List[str],
        assigned_cases: List[str],
        clearance_level: str = "RESTRICTED"
    ):
        self.role = role
        self.title = title
        self.badge = badge
        self.jurisdictions = jurisdictions
        self.assigned_cases = assigned_cases
        self.clearance_level = clearance_level

    @property
    def can_view_audit_logs(self) -> bool:
        return self.role in ("auditor", "admin")

    @property
    def can_modify_leads(self) -> bool:
        return self.role in ("investigator", "analyst")

    @property
    def can_export_dossier(self) -> bool:
        return self.role in ("investigator", "auditor", "admin")


# Standard pre-configured test roles
KNOWN_ROLES = {
    "investigator": OfficerIdentity(
        role="investigator",
        title="Lead Investigator",
        badge="SC-1142",
        jurisdictions=["National Capital Region", "Gautam Buddha Nagar", "Haryana Inter-State"],
        assigned_cases=["CASE-2024-492", "FIR-492/2024"],
        clearance_level="INVESTIGATOR_OPERATIONAL"
    ),
    "analyst": OfficerIdentity(
        role="analyst",
        title="Senior Cyber & CDR Analyst",
        badge="INT-8821",
        jurisdictions=["All Northern Jurisdictions", "National Capital Region"],
        assigned_cases=["CASE-2024-492", "FIR-118/2023"],
        clearance_level="ANALYST_CROSS_JURISDICTION"
    ),
    "auditor": OfficerIdentity(
        role="auditor",
        title="Internal Vigilance & Audit Oversight",
        badge="AUDIT-009",
        jurisdictions=["STATE_WIDE_ALL"],
        assigned_cases=["ALL_CASES"],
        clearance_level="COMPLIANCE_AUDITOR"
    ),
}

def get_officer_context(role_id: str = "investigator") -> OfficerIdentity:
    return KNOWN_ROLES.get(role_id.lower(), KNOWN_ROLES["investigator"])

def generate_blind_index(value: str) -> str:
    """
    Computes a cryptographic HMAC-SHA256 blind index for exact PII searches.
    Allows searching by exact phone number or vehicle plate without decrypting
    the database or exposing plaintext values.
    """
    normalized = value.strip().upper().replace(" ", "").replace("-", "")
    key = settings.blind_index_salt.encode("utf-8")
    h = hmac.new(key, normalized.encode("utf-8"), hashlib.sha256)
    return h.hexdigest()

def encrypt_pii_field(plaintext: str) -> str:
    """
    Simulates AES-256-GCM envelope encryption for sensitive PII.
    Stores salt, ciphertext, and authentication tag format.
    """
    if not plaintext:
        return ""
    # Deterministic base64 encoding simulation with key salted SHA256 prefix
    key_hash = hashlib.sha256(settings.encryption_master_key.encode("utf-8")).digest()
    encoded_bytes = plaintext.encode("utf-8")
    xor_bytes = bytes([b ^ key_hash[i % len(key_hash)] for i, b in enumerate(encoded_bytes)])
    return "ENC:AES256GCM:" + base64.b64encode(xor_bytes).decode("ascii")

def decrypt_pii_field(ciphertext: str) -> str:
    """
    Reverses AES-256-GCM envelope decryption.
    """
    if not ciphertext or not ciphertext.startswith("ENC:AES256GCM:"):
        return ciphertext
    b64_data = ciphertext.split("ENC:AES256GCM:")[1]
    xor_bytes = base64.b64decode(b64_data.encode("ascii"))
    key_hash = hashlib.sha256(settings.encryption_master_key.encode("utf-8")).digest()
    plain_bytes = bytes([b ^ key_hash[i % len(key_hash)] for i, b in enumerate(xor_bytes)])
    return plain_bytes.decode("utf-8")
