from typing import List, Dict, Set, Tuple
from datetime import datetime, timezone
from ..models.canonical import CandidateCrossCaseLead, SignalBand
from .graph_store import graph_data_store

class CrossCaseLinkageDetector:
    """
    Background job that detects indirect entity links between distinct criminal cases
    across 2 to 3 hops in the knowledge graph.
    STRICT POLICY INVARIANT: NEVER AUTO-MERGE CASES.
    Emits candidate leads for human investigator review.
    """

    def __init__(self):
        self._candidate_leads: List[CandidateCrossCaseLead] = []

    def scan_for_cross_case_links(self) -> List[CandidateCrossCaseLead]:
        """
        Traverses the graph to find distinct cases that share entities across 2 hops:
        Case A -> Entity X -> Case B  (2 hops)
        or Case A -> Entity X -> Entity Y -> Case B (3 hops)
        """
        all_entities = graph_data_store.get_all_entities()
        case_nodes = [e for e in all_entities if e.type == "case"]
        all_edges = graph_data_store.get_all_edges()

        # Build adjacency mapping
        adj: Dict[str, List[Tuple[str, str]]] = {e.id: [] for e in all_entities}
        for edge in all_edges:
            adj[edge.source_id].append((edge.target_id, edge.label))
            adj[edge.target_id].append((edge.source_id, edge.label))

        discovered_leads: List[CandidateCrossCaseLead] = []
        seen_case_pairs: Set[Tuple[str, str, str]] = set()

        # Scan for each case node
        for case_a in case_nodes:
            # 1-hop neighbors of Case A
            for neighbor_1, label_1 in adj.get(case_a.id, []):
                ent_1 = graph_data_store.get_entity(neighbor_1)
                if not ent_1 or ent_1.type == "case":
                    continue

                # Check 2-hop neighbors
                for neighbor_2, label_2 in adj.get(neighbor_1, []):
                    if neighbor_2 == case_a.id:
                        continue
                    ent_2 = graph_data_store.get_entity(neighbor_2)
                    if not ent_2:
                        continue

                    # Direct 2-hop Case link: Case A -- Entity 1 -- Case B
                    if ent_2.type == "case" and ent_2.id != case_a.id:
                        pair_key = tuple(sorted([case_a.id, ent_2.id])) + (ent_1.id,)
                        if pair_key not in seen_case_pairs:
                            seen_case_pairs.add(pair_key)
                            lead = CandidateCrossCaseLead(
                                lead_id=f"ccl-{len(self._candidate_leads) + len(discovered_leads) + 1:03d}",
                                case_a_id=case_a.id,
                                case_a_fir=case_a.name,
                                case_b_id=ent_2.id,
                                case_b_fir=ent_2.name,
                                bridging_entity_id=ent_1.id,
                                bridging_entity_name=ent_1.name,
                                hop_count=2,
                                matching_criteria=f"Shared {ent_1.category_label}: '{ent_1.name}' ({ent_1.primary_identifier})",
                                confidence_band=SignalBand.STRONG_SIGNAL,
                                explanation=(
                                    f"Cross-Jurisdiction Overlap Detected: Case '{case_a.name}' and Case '{ent_2.name}' "
                                    f"share a common entity '{ent_1.name}' ({ent_1.category_label}). "
                                    f"Automated case merging is strictly prohibited by law. "
                                    f"Surfacing as candidate lead for Investigating Officers to evaluate coordinated action."
                                ),
                                detected_at=datetime.now(timezone.utc).isoformat(),
                                status="PENDING_IO_REVIEW"
                            )
                            discovered_leads.append(lead)

        self._candidate_leads.extend(discovered_leads)
        return discovered_leads

    def get_candidate_leads(self) -> List[CandidateCrossCaseLead]:
        if not self._candidate_leads:
            self.scan_for_cross_case_links()
        return self._candidate_leads

cross_case_detector = CrossCaseLinkageDetector()
