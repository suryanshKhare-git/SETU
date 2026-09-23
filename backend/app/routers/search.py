import re
from fastapi import APIRouter, Header, HTTPException, Query
from typing import Optional
from ..models.api_schemas import UniversalSearchRequest, UniversalSearchResult
from ..services.graph_store import graph_data_store
from ..core.audit_ledger import audit_ledger
from ..core.security import get_officer_context
from ..models.audit import AuditActionCategory

router = APIRouter(prefix="/search", tags=["Universal Search"])

def detect_entity_query_type(q: str) -> tuple[str, str]:
    q_clean = q.strip().lower()
    digits_only = re.sub(r"[\s\-\+]", "", q_clean)
    if digits_only.isdigit() and (len(digits_only) == 10 or (len(digits_only) == 12 and digits_only.startswith("91")) or (10 <= len(digits_only) <= 15)):
        return "phone", "Detected Telephony MSISDN / CDR Record"
    if re.match(r"^(dl|hr|up|mh|ka|gj|pb)[0-9a-z\s-]{2,}", q_clean):
        return "vehicle", "Detected Vehicle Registration / Vahan Plate"
    if q_clean.startswith("fir") or q_clean.startswith("case") or q_clean.startswith("gd"):
        return "case", "Detected Police FIR / Criminal Docket ID"
    if any(k in q_clean for k in ["hdfc", "axis", "a/c", "bank"]) or re.match(r"^\d{6,}$", q_clean):
        return "account", "Detected Financial Bank Account / Hawala Ledger"
    if any(k in q_clean for k in ["sector", "toll", "plaza", "chowk", "road"]):
        return "location", "Detected Geographic Location / Cell Tower Zone"
    return "person", "Target Query: Name / Known Alias / Subject"

@router.post("/universal", response_model=UniversalSearchResult)
def universal_search(
    req: UniversalSearchRequest,
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
    x_legal_basis: str = Header("FIR 492/2024 Investigation", alias="X-Legal-Basis"),
):
    """
    Universal entity search omnibox with automatic type-ahead entity classification.
    Every search query is immutably logged into the cryptographic audit ledger.
    """
    officer = get_officer_context(x_officer_role)
    detected_type, detected_label = detect_entity_query_type(req.query)
    
    entities = graph_data_store.search_entities(
        query=req.query,
        category=req.category,
        limit=req.limit
    )

    # Log into audit ledger
    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action=f"Universal Search: '{req.query}' (Filter: {req.category})",
        target=f"Query: {req.query}",
        category=AuditActionCategory.SEARCH,
        legal_basis=x_legal_basis,
        status="AUTHORIZED"
    )

    return UniversalSearchResult(
        query=req.query,
        detected_type=detected_type,
        detected_label=detected_label,
        entities=entities,
        total_count=len(entities)
    )
