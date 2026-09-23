from fastapi import APIRouter, Header, HTTPException
from ..models.api_schemas import ReviewLeadRequest, ReviewLeadResponse
from ..services.review_service import review_service
from ..core.security import get_officer_context

router = APIRouter(prefix="/reviews", tags=["Human Review Workflow"])

@router.post("/edges/{edge_id}", response_model=ReviewLeadResponse)
def record_edge_review(
    edge_id: str,
    req: ReviewLeadRequest,
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
):
    """
    Records human investigator review for an AI-suggested lead.
    Stored independently of raw machine scoring to ensure legal accountability.
    """
    officer = get_officer_context(x_officer_role)
    if not officer.can_modify_leads:
        raise HTTPException(
            status_code=403,
            detail="Active officer role is not authorized to endorse or modify lead determinations."
        )

    try:
        record = review_service.record_review(
            edge_id=edge_id,
            status=req.review_status,
            officer_badge=x_officer_badge,
            officer_role=officer.role,
            officer_notes=req.officer_notes,
            legal_basis=req.legal_basis
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return ReviewLeadResponse(
        edge_id=record.edge_id,
        review_status=record.status,
        reviewed_by=record.officer_badge,
        reviewed_at=record.reviewed_at,
        review_notes=record.officer_notes,
        audit_log_id=record.review_id
    )
