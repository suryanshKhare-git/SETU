from ..models.canonical import (
    CanonicalEntity,
    CanonicalEdge,
    EntityType,
    RawRecord,
    RawSourceType,
    SignalBand,
    FactorScore,
    SourceCitation,
    ReviewStatus,
    CanonicalIdentifier,
    IdentifierType,
)
from ..core.security import generate_blind_index
from ..services.graph_store import graph_data_store

SEED_ENTITIES = [
    CanonicalEntity(
        id="ent-person-1",
        name='Vikram "Vicky" Malhotra',
        type=EntityType.PERSON,
        category_label="Suspect / Logistics Coordinator",
        primary_identifier="Aadhaar Hash #4092-****-8819",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.AADHAAR_HASH, value="40928819", is_primary=True, blind_index=generate_blind_index("40928819")),
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919811029481", is_primary=False, blind_index=generate_blind_index("+919811029481")),
        ],
        aliases=["Vicky Pehelwan", "Victor M."],
        risk_indicator="Prior charge-sheet in 2022 cargo fraud",
        summary="Identified as chief coordinator for movement of hijacked transit freight. Linked via cell tower co-location during transit window and direct call burst to ground execution crew.",
        jurisdiction="National Capital Region",
        first_sighted="2024-10-10 14:20 IST",
        last_sighted="2024-10-14 02:15 IST",
        status="flagged",
        metadata={
            "Active Contact": "+91 98110 29481",
            "Reported Address": "Flat 4B, Sector 62, Noida",
            "Identified Role": "Operational Planner",
        },
        tags=["Primary Lead", "Flight Risk", "Surveillance Active"]
    ),
    CanonicalEntity(
        id="ent-person-2",
        name="Kabir Deshmukh",
        type=EntityType.PERSON,
        category_label="Vehicle Operator / Ground Crew",
        primary_identifier="DL-DL-042019003881",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919821034918", is_primary=True, blind_index=generate_blind_index("+919821034918")),
        ],
        aliases=["KD", "Chhotu Driver"],
        risk_indicator="Registered commercial driver with false logbook records",
        summary="Driver of decoy container vehicle DL-01-AB-1234. Present at Murthal toll gate within 90 seconds of Vikram Malhotra's burner phone ping.",
        jurisdiction="Haryana / Delhi",
        first_sighted="2024-10-11 09:00 IST",
        last_sighted="2024-10-13 18:30 IST",
        status="active",
        metadata={
            "Active Contact": "+91 98210 34918",
            "Assigned Vehicle": "DL-01-AB-1234 (Tata 407)",
        },
        tags=["Ground Operative", "FASTag Link"]
    ),
    CanonicalEntity(
        id="ent-person-3",
        name='Tariq "Trader" Ahmed',
        type=EntityType.PERSON,
        category_label="Financial Conduit / Hawala Operator",
        primary_identifier="PAN: BPNPA****K",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.PAN, value="BPNPAK", is_primary=True, blind_index=generate_blind_index("BPNPAK")),
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919711455201", is_primary=False, blind_index=generate_blind_index("+919711455201")),
        ],
        aliases=["Tariq Bhai", "The Trader"],
        risk_indicator="Subject of FIU Cash Transaction Reports (CTR) Q3 2024",
        summary="Received multiple structured RTGS cash drops into shell entity 'Blue Star Cargo' immediately following the freight hijack; disbursed cash tokens via Chandni Chowk conduit.",
        jurisdiction="Old Delhi / Mumbai South",
        first_sighted="2024-10-12 11:00 IST",
        last_sighted="2024-10-15 16:45 IST",
        status="active",
        metadata={
            "Monitored Account": "HDFC Current #023910029",
            "Phone": "+91 97114 55201",
        },
        tags=["Financial Trail", "Hawala Lead"]
    ),
    CanonicalEntity(
        id="ent-phone-1",
        name="+91 98110 29481",
        type=EntityType.PHONE,
        category_label="Burner SIM (Suspect Associated)",
        primary_identifier="IMEI: 864910049281720",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919811029481", is_primary=True, blind_index=generate_blind_index("+919811029481")),
            CanonicalIdentifier(id_type=IdentifierType.IMEI, value="864910049281720", is_primary=False, blind_index=generate_blind_index("864910049281720")),
        ],
        summary="Activated 48 hours prior to the hijack using forged CAF. 14 short-duration calls logged to Kabir Deshmukh around midnight.",
        jurisdiction="Delhi NCR Circle",
        first_sighted="2024-10-10 18:30 IST",
        last_sighted="2024-10-13 01:15 IST",
        status="active",
        metadata={"Carrier": "Airtel NCR", "Tower": "Sector 18 Noida"},
        tags=["Burner Line", "IMEI Monitored"]
    ),
    CanonicalEntity(
        id="ent-phone-2",
        name="+91 98210 34918",
        type=EntityType.PHONE,
        category_label="Driver Mobile Endpoint",
        primary_identifier="IMEI: 359102847192039",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.MSISDN, value="+919821034918", is_primary=True, blind_index=generate_blind_index("+919821034918")),
        ],
        summary="Subscribed in name of Kabir Deshmukh. Cell tower trail mirrors container truck GPS movements along Western Peripheral Expressway.",
        jurisdiction="Haryana Circle",
        first_sighted="2024-09-01 00:00 IST",
        last_sighted="2024-10-14 11:20 IST",
        status="active",
        metadata={"Carrier": "Jio Infocomm", "Tower": "Murthal Toll Sector"},
        tags=["Cell Tower Lock"]
    ),
    CanonicalEntity(
        id="ent-vehicle-1",
        name="DL-01-AB-1234",
        type=EntityType.VEHICLE,
        category_label="Commercial Freight Carrier (Decoy)",
        primary_identifier="Chassis: MAT612049N104928",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.VEHICLE_PLATE, value="DL-01-AB-1234", is_primary=True, blind_index=generate_blind_index("DL01AB1234")),
            CanonicalIdentifier(id_type=IdentifierType.FASTAG_ID, value="34161FA82091", is_primary=False, blind_index=generate_blind_index("34161FA82091")),
        ],
        summary="Vahan database records indicate registered to 'Shree Balaji Logistics'. FASTag transaction logged at Murthal Toll at 00:14 IST on 13-Oct-2024.",
        jurisdiction="Delhi Transport Dept (DL-01)",
        first_sighted="2024-10-12 22:30 IST",
        last_sighted="2024-10-13 03:45 IST",
        status="flagged",
        metadata={"Make": "Tata 407", "FASTag ID": "34161FA82091"},
        tags=["Decoy Vehicle", "FASTag Monitored", "Seizure Target"]
    ),
    CanonicalEntity(
        id="ent-account-1",
        name="HDFC Current A/C #023910029",
        type=EntityType.ACCOUNT,
        category_label="Shell Company Repository",
        primary_identifier="IFSC: HDFC0000281",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.BANK_ACCOUNT, value="023910029", is_primary=True, blind_index=generate_blind_index("023910029")),
        ],
        summary="Inward RTGS credit of ₹85,00,000 received 6 hours after cargo hijack from unverified source; rapidly dispersed to multiple mule accounts.",
        jurisdiction="HDFC Bank K.G. Marg",
        first_sighted="2024-10-13 06:15 IST",
        last_sighted="2024-10-14 14:00 IST",
        status="flagged",
        metadata={"Signatory": "Tariq Ahmed", "Turnover Alert": "STR-2024-FIU-9941"},
        tags=["Hawala Repository", "Freeze Warrant Pending"]
    ),
    CanonicalEntity(
        id="ent-location-1",
        name="Sector 18 Ind. Area, Noida",
        type=EntityType.LOCATION,
        category_label="Primary Incident Scene",
        primary_identifier="Geo: 28.5708° N, 77.3271° E",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.CELL_TOWER_ID, value="NOI-SEC18-T3", is_primary=True, blind_index=generate_blind_index("NOI-SEC18-T3")),
        ],
        summary="Intersection where victim container was forced off the road and hijacked.",
        jurisdiction="PS Sector 20 Noida",
        first_sighted="2024-10-12 23:45 IST",
        last_sighted="2024-10-13 00:30 IST",
        status="active",
        metadata={"Tower ID": "AIRTEL-NOI-SEC18-T3"},
        tags=["Crime Scene"]
    ),
    CanonicalEntity(
        id="ent-case-1",
        name="FIR #492/2024",
        type=EntityType.CASE,
        category_label="Primary Active Dossier",
        primary_identifier="PS-SEC20-NOIDA-2024-0492",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.CASE_DOCKET_ID, value="FIR-492-2024", is_primary=True, blind_index=generate_blind_index("FIR-492-2024")),
        ],
        summary="Lead case docket: Coordinated heist of an electronic consignment valued at ₹4.2 Crores in transit.",
        jurisdiction="Special Cell / Noida",
        first_sighted="2024-10-13 02:30 IST",
        last_sighted="2024-10-15 20:00 IST",
        status="active",
        metadata={"IO": "Inspector S. Rawat", "Sections": "BNS 303(2), 310(2), 111"},
        tags=["Master Dossier"]
    ),
    # Secondary Case for Cross-Case Linkage Testing
    CanonicalEntity(
        id="ent-case-2",
        name="FIR #118/2023",
        type=EntityType.CASE,
        category_label="Historical Inter-State Case Dossier",
        primary_identifier="PS-CYB-HYD-2023-0118",
        identifiers=[
            CanonicalIdentifier(id_type=IdentifierType.CASE_DOCKET_ID, value="FIR-118-2023", is_primary=True, blind_index=generate_blind_index("FIR-118-2023")),
        ],
        summary="Armed highway robbery of semiconductor shipments on NH-44 near Shamshabad in Nov 2023. Suspect modus operandi matches decoy carrier switch.",
        jurisdiction="Cyberabad Special Cell",
        first_sighted="2023-11-04 03:00 IST",
        last_sighted="2024-02-10 12:00 IST",
        status="active",
        metadata={"IO": "ACP K. V. Reddy", "Sections": "IPC Sec 395, 397"},
        tags=["Historical Dossier", "Cross-Jurisdiction Target"]
    ),
]

