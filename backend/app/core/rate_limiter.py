import time
from collections import defaultdict
from typing import Dict, List, Tuple
from ..config import settings
from .audit_ledger import audit_ledger
from ..models.audit import AuditActionCategory

class AnomalyDetectingRateLimiter:
    def __init__(self):
        self._window_requests: Dict[str, List[float]] = defaultdict(list)
        self._window_seconds: int = 60

    def check_request(self, client_ip: str, officer_badge: str, endpoint: str, case_ref: str = "") -> Tuple[bool, str]:
        now = time.time()
        key = f"{client_ip}:{officer_badge}"
        
        # Prune older than 60 seconds
        self._window_requests[key] = [t for t in self._window_requests[key] if now - t < self._window_seconds]
        
        current_count = len(self._window_requests[key])
        
        # Anomaly 1: Rate limit exceeded (> 60 queries/min)
        if current_count >= settings.rate_limit_per_minute:
            audit_ledger.append(
                officer_name="Rate Limiter Shield",
                officer_role="SECURITY_DAEMON",
                officer_badge=officer_badge,
                action=f"Rate Limit Exceeded: {current_count} req/min on {endpoint}",
                target=endpoint,
                category=AuditActionCategory.SECURITY_WARNING,
                legal_basis="Automatic Rate Protection Policy",
                terminal_ip=client_ip,
                status="FLAGGED_AUDIT"
            )
            return False, "Rate limit exceeded. Query rate throttled to protect evidentiary integrity."

        # Anomaly 2: Rapid burst detection (> 15 queries in 5 seconds)
        recent_burst = [t for t in self._window_requests[key] if now - t < 5.0]
        if len(recent_burst) >= settings.anomaly_burst_threshold:
            audit_ledger.append(
                officer_name="Anomaly Detector",
                officer_role="SECURITY_DAEMON",
                officer_badge=officer_badge,
                action=f"Automated Scraping Anomaly: {len(recent_burst)} rapid requests in 5s",
                target=endpoint,
                category=AuditActionCategory.SECURITY_WARNING,
                legal_basis="Anti-Scraping / Bulk Exfiltration Safeguard",
                terminal_ip=client_ip,
                status="FLAGGED_AUDIT"
            )
            return False, "Security flag: Abnormal query velocity detected. Investigation supervisor notified."

        self._window_requests[key].append(now)
        return True, "OK"

rate_limiter = AnomalyDetectingRateLimiter()
