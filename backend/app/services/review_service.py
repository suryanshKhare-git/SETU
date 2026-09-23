import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Optional
from pydantic import BaseModel
from ..models.canonical import ReviewStatus
from ..core.audit_ledger import audit_ledger
from ..models.audit import AuditActionCategory
from .graph_store import graph_data_store

class InvestigatorReviewRecord(BaseModel):
    review_id: str
    edge_id: str
    officer_badge: str
    officer_role: str
    status: ReviewStatus
    officer_notes: Optional[str] = None
    reviewed_at: str
    digital_signature_hash: str

class ReviewVerificationService:
    """
    Decoupled Review Service.
    Stores human investigator determinations separately from raw machine edge scores.
    Preserves auditability and legal evidentiary standards.
    """

    def __init__(self):
        self._reviews: Dict[str, InvestigatorReviewRecord] = {}

    def record_review(
        self,
        edge_id: str,
        status: ReviewStatus,
        officer_badge: str,
        officer_role: str,
        officer_notes: Optional[str] = None,
        legal_basis: str = "Authorized by IO under FIR 492/2024"
    ) -> InvestigatorReviewRecord:
        edge = graph_data_store.get_edge(edge_id)
        if not edge:
            raise ValueError(f"Connection edge {edge_id} not found in graph repository.")

        now_iso = datetime.now(timezone.utc).isoformat()
        sig_payload = f"{edge_id}|{status.value}|{officer_badge}|{now_iso}|{officer_notes or ''}"
        sig_hash = hashlib.sha256(sig_payload.encode("utf-8")).hexdigest()

        review = InvestigatorReviewRecord(
            review_id=f"rev-{len(self._reviews) + 1:04d}",
            edge_id=edge_id,
            officer_badge=officer_badge,
            officer_role=officer_role,
            status=status,
            officer_notes=officer_notes,
            reviewed_at=now_iso,
            digital_signature_hash=sig_hash
        )
        self._reviews[edge_id] = review

        # Update edge state in the graph store
        graph_data_store.update_edge_review_status(
            edge_id=edge_id,
            status=status,
            reviewed_by=officer_badge,
            reviewed_at=now_iso,
            notes=officer_notes
        )

        # Log into append-only cryptographic audit chain
        audit_ledger.append(
            officer_name=f"Officer ({officer_badge})",
            officer_role=officer_role,
            officer_badge=officer_badge,
            action=f"Lead Review Status Updated: {status.value.upper()}",
            target=f"Edge {edge_id} ({edge.label})",
            category=AuditActionCategory.LEAD_REVIEW,
            legal_basis=legal_basis,
            status="AUTHORIZED"
        )

        return review

    def get_review_for_edge(self, edge_id: str) -> Optional[InvestigatorReviewRecord]:
        return self._reviews.get(edge_id)

    def get_all_reviews(self) -> List[InvestigatorReviewRecord]:
        return list(self._reviews.values())

review_service = ReviewVerificationService()
