import pytest
from app.services.entity_resolution import (
    entity_resolution_engine,
    jaro_winkler_similarity,
)
from app.models.canonical import (
    CanonicalEntity,
    EntityType,
    CanonicalIdentifier,
    IdentifierType,
    SignalBand,
)
from app.core.security import generate_blind_index

def test_jaro_winkler_metric():
    assert jaro_winkler_similarity("Vikram Malhotra", "Vikram Malhotra") == 1.0
    assert jaro_winkler_similarity("Vikram Malhotra", "Vicky Malhotra") >= 0.80
    assert jaro_winkler_similarity("Vikram Malhotra", "Zubair Khan") < 0.60
    assert jaro_winkler_similarity("ABCDEF", "UVWXYZ") == 0.0

def test_tier_1_exact_identifier_match():
    ent_a = CanonicalEntity(
        id="ent-a",
        name="Subject A",
        type=EntityType.PERSON,
        category_label="Suspect",
        primary_identifier="+919811029481",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919811029481", is_primary=True, blind_index=generate_blind_index("+919811029481"))
        ],
        summary="A",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    ent_b = CanonicalEntity(
        id="ent-b",
        name="Burner Line",
        type=EntityType.PHONE,
        category_label="CDR MSISDN",
        primary_identifier="+919811029481",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919811029481", is_primary=True, blind_index=generate_blind_index("+919811029481"))
        ],
        summary="B",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    evidence = entity_resolution_engine.resolve_entities(ent_a, ent_b)
    assert evidence is not None
    assert evidence.tier == "TIER_1_EXACT_IDENTIFIER"
    assert evidence.score == 1.0
    assert evidence.confidence_band == SignalBand.DIRECT_OFFICIAL_REGISTRY
    assert len(evidence.matching_identifiers) > 0

def test_tier_2_fuzzy_name_match():
    ent_a = CanonicalEntity(
        id="ent-p1",
        name="Vikram Malhotra",
        type=EntityType.PERSON,
        category_label="Suspect",
        primary_identifier="ID-1",
        aliases=["Vicky"],
        summary="",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    ent_b = CanonicalEntity(
        id="ent-p2",
        name="Vikram M.",
        type=EntityType.PERSON,
        category_label="CAF Subscriber",
        primary_identifier="ID-2",
        aliases=["Vicky"],
        summary="",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    evidence = entity_resolution_engine.resolve_entities(ent_a, ent_b)
    assert evidence is not None
    assert evidence.tier == "TIER_2_FUZZY_PHONETIC"
    assert evidence.score >= 0.80
    assert len(evidence.factors) >= 1

def test_tier_3_spatio_temporal_overlap():
    ent_a = CanonicalEntity(
        id="ent-sim1",
        name="+91 98110 29481",
        type=EntityType.PHONE,
        category_label="Burner",
        primary_identifier="SIM-1",
        summary="",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    ent_b = CanonicalEntity(
        id="ent-truck",
        name="DL-01-AB-1234",
        type=EntityType.VEHICLE,
        category_label="Truck",
        primary_identifier="VEH-1",
        summary="",
        jurisdiction="NCR",
        first_sighted="",
        last_sighted=""
    )

    context = {
        "spatio_temporal_overlap": True,
        "time_delta_mins": 4,
        "distance_meters": 120,
        "evidence_record_ids": ["rec-cdr-01", "rec-toll-01"]
    }

    evidence = entity_resolution_engine.resolve_entities(ent_a, ent_b, context=context)
    assert evidence is not None
    assert evidence.tier == "TIER_3_SPATIO_TEMPORAL"
    assert evidence.score >= 0.85
    assert evidence.confidence_band == SignalBand.STRONG_SIGNAL