SEED_EDGES = [
    CanonicalEdge(
        edge_id="edge-1",
        source_id="ent-person-1",
        target_id="ent-phone-1",
        label="Registered User [Lead]",
        connection_type="telephony",
        is_ai_generated=True,
        lead_label="Lead: Device Possession & Tower Colocation",
        confidence_band=SignalBand.STRONG_SIGNAL,
        confidence_range="86% – 92% Signal Weight",
        confidence_score=0.89,
        factors=[
            FactorScore(factor="CAF Identity Match", score=88, weight="High", description="Address on CAF matches suspect lease"),
            FactorScore(factor="Tower Colocation", score=94, weight="Critical", description="Device pings Sector 62 during dwell hours")
        ],
        plain_language_explanation="Algorithm correlated cell tower pings for SIM +91 98110 29481 with the residential geo-boundary of Vikram Malhotra over an 8-day period.",
        source_citations=[
            SourceCitation(id="cite-1", title="CAF Airtel Delhi-NCR", record_type="CDR", snippet="Customer Name: Vikram M., Address: Sector 62 Noida", doc_ref="EXHIBIT-CDR-AIRTEL-492/A")
        ],
        review_status=ReviewStatus.VERIFIED_LEAD,
        reviewed_by="Inspector S. Rawat",
        reviewed_at="2024-10-14 10:30 IST"
    ),
    CanonicalEdge(
        edge_id="edge-2",
        source_id="ent-phone-1",
        target_id="ent-phone-2",
        label="Call Burst [Lead]",
        connection_type="telephony",
        is_ai_generated=True,
        lead_label="Lead: Operational Call Burst Pre/Post Hijack",
        confidence_band=SignalBand.STRONG_SIGNAL,
        confidence_range="89% – 95% Signal Weight",
        confidence_score=0.92,
        factors=[
            FactorScore(factor="Temporal Synchronization", score=98, weight="Critical", description="Calls placed 12 mins before and 4 mins after crime"),
            FactorScore(factor="Call Surge", score=92, weight="High", description="14 calls in 3 hours vs 0 historical interactions")
        ],
        plain_language_explanation="Telephony intelligence detected an anomalous surge of 14 direct phone calls between burner device +91 98110 29481 and driver device +91 98210 34918 spanning 23:30 IST to 02:30 IST on the night of the heist.",
        source_citations=[
            SourceCitation(id="cite-2", title="CDR Cross-Switch Matrix NCR-HR", record_type="CDR", snippet="Call #1: 23:32:10; Call #2: 23:49:02; Call #14: 01:54:11", doc_ref="EXHIBIT-CDR-NOIDA-HR-LOGS")
        ],
        review_status=ReviewStatus.UNREVIEWED
    ),
    CanonicalEdge(
        edge_id="edge-3",
        source_id="ent-person-2",
        target_id="ent-vehicle-1",
        label="Driver Association [Lead]",
        connection_type="ownership",
        is_ai_generated=True,
        lead_label="Lead: Operational Vehicle Assignment",
        confidence_band=SignalBand.STRONG_SIGNAL,
        confidence_range="84% – 90% Signal Weight",
        confidence_score=0.87,
        factors=[
            FactorScore(factor="Device-Vehicle Colocation", score=95, weight="Critical", description="Phone GPS matches vehicle FASTag timestamps within 30s")
        ],
        plain_language_explanation="Driver Kabir Deshmukh's personal phone was triangulated directly within the vehicle cockpit coordinates of decoy truck DL-01-AB-1234 across Murthal Toll Plaza.",
        source_citations=[
            SourceCitation(id="cite-3", title="FASTag Log NHAI Plaza Murthal", record_type="VAHAN", snippet="Vehicle DL-01-AB-1234 passed Lane 04 at 01:14:18 IST", doc_ref="EXHIBIT-FASTAG-MURTHAL-492")
        ],
        review_status=ReviewStatus.VERIFIED_LEAD,
        reviewed_by="SI Ajay Malik",
        reviewed_at="2024-10-13 16:00 IST"
    ),
    CanonicalEdge(
        edge_id="edge-4",
        source_id="ent-person-1",
        target_id="ent-person-3",
        label="Financial Conduit [Lead]",
        connection_type="financial",
        is_ai_generated=True,
        lead_label="Lead: Hawala Cash Settlement & Commission",
        confidence_band=SignalBand.MODERATE_SIGNAL,
        confidence_range="72% – 79% Signal Weight",
        confidence_score=0.76,
        factors=[
            FactorScore(factor="Informant Report", score=78, weight="High", description="Source reports token handover at Chandni Chowk")
        ],
        plain_language_explanation="Intelligence indicates Vikram Malhotra negotiated liquidation of the stolen consignment through Tariq Ahmed's front in Old Delhi.",
        source_citations=[
            SourceCitation(id="cite-4", title="Special Cell Intel Report #IR-882", record_type="WITNESS_STATEMENT", snippet="Broker Vicky met Tariq Bullion representative at Naya Bazar", doc_ref="INT-REPORT-SC-882")
        ],
        review_status=ReviewStatus.UNREVIEWED
    ),
    CanonicalEdge(
        edge_id="edge-5",
        source_id="ent-person-3",
        target_id="ent-account-1",
        label="Signatory & Beneficiary [Direct]",
        connection_type="financial",
        is_ai_generated=False,
        lead_label="Direct Official Registry: Bank KYC & Signatory",
        confidence_band=SignalBand.DIRECT_OFFICIAL_REGISTRY,
        confidence_range="100% Banking Documentation",
        confidence_score=1.0,
        factors=[
            FactorScore(factor="Bank Mandate", score=100, weight="Official", description="Sole authorized signatory on HDFC Current A/C #023910029")
        ],
        plain_language_explanation="Verified banking documentation under Section 91 CrPC/BNSS summons confirms Tariq Ahmed as sole authorized signatory of the receiving shell account.",
        source_citations=[
            SourceCitation(id="cite-5", title="HDFC Bank Account Opening Mandate", record_type="FINANCIAL", snippet="A/C #023910029, Entity: Blue Star Logistics, Signatory: Tariq Ahmed", doc_ref="SEC91-HDFC-BANK-492")
        ],
        review_status=ReviewStatus.VERIFIED_LEAD
    ),
    CanonicalEdge(
        edge_id="edge-6",
        source_id="ent-person-1",
        target_id="ent-case-1",
        label="Named Suspect [FIR]",
        connection_type="co_accused",
        is_ai_generated=False,
        lead_label="Direct Official Case Record: FIR Accused Array",
        confidence_band=SignalBand.DIRECT_OFFICIAL_REGISTRY,
        confidence_range="100% Legal Docket",
        confidence_score=1.0,
        factors=[
            FactorScore(factor="Case Diary", score=100, weight="Official", description="Named in Case Diary Part-II")
        ],
        plain_language_explanation="Listed in Case Diary following disclosure statement recorded under custody and surveillance corroboration.",
        source_citations=[
            SourceCitation(id="cite-6", title="Case Diary PS Sector 20 #CD-04", record_type="FIR", snippet="IO noted Vikram Malhotra @ Vicky as prime coordinator", doc_ref="CASE-DIARY-FIR492-CD04")
        ],
        review_status=ReviewStatus.VERIFIED_LEAD
    ),
    # Cross-Case Bridging Edge: Vehicle DL-01-AB-1234 also accused in FIR #118/2023!
    CanonicalEdge(
        edge_id="edge-cross-case-bridge",
        source_id="ent-vehicle-1",
        target_id="ent-case-2",
        label="Suspect Transit Vehicle [Historical FIR]",
        connection_type="co_accused",
        is_ai_generated=False,
        lead_label="Direct Official Case Record: Seizure Memo Reference",
        confidence_band=SignalBand.DIRECT_OFFICIAL_REGISTRY,
        confidence_range="100% Legal Docket",
        confidence_score=1.0,
        factors=[
            FactorScore(factor="Seizure Memo Match", score=100, weight="Official", description="Recorded in Annexure-B of Cyberabad Chargesheet")
        ],
        plain_language_explanation="Decoy carrier DL-01-AB-1234 was previously flagged in Cyberabad FIR #118/2023 for identical freight theft modus operandi.",
        source_citations=[
            SourceCitation(id="cite-7", title="Cyberabad Chargesheet CC-991/2024", record_type="FIR", snippet="Vehicle DL-01-AB-1234 identified as decoy switch carrier", doc_ref="CYBERABAD-FIR118-CC991")
        ],
        review_status=ReviewStatus.VERIFIED_LEAD
    ),
    CanonicalEdge(
        edge_id="edge-7",
        source_id="ent-vehicle-1",
        target_id="ent-case-1",
        label="Decoy Carrier [FIR]",
        connection_type="co_accused",
        is_ai_generated=False,
        lead_label="Direct Official Case Record: FIR Seizure Target",
        confidence_band=SignalBand.DIRECT_OFFICIAL_REGISTRY,
        confidence_range="100% Legal Docket",
        confidence_score=1.0,
        factors=[
            FactorScore(factor="FIR Narrative", score=100, weight="Official", description="Cited in FIR 492/2024 body")
        ],
        plain_language_explanation="Decoy truck DL-01-AB-1234 cited in First Information Report as the transport container used to divert hijacked cargo.",
        source_citations=[
            SourceCitation(id="cite-fir-veh", title="FIR No. 492/2024 Annexure", record_type="FIR", snippet="Decoy transport container vehicle registration DL-01-AB-1234", doc_ref="FIR-492-2024-PS-SEC20")
        ],
        review_status=ReviewStatus.VERIFIED_LEAD
    ),
]

