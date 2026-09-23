from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .canonical import CanonicalEntity, CanonicalEdge, ReviewStatus, SignalBand

class UniversalSearchRequest(BaseModel):
    query: str
    category: str = "all"
    limit: int = 50

class UniversalSearchResult(BaseModel):
    query: str
    detected_type: Optional[str] = None
    detected_label: Optional[str] = None
    entities: List[CanonicalEntity]
    total_count: int

class GraphTraversalResponse(BaseModel):
    root_entity_id: str
    nodes: List[CanonicalEntity]
    edges: List[CanonicalEdge]
    hop_count: int

class ReviewLeadRequest(BaseModel):
    review_status: ReviewStatus
    officer_notes: Optional[str] = None
    legal_basis: str = "Investigation under Section 173 BNSS"

class ReviewLeadResponse(BaseModel):
    edge_id: str
    review_status: ReviewStatus
    reviewed_by: str
    reviewed_at: str
    review_notes: Optional[str]
    audit_log_id: str

class WorkspaceItem(BaseModel):
    id: str
    entity_id: Optional[str] = None
    edge_id: Optional[str] = None
    type: str  # entity, connection, hypothesis
    title: str
    subtitle: str
    column: str  # assessment, active_leads, verified, ruled_out
    notes: str
    tags: List[str] = Field(default_factory=list)
    confidence: Optional[str] = None
    pinned_at: str
    pinned_by: str

class WorkspaceItemCreate(BaseModel):
    entity_id: Optional[str] = None
    edge_id: Optional[str] = None
    type: str
    title: str
    subtitle: str
    column: str = "active_leads"
    notes: str = ""
    tags: List[str] = Field(default_factory=list)
    confidence: Optional[str] = None

class DossierExportRequest(BaseModel):
    case_id: str
    include_verified_only: bool = True
    io_notes: Optional[str] = None

class DossierExportResponse(BaseModel):
    fir_number: str
    police_station: str
    investigating_officer: str
    incident_date: str
    statutory_sections: List[str]
    case_synopsis: str
    verified_network_leads: List[CanonicalEdge]
    pinned_hypothesis_cards: List[WorkspaceItem]
    sec_65b_evidentiary_certification: str
    security_hash: str
    generated_at: str
