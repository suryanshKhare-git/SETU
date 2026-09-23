import pytest
from app.core.audit_ledger import CryptographicAuditLedger
from app.models.audit import AuditActionCategory

def test_audit_chain_integrity_and_tamper_detection():
    ledger = CryptographicAuditLedger()
    
    # 1. Verify intact chain
    initial_res = ledger.verify_chain_integrity()
    assert initial_res.is_valid is True
    assert initial_res.total_records_checked > 0

    # 2. Append new event
    new_entry = ledger.append(
        officer_name="Test Officer",
        officer_role="investigator",
        officer_badge="TEST-99",
        action="Queried Suspect Phone Records",
        target="+91 98110 29481",
        category=AuditActionCategory.SEARCH,
        legal_basis="Test Warrant Ref 123",
        status="AUTHORIZED"
    )

    # 3. Verify chain is still valid
    res_after_append = ledger.verify_chain_integrity()
    assert res_after_append.is_valid is True
    assert res_after_append.latest_hash == new_entry.entry_hash

    # 4. Simulate malicious tampering with payload in a historical entry
    tampered_entry = ledger._entries[1]
    original_target = tampered_entry.target
    tampered_entry.target = "ALTERED_TARGET_CORRUPT"

    # 5. Chain verification must detect tampering!
    tamper_check = ledger.verify_chain_integrity()
    assert tamper_check.is_valid is False
    assert tamper_check.tampered_entry_id == tampered_entry.id
    assert "Hash mismatch" in tamper_check.verification_message

    # Restore target
    tampered_entry.target = original_target
    assert ledger.verify_chain_integrity().is_valid is True