SEED_RAW_RECORDS = [
    RawRecord(
        id="rec-fir-492",
        source_agency="PS Sector 20, Gautam Buddha Nagar Police",
        record_type=RawSourceType.FIR,
        document_number="FIR-492-2024-PS-SEC20",
        timestamp="2024-10-13 02:30 IST",
        raw_text="FIRST INFORMATION REPORT (Sec 173 BNSS / 154 CrPC). PS Sector 20 Noida. Complainant: Swift Freight India. Value: ₹4,20,00,000. Suspects: Vikram Malhotra, driver Kabir Deshmukh, decoy container DL-01-AB-1234.",
        legal_admissibility_note="Certified copy admissible under Section 61 BNSS.",
        extracted_entities=["ent-case-1", "ent-person-1", "ent-person-2", "ent-vehicle-1"],
        jurisdiction="National Capital Region"
    ),
    RawRecord(
        id="rec-cdr-oct12",
        source_agency="Airtel & Jio Telecom Nodal Directorate",
        record_type=RawSourceType.CDR,
        document_number="EXHIBIT-CDR-NOIDA-HR-LOGS",
        timestamp="2024-10-13 04:00 IST",
        raw_text="TELECOM COMPLIANCE LOG. Target: +919811029481 -> +919821034918. 14 calls between 23:30 to 02:30 IST. Cell-ID: NOI-SEC18-01 handoff to MURTHAL-TWR-02.",
        legal_admissibility_note="Furnished with Section 65B Indian Evidence Act / Section 63 BSA certificate.",
        extracted_entities=["ent-phone-1", "ent-phone-2", "ent-location-1"],
        jurisdiction="NCR & Haryana Circles"
    ),
    RawRecord(
        id="rec-fastag-murthal",
        source_agency="NHAI / IHMCL National Toll Gateway",
        record_type=RawSourceType.VEHICLE,
        document_number="EXHIBIT-FASTAG-MURTHAL-492",
        timestamp="2024-10-13 01:14 IST",
        raw_text="NETC NPCI TRANSACTION: Plaza: Murthal NH-44, Lane 04. Tag ID: 34161FA82091. Plate: DL01AB1234. Time: 01:14:18 IST.",
        legal_admissibility_note="Cryptographically signed electronic record under IT Act Sec 79A.",
        extracted_entities=["ent-vehicle-1", "ent-person-2"],
        jurisdiction="Sonipat / NHAI"
    ),
    RawRecord(
        id="rec-bank-hdfc",
        source_agency="HDFC Bank AML Compliance Cell",
        record_type=RawSourceType.FINANCIAL,
        document_number="SEC91-HDFC-BANK-492",
        timestamp="2024-10-14 11:00 IST",
        raw_text="HDFC BANK FIU DISCLOSURE. A/C 023910029 (Blue Star Cargo). Signatory: Tariq Ahmed. Credit: ₹85,00,000 RTGS at 06:15 IST; rapid cash disbursement via 14 IMPS transfers within 4 hours.",
        legal_admissibility_note="Certified under Bankers Books Evidence Act, 1891 Sec 2A.",
        extracted_entities=["ent-account-1", "ent-person-3"],
        jurisdiction="Reserve Bank of India / FIU-IND"
    )
]

def seed_database():
    """Initializes the in-memory graph repository with realistic seed data."""
    for ent in SEED_ENTITIES:
        graph_data_store.add_entity_node(ent)
    for edge in SEED_EDGES:
        graph_data_store.add_connection_edge(edge)

# Auto-seed on import
seed_database()
