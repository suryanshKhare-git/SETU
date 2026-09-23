import networkx as nx
from typing import Dict, List, Optional, Set, Tuple
from ..models.canonical import (
    CanonicalEntity,
    CanonicalEdge,
    EntityType,
    ReviewStatus,
    SignalBand,
)

class GraphDataStore:
    """
    Primary Graph Engine abstraction holding entities as nodes and relationships as edges.
    Supports bounded k-hop traversal, neighborhood querying, and edge inspection.
    """

    def __init__(self):
        self._graph = nx.MultiGraph()
        self._entities: Dict[str, CanonicalEntity] = {}
        self._edges: Dict[str, CanonicalEdge] = {}

    def add_entity_node(self, entity: CanonicalEntity) -> None:
        self._entities[entity.id] = entity
        self._graph.add_node(
            entity.id,
            name=entity.name,
            type=entity.type.value if hasattr(entity.type, "value") else str(entity.type),
            category=entity.category_label,
            identifier=entity.primary_identifier,
            jurisdiction=entity.jurisdiction
        )

    def add_connection_edge(self, edge: CanonicalEdge) -> None:
        self._edges[edge.edge_id] = edge
        self._graph.add_edge(
            edge.source_id,
            edge.target_id,
            key=edge.edge_id,
            label=edge.label,
            connection_type=edge.connection_type,
            is_ai_generated=edge.is_ai_generated,
            confidence_score=edge.confidence_score,
            confidence_band=edge.confidence_band.value if hasattr(edge.confidence_band, "value") else str(edge.confidence_band)
        )

    def get_entity(self, entity_id: str) -> Optional[CanonicalEntity]:
        return self._entities.get(entity_id)

    def get_edge(self, edge_id: str) -> Optional[CanonicalEdge]:
        return self._edges.get(edge_id)

    def get_all_entities(self) -> List[CanonicalEntity]:
        return list(self._entities.values())

    def get_all_edges(self) -> List[CanonicalEdge]:
        return list(self._edges.values())

    def update_edge_review_status(
        self,
        edge_id: str,
        status: ReviewStatus,
        reviewed_by: str,
        reviewed_at: str,
        notes: Optional[str] = None
    ) -> Optional[CanonicalEdge]:
        edge = self._edges.get(edge_id)
        if not edge:
            return None
        edge.review_status = status
        edge.reviewed_by = reviewed_by
        edge.reviewed_at = reviewed_at
        if notes:
            edge.review_notes = notes
        return edge

    def get_bounded_subgraph(
        self,
        root_entity_id: str,
        max_hops: int = 2,
        min_confidence: float = 0.0
    ) -> Tuple[List[CanonicalEntity], List[CanonicalEdge]]:
        """
        Extracts bounded ego-network around root_entity_id up to max_hops (clamped between 1 and 3).
        Guarantees query boundedness for production stability.
        """
        if root_entity_id not in self._entities:
            return [], []

        max_hops = max(1, min(max_hops, 3))  # Hard cap at 3 hops

        # BFS to discover nodes within bounded distance
        visited_nodes: Set[str] = {root_entity_id}
        current_layer: Set[str] = {root_entity_id}

        for _ in range(max_hops):
            next_layer: Set[str] = set()
            for node in current_layer:
                if node in self._graph:
                    neighbors = set(self._graph.neighbors(node))
                    for nbr in neighbors:
                        if nbr not in visited_nodes:
                            visited_nodes.add(nbr)
                            next_layer.add(nbr)
            current_layer = next_layer
            if not current_layer:
                break

        # Collect relevant nodes
        nodes = [self._entities[nid] for nid in visited_nodes if nid in self._entities]

        # Collect all edges connecting nodes in visited set
        edges: List[CanonicalEdge] = []
        for eid, edge in self._edges.items():
            if edge.source_id in visited_nodes and edge.target_id in visited_nodes:
                if edge.confidence_score >= min_confidence:
                    edges.append(edge)

        return nodes, edges

    def search_entities(
        self,
        query: str,
        category: str = "all",
        limit: int = 50
    ) -> List[CanonicalEntity]:
        q = query.strip().lower()
        results: List[CanonicalEntity] = []

        for ent in self._entities.values():
            if category != "all" and ent.type != category:
                continue

            # Text matching across name, primary identifier, summary, aliases, tags
            matched = False
            if not q:
                matched = True
            elif (
                q in ent.name.lower()
                or q in ent.primary_identifier.lower()
                or q in ent.summary.lower()
                or any(q in a.lower() for a in ent.aliases)
                or any(q in t.lower() for t in ent.tags)
            ):
                matched = True

            if matched:
                results.append(ent)
                if len(results) >= limit:
                    break

        return results

graph_data_store = GraphDataStore()
