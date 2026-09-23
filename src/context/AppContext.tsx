import React, { createContext, useContext, useState } from 'react';
import {
  Entity,
  ConnectionEdge,
  TimelineEvent,
  RawSourceRecord,
  WorkspaceCard,
  UserRole,
  AuditLogEntry,
  CaseOverview,
  ReviewStatus,
  AIInvestigationInsight,
  InsightReviewStatus,
  NetworkCluster,
  AnalysisProgressStep,
} from '../types';
import {
  CURRENT_CASE,
  AVAILABLE_CASES,
  USER_ROLES,
  MOCK_ENTITIES,
  MOCK_EDGES,
  MOCK_TIMELINE,
  MOCK_RAW_RECORDS,
  INITIAL_WORKSPACE_CARDS,
  MOCK_AI_INSIGHTS,
  MOCK_CLUSTERS,
} from '../data/mockDataset';
import { INITIAL_AUDIT_LOGS } from '../data/auditLogData';
import { AIAnalysisService } from '../services/aiAnalysisService';

export type AppView = 'home' | 'cases' | 'search' | 'graph' | 'timeline' | 'workspace' | 'entity-profile' | 'audit-log' | 'insights';

interface AppContextType {
  currentRole: UserRole;
  setRole: (roleId: string) => void;
  caseOverview: CaseOverview;
  cases: CaseOverview[];
  selectedCase: CaseOverview | null;
  selectCase: (caseId: string) => void;
  workflowStep: number;
  setWorkflowStep: (step: number) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  entities: Entity[];
  edges: ConnectionEdge[];
  timeline: TimelineEvent[];
  rawRecords: RawSourceRecord[];
  workspaceCards: WorkspaceCard[];
  auditLogs: AuditLogEntry[];
  aiInsights: AIInvestigationInsight[];
  selectedInsightId: string | null;
  selectInsight: (id: string | null) => void;
  updateInsightReview: (insightId: string, status: InsightReviewStatus, note?: string) => void;
  selectedEntityId: string | null;
  selectedEdgeId: string | null;
  activeProfileEntityId: string | null;
  inspectedRawRecord: RawSourceRecord | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectEntity: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  viewEntityProfile: (id: string) => void;
  updateEdgeReview: (edgeId: string, status: ReviewStatus, notes?: string) => void;
  pinToWorkspace: (card: Omit<WorkspaceCard, 'id' | 'pinnedAt' | 'pinnedBy'>) => void;
  updateWorkspaceCard: (id: string, updates: Partial<WorkspaceCard>) => void;
  removeWorkspaceCard: (id: string) => void;
  inspectEvidenceByDocRef: (docRefOrId: string) => void;
  closeEvidenceModal: () => void;
  logAuditAction: (action: string, target: string, category: AuditLogEntry['category'], legalBasis?: string) => void;
  // Modals & Highlights
  isCaseSelectModalOpen: boolean;
  setCaseSelectModalOpen: (open: boolean) => void;
  isAddDataModalOpen: boolean;
  setAddDataModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setReportModalOpen: (open: boolean) => void;
  isMethodologyModalOpen: boolean;
  setMethodologyModalOpen: (open: boolean) => void;
  isAnalysisModalOpen: boolean;
  setAnalysisModalOpen: (open: boolean) => void;
  highlightedEntityIds: string[];
  activeHighlightLabel: string | null;
  clusters: NetworkCluster[];
  highlightNeighborsOf: (entityId: string | null) => void;
  highlightEvidenceInGraph: (docRefOrId: string, entityIds: string[], customLabel?: string) => void;
  highlightInsightInGraph: (insightId: string) => void;
  highlightClusterInGraph: (clusterId: string) => void;
  clearGraphHighlight: () => void;
  loadSimulatedData: (dataType: string) => void;
  runNetworkAnalysis: () => void;
  isAnalyzingNetwork: boolean;
  analysisProgress: AnalysisProgressStep[];
  // SIH Live Demo Controls
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  loadDemoCase: () => void;
  resetDemo: () => void;
  demoToastMessage: string | null;
  clearDemoToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole>(USER_ROLES[0]);
  const [cases] = useState<CaseOverview[]>(AVAILABLE_CASES);
  const [selectedCase, setSelectedCase] = useState<CaseOverview | null>(null);
  const [caseOverview, setCaseOverview] = useState<CaseOverview>(CURRENT_CASE);
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [activeView, setActiveView] = useState<AppView>('home');
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [edges, setEdges] = useState<ConnectionEdge[]>(MOCK_EDGES);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(MOCK_TIMELINE);
  const [rawRecords, setRawRecords] = useState<RawSourceRecord[]>(MOCK_RAW_RECORDS);
  const [workspaceCards, setWorkspaceCards] = useState<WorkspaceCard[]>(INITIAL_WORKSPACE_CARDS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [aiInsights, setAiInsights] = useState<AIInvestigationInsight[]>(MOCK_AI_INSIGHTS);
  const [clusters, setClusters] = useState<NetworkCluster[]>(MOCK_CLUSTERS);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [activeProfileEntityId, setActiveProfileEntityId] = useState<string | null>('ent-person-1');
  const [inspectedRawRecord, setInspectedRawRecord] = useState<RawSourceRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // SIH Presentation Mode & Demo Notifications
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [demoToastMessage, setDemoToastMessage] = useState<string | null>(null);

  // Modals & Highlights
  const [isCaseSelectModalOpen, setCaseSelectModalOpen] = useState<boolean>(false);
  const [isAddDataModalOpen, setAddDataModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [isMethodologyModalOpen, setMethodologyModalOpen] = useState<boolean>(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState<boolean>(false);
  const [highlightedEntityIds, setHighlightedEntityIds] = useState<string[]>([]);
  const [activeHighlightLabel, setActiveHighlightLabel] = useState<string | null>(null);
  const [isAnalyzingNetwork, setIsAnalyzingNetwork] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressStep[]>(AIAnalysisService.getInitialAnalysisSteps());

  const logAuditAction = (
    action: string,
    target: string,
    category: AuditLogEntry['category'],
    legalBasis: string = `Authorized by IO under ${caseOverview.firNumber}`
  ) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST (Realtime)',
      officerName: currentRole.title,
      officerRole: currentRole.id,
      officerBadge: currentRole.badge,
      action,
      target,
      category,
      legalBasis,
      terminalIp: '10.14.88.21 (Investigator Station 01)',
      status: 'AUTHORIZED',
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const selectCase = (caseId: string) => {
    const found = cases.find(c => c.caseId === caseId);
    if (found) {
      setSelectedCase(found);
      setCaseOverview(found);
      logAuditAction('Switched Active Case Docket', `${found.title} [${found.firNumber}]`, 'SEARCH');
      setCaseSelectModalOpen(false);
      // Advance to step 2 or 3
      if (workflowStep === 1) {
        setWorkflowStep(2);
      }
    }
  };

  const setRole = (roleId: string) => {
    const found = USER_ROLES.find(r => r.id === roleId);
    if (found) {
      setCurrentRoleState(found);
      logAuditAction(`RBAC Role Switched to ${found.title}`, `User: ${found.badge}`, 'SECURITY_WARNING', 'Session Authentication');
    }
  };

  const highlightNeighborsOf = (entityId: string | null) => {
    if (!entityId) {
      setHighlightedEntityIds([]);
      return;
    }
    const connectedEdges = edges.filter(e => e.source === entityId || e.target === entityId);
    const neighborIds = connectedEdges.map(e => (e.source === entityId ? e.target : e.source));
    setHighlightedEntityIds([entityId, ...neighborIds]);
  };

  const selectEntity = (id: string | null) => {
    setSelectedEntityId(id);
    if (id) {
      setSelectedEdgeId(null);
      highlightNeighborsOf(id);
      const ent = entities.find(e => e.id === id);
      if (ent) {
        logAuditAction('Inspected Node Entity Details', `${ent.name} (${ent.type})`, 'GRAPH_INSPECTION');
      }
      if (workflowStep < 4) {
        setWorkflowStep(4);
      }
    } else {
      highlightNeighborsOf(null);
    }
  };

  const selectEdge = (id: string | null) => {
    setSelectedEdgeId(id);
    if (id) {
      setSelectedEntityId(null);
      const edge = edges.find(e => e.id === id);
      if (edge) {
        logAuditAction('Opened Explainability Drawer for AI Lead', `${edge.label}: ${edge.leadLabel}`, 'LEAD_REVIEW');
        setHighlightedEntityIds([edge.source, edge.target]);
      }
    } else {
      setHighlightedEntityIds([]);
    }
  };

  const selectInsight = (id: string | null) => {
    setSelectedInsightId(id);
    if (id) {
      const ins = aiInsights.find(i => i.id === id);
      if (ins && ins.entityId) {
        selectEntity(ins.entityId);
      }
    }
  };

  const viewEntityProfile = (id: string) => {
    setActiveProfileEntityId(id);
    setActiveView('entity-profile');
    setSelectedEntityId(null);
    setSelectedEdgeId(null);
    const ent = entities.find(e => e.id === id);
    if (ent) {
      logAuditAction('Navigated to Full Entity Profile Page', `${ent.name} [ID: ${ent.id}]`, 'SEARCH');
    }
  };

  const updateEdgeReview = (edgeId: string, status: ReviewStatus, notes?: string) => {
    setEdges(prev =>
      prev.map(edge => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            reviewStatus: status,
            reviewNotes: notes || edge.reviewNotes,
            reviewedBy: currentRole.badge,
            reviewedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
          };
        }
        return edge;
      })
    );

    const edge = edges.find(e => e.id === edgeId);
    logAuditAction(
      `Investigator Lead Review: Status -> ${status.toUpperCase().replace('_', ' ')}`,
      edge ? `${edge.label} (${edge.confidenceRange})` : edgeId,
      'LEAD_REVIEW',
      notes ? `Investigator Note: ${notes}` : 'Review updated by IO'
    );
  };

