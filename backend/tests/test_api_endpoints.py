import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_universal_search_auto_detection():
    # Test phone query
    response = client.post(
        "/api/v1/search/universal",
        json={"query": "+91 98110 29481", "category": "all"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["detected_type"] == "phone"
    assert len(data["entities"]) >= 1

    # Test vehicle query
    res_veh = client.post(
        "/api/v1/search/universal",
        json={"query": "DL-01-AB-1234", "category": "all"}
    )
    assert res_veh.status_code == 200
    assert res_veh.json()["detected_type"] == "vehicle"

def test_entity_graph_bounded_traversal():
    response = client.get("/api/v1/entities/ent-person-1/graph?max_hops=2")
    assert response.status_code == 200
    data = response.json()
    assert data["root_entity_id"] == "ent-person-1"
    assert len(data["nodes"]) >= 2
    assert len(data["edges"]) >= 1
    assert data["hop_count"] == 2

def test_human_lead_review():
    response = client.post(
        "/api/v1/reviews/edges/edge-2",
        headers={
            "X-Officer-Role": "investigator",
            "X-Officer-Badge": "SC-1142",
        },
        json={
            "review_status": "verified_lead",
            "officer_notes": "Corroborated by IO with phone GPS logs",
            "legal_basis": "Case Diary Part-II Entry"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["edge_id"] == "edge-2"
    assert data["review_status"] == "verified_lead"
    assert data["reviewed_by"] == "SC-1142"

def test_dossier_export():
    response = client.post(
        "/api/v1/cases/export-dossier",
        headers={
            "X-Officer-Role": "investigator",
            "X-Officer-Badge": "SC-1142"
        },
        json={"case_id": "CASE-2024-492"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "FIR No. 492/2024" in data["fir_number"]
    assert "Section 65B" in data["sec_65b_evidentiary_certification"]
    assert data["security_hash"].startswith("SHA256-")

def test_audit_log_rbac_gating():
    # 1. Field investigator must be denied access to audit logs!
    denied = client.get(
        "/api/v1/audit/logs",
        headers={"X-Officer-Role": "investigator", "X-Officer-Badge": "SC-1142"}
    )
    assert denied.status_code == 403
    assert "RBAC Clearance Denied" in denied.json()["detail"]

    # 2. Compliance auditor must be granted access
    allowed = client.get(
        "/api/v1/audit/logs",
        headers={"X-Officer-Role": "auditor", "X-Officer-Badge": "AUDIT-009"}
    )
    assert allowed.status_code == 200
    logs = allowed.json()
    assert len(logs) >= 1
    assert "entry_hash" in logs[0]
    assert "previous_block_hash" in logs[0]

def test_audit_chain_verification_endpoint():
    response = client.post(
        "/api/v1/audit/verify-chain",
        headers={"X-Officer-Role": "auditor"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["total_records_checked"] > 0
