import pytest
from app.services.ingestion import IngestionConnectorService
from app.models.canonical import RawSourceType, EntityType

def test_ingest_fir():
    sample_fir = {
        "id": "rec-fir-test-01",
        "fir_number": "FIR-999-2024",
        "police_station": "Special Cell PS",
        "incident_date": "2024-10-12",
        "raw_text": "Sample FIR complaint regarding hijacking of freight.",
        "jurisdiction": "Delhi NCR",
        "suspects": [
            {"name": "Vikram Malhotra", "role": "Prime Coordinator", "aliases": ["Vicky"]}
        ]
    }
    record, entities = IngestionConnectorService.ingest_fir(sample_fir)
    assert record.record_type == RawSourceType.FIR
    assert record.payload_hash is not None
    assert len(entities) == 2  # Case entity + Suspect entity
    assert entities[0].type == EntityType.CASE
    assert entities[1].type == EntityType.PERSON
    assert entities[1].name == "Vikram Malhotra"

def test_ingest_cdr():
    sample_cdr = {
        "id": "rec-cdr-test-01",
        "target_msisdn": "+919811029481",
        "imei": "864910049281720",
        "carrier": "Airtel",
        "raw_text": "CDR Dump log showing 14 outgoing calls.",
        "jurisdiction": "NCR Circle"
    }
    record, entities = IngestionConnectorService.ingest_cdr(sample_cdr)
    assert record.record_type == RawSourceType.CDR
    assert len(entities) == 1
    assert entities[0].type == EntityType.PHONE
    assert entities[0].name == "+919811029481"
    assert entities[0].identifiers[0].blind_index is not None

def test_ingest_vahan():
    sample_vahan = {
        "plate": "DL-01-AB-1234",
        "chassis": "MAT612049N104928",
        "fastag_id": "34161FA82091",
        "raw_text": "Vahan vehicle registration record.",
    }
    record, entities = IngestionConnectorService.ingest_vehicle_vahan(sample_vahan)
    assert record.record_type == RawSourceType.VEHICLE
    assert len(entities) == 1
    assert entities[0].type == EntityType.VEHICLE
    assert entities[0].name == "DL-01-AB-1234"
