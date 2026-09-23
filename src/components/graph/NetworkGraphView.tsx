import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Entity, ConnectionEdge, EntityType } from '../../types';
import { NodeDetailsDrawer } from './NodeDetailsDrawer';
import { EdgeExplainDrawer } from './EdgeExplainDrawer';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Layers,
  Search,
  SlidersHorizontal,
  Info,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SimulationNode {
  id: string;
  name: string;
  type: EntityType;
  categoryLabel: string;
  primaryIdentifier: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isDragging?: boolean;
}

// Colors and shapes mapping for entity types
const TYPE_COLORS: Record<EntityType, { bg: string; border: string; text: string; label: string; initial: string }> = {
  person: { bg: '#083344', border: '#06B6D4', text: '#67E8F9', label: 'Person', initial: 'P' },
  organization: { bg: '#312E81', border: '#818CF8', text: '#C7D2FE', label: 'Organization / Enterprise', initial: 'ORG' },
  phone: { bg: '#134E4A', border: '#14B8A6', text: '#5EEAD4', label: 'Phone / SIM', initial: 'SIM' },
  vehicle: { bg: '#451A03', border: '#F59E0B', text: '#FCD34D', label: 'Vehicle', initial: 'VEH' },
  account: { bg: '#064E3B', border: '#10B981', text: '#6EE7B7', label: 'Account / Hawala', initial: 'A/C' },
  location: { bg: '#3B0764', border: '#A855F7', text: '#D8B4FE', label: 'Location / Scene', initial: 'LOC' },
  case: { bg: '#1E3A8A', border: '#3B82F6', text: '#93C5FD', label: 'FIR Docket', initial: 'FIR' },
};

