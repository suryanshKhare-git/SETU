import pytest
from app.services.cross_case_detector import cross_case_detector
from app.services.graph_store import graph_data_store

def test_cross_case_detection_without_merging():
    leads = cross_case_detector.scan_for_cross_case_links()
    assert len(leads) >= 1

    for lead in leads:
        # Strict Invariant: Different case entities!
        assert lead.case_a_id != lead.case_b_id
        assert lead.status == "PENDING_IO_REVIEW"
        assert lead.hop_count >= 2
        assert "strictly prohibited" in lead.explanation.lower()
        assert lead.bridging_entity_name is not None
