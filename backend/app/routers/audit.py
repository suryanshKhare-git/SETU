from fastapi import APIRouter, Header, HTTPException, Query
from typing import List, Optional
from ..models.audit import AuditLogEntry, AuditChainVerificationResult
from ..core.audit_ledger import audit_ledger
from ..core.security import get_officer_context

router = APIRouter(prefix="/audit", tags=["Cryptographic Audit Vault"])

@router.get("/logs", response_model=List[AuditLogEntry])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    x_officer_role: str = Header("auditor", alias="X-Officer-Role"),
    x_officer_badge: str = Header("AUDIT-009", alias="X-Officer-Badge"),
):
    """
    Accesses the tamper-evident audit ledger.
    STRICT RBAC POLICY: Restricted to Compliance & Internal Audit Officers.
    Field investigators and operators are denied access.
    """
    officer = get_officer_context(x_officer_role)
    if not officer.can_view_audit_logs:
        raise HTTPException(
            status_code=403,
            detail=(
                f"RBAC Clearance Denied: Role '{officer.title}' ({x_officer_badge}) is provisioned for "
                f"investigative operations only. Direct inspection of officer query trails and supervisory "
                f"access ledgers is strictly restricted to Compliance and Internal Vigilance personnel."
            )
        )

    all_logs = audit_ledger.get_all_entries()
    return all_logs[:limit]

@router.post("/verify-chain", response_model=AuditChainVerificationResult)
def verify_audit_chain_integrity(
    x_officer_role: str = Header("auditor", alias="X-Officer-Role"),
):
    """
    Recalculates every SHA-256 HMAC hash in the ledger from Genesis Block to Head Block.
    Verifies zero retroactive tampering, omission, or row modification.
    """
    officer = get_officer_context(x_officer_role)
    if not officer.can_view_audit_logs:
        raise HTTPException(status_code=403, detail="Audit verification clearance required.")

    return audit_ledger.verify_chain_integrity()