export const NetworkGraphView: React.FC = () => {
  const {
    entities,
    edges,
    selectedEntityId,
    selectedEdgeId,
    selectEntity,
    selectEdge,
    highlightedEntityIds,
    activeHighlightLabel,
    clearGraphHighlight,
    clusters,
    highlightClusterInGraph,
    setMethodologyModalOpen,
    isPresentationMode,
    runNetworkAnalysis,
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showClusterDropdown, setShowClusterDropdown] = useState<boolean>(false);

  // Viewport transforms
  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({
    x: 0,
    y: 0,
    scale: 1,
  });

  // Requirement 7: Entity Type Filter state
  const [activeTypeFilters, setActiveTypeFilters] = useState<Record<EntityType, boolean>>({
    person: true,
    phone: true,
    vehicle: true,
    account: true,
    location: true,
    case: true,
    organization: true,
  });

  // Requirement 7: Relationship Type Filter state
  const [activeRelFilters, setActiveRelFilters] = useState<Record<ConnectionEdge['connectionType'], boolean>>({
    telephony: true,
    spatial: true,
    financial: true,
    ownership: true,
    co_accused: true,
    employment: true,
    association: true,
  });

  const [reviewFilter, setReviewFilter] = useState<'all' | 'unreviewed' | 'verified_lead' | 'needs_evidence'>('all');
  const [graphSearch, setGraphSearch] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [physicsRunning, setPhysicsRunning] = useState<boolean>(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  // Hover state
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Interaction tracking refs
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeIdRef = useRef<string | null>(null);

  // Simulation nodes map
  const nodesRef = useRef<Map<string, SimulationNode>>(new Map());

  // Requirement 6: Search matching list
  const searchResults = useMemo(() => {
    if (!graphSearch.trim()) return [];
    const q = graphSearch.toLowerCase().trim();
    return entities.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.primaryIdentifier.toLowerCase().includes(q) ||
        e.categoryLabel.toLowerCase().includes(q) ||
        (e.aliases && e.aliases.some(a => a.toLowerCase().includes(q)))
    );
  }, [entities, graphSearch]);

  // Filtered visible entities based on category checkboxes
  const visibleEntities = useMemo(() => {
    return entities.filter(ent => activeTypeFilters[ent.type]);
  }, [entities, activeTypeFilters]);

  const visibleEntityIds = useMemo(() => new Set(visibleEntities.map(e => e.id)), [visibleEntities]);

  // Filtered visible edges based on active entity filters and relationship filters
  const visibleEdges = useMemo(() => {
    return edges.filter(edge => {
      if (!visibleEntityIds.has(edge.source) || !visibleEntityIds.has(edge.target)) {
        return false;
      }
      if (!activeRelFilters[edge.connectionType]) {
        return false;
      }
      if (reviewFilter === 'all') return true;
      return edge.reviewStatus === reviewFilter;
    });
  }, [edges, visibleEntityIds, activeRelFilters, reviewFilter]);

  // Requirement 7: Clear Filters Action
  const handleClearFilters = () => {
    setActiveTypeFilters({
      person: true,
      phone: true,
      vehicle: true,
      account: true,
      location: true,
      case: true,
      organization: true,
    });
    setActiveRelFilters({
      telephony: true,
      spatial: true,
      financial: true,
      ownership: true,
      co_accused: true,
      employment: true,
      association: true,
    });
    setReviewFilter('all');
    setGraphSearch('');
  };

  // Set of connected entities if a node or edge or cluster highlight is active
  const connectedNeighbors = useMemo(() => {
    if (!selectedEntityId && highlightedEntityIds.length === 0) return null;
    const neighborSet = new Set<string>();
    if (selectedEntityId) {
      neighborSet.add(selectedEntityId);
      edges.forEach(e => {
        if (e.source === selectedEntityId) neighborSet.add(e.target);
        if (e.target === selectedEntityId) neighborSet.add(e.source);
      });
    }
    highlightedEntityIds.forEach(id => neighborSet.add(id));
    return neighborSet;
  }, [selectedEntityId, highlightedEntityIds, edges]);

  // Initialize or update simulation nodes
  useEffect(() => {
    const currentMap = nodesRef.current;
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    visibleEntities.forEach((ent, index) => {
      if (!currentMap.has(ent.id)) {
        const angle = (index / Math.max(visibleEntities.length, 1)) * 2 * Math.PI;
        const radius = Math.min(width, height) * 0.32;
        currentMap.set(ent.id, {
          id: ent.id,
          name: ent.name,
          type: ent.type,
          categoryLabel: ent.categoryLabel,
          primaryIdentifier: ent.primaryIdentifier,
          x: width / 2 + radius * Math.cos(angle) + (Math.random() - 0.5) * 40,
          y: height / 2 + radius * Math.sin(angle) + (Math.random() - 0.5) * 40,
          vx: 0,
          vy: 0,
          radius: (ent.type === 'case' ? 32 : ent.type === 'person' ? 28 : ent.type === 'organization' ? 30 : 24) * (isPresentationMode ? 1.25 : 1),
          color: TYPE_COLORS[ent.type]?.bg || '#083344',
        });
      } else {
        const existing = currentMap.get(ent.id)!;
        existing.name = ent.name;
        existing.categoryLabel = ent.categoryLabel;
        existing.radius = (ent.type === 'case' ? 32 : ent.type === 'person' ? 28 : ent.type === 'organization' ? 30 : 24) * (isPresentationMode ? 1.25 : 1);
      }
    });

    // Clean up removed nodes
    for (const key of currentMap.keys()) {
      if (!visibleEntityIds.has(key)) {
        currentMap.delete(key);
      }
    }
  }, [visibleEntities, visibleEntityIds, isPresentationMode]);

  // Physics Simulation Step
  const runPhysicsTick = useCallback(() => {
    if (!physicsRunning) return;

    const nodes = Array.from(nodesRef.current.values());
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // 1. Center gravity
    for (const node of nodes) {
      if (node.isDragging) continue;
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      node.vx += dx * 0.0008;
      node.vy += dy * 0.0008;
    }

    // 2. Node-node repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const distSq = dx * dx + dy * dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 380) {
          const force = 1800 / (distSq + 200);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (!n1.isDragging) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (!n2.isDragging) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }
    }

    // 3. Edge spring attraction
    for (const edge of visibleEdges) {
      const source = nodesRef.current.get(edge.source);
      const target = nodesRef.current.get(edge.target);
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const idealDist = 180;
      const force = (dist - idealDist) * 0.008;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!source.isDragging) {
        source.vx += fx;
        source.vy += fy;
      }
      if (!target.isDragging) {
        target.vx -= fx;
        target.vy -= fy;
      }
    }

    // 4. Update velocity and apply friction
    const damping = 0.86;
    for (const node of nodes) {
      if (node.isDragging) continue;
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
    }
  }, [physicsRunning, visibleEdges]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      runPhysicsTick();

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 600;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Background fill
      ctx.fillStyle = '#0B0F17';
      ctx.fillRect(0, 0, width, height);

      // Apply zoom & pan transform
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      // Subtle grid background
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1 / transform.scale;
      const startX = -transform.x / transform.scale;
      const startY = -transform.y / transform.scale;
      const endX = startX + width / transform.scale;
      const endY = startY + height / transform.scale;

      ctx.beginPath();
      for (let x = Math.floor(startX / gridSize) * gridSize; x < endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / gridSize) * gridSize; y < endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Presentation mode scale factor for high readability
      const presScale = isPresentationMode ? 1.28 : 1.0;

      // Draw Edges
      for (const edge of visibleEdges) {
        const source = nodesRef.current.get(edge.source);
        const target = nodesRef.current.get(edge.target);
        if (!source || !target) continue;

        const isSelected = selectedEdgeId === edge.id;
        const isHovered = hoveredEdgeId === edge.id;
        const isHighlightedEdge =
          highlightedEntityIds.length > 0 &&
          highlightedEntityIds.includes(edge.source) &&
          highlightedEntityIds.includes(edge.target);
        const isPartiallyHighlighted =
          highlightedEntityIds.length > 0 &&
          (highlightedEntityIds.includes(edge.source) || highlightedEntityIds.includes(edge.target));
        const isConnectedToSelectedNode =
          selectedEntityId ? (edge.source === selectedEntityId || edge.target === selectedEntityId) : false;

        // Dim unrelated edges if a node or edge or cluster/evidence highlight is active
        const hasActiveFilter = Boolean(selectedEntityId || selectedEdgeId || highlightedEntityIds.length > 0);
        if (hasActiveFilter) {
          if (isSelected || isConnectedToSelectedNode || isHighlightedEdge) {
            ctx.globalAlpha = 1.0;
          } else if (isPartiallyHighlighted) {
            ctx.globalAlpha = 0.55;
          } else {
            ctx.globalAlpha = 0.08;
          }
        } else {
          ctx.globalAlpha = 1.0;
        }

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        if (isSelected || isConnectedToSelectedNode || isHighlightedEdge) {
          ctx.strokeStyle = '#2DD4BF';
          ctx.lineWidth = (3.5 * presScale) / transform.scale;
          ctx.setLineDash([]);
        } else if (isHovered) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = (2.5 * presScale) / transform.scale;
          ctx.setLineDash([]);
        } else if (edge.isAIGenerated) {
          ctx.strokeStyle = edge.reviewStatus === 'verified_lead' ? '#10B981' : '#F59E0B';
          ctx.lineWidth = (1.8 * presScale) / transform.scale;
          ctx.setLineDash([6 / transform.scale, 4 / transform.scale]);
        } else {
          ctx.strokeStyle = '#14B8A6';
          ctx.lineWidth = (1.6 * presScale) / transform.scale;
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Midpoint label pill
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        ctx.save();
        ctx.translate(midX, midY);

        const labelText = edge.label;
        ctx.font = `600 ${Math.max(10, (11 * presScale) / transform.scale)}px monospace`;
        const textWidth = ctx.measureText(labelText).width;
        const pillWidth = textWidth + (12 * presScale) / transform.scale;
        const pillHeight = (16 * presScale) / transform.scale;

        ctx.fillStyle = isSelected || isConnectedToSelectedNode || isHighlightedEdge
          ? 'rgba(13, 148, 136, 0.95)'
          : isHovered
          ? 'rgba(245, 158, 11, 0.9)'
          : 'rgba(15, 22, 38, 0.85)';
        ctx.strokeStyle = isSelected || isConnectedToSelectedNode || isHighlightedEdge
          ? '#2DD4BF'
          : isHovered
          ? '#F59E0B'
          : edge.isAIGenerated
          ? 'rgba(245, 158, 11, 0.6)'
          : 'rgba(20, 184, 166, 0.5)';
        ctx.lineWidth = (1 * presScale) / transform.scale;

        ctx.beginPath();
        ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, (3 * presScale) / transform.scale);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isSelected || isHovered || isConnectedToSelectedNode || isHighlightedEdge ? '#FFFFFF' : '#E2E8F0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, 0, 0);
        ctx.restore();
      }

      // Draw Nodes
      for (const node of nodesRef.current.values()) {
        const isSelected = selectedEntityId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isHighlighted = highlightedEntityIds.includes(node.id);
        const isNeighbor = connectedNeighbors && connectedNeighbors.has(node.id);
        const typeInfo = TYPE_COLORS[node.type] || { bg: '#083344', border: '#06B6D4', text: '#67E8F9', label: 'Entity', initial: 'E' };

        // Dim unrelated nodes if a selection or highlight is active
        const hasActiveNodeFilter = Boolean(selectedEntityId || highlightedEntityIds.length > 0);
        if (hasActiveNodeFilter) {
          if (isSelected || isHighlighted) {
            ctx.globalAlpha = 1.0;
          } else if (isNeighbor) {
            ctx.globalAlpha = 0.70;
          } else {
            ctx.globalAlpha = 0.15;
          }
        } else {
          ctx.globalAlpha = 1.0;
        }

        // Outer halo ring
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected || isHighlighted ? 8 * presScale : isHovered ? 5 * presScale : 3 * presScale) / transform.scale, 0, 2 * Math.PI);
        if (isSelected || isHighlighted) {
          ctx.strokeStyle = '#2DD4BF';
          ctx.lineWidth = (3.8 * presScale) / transform.scale;
        } else if (isNeighbor) {
          ctx.strokeStyle = '#0D9488';
          ctx.lineWidth = (2.2 * presScale) / transform.scale;
        } else if (isHovered) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = (2.8 * presScale) / transform.scale;
        } else {
          ctx.strokeStyle = typeInfo.border;
          ctx.lineWidth = (1.6 * presScale) / transform.scale;
        }
        ctx.stroke();

        // Node fill
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = typeInfo.bg;
        ctx.fill();

        // Inner icon letter
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.max(11, (12 * presScale) / transform.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typeInfo.initial, node.x, node.y - (2 * presScale) / transform.scale);

        // Name label beneath node
        ctx.font = `600 ${Math.max(10, (11.5 * presScale) / transform.scale)}px sans-serif`;
        ctx.fillStyle = isSelected ? '#5EEAD4' : '#F8FAFC';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.radius + (14 * presScale) / transform.scale);

        // Identifier label
        ctx.font = `400 ${Math.max(9, (9.5 * presScale) / transform.scale)}px monospace`;
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(node.primaryIdentifier, node.x, node.y + node.radius + (26 * presScale) / transform.scale);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    runPhysicsTick,
    transform,
    visibleEdges,
    selectedEntityId,
    selectedEdgeId,
    hoveredNodeId,
    hoveredEdgeId,
    connectedNeighbors,
    highlightedEntityIds,
    isPresentationMode,
  ]);

  // Coordinate helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, rawX: 0, rawY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const x = (clientX - transform.x) / transform.scale;
    const y = (clientY - transform.y) / transform.scale;
    return { x, y, rawX: clientX, rawY: clientY };
  };

  const getNodeAt = (x: number, y: number): SimulationNode | null => {
    for (const node of nodesRef.current.values()) {
      const dx = node.x - x;
      const dy = node.y - y;
      if (dx * dx + dy * dy <= node.radius * node.radius) {
        return node;
      }
    }
    return null;
  };

  const getEdgeAt = (x: number, y: number): ConnectionEdge | null => {
    const threshold = 12 / transform.scale;
    for (const edge of visibleEdges) {
      const source = nodesRef.current.get(edge.source);
      const target = nodesRef.current.get(edge.target);
      if (!source || !target) continue;

      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dx = midX - x;
      const dy = midY - y;
      if (dx * dx + dy * dy <= (threshold * 2) * (threshold * 2)) {
        return edge;
      }
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const { x, y, rawX, rawY } = getCanvasCoords(e);
    const clickedNode = getNodeAt(x, y);

    if (clickedNode) {
      draggedNodeIdRef.current = clickedNode.id;
      clickedNode.isDragging = true;
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: rawX - transform.x, y: rawY - transform.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, rawX, rawY } = getCanvasCoords(e);

    if (draggedNodeIdRef.current) {
      const node = nodesRef.current.get(draggedNodeIdRef.current);
      if (node) {
        node.x = x;
        node.y = y;
        node.vx = 0;
        node.vy = 0;
      }
      return;
    }

    if (isPanningRef.current) {
      setTransform(prev => ({
        ...prev,
        x: rawX - panStartRef.current.x,
        y: rawY - panStartRef.current.y,
      }));
      return;
    }

    const hoveredNode = getNodeAt(x, y);
    setHoveredNodeId(hoveredNode ? hoveredNode.id : null);

    if (!hoveredNode) {
      const hoveredEdge = getEdgeAt(x, y);
      setHoveredEdgeId(hoveredEdge ? hoveredEdge.id : null);
    } else {
      setHoveredEdgeId(null);
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeIdRef.current) {
      const node = nodesRef.current.get(draggedNodeIdRef.current);
      if (node) node.isDragging = false;
      draggedNodeIdRef.current = null;
    }
    isPanningRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    const clickedNode = getNodeAt(x, y);

    if (clickedNode) {
      selectEntity(clickedNode.id);
      return;
    }

    const clickedEdge = getEdgeAt(x, y);
    if (clickedEdge) {
      selectEdge(clickedEdge.id);
      return;
    }

    // Clicked empty canvas: deselect
    selectEntity(null);
    selectEdge(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const { rawX, rawY } = getCanvasCoords(e);

    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * zoomFactor, 0.25), 3.5);
      const newX = rawX - (rawX - prev.x) * (newScale / prev.scale);
      const newY = rawY - (rawY - prev.y) * (newScale / prev.scale);
      return { x: newX, y: newY, scale: newScale };
    });
  };

  const handleZoom = (factor: number) => {
    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    setTransform(prev => {
      const newScale = Math.min(Math.max(prev.scale * factor, 0.25), 3.5);
      const newX = centerX - (centerX - prev.x) * (newScale / prev.scale);
      const newY = centerY - (centerY - prev.y) * (newScale / prev.scale);
      return { x: newX, y: newY, scale: newScale };
    });
  };

  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Requirement 4: Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Focus on entity from search result
  const handleSelectSearchResult = (ent: Entity) => {
    selectEntity(ent.id);
    setGraphSearch('');
    setIsSearchFocused(false);

    // Smooth center on node
    const node = nodesRef.current.get(ent.id);
    if (node && containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      setTransform({
        x: width / 2 - node.x * 1.3,
        y: height / 2 - node.y * 1.3,
        scale: 1.3,
      });
    }
  };

  const activeSelectedEntity = entities.find(e => e.id === selectedEntityId);
  const activeSelectedEdge = edges.find(e => e.id === selectedEdgeId);

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#0B0F17] overflow-hidden select-none animate-fadeIn">
      {/* Standardized Page Header */}
      <div className="bg-[#0E1420] border-b border-slate-800 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Network Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Explore relationships between entities in the selected investigation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runNetworkAnalysis}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            <span>Analyze Network</span>
          </button>
        </div>
      </div>

      {/* Top Filter & In-Graph Search Bar */}
      <div className="bg-[#111827] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20 text-xs shadow-sm">
        {/* Requirement 6: Prominent In-Graph Search Field */}
        <div className="relative w-full sm:w-72 md:w-80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={graphSearch}
              onChange={e => {
                setGraphSearch(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search people, organizations, locations..."
              className="w-full pl-8 pr-8 h-9 bg-setu-card border border-setu-border focus:border-teal-500 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none font-sans"
            />
            <Search className="w-4 h-4 text-teal-400 absolute left-2.5 pointer-events-none" />
            {graphSearch && (
              <button
                onClick={() => setGraphSearch('')}
                className="absolute right-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && graphSearch.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-setu-surface border border-setu-border rounded-lg shadow-2xl z-30 max-h-64 overflow-y-auto divide-y divide-setu-border/60 font-sans">
              {searchResults.length > 0 ? (
                searchResults.map(ent => (
                  <button
                    key={ent.id}
                    onClick={() => handleSelectSearchResult(ent)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between group transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-100 group-hover:text-teal-300 transition">
                        {ent.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {ent.primaryIdentifier}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300">
                      {ent.categoryLabel}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 font-mono">
                  No entities found matching "{graphSearch}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Requirement 7: Entity Type Filter Checkboxes / Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-setu-textMuted font-mono text-[11px] mr-1 hidden lg:inline">
            Entity Types:
          </span>
          {(Object.keys(TYPE_COLORS) as EntityType[]).map(type => {
            const isActive = activeTypeFilters[type];
            return (
              <button
                key={type}
                onClick={() =>
                  setActiveTypeFilters(prev => ({
                    ...prev,
                    [type]: !prev[type],
                  }))
                }
                className={`px-2.5 h-8 rounded-md text-xs font-mono font-medium transition border flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-setu-card text-white border-teal-500/70 shadow-sm'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800 line-through'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: TYPE_COLORS[type].border }}
                />
                <span>{type.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* Relationship Filters & Clear Button */}
        <div className="flex items-center gap-2">
          {/* Filter Dropdown Toggle for Relationship Types */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-md border text-xs font-mono transition ${
                showFilterDropdown || Object.values(activeRelFilters).some(v => !v)
                  ? 'bg-teal-950 border-teal-500 text-teal-300'
                  : 'bg-setu-card border-setu-border text-slate-300 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Relations</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-setu-surface border border-setu-border rounded-lg shadow-xl p-3 z-30 space-y-2 font-sans">
                <div className="text-[11px] font-mono font-bold text-slate-300 uppercase pb-1 border-b border-setu-border flex items-center justify-between">
                  <span>Relationship Filters</span>
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  {[
                    { id: 'telephony', label: 'Communication / CDR' },
                    { id: 'spatial', label: 'Location / Spatial' },
                    { id: 'financial', label: 'Banking & Hawala' },
                    { id: 'ownership', label: 'Ownership / Registered' },
                    { id: 'co_accused', label: 'Co-accused Association' },
                    { id: 'employment', label: 'Employment / Corporate' },
                    { id: 'association', label: 'Operational Association' },
                  ].map(rel => {
                    const checked = activeRelFilters[rel.id as keyof typeof activeRelFilters];
                    return (
                      <label
                        key={rel.id}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setActiveRelFilters(prev => ({
                              ...prev,
                              [rel.id]: !prev[rel.id as keyof typeof activeRelFilters],
                            }))
                          }
                          className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                        />
                        <span>{rel.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Detected Pattern Clusters Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowClusterDropdown(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 h-9 rounded-md border text-xs font-mono transition ${
                showClusterDropdown || (activeHighlightLabel && activeHighlightLabel.startsWith('Pattern:'))
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300'
                  : 'bg-setu-card border-setu-border text-slate-300 hover:bg-slate-800'
              }`}
              title="Filter by detected operational clusters"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Clusters ({clusters.length})</span>
            </button>

            {showClusterDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-setu-surface border border-setu-border rounded-lg shadow-2xl p-2.5 z-30 space-y-1.5 font-sans">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-setu-border flex items-center justify-between">
                  <span>Detected Network Patterns</span>
                  <button onClick={() => setShowClusterDropdown(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 pt-1">
                  {clusters.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        highlightClusterInGraph(c.id);
                        setShowClusterDropdown(false);
                      }}
                      className="w-full text-left p-2 rounded hover:bg-slate-800/80 transition flex flex-col gap-0.5 group border border-transparent hover:border-setu-border"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-amber-300">
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-950/60 border border-amber-700/50 text-amber-400 rounded">
                          {c.entityIds.length} nodes
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {c.patternType}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scoring Methodology Modal Trigger */}
          <button
            onClick={() => setMethodologyModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 h-9 rounded-md bg-setu-card hover:bg-slate-800 border border-setu-border text-slate-300 text-xs font-mono transition"
            title="View AI Scoring & Traceability Methodology"
          >
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Methodology</span>
          </button>

          {/* Lead Review State Dropdown */}
          <div className="flex items-center gap-1 bg-setu-card px-2 h-9 rounded-md border border-setu-border">
            <select
              value={reviewFilter}
              onChange={e => setReviewFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-setu-surface">All Links & Records</option>
              <option value="unreviewed" className="bg-setu-surface">Unreviewed AI Leads</option>
              <option value="verified_lead" className="bg-setu-surface">Human-Verified Leads</option>
              <option value="needs_evidence" className="bg-setu-surface">Needs Evidence</option>
            </select>
          </div>

          {/* Requirement 7: Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 px-3 h-9 rounded-md bg-setu-card hover:bg-slate-800 border border-setu-border text-slate-300 text-xs font-mono transition"
            title="Reset all entity and relationship filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
            <span>Clear</span>
          </button>

          {/* Physics Simulation Toggle */}
          <button
            onClick={() => setPhysicsRunning(prev => !prev)}
            className={`w-9 h-9 flex items-center justify-center rounded-md border transition ${
              physicsRunning
                ? 'bg-teal-950/60 border-teal-500/60 text-teal-300'
                : 'bg-setu-card border-setu-border text-slate-400'
            }`}
            title={physicsRunning ? 'Pause graph simulation' : 'Resume graph simulation'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${physicsRunning ? 'animate-spin-slow' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Canvas Area */}
      <div
        className="flex-1 relative flex overflow-hidden"
        ref={containerRef}
        onClick={() => setIsSearchFocused(false)}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing block"
        />

        {/* Floating Zoom, Pan, Reset & Fullscreen Controls Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 p-1 bg-setu-surface/90 border border-setu-border rounded-lg shadow-xl backdrop-blur-sm z-20">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Reset View & Center"
            aria-label="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Toggle Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-setu-textMuted px-2">
            {Math.round(transform.scale * 100)}%
          </span>
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 p-3 bg-setu-surface/85 border border-setu-border rounded-lg shadow-lg backdrop-blur-sm z-20 text-[11px] font-mono space-y-1.5 hidden md:block">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Network Key & Categories
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full border border-teal-400 bg-[#083344]" />
            <span>Entities (P: Person, ORG: Organization, SIM: Phone, A/C: Account, VEH: Vehicle)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-amber-400" />
            <span>AI Suggested Lead (Click to explain)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-4 h-0.5 bg-teal-400" />
            <span>Direct Official Registry</span>
          </div>
        </div>

        {/* Active Focus / Evidence / Cluster Filter Banner */}
        {activeHighlightLabel && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 p-2 px-4 bg-teal-950/95 border border-teal-500/80 rounded-lg shadow-2xl backdrop-blur-md z-30 text-xs font-mono flex items-center gap-3 animate-fadeIn">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] text-teal-400 uppercase tracking-wider font-bold">Investigative Canvas Focus Active</span>
              <span className="text-white font-medium">{activeHighlightLabel} ({highlightedEntityIds.length} correlated entities)</span>
            </div>
            <button
              onClick={clearGraphHighlight}
              className="ml-2 px-2.5 py-1 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded border border-slate-600 text-[11px] flex items-center gap-1 transition"
              title="Clear focus and restore full graph view"
            >
              <X className="w-3 h-3 text-rose-400" />
              <span>Clear Focus</span>
            </button>
          </div>
        )}

        {/* Selected Entity Highlight Alert */}
        {selectedEntityId && activeSelectedEntity && (
          <div className="absolute top-4 right-4 sm:right-96 p-2.5 bg-setu-surface/90 border border-teal-500/70 rounded-lg shadow-lg backdrop-blur-sm z-20 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="text-teal-300 font-semibold">1st-Degree Focus Active:</span>
            <span className="text-white truncate max-w-[160px]">{activeSelectedEntity.name}</span>
            <button
              onClick={() => selectEntity(null)}
              className="text-slate-400 hover:text-white ml-1"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Instruction badge bottom right */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-setu-surface/80 border border-setu-border rounded-md text-[11px] font-mono text-setu-textMuted backdrop-blur-sm hidden sm:flex items-center gap-2 pointer-events-none">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>Click any Node or Edge to inspect evidence</span>
        </div>

        {/* Right Details Drawers */}
        {activeSelectedEntity && (
          <NodeDetailsDrawer
            entity={activeSelectedEntity}
            onClose={() => selectEntity(null)}
          />
        )}

        {activeSelectedEdge && (
          <EdgeExplainDrawer
            edge={activeSelectedEdge}
            onClose={() => selectEdge(null)}
          />
        )}
      </div>
    </div>
  );
};
