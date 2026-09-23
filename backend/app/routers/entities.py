from fastapi import APIRouter, Header, HTTPException, Query
from typing import List, Optional
from ..models.canonical import CanonicalEntity, CanonicalEdge
from ..models.api_schemas import GraphTraversalResponse
from ..services.graph_store import graph_data_store
from ..core.audit_ledger import audit_ledger
from ..core.security import get_officer_context
from ..models.audit import AuditActionCategory

router = APIRouter(prefix="/entities", tags=["Entities & Graph"])

@router.get("", response_model=List[CanonicalEntity])
def list_entities():
    """Returns all canonical entities in the active repository."""
    return graph_data_store.get_all_entities()

@router.get("/{entity_id}", response_model=CanonicalEntity)
def get_entity_profile(
    entity_id: str,
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
    x_legal_basis: str = Header("FIR 492/2024 Case Diary Inspection", alias="X-Legal-Basis"),
):
    """Retrieves full canonical profile for an entity node."""
    ent = graph_data_store.get_entity(entity_id)
    if not ent:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_id}' not found.")

    officer = get_officer_context(x_officer_role)
    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action="Viewed Entity Dossier Profile",
        target=f"{ent.name} [{ent.id}]",
        category=AuditActionCategory.SEARCH,
        legal_basis=x_legal_basis,
        status="AUTHORIZED"
    )
    return ent

@router.get("/{entity_id}/graph", response_model=GraphTraversalResponse)
def get_entity_subgraph(
    entity_id: str,
    max_hops: int = Query(1, ge=1, le=3, description="Bounded hop distance (1 to 3)"),
    min_confidence: float = Query(0.0, ge=0.0, le=1.0),
    x_officer_role: str = Header("investigator", alias="X-Officer-Role"),
    x_officer_badge: str = Header("SC-1142", alias="X-Officer-Badge"),
    x_legal_basis: str = Header("Link Analysis under Section 173 BNSS", alias="X-Legal-Basis"),
):
    """
    Executes bounded k-hop network traversal around target entity.
    Hop count is strictly capped between 1 and 3 to guarantee bounded query latency.
    """
    ent = graph_data_store.get_entity(entity_id)
    if not ent:
        raise HTTPException(status_code=404, detail=f"Root entity '{entity_id}' not found.")

    nodes, edges = graph_data_store.get_bounded_subgraph(
        root_entity_id=entity_id,
        max_hops=max_hops,
        min_confidence=min_confidence
    )

    officer = get_officer_context(x_officer_role)
    audit_ledger.append(
        officer_name=officer.title,
        officer_role=officer.role,
        officer_badge=x_officer_badge,
        action=f"Expanded {max_hops}-Hop Network Neighborhood",
        target=f"{ent.name} [{ent.id}] (Discovered {len(nodes)} nodes, {len(edges)} edges)",
        category=AuditActionCategory.GRAPH_INSPECTION,
        legal_basis=x_legal_basis,
        status="AUTHORIZED"
    )

    return GraphTraversalResponse(
        root_entity_id=entity_id,
        nodes=nodes,
        edges=edges,
        hop_count=max_hops
    )

@router.get("/{entity_id}/edges", response_model=List[CanonicalEdge])
def get_entity_direct_edges(entity_id: str):
    """Returns all direct 1st-degree incident and lead connections for an entity."""
    all_edges = graph_data_store.get_all_edges()
    return [e for e in all_edges if e.source_id == entity_id or e.target_id == entity_id]
