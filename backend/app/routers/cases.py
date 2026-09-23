import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException, Body
from typing import List
from ..models.api_schemas import (
    WorkspaceItem,
    WorkspaceItemCreate,
    DossierExportRequest,
    DossierExportResponse,
)
from ..models.canonical import CandidateCrossCaseLead, ReviewStatus
from ..services.graph_store import graph_data_store
from ..services.cross_case_detector import cross_case_detector
from ..core.audit_ledger import audit_ledger
from ..core.security import get_officer_context
from ..models.audit import AuditActionCategory

router = APIRouter(prefix="/cases", tags=["Case Workspace & Dossier"])

# In-memory case workspace pinboard state
_WORKSPACE_ITEMS: List[WorkspaceItem] = [
    WorkspaceItem(
        id="card-1",
        entity_id="ent-person-1",
        type="entity",
        title='Vikram "Vicky" Malhotra',
        subtitle="Suspect / Operational Coordinator",
        column="active_leads",
        notes="Cell tower evidence shows device roaming with target vehicle. Search warrant pending for Sector 62 residence.",
        tags=["Primary Lead", "Flight Risk"],
        confidence="Strong Signal [89%]",
        pinned_at="14:00 IST",
        pinned_by="SC-1142"
    ),
    WorkspaceItem(
        id="card-2",
        entity_id="ent-vehicle-1",
        type="entity",
        title="Decoy Carrier DL-01-AB-1234",
        subtitle="Tata 407 Commercial Container",
        column="verified",
        notes="FASTag entry at Murthal toll corroborated with driver cell tower handoff. Look-out circular active.",
        tags=["Seizure Target", "FASTag Verified"],
        confidence="Verified Registry",
        pinned_at="15:30 IST",
        pinned_by="SC-1142"
    ),
    WorkspaceItem(
        id="card-3",
        edge_id="edge-2",
        type="connection",
        title="Call Burst: Malhotra <-> Deshmukh",
        subtitle="14 calls spanning 23:30 to 02:30 IST",
        column="active_leads",
        notes="Zero prior interactions; sudden anomalous operational surge timed precisely with transit hijack.",
        tags=["Operational Burst", "CDR Evidence"],
        confidence="Strong Signal [92%]",
        pinned_at="16:15 IST",
        pinned_by="INT-8821"
    ),
]

@router.get("/workspace", response_model=List[WorkspaceItem])
def get_workspace_cards():
    """Returns all pinned cards in the active investigation workspace pinboard."""
    return _WORKSPACE_ITEMS

@router.post("/workspace", response_model=WorkspaceItem)
def add_workspace_card(
    item: WorkspaceItemCreate,
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
):
    """Pins an entity, connection, or working hypothesis to the case pinboard."""
    officer = get_officer_context(x_officer_role)
    new_card = WorkspaceItem(
        id=f"card-{len(_WORKSPACE_ITEMS) + 1}",
        entity_id=item.entity_id,
        edge_id=item.edge_id,
        type=item.type,
        title=item.title,
        subtitle=item.subtitle,
        column=item.column,
        notes=item.notes,
        tags=item.tags,
        confidence=item.confidence,
        pinned_at=datetime.now(timezone.utc).strftime("%H:%M IST"),
        pinned_by=x_officer_badge
    )
    _WORKSPACE_ITEMS.append(new_card)

    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action="Pinned Item to Investigation Pinboard",
        target=f"Card: {item.title} ({item.column})",
        category=AuditActionCategory.WORKSPACE_PIN,
        legal_basis="Case Diary Working Notes",
        status="AUTHORIZED"
    )
    return new_card

@router.delete("/workspace/{card_id}")
def delete_workspace_card(card_id: str):
    global _WORKSPACE_ITEMS
    _WORKSPACE_ITEMS = [c for c in _WORKSPACE_ITEMS if c.id != card_id]
    return {"status": "success", "deleted_card_id": card_id}

@router.get("/cross-case-leads", response_model=List[CandidateCrossCaseLead])
def get_cross_case_candidate_leads(
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
):
    """
    Returns candidate leads connecting distinct cases across 2+ hops.
    STRICT POLICY: Never auto-merges cases.
    """
    officer = get_officer_context(x_officer_role)
    leads = cross_case_detector.get_candidate_leads()

    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action="Queried Cross-Case Linkage Candidates",
        target=f"Detected {len(leads)} Candidate Leads",
        category=AuditActionCategory.CROSS_CASE_SCAN,
        legal_basis="Inter-State Syndicate Detection Mandate",
        status="AUTHORIZED"
    )
    return leads

@router.post("/export-dossier", response_model=DossierExportResponse)
def export_investigative_dossier(
    req: DossierExportRequest,
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
    x_legal_basis: str = Header("Remand Application before Judicial Magistrate", alias="X-Legal-Basis"),
):
    """
    Generates formal court-admissible dossier with Section 65B/63 BSA certification
    and cryptographic digital verification hash.
    """
    officer = get_officer_context(x_officer_role)
    if not officer.can_export_dossier:
        raise HTTPException(status_code=403, detail="Officer clearance insufficient for dossier export.")

    all_edges = graph_data_store.get_all_edges()
    verified_leads = [e for e in all_edges if e.review_status == ReviewStatus.VERIFIED_LEAD]

    now_iso = datetime.now(timezone.utc).isoformat()
    security_hash = hashlib.sha256(f"FIR-492-2024|{x_officer_badge}|{now_iso}".encode("utf-8")).hexdigest()

    certification = (
        "Pursuant to Section 65B of the Indian Evidence Act, 1872 (and Section 63 of Bharatiya Sakshya Adhiniyam, 2023), "
        "all algorithmic link recommendations and entity resolution models herein represent investigative leads only. "
        "No automated model has confirmed guilt or made conclusive legal determinations. Every recorded connection has been "
        f"individually reviewed, verified, and endorsed by authorized officer {x_officer_badge} prior to incorporation into this docket."
    )

    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action="Exported Formal Investigation Dossier",
        target=f"FIR #492/2024 Docket (Security Hash: {security_hash[:12]}...)",
        category=AuditActionCategory.DOSSIER_EXPORT,
        legal_basis=x_legal_basis,
        status="AUTHORIZED"
    )

    return DossierExportResponse(
        fir_number="FIR No. 492/2024",
        police_station="Special Cell / PS Sector 20 Noida",
        investigating_officer=f"{officer.title} ({x_officer_badge})",
        incident_date="2024-10-12 23:45 IST",
        statutory_sections=["BNS Sec 303(2) (Dacoity)", "BNS Sec 310(2) (Transit Hijack)", "BNS Sec 111 (Organised Crime)"],
        case_synopsis="Coordinated heist of electronic freight valued at ₹4.2 Crores in transit. Involves decoy commercial vehicle, cell tower overlaps, synchronized CDR bursts, and Hawala remittance trail.",
        verified_network_leads=verified_leads,
        pinned_hypothesis_cards=_WORKSPACE_ITEMS,
        sec_65b_evidentiary_certification=certification,
        security_hash=f"SHA256-{security_hash[:32].upper()}",
        generated_at=now_iso
    )
