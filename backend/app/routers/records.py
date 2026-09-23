from fastapi import APIRouter, Header, HTTPException
from typing import List
from ..models.canonical import RawRecord
from ..data.seed_data import SEED_RAW_RECORDS
from ..core.audit_ledger import audit_ledger
from ..core.security import get_officer_context
from ..models.audit import AuditActionCategory

router = APIRouter(prefix="/records", tags=["Raw Source Records & Exhibits"])

@router.get("", response_model=List[RawRecord])
def list_raw_records():
    """Lists all ingested certified source exhibits."""
    return SEED_RAW_RECORDS

@router.get("/{record_id}", response_model=RawRecord)
def get_raw_record(
    record_id: str,
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
    x_legal_basis: str = Header("Inspection of Primary Exhibit", alias="X-Legal-Basis"),
):
    """Retrieves full text and admissibility note for a raw electronic exhibit."""
    found = None
    for r in SEED_RAW_RECORDS:
        if r.id == record_id or r.document_number == record_id or record_id in r.id:
            found = r
            break

    if not found:
        raise HTTPException(status_code=404, detail=f"Source record '{record_id}' not found.")

    officer = get_officer_context(x_officer_role)
    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action=f"Inspected Certified Raw Exhibit [{found.record_type.value}]",
        target=f"{found.document_number} ({found.source_agency})",
        category=AuditActionCategory.EVIDENCE_VIEW,
        legal_basis=x_legal_basis,
        status="AUTHORIZED"
    )

    return found
