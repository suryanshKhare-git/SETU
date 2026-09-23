import hashlib
from typing import Dict, Any, List, Tuple
from ..models.canonical import (
    RawRecord,
    RawSourceType,
    CanonicalEntity,
    EntityType,
    CanonicalIdentifier,
    IdentifierType,
)
from ..core.security import generate_blind_index, encrypt_pii_field

class IngestionConnectorService:
    """
    Connectors and normalizers for heterogeneous crime records:
    FIR, CDR, Financial Bank records, Vahan/FASTag vehicle logs, and Surveillance CCTV.
    """

    @staticmethod
    def _compute_payload_hash(raw_text: str) -> str:
        return hashlib.sha256(raw_text.strip().encode("utf-8")).hexdigest()

    @classmethod
    def ingest_fir(cls, raw_data: Dict[str, Any]) -> Tuple[RawRecord, List[CanonicalEntity]]:
        """
        Normalizes police FIR / Chargesheet into Canonical Case, Persons, and Incident Locations.
        """
        raw_text = raw_data.get("raw_text", "")
        record_id = raw_data.get("id", f"rec-fir-{raw_data.get('fir_number', 'unknown')}")
        
        record = RawRecord(
            id=record_id,
            source_agency=raw_data.get("police_station", "State Police"),
            record_type=RawSourceType.FIR,
            document_number=raw_data.get("fir_number", ""),
            timestamp=raw_data.get("incident_date", ""),
            raw_text=raw_text,
            legal_admissibility_note="Certified copy under Section 61 BNSS / Sec 154 CrPC.",
            extracted_entities=[],
            payload_hash=cls._compute_payload_hash(raw_text),
            jurisdiction=raw_data.get("jurisdiction", "NCR")
        )

        entities: List[CanonicalEntity] = []

        # 1. Primary Case Entity
        case_entity = CanonicalEntity(
            id=raw_data.get("case_id", f"ent-case-{raw_data.get('fir_number')}"),
            name=raw_data.get("fir_number", "FIR Unknown"),
            type=EntityType.CASE,
            category_label="Primary Case Docket",
            primary_identifier=raw_data.get("fir_number", ""),
            identifiers=[
                CanonicalIdentifier(
                    id_type=IdentifierType.CASE_DOCKET_ID,
                    value=raw_data.get("fir_number", ""),
                    is_primary=True,
                    blind_index=generate_blind_index(raw_data.get("fir_number", ""))
                )
            ],
            summary=raw_data.get("synopsis", "Official criminal docket"),
            jurisdiction=raw_data.get("jurisdiction", "NCR"),
            first_sighted=raw_data.get("incident_date", ""),
            last_sighted=raw_data.get("incident_date", ""),
            metadata={
                "Police Station": raw_data.get("police_station", ""),
                "Investigating Officer": raw_data.get("io_name", ""),
                "Sections": ", ".join(raw_data.get("sections", [])),
            },
            tags=["Master Dossier", "Official FIR"]
        )
        entities.append(case_entity)
        record.extracted_entities.append(case_entity.id)

        # 2. Extract Suspects / Accused
        for s in raw_data.get("suspects", []):
            suspect_id = s.get("id", f"ent-person-{s['name'].lower().replace(' ', '-')}")
            p_entity = CanonicalEntity(
                id=suspect_id,
                name=s["name"],
                type=EntityType.PERSON,
                category_label=s.get("role", "Named Suspect"),
                primary_identifier=s.get("identifier", "Aadhaar Hash Pending"),
                aliases=s.get("aliases", []),
                risk_indicator=s.get("risk_indicator"),
                summary=s.get("summary", f"Named in FIR {raw_data.get('fir_number')}"),
                jurisdiction=raw_data.get("jurisdiction", "NCR"),
                first_sighted=raw_data.get("incident_date", ""),
                last_sighted=raw_data.get("incident_date", ""),
                metadata={"Role in Case": s.get("role", "Accused")},
                tags=["Named in FIR"]
            )
            entities.append(p_entity)
            record.extracted_entities.append(p_entity.id)

        return record, entities

    @classmethod
    def ingest_cdr(cls, raw_data: Dict[str, Any]) -> Tuple[RawRecord, List[CanonicalEntity]]:
        """
        Normalizes CDR / IPDR telephony records into Phone and Tower Location entities.
        """
        raw_text = raw_data.get("raw_text", "")
        record_id = raw_data.get("id", "rec-cdr-log")
        
        record = RawRecord(
            id=record_id,
            source_agency=raw_data.get("carrier_authority", "Telecom Nodal Intelligence Cell"),
            record_type=RawSourceType.CDR,
            document_number=raw_data.get("document_number", "CDR-DUMP-01"),
            timestamp=raw_data.get("timestamp", ""),
            raw_text=raw_text,
            legal_admissibility_note="Certified with Section 65B Indian Evidence Act / Section 63 BSA certificate signed by Nodal Officer.",
            extracted_entities=[],
            payload_hash=cls._compute_payload_hash(raw_text),
            jurisdiction=raw_data.get("jurisdiction", "NCR Circle")
        )

        entities: List[CanonicalEntity] = []
        
        # Phone Entity
        msisdn = raw_data.get("target_msisdn", "")
        phone_id = raw_data.get("entity_id", f"ent-phone-{msisdn.replace('+', '').replace(' ', '')}")
        phone_entity = CanonicalEntity(
            id=phone_id,
            name=msisdn,
            type=EntityType.PHONE,
            category_label=raw_data.get("category_label", "Monitored MSISDN"),
            primary_identifier=f"IMEI: {raw_data.get('imei', 'N/A')}",
            identifiers=[
                CanonicalIdentifier(
                    id_type=IdentifierType.MSISDN,
                    value=msisdn,
                    is_primary=True,
                    blind_index=generate_blind_index(msisdn)
                ),
                CanonicalIdentifier(
                    id_type=IdentifierType.IMEI,
                    value=raw_data.get("imei", ""),
                    is_primary=False,
                    blind_index=generate_blind_index(raw_data.get("imei", ""))
                ),
            ],
            summary=raw_data.get("summary", "Telephony communication endpoint"),
            jurisdiction=raw_data.get("jurisdiction", "NCR Circle"),
            first_sighted=raw_data.get("first_sighted", ""),
            last_sighted=raw_data.get("last_sighted", ""),
            metadata={
                "Carrier": raw_data.get("carrier", "Unknown"),
                "IMEI": raw_data.get("imei", "N/A"),
                "Azimuth": raw_data.get("azimuth", "N/A"),
            },
            tags=["CDR Ingest", "Telecom Monitored"]
        )
        entities.append(phone_entity)
        record.extracted_entities.append(phone_entity.id)

        return record, entities

    @classmethod
    def ingest_vehicle_vahan(cls, raw_data: Dict[str, Any]) -> Tuple[RawRecord, List[CanonicalEntity]]:
        """
        Normalizes Vahan 4.0 / FASTag vehicle records into Vehicle entities.
        """
        raw_text = raw_data.get("raw_text", "")
        record_id = raw_data.get("id", f"rec-vahan-{raw_data.get('plate', '')}")
        
        record = RawRecord(
            id=record_id,
            source_agency=raw_data.get("issuing_authority", "MoRTH Vahan Portal / NHAI"),
            record_type=RawSourceType.VEHICLE,
            document_number=raw_data.get("doc_ref", "VAHAN-REG-01"),
            timestamp=raw_data.get("timestamp", ""),
            raw_text=raw_text,
            legal_admissibility_note="Cryptographically authenticated record under IT Act Sec 79A.",
            extracted_entities=[],
            payload_hash=cls._compute_payload_hash(raw_text),
            jurisdiction=raw_data.get("jurisdiction", "National Permit")
        )

        plate = raw_data.get("plate", "")
        veh_id = raw_data.get("entity_id", f"ent-vehicle-{plate.replace('-', '').lower()}")
        
        veh_entity = CanonicalEntity(
            id=veh_id,
            name=plate,
            type=EntityType.VEHICLE,
            category_label=raw_data.get("category_label", "Commercial Vehicle"),
            primary_identifier=f"Chassis: {raw_data.get('chassis', 'N/A')}",
            identifiers=[
                CanonicalIdentifier(
                    id_type=IdentifierType.VEHICLE_PLATE,
                    value=plate,
                    is_primary=True,
                    blind_index=generate_blind_index(plate)
                ),
                CanonicalIdentifier(
                    id_type=IdentifierType.FASTAG_ID,
                    value=raw_data.get("fastag_id", ""),
                    is_primary=False,
                    blind_index=generate_blind_index(raw_data.get("fastag_id", ""))
                ),
            ],
            summary=raw_data.get("summary", "Registered motor transport"),
            jurisdiction=raw_data.get("jurisdiction", "RTO"),
            first_sighted=raw_data.get("timestamp", ""),
            last_sighted=raw_data.get("timestamp", ""),
            metadata={
                "Owner": raw_data.get("owner", "N/A"),
                "Model": raw_data.get("model", "N/A"),
                "FASTag": raw_data.get("fastag_id", "N/A")
            },
            tags=["Vahan Ingest", "FASTag Monitored"]
        )
        record.extracted_entities.append(veh_entity.id)
        return record, [veh_entity]

    @classmethod
    def ingest_bank_statement(cls, raw_data: Dict[str, Any]) -> Tuple[RawRecord, List[CanonicalEntity]]:
        """
        Normalizes bank account and financial transaction logs into Account entities.
        """
        raw_text = raw_data.get("raw_text", "")
        record_id = raw_data.get("id", "rec-bank-01")
        
        record = RawRecord(
            id=record_id,
            source_agency=raw_data.get("bank_name", "Banking AML Compliance Cell"),
            record_type=RawSourceType.FINANCIAL,
            document_number=raw_data.get("document_number", "SEC91-BANK-01"),
            timestamp=raw_data.get("timestamp", ""),
            raw_text=raw_text,
            legal_admissibility_note="Certified under Bankers Books Evidence Act, 1891 Sec 2A.",
            extracted_entities=[],
            payload_hash=cls._compute_payload_hash(raw_text),
            jurisdiction=raw_data.get("jurisdiction", "RBI Financial Sector")
        )

        acc_num = raw_data.get("account_number", "")
        acc_id = raw_data.get("entity_id", f"ent-account-{acc_num.replace(' ', '')}")

        acc_entity = CanonicalEntity(
            id=acc_id,
            name=f"{raw_data.get('bank_name', 'Bank')} A/C #{acc_num}",
            type=EntityType.ACCOUNT,
            category_label=raw_data.get("category_label", "Financial Repository"),
            primary_identifier=f"IFSC: {raw_data.get('ifsc', 'N/A')}",
            identifiers=[
                CanonicalIdentifier(
                    id_type=IdentifierType.BANK_ACCOUNT,
                    value=acc_num,
                    is_primary=True,
                    blind_index=generate_blind_index(acc_num)
                ),
                CanonicalIdentifier(
                    id_type=IdentifierType.IFSC,
                    value=raw_data.get("ifsc", ""),
                    is_primary=False,
                    blind_index=generate_blind_index(raw_data.get("ifsc", ""))
                ),
            ],
            summary=raw_data.get("summary", "Monitored bank ledger account"),
            jurisdiction=raw_data.get("jurisdiction", "Banking"),
            first_sighted=raw_data.get("timestamp", ""),
            last_sighted=raw_data.get("timestamp", ""),
            metadata={
                "Signatory": raw_data.get("signatory", "N/A"),
                "Entity": raw_data.get("entity_holder", "N/A"),
            },
            tags=["Financial Ingest", "Hawala Trail"]
        )
        record.extracted_entities.append(acc_entity.id)
        return record, [acc_entity]
