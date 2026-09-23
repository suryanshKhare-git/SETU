import pytest
from app.services.explanation_service import explanation_service
from app.models.canonical import (
    CanonicalEntity,
    EntityType,
    SourceCitation,
    ResolutionEvidence,
    SignalBand,
)

def test_grounded_telephony_lead_explanation():
    ent_a = CanonicalEntity(
        id="ent-phone-1",
        name="+91 98110 29481",
        type=EntityType.PHONE,
        category_label="Burner MSISDN",
        primary_identifier="IMEI-1",
        summary="",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    ent_b = CanonicalEntity(
        id="ent-phone-2",
        name="+91 98210 34918",
        type=EntityType.PHONE,
        category_label="Driver SIM",
        primary_identifier="IMEI-2",
        summary="",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    citations = [
        SourceCitation(
            id="cite-1",
            title="CDR Matrix Dump",
            record_type="CDR",
            snippet="14 calls logged during incident window",
            doc_ref="EXHIBIT-CDR-NOIDA-HR-LOGS"
        )
    ]

    res = explanation_service.generate_explanation(
        source_entity=ent_a,
        target_entity=ent_b,
        connection_type="telephony",
        citations=citations
    )

    assert "Lead" in res["lead_label"] or "Possible Connection" in res["lead_label"]
    assert res["is_ai_generated"] is True
    assert "EXHIBIT-CDR-NOIDA-HR-LOGS" in res["explanation"]
    assert res["confidence_band"] == SignalBand.STRONG_SIGNAL
    assert "investigative lead" in res["explanation"].lower()

def test_official_registry_explanation():
    ent_person = CanonicalEntity(
        id="ent-p1",
        name="Neeraj Yadav",
        type=EntityType.PERSON,
        category_label="Owner",
        primary_identifier="ID-1",
        summary="",
        jurisdiction="Haryana",
        first_sighted="",
        last_sighted=""
    )

    ent_veh = CanonicalEntity(
        id="ent-v1",
        name="HR-26-DQ-8819",
        type=EntityType.VEHICLE,
        category_label="SUV",
        primary_identifier="CHASSIS-1",
        summary="",
        jurisdiction="Haryana",
        first_sighted="",
        last_sighted=""
    )

    evidence = ResolutionEvidence(
        resolution_id="res-exact",
        tier="TIER_1_EXACT_IDENTIFIER",
        entity_a_id=ent_person.id,
        entity_b_id=ent_veh.id,
        score=1.0,
        confidence_band=SignalBand.DIRECT_OFFICIAL_REGISTRY,
        matching_identifiers=["VEHICLE_OWNER_MATCH"],
        rules_applied=["RULE_VAHAN_DATABASE_MATCH"],
        timestamp=""
    )

    res = explanation_service.generate_explanation(
        source_entity=ent_person,
        target_entity=ent_veh,
        evidence=evidence,
        connection_type="ownership"
    )

    assert res["is_ai_generated"] is False
    assert res["confidence_band"] == SignalBand.DIRECT_OFFICIAL_REGISTRY
    assert "Direct Official Registry" in res["lead_label"]
