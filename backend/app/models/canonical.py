from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class EntityType(str, Enum):
    PERSON = "person"
    PHONE = "phone"
    VEHICLE = "vehicle"
    ACCOUNT = "account"
    LOCATION = "location"
    ORGANIZATION = "organization"
    CASE = "case"
    EVENT = "event"

class IdentifierType(str, Enum):
    MSISDN = "MSISDN"
    IMEI = "IMEI"
    IMSI = "IMSI"
    VEHICLE_PLATE = "VEHICLE_PLATE"
    CHASSIS_NO = "CHASSIS_NO"
    BANK_ACCOUNT = "BANK_ACCOUNT"
    IFSC = "IFSC"
    PAN = "PAN"
    AADHAAR_HASH = "AADHAAR_HASH"
    CASE_DOCKET_ID = "CASE_DOCKET_ID"
    FASTAG_ID = "FASTAG_ID"
    CELL_TOWER_ID = "CELL_TOWER_ID"

class RawSourceType(str, Enum):
    FIR = "FIR"
    CDR = "CDR"
    FINANCIAL = "FINANCIAL"
    VEHICLE = "VEHICLE"
    SURVEILLANCE = "SURVEILLANCE"
    WITNESS_STATEMENT = "WITNESS_STATEMENT"

class ReviewStatus(str, Enum):
    UNREVIEWED = "unreviewed"
    VERIFIED_LEAD = "verified_lead"
    NEEDS_EVIDENCE = "needs_evidence"
    DISMISSED = "dismissed"

class SignalBand(str, Enum):
    STRONG_SIGNAL = "Strong Signal"
    MODERATE_SIGNAL = "Moderate Signal"
    WEAK_SIGNAL = "Weak Signal"
    DIRECT_OFFICIAL_REGISTRY = "Direct Official Registry"

class CanonicalIdentifier(BaseModel):
    id_type: IdentifierType
    value: str
    is_primary: bool = False
    blind_index: Optional[str] = None

class RawRecord(BaseModel):
    id: str
    source_agency: str
    record_type: RawSourceType
    document_number: str
    timestamp: str
    raw_text: str
    legal_admissibility_note: str
    extracted_entities: List[str] = Field(default_factory=list)
    payload_hash: Optional[str] = None
    jurisdiction: str = "National Capital Region"

class CanonicalEntity(BaseModel):
    id: str
    name: str
    type: EntityType
    category_label: str
    primary_identifier: str
    identifiers: List[CanonicalIdentifier] = Field(default_factory=list)
    aliases: List[str] = Field(default_factory=list)
    risk_indicator: Optional[str] = None
    summary: str
    jurisdiction: str
    first_sighted: str
    last_sighted: str
    status: str = "active"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)

class FactorScore(BaseModel):
    factor: str
    score: float  # 0 to 100
    weight: str
    description: str

class ResolutionEvidence(BaseModel):
    resolution_id: str
    tier: str  # TIER_1_EXACT, TIER_2_FUZZY, TIER_3_SPATIO_TEMPORAL
    entity_a_id: str
    entity_b_id: str
    score: float
    confidence_band: SignalBand
    factors: List[FactorScore] = Field(default_factory=list)
    matching_identifiers: List[str] = Field(default_factory=list)
    evidence_record_ids: List[str] = Field(default_factory=list)
    rules_applied: List[str] = Field(default_factory=list)
    timestamp: str

class SourceCitation(BaseModel):
    id: str
    title: str
    record_type: str
    snippet: str
    doc_ref: str
    timestamp: Optional[str] = None

class CanonicalEdge(BaseModel):
    edge_id: str
    source_id: str
    target_id: str
    label: str
    connection_type: str
    is_ai_generated: bool
    lead_label: str  # Enforces 'Lead: ...' or 'Possible Connection: ...' for AI links
    confidence_band: SignalBand
    confidence_range: str
    confidence_score: float
    factors: List[FactorScore] = Field(default_factory=list)
    plain_language_explanation: str
    source_citations: List[SourceCitation] = Field(default_factory=list)
    resolution_evidence_id: Optional[str] = None
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    review_notes: Optional[str] = None

class CandidateCrossCaseLead(BaseModel):
    lead_id: str
    case_a_id: str
    case_a_fir: str
    case_b_id: str
    case_b_fir: str
    bridging_entity_id: str
    bridging_entity_name: str
    hop_count: int
    matching_criteria: str
    confidence_band: SignalBand
    explanation: str
    detected_at: str
    status: str = "PENDING_IO_REVIEW"  # NEVER auto-merged
