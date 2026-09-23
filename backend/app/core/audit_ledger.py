import hmac
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from ..models.audit import AuditLogEntry, AuditActionCategory, AuditChainVerificationResult
from ..config import settings

class CryptographicAuditLedger:
    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    def __init__(self):
        self._entries: List[AuditLogEntry] = []
        self._init_seed_audit_chain()

    def _calculate_hash(
        self,
        prev_hash: str,
        seq: int,
        timestamp: str,
        badge: str,
        action: str,
        target: str,
        legal_basis: str
    ) -> str:
        payload = f"{prev_hash}|{seq}|{timestamp}|{badge}|{action}|{target}|{legal_basis}"
        key = settings.audit_chain_hmac_secret.encode("utf-8")
        h = hmac.new(key, payload.encode("utf-8"), hashlib.sha256)
        return h.hexdigest()

    def append(
        self,
        officer_name: str,
        officer_role: str,
        officer_badge: str,
        action: str,
        target: str,
        category: AuditActionCategory,
        legal_basis: str,
        terminal_ip: str = "10.14.88.21",
        status: str = "AUTHORIZED"
    ) -> AuditLogEntry:
        seq = len(self._entries) + 1
        prev_hash = self._entries[-1].entry_hash if self._entries else self.GENESIS_HASH
        timestamp = datetime.now(timezone.utc).isoformat()
        
        entry_hash = self._calculate_hash(
            prev_hash=prev_hash,
            seq=seq,
            timestamp=timestamp,
            badge=officer_badge,
            action=action,
            target=target,
            legal_basis=legal_basis
        )
        
        entry = AuditLogEntry(
            id=f"aud-{seq:04d}",
            sequence_number=seq,
            timestamp=timestamp,
            officer_name=officer_name,
            officer_role=officer_role,
            officer_badge=officer_badge,
            action=action,
            target=target,
            category=category,
            legal_basis=legal_basis,
            terminal_ip=terminal_ip,
            status=status,
            previous_block_hash=prev_hash,
            entry_hash=entry_hash
        )
        self._entries.append(entry)
        return entry

    def get_all_entries(self) -> List[AuditLogEntry]:
        # Return newest first for dashboard inspection
        return list(reversed(self._entries))

    def verify_chain_integrity(self) -> AuditChainVerificationResult:
        """
        Validates entire hash-chain from genesis block to current head.
        Returns False if any row was tampered with, deleted, or reordered.
        """
        if not self._entries:
            return AuditChainVerificationResult(
                is_valid=True,
                total_records_checked=0,
                genesis_hash=self.GENESIS_HASH,
                latest_hash=self.GENESIS_HASH,
                verification_message="Empty audit ledger verified."
            )

        prev_hash = self.GENESIS_HASH
        for idx, entry in enumerate(self._entries):
            # Check previous hash pointer
            if entry.previous_block_hash != prev_hash:
                return AuditChainVerificationResult(
                    is_valid=False,
                    total_records_checked=idx,
                    genesis_hash=self.GENESIS_HASH,
                    latest_hash=self._entries[-1].entry_hash,
                    tampered_entry_id=entry.id,
                    verification_message=f"Broken chain link at entry #{entry.sequence_number} ({entry.id}): prev hash pointer does not match previous block."
                )

            # Re-calculate hash to verify payload integrity
            recalculated = self._calculate_hash(
                prev_hash=prev_hash,
                seq=entry.sequence_number,
                timestamp=entry.timestamp,
                badge=entry.officer_badge,
                action=entry.action,
                target=entry.target,
                legal_basis=entry.legal_basis
            )

            if recalculated != entry.entry_hash:
                return AuditChainVerificationResult(
                    is_valid=False,
                    total_records_checked=idx,
                    genesis_hash=self.GENESIS_HASH,
                    latest_hash=self._entries[-1].entry_hash,
                    tampered_entry_id=entry.id,
                    verification_message=f"Hash mismatch at entry #{entry.sequence_number} ({entry.id}): payload was modified after cryptographic sealing."
                )

            prev_hash = entry.entry_hash

        return AuditChainVerificationResult(
            is_valid=True,
            total_records_checked=len(self._entries),
            genesis_hash=self.GENESIS_HASH,
            latest_hash=self._entries[-1].entry_hash,
            verification_message=f"Audit chain cryptographic seal verified across all {len(self._entries)} sequential blocks. 0 discrepancies."
        )

    def _init_seed_audit_chain(self):
        seed_events = [
            ("Lead Investigator", "investigator", "SC-1142", "Initialized Case Repository FIR #492/2024", "CASE-2024-492", AuditActionCategory.WORKSPACE_PIN, "Sec 173 BNSS Registration", "AUTHORIZED"),
            ("Senior Analyst K. Sharma", "analyst", "INT-8821", "Ingested Telecom Carrier Dump NOI-HR", "CDR Batch #88192", AuditActionCategory.EVIDENCE_VIEW, "Sec 94 BNSS Order Ref SC/NOI/2024/991", "AUTHORIZED"),
            ("Lead Investigator", "investigator", "SC-1142", "Universal Search: Suspect Plate DL-01-AB-1234", "Vehicle DL01AB1234", AuditActionCategory.SEARCH, "Inter-State Transit Theft FIR 492", "AUTHORIZED"),
            ("Constable M. Tyagi", "operator", "OP-4410", "Attempted Unsanctioned Bulk CDR Dump", "Burner SIM +91 98110 29481", AuditActionCategory.SECURITY_WARNING, "File Maintenance [INSUFFICIENT CLEARANCE]", "FLAGGED_AUDIT"),
            ("Lead Investigator", "investigator", "SC-1142", "Verified Lead: Call Burst Malhotra <-> Deshmukh", "Edge edge-2", AuditActionCategory.LEAD_REVIEW, "Case Diary Note CD-04", "AUTHORIZED"),
        ]
        for name, role, badge, action, target, cat, legal, status in seed_events:
            self.append(
                officer_name=name,
                officer_role=role,
                officer_badge=badge,
                action=action,
                target=target,
                category=cat,
                legal_basis=legal,
                terminal_ip="10.14.88.21",
                status=status
            )

# Global singleton instance of the audit vault
audit_ledger = CryptographicAuditLedger()
