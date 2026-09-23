export type EntityType = 'person' | 'phone' | 'vehicle' | 'account' | 'location' | 'case' | 'organization';

export type ReviewStatus = 'unreviewed' | 'verified_lead' | 'needs_evidence' | 'dismissed';

export type SignalBand = 'Strong Signal' | 'Moderate Signal' | 'Weak Signal' | 'Direct Official Registry';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  categoryLabel: string;
  primaryIdentifier: string;
  aliases?: string[];
  riskIndicator?: string;
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore?: number; // 0 - 100
  riskRationale?: string;
  summary: string;
  jurisdiction: string;
  firstSighted: string;
  lastSighted: string;
  status: 'active' | 'flagged' | 'cleared';
  metadata: Record<string, string | number>;
  tags: string[];
}

export interface FactorScore {
  factor: string;
  score: number; // 0 - 100
  weight: string;
  description: string;
}

export interface SourceCitation {
  id: string;
  title: string;
  recordType: 'FIR' | 'CDR' | 'VAHAN' | 'BANK_LEDGER' | 'CCTV_LOG' | 'WITNESS_STATEMENT';
  snippet: string;
  docRef: string;
  timestamp?: string;
  rawRecordId?: string;
}

export interface ConnectionEdge {
  id: string;
  source: string; // entity id
  target: string; // entity id
  label: string;
  connectionType: 'telephony' | 'spatial' | 'financial' | 'ownership' | 'co_accused' | 'employment' | 'association';
  isAIGenerated: boolean;
  leadLabel: string; // MUST contain 'Lead' or 'Possible Connection' for AI links
  confidenceBand: SignalBand;
  confidenceRange: string; // e.g. "82% – 88% Signal Weight"
  factorBreakdown: FactorScore[];
  plainLanguageExplanation: string;
  sourceCitations: SourceCitation[];
  reviewStatus: ReviewStatus;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  displayDate: string;
  title: string;
  category: 'telephony' | 'transit' | 'financial' | 'police_incident' | 'surveillance';
  entityIds: string[];
  summary: string;
  locationName?: string;
  sourceDocRef: string;
  evidenceWeight: string;
}

export interface RawSourceRecord {
  id: string;
  recordType: 'FIR' | 'CDR' | 'VAHAN' | 'BANK_LEDGER' | 'CCTV_LOG' | 'WITNESS_STATEMENT';
  title: string;
  documentNumber: string;
  issuingAuthority: string;
  timestamp: string;
  rawText: string;
  extractedEntities: string[];
  jurisdiction: string;
  legalAdmissibilityNote: string;
}

export interface WorkspaceCard {
  id: string;
  entityId?: string;
  edgeId?: string;
  type: 'entity' | 'connection' | 'hypothesis';
  title: string;
  subtitle: string;
  column: 'assessment' | 'active_leads' | 'verified' | 'ruled_out';
  notes: string;
  tags: string[];
  confidence?: string;
  pinnedAt: string;
  pinnedBy: string;
}

export interface UserRole {
  id: string;
  title: string;
  badge: string;
  department: string;
  jurisdiction: string;
  permissions: {
    canViewRawRecords: boolean;
    canModifyLeads: boolean;
    canExportDossier: boolean;
    canViewAuditLogs: boolean;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerName: string;
  officerRole: string;
  officerBadge: string;
  action: string;
  category: 'SEARCH' | 'GRAPH_INSPECTION' | 'EVIDENCE_VIEW' | 'LEAD_REVIEW' | 'WORKSPACE_PIN' | 'DOSSIER_EXPORT' | 'SECURITY_WARNING';
  target: string;
  legalBasis: string;
  terminalIp: string;
  status: 'AUTHORIZED' | 'FLAGGED_AUDIT';
}

export interface CaseOverview {
  caseId: string;
  firNumber: string;
  title: string;
  policeStation: string;
  investigationOfficer: string;
  incidentDate: string;
  jurisdiction: string;
  sections: string[];
  synopsis: string;
  entityCount?: number;
  edgeCount?: number;
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdated?: string;
  status?: 'active' | 'archived' | 'pending';
}

export type Case = CaseOverview;

export type InsightType = 'RELATIONSHIP' | 'TEMPORAL' | 'LOCATION' | 'NETWORK' | 'ACTIVITY';

export type InsightReviewStatus = 'not_reviewed' | 'under_review' | 'verified_lead' | 'dismissed' | 'false_positive';

export interface AIInvestigationInsight {
  id: string;
  caseId: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: InsightType;
  shortExplanation: string;
  whyThisInsight: string;
  entityId?: string;
  relatedEntityName?: string;
  relatedEntityIds: string[];
  relatedEdgeIds: string[];
  whyDetected: string[];
  supportingFactors: FactorScore[];
  confidence: number; // 0 - 100 percentage
  suggestedAction: string;
  evidenceReferences: SourceCitation[];
  reviewStatus: InsightReviewStatus;
  investigatorNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  dataQualityNotice?: string;
  priorityScoreBreakdown?: { factor: string; points: number }[];
  timelinePattern?: { label: string; periods: { date: string; count: number }[] };
  reviewed?: boolean;
}

export interface NetworkCluster {
  id: string;
  name: string;
  entityIds: string[];
  relationshipCount: number;
  whyItMatters: string;
  patternType: string;
  confidence: number;
}

export interface AnalysisProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed';
}

