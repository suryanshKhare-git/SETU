from enum import Enum
from pydantic import BaseModel
from typing import Optional

class AuditActionCategory(str, Enum):
    SEARCH = "SEARCH"
    GRAPH_INSPECTION = "GRAPH_INSPECTION"
    EVIDENCE_VIEW = "EVIDENCE_VIEW"
    LEAD_REVIEW = "LEAD_REVIEW"
    WORKSPACE_PIN = "WORKSPACE_PIN"
    DOSSIER_EXPORT = "DOSSIER_EXPORT"
    SECURITY_WARNING = "SECURITY_WARNING"
    CROSS_CASE_SCAN = "CROSS_CASE_SCAN"

class AuditLogEntry(BaseModel):
    id: str
    sequence_number: int
    timestamp: str
    officer_name: str
    officer_role: str
    officer_badge: str
    action: str
    target: str
    category: AuditActionCategory
    legal_basis: str
    terminal_ip: str
    status: str = "AUTHORIZED"  # AUTHORIZED or FLAGGED_AUDIT
    previous_block_hash: str
    entry_hash: str
    signature: Optional[str] = None

class AuditChainVerificationResult(BaseModel):
    is_valid: bool
    total_records_checked: int
    genesis_hash: str
    latest_hash: str
    tampered_entry_id: Optional[str] = None
    verification_message: str