  const pinToWorkspace = (cardData: Omit<WorkspaceCard, 'id' | 'pinnedAt' | 'pinnedBy'>) => {
    const newCard: WorkspaceCard = {
      ...cardData,
      id: `card-${Date.now()}`,
      pinnedAt: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
      pinnedBy: currentRole.badge,
    };
    setWorkspaceCards(prev => [newCard, ...prev]);
    logAuditAction('Pinned Item to Investigation Pinboard', cardData.title, 'WORKSPACE_PIN');
  };

  const updateWorkspaceCard = (id: string, updates: Partial<WorkspaceCard>) => {
    setWorkspaceCards(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeWorkspaceCard = (id: string) => {
    setWorkspaceCards(prev => prev.filter(c => c.id !== id));
  };

  const inspectEvidenceByDocRef = (docRefOrId: string) => {
    const found =
      rawRecords.find(r => r.id === docRefOrId || r.documentNumber === docRefOrId) ||
      rawRecords.find(r => docRefOrId.includes(r.id) || docRefOrId.includes(r.documentNumber)) ||
      rawRecords[0];

    if (found) {
      setInspectedRawRecord(found);
      logAuditAction('Inspected Raw Evidentiary Document', `${found.title} [${found.documentNumber}]`, 'EVIDENCE_VIEW', 'Court admissibility audit');
    }
  };

  const closeEvidenceModal = () => {
    setInspectedRawRecord(null);
  };

  const updateInsightReview = (insightId: string, status: InsightReviewStatus, note?: string) => {
    setAiInsights(prev =>
      prev.map(ins => {
        if (ins.id === insightId) {
          return {
            ...ins,
            reviewStatus: status,
            reviewed: status !== 'not_reviewed',
            investigatorNote: note !== undefined ? note : ins.investigatorNote,
            reviewedBy: currentRole.badge,
            reviewedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
          };
        }
        return ins;
      })
    );
    const targetInsight = aiInsights.find(i => i.id === insightId);
    logAuditAction(
      `AI Insight Review Status: ${status.toUpperCase().replace('_', ' ')}`,
      targetInsight ? targetInsight.title : insightId,
      'LEAD_REVIEW',
      note ? `Investigator Note: ${note}` : undefined
    );
  };

  const highlightEvidenceInGraph = (docRefOrId: string, entityIds: string[], customLabel?: string) => {
    const rec = rawRecords.find(r => r.id === docRefOrId || r.documentNumber === docRefOrId);
    const label = customLabel || (rec ? `Evidence: ${rec.documentNumber} (${rec.title})` : `Evidence Ref: ${docRefOrId}`);
    setHighlightedEntityIds(entityIds);
    setActiveHighlightLabel(label);
    if (entityIds.length > 0) {
      setSelectedEntityId(entityIds[0]);
      setSelectedEdgeId(null);
    }
    setActiveView('graph');
    logAuditAction('Correlated Evidence to Graph View', label, 'GRAPH_INSPECTION');
  };

  const highlightInsightInGraph = (insightId: string) => {
    const ins = aiInsights.find(i => i.id === insightId);
    if (!ins) return;
    setSelectedInsightId(insightId);
    const targetIds = ins.relatedEntityIds && ins.relatedEntityIds.length > 0
      ? ins.relatedEntityIds
      : (ins.entityId ? [ins.entityId] : []);
    setHighlightedEntityIds(targetIds);
    setActiveHighlightLabel(`AI Insight: ${ins.title}`);
    if (targetIds.length > 0) {
      setSelectedEntityId(targetIds[0]);
      setSelectedEdgeId(null);
    }
    setActiveView('graph');
    logAuditAction('Correlated AI Insight to Graph Topology', ins.title, 'GRAPH_INSPECTION');
  };

  const highlightClusterInGraph = (clusterId: string) => {
    const cl = clusters.find(c => c.id === clusterId);
    if (!cl) return;
    setHighlightedEntityIds(cl.entityIds);
    setActiveHighlightLabel(`Pattern: ${cl.name}`);
    if (cl.entityIds.length > 0) {
      setSelectedEntityId(cl.entityIds[0]);
      setSelectedEdgeId(null);
    }
    setActiveView('graph');
    logAuditAction('Highlighted Detected Network Cluster', cl.name, 'GRAPH_INSPECTION');
  };

  const clearGraphHighlight = () => {
    setHighlightedEntityIds([]);
    setActiveHighlightLabel(null);
    setSelectedEntityId(null);
    setSelectedEdgeId(null);
  };

  const runNetworkAnalysis = () => {
    setAnalysisModalOpen(true);
    setIsAnalyzingNetwork(true);
    const steps = AIAnalysisService.getInitialAnalysisSteps();
    setAnalysisProgress(steps.map((s, idx) => (idx === 0 ? { ...s, status: 'active' } : s)));

    logAuditAction('Triggered Automated Network Intelligence Pipeline', `${caseOverview.title} [${caseOverview.firNumber}]`, 'SEARCH');

    steps.forEach((_, index) => {
      setTimeout(() => {
        setAnalysisProgress(prev =>
          prev.map((step, sIdx) => {
            if (sIdx < index) return { ...step, status: 'completed' };
            if (sIdx === index) return { ...step, status: 'completed' };
            if (sIdx === index + 1) return { ...step, status: 'active' };
            return { ...step, status: 'pending' };
          })
        );

        if (index === steps.length - 1) {
          setTimeout(() => {
            setIsAnalyzingNetwork(false);
            setWorkflowStep(3); // Advance to Step 3
            setActiveView('insights');
            logAuditAction('Completed Automated Network Intelligence Pipeline', '5 AI Insights & 3 Operational Clusters Generated', 'LEAD_REVIEW');
          }, 400);
        }
      }, (index + 1) * 450);
    });
  };

  const loadSimulatedData = (dataType: string) => {
    logAuditAction(`Loaded Data Source File: ${dataType.toUpperCase()}`, `${dataType} batch ingested`, 'EVIDENCE_VIEW');
    setWorkflowStep(3); // Advance to Analyze Network
    setAddDataModalOpen(false);
  };

  const showDemoToast = (msg: string) => {
    setDemoToastMessage(msg);
    setTimeout(() => {
      setDemoToastMessage(current => (current === msg ? null : current));
    }, 4500);
  };

  const clearDemoToast = () => {
    setDemoToastMessage(null);
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(prev => {
      const next = !prev;
      showDemoToast(next ? 'Presentation Mode Enabled: High-Contrast & Projection Scaling Active' : 'Standard Investigation Mode Restored');
      logAuditAction('Toggled UI Presentation Mode', next ? 'High Contrast Projection ON' : 'Standard View', 'SEARCH');
      return next;
    });
  };

  const loadDemoCase = () => {
    setSelectedCase(CURRENT_CASE);
    setCaseOverview(CURRENT_CASE);
    setEntities(MOCK_ENTITIES);
    setEdges(MOCK_EDGES);
    setTimeline(MOCK_TIMELINE);
    setRawRecords(MOCK_RAW_RECORDS);
    setAiInsights(MOCK_AI_INSIGHTS);
    setClusters(MOCK_CLUSTERS);
    setWorkspaceCards(INITIAL_WORKSPACE_CARDS);
    setWorkflowStep(1);
    setActiveView('home');
    clearGraphHighlight();
    setSelectedEntityId(null);
    setSelectedEdgeId(null);
    setSelectedInsightId(null);
    showDemoToast('Demo Case Loaded: Financial Network & Transit Syndicate (26 entities, 28 relationships)');
    logAuditAction('Loaded Controlled Demonstration Case Docket', 'Operation Northern Haul (26 entities, 28 relationships)', 'SEARCH');
  };

  const resetDemo = () => {
    setSelectedCase(null);
    setCaseOverview(CURRENT_CASE);
    setEntities(MOCK_ENTITIES);
    setEdges(MOCK_EDGES);
    setTimeline(MOCK_TIMELINE);
    setRawRecords(MOCK_RAW_RECORDS);
    setAiInsights(MOCK_AI_INSIGHTS);
    setClusters(MOCK_CLUSTERS);
    setWorkspaceCards(INITIAL_WORKSPACE_CARDS);
    setWorkflowStep(1);
    setActiveView('home');
    clearGraphHighlight();
    setSelectedEntityId(null);
    setSelectedEdgeId(null);
    setSelectedInsightId(null);
    showDemoToast('Demo Case Reset: Default Clean State Restored');
    logAuditAction('Reset Demonstration Case State', 'Clean initial state restored for evaluation', 'SEARCH');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        caseOverview,
        cases,
        selectedCase,
        selectCase,
        workflowStep,
        setWorkflowStep,
        activeView,
        setActiveView,
        entities,
        edges,
        timeline,
        rawRecords,
        workspaceCards,
        auditLogs,
        aiInsights,
        selectedInsightId,
        selectInsight,
        updateInsightReview,
        selectedEntityId,
        selectedEdgeId,
        activeProfileEntityId,
        inspectedRawRecord,
        searchQuery,
        setSearchQuery,
        selectEntity,
        selectEdge,
        viewEntityProfile,
        updateEdgeReview,
        pinToWorkspace,
        updateWorkspaceCard,
        removeWorkspaceCard,
        inspectEvidenceByDocRef,
        closeEvidenceModal,
        logAuditAction,
        isCaseSelectModalOpen,
        setCaseSelectModalOpen,
        isAddDataModalOpen,
        setAddDataModalOpen,
        isReportModalOpen,
        setReportModalOpen,
        isMethodologyModalOpen,
        setMethodologyModalOpen,
        isAnalysisModalOpen,
        setAnalysisModalOpen,
        highlightedEntityIds,
        activeHighlightLabel,
        clusters,
        highlightNeighborsOf,
        highlightEvidenceInGraph,
        highlightInsightInGraph,
        highlightClusterInGraph,
        clearGraphHighlight,
        loadSimulatedData,
        runNetworkAnalysis,
        isAnalyzingNetwork,
        analysisProgress,
        isPresentationMode,
        togglePresentationMode,
        loadDemoCase,
        resetDemo,
        demoToastMessage,
        clearDemoToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

