import re
import math
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime, timezone
from ..models.canonical import (
    CanonicalEntity,
    ResolutionEvidence,
    SignalBand,
    FactorScore,
    IdentifierType,
)
from ..core.security import generate_blind_index

def jaro_winkler_similarity(s1: str, s2: str) -> float:
    """
    Computes Jaro-Winkler string distance between two strings (0.0 to 1.0).
    Ideal for phonetic and typographical variations in suspect names.
    """
    s1 = s1.lower().strip()
    s2 = s2.lower().strip()
    if s1 == s2:
        return 1.0

    len1, len2 = len(s1), len(s2)
    if len1 == 0 or len2 == 0:
        return 0.0

    match_distance = max(len1, len2) // 2 - 1
    s1_matches = [False] * len1
    s2_matches = [False] * len2
    matches = 0
    transpositions = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] != s2[j]:
                continue
            s1_matches[i] = True
            s2_matches[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0

    # Winkler prefix bonus (up to 4 chars)
    prefix = 0
    for i in range(min(4, min(len1, len2))):
        if s1[i] == s2[i]:
            prefix += 1
        else:
            break

    return jaro + prefix * 0.1 * (1.0 - jaro)


class EntityResolutionEngine:
    def __init__(self, name_fuzzy_threshold: float = 0.82):
        self.name_fuzzy_threshold = name_fuzzy_threshold
        self._resolution_history: Dict[str, ResolutionEvidence] = {}

    def resolve_entities(
        self,
        entity_a: CanonicalEntity,
        entity_b: CanonicalEntity,
        context: Optional[Dict[str, Any]] = None
    ) -> Optional[ResolutionEvidence]:
        """
        Executes progressive 3-tier matching cascade between two entities.
        Returns ResolutionEvidence if matched or linked, None if no signal.
        """
        context = context or {}

        # -------------------------------------------------------------
        # TIER 1: Deterministic Exact Identifier Matching
        # -------------------------------------------------------------
        tier_1_match, matching_ids = self._check_tier_1_exact(entity_a, entity_b)
        if tier_1_match:
            res_id = f"res-tier1-{entity_a.id}-{entity_b.id}"
            evidence = ResolutionEvidence(
                resolution_id=res_id,
                tier="TIER_1_EXACT_IDENTIFIER",
                entity_a_id=entity_a.id,
                entity_b_id=entity_b.id,
                score=1.0,
                confidence_band=SignalBand.DIRECT_OFFICIAL_REGISTRY,
                factors=[
                    FactorScore(
                        factor="Cryptographic Blind Index Match",
                        score=100.0,
                        weight="Deterministic",
                        description=f"Exact match on high-entropy unique identifiers: {', '.join(matching_ids)}"
                    )
                ],
                matching_identifiers=matching_ids,
                evidence_record_ids=context.get("evidence_record_ids", []),
                rules_applied=["RULE_EXACT_BLIND_INDEX_EQUALITY"],
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            self._resolution_history[res_id] = evidence
            return evidence

        # -------------------------------------------------------------
        # TIER 2: Probabilistic & Phonetic Fuzzy Matching (Persons / Orgs)
        # -------------------------------------------------------------
        if entity_a.type == entity_b.type and entity_a.type == "person":
            similarity = jaro_winkler_similarity(entity_a.name, entity_b.name)
            
            # Check aliases as well
            alias_matched = False
            for alias_a in entity_a.aliases:
                for alias_b in entity_b.aliases:
                    if jaro_winkler_similarity(alias_a, alias_b) >= 0.88:
                        alias_matched = True
                        similarity = max(similarity, 0.90)

            if similarity >= self.name_fuzzy_threshold:
                res_id = f"res-tier2-{entity_a.id}-{entity_b.id}"
                score = round(similarity, 2)
                band = SignalBand.STRONG_SIGNAL if score >= 0.88 else SignalBand.MODERATE_SIGNAL
                evidence = ResolutionEvidence(
                    resolution_id=res_id,
                    tier="TIER_2_FUZZY_PHONETIC",
                    entity_a_id=entity_a.id,
                    entity_b_id=entity_b.id,
                    score=score,
                    confidence_band=band,
                    factors=[
                        FactorScore(
                            factor="Jaro-Winkler Phonetic Similarity",
                            score=score * 100,
                            weight="High",
                            description=f"Name string distance calculated between '{entity_a.name}' and '{entity_b.name}' ({score:.2f})"
                        ),
                        FactorScore(
                            factor="Jurisdictional Overlap",
                            score=85.0 if entity_a.jurisdiction == entity_b.jurisdiction else 50.0,
                            weight="Moderate",
                            description=f"Jurisdiction match: {entity_a.jurisdiction}"
                        ),
                    ],
                    matching_identifiers=[entity_a.primary_identifier, entity_b.primary_identifier],
                    evidence_record_ids=context.get("evidence_record_ids", []),
                    rules_applied=["RULE_JARO_WINKLER_PHONETIC", "RULE_ALIAS_INTERSECT"],
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                self._resolution_history[res_id] = evidence
                return evidence

        # -------------------------------------------------------------
        # TIER 3: Spatio-Temporal Co-Presence Matching
        # -------------------------------------------------------------
        co_located = context.get("spatio_temporal_overlap", False)
        if co_located:
            time_delta_mins = context.get("time_delta_mins", 30)
            distance_meters = context.get("distance_meters", 500)
            
            # Decay score based on delta time & distance
            time_score = max(0, 100 - (time_delta_mins * 2))
            spatial_score = max(0, 100 - (distance_meters / 20))
            combined_score = (time_score * 0.55 + spatial_score * 0.45) / 100.0

            if combined_score >= 0.65:
                res_id = f"res-tier3-{entity_a.id}-{entity_b.id}"
                band = SignalBand.STRONG_SIGNAL if combined_score >= 0.82 else SignalBand.MODERATE_SIGNAL
                evidence = ResolutionEvidence(
                    resolution_id=res_id,
                    tier="TIER_3_SPATIO_TEMPORAL",
                    entity_a_id=entity_a.id,
                    entity_b_id=entity_b.id,
                    score=round(combined_score, 2),
                    confidence_band=band,
                    factors=[
                        FactorScore(
                            factor="Temporal Synchronicity",
                            score=time_score,
                            weight="Critical",
                            description=f"Logged within {time_delta_mins} minutes of incident critical window."
                        ),
                        FactorScore(
                            factor="Spatial Colocation / Cell Tower Overlap",
                            score=spatial_score,
                            weight="High",
                            description=f"Triangulated within {distance_meters} meters of target sector."
                        ),
                    ],
                    matching_identifiers=[entity_a.name, entity_b.name],
                    evidence_record_ids=context.get("evidence_record_ids", []),
                    rules_applied=["RULE_TOWER_TRIANGULATION_OVERLAP", "RULE_FASTAG_CHRONO_LOCK"],
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                self._resolution_history[res_id] = evidence
                return evidence

        return None

    def _check_tier_1_exact(self, a: CanonicalEntity, b: CanonicalEntity) -> Tuple[bool, List[str]]:
        """Checks exact equality of high-entropy blind index tokens."""
        matching = []
        for id_a in a.identifiers:
            for id_b in b.identifiers:
                if id_a.id_type == id_b.id_type and id_a.value.strip() and id_a.value.strip() == id_b.value.strip():
                    matching.append(f"{id_a.id_type.value}: {id_a.value}")
        return len(matching) > 0, matching

    def get_evidence(self, resolution_id: str) -> Optional[ResolutionEvidence]:
        return self._resolution_history.get(resolution_id)

entity_resolution_engine = EntityResolutionEngine()
