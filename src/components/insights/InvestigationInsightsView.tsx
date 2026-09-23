import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InsightType,
  InsightReviewStatus,
} from '../../types';
import {
  Sparkles,
  Shield,
  AlertTriangle,
  ArrowRight,
  FileText,
  Phone,
  Truck,
  CreditCard,
  Pin,
  ExternalLink,
  Layers,
  HelpCircle,
  Clock,
  Search,
  Compass,
  UserCheck,
  RotateCcw,
  Info,
  Check,
} from 'lucide-react';

export const InvestigationInsightsView: React.FC = () => {
  const {
    aiInsights,
    clusters,
    selectedInsightId,
    selectEntity,
    setActiveView,
    inspectEvidenceByDocRef,
    pinToWorkspace,
    selectedCase,
    updateInsightReview,
    highlightInsightInGraph,
    highlightClusterInGraph,
    highlightEvidenceInGraph,
    setMethodologyModalOpen,
    entities,
  } = useApp();

  // Active Tab: 'insights' | 'clusters' | 'timeline'
  const [activeTab, setActiveTab] = useState<'insights' | 'clusters' | 'timeline'>('insights');

  // Filters
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Local state for editing notes per insight
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [savedNoteFeedback, setSavedNoteFeedback] = useState<string | null>(null);

  // Filtered insights calculation
  const filteredInsights = aiInsights.filter(ins => {
    if (filterPriority !== 'ALL' && ins.priority !== filterPriority) return false;
    if (filterType !== 'ALL' && ins.type !== filterType) return false;
    if (filterStatus !== 'ALL' && (ins.reviewStatus || 'not_reviewed') !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = ins.title.toLowerCase().includes(q);
      const matchExpl = ins.shortExplanation?.toLowerCase().includes(q) || false;
      const matchEntities = ins.relatedEntityIds?.some(id => id.toLowerCase().includes(q)) || false;
      const matchEvidence = ins.evidenceReferences?.some(e => e.docRef.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)) || false;
      if (!matchTitle && !matchExpl && !matchEntities && !matchEvidence) return false;
    }
    return true;
  });

  const reviewedCount = aiInsights.filter(
    ins => ins.reviewStatus && ins.reviewStatus !== 'not_reviewed'
  ).length;

  const handleSaveNote = (insightId: string, status: InsightReviewStatus) => {
    const note = notesState[insightId] ?? '';
    updateInsightReview(insightId, status, note);
    setSavedNoteFeedback(insightId);
    setTimeout(() => setSavedNoteFeedback(null), 2500);
  };

  const getTypeBadge = (type: InsightType) => {
    switch (type) {
      case 'RELATIONSHIP':
        return { label: 'Relationship Pattern', color: 'border-cyan-500/60 bg-cyan-950/70 text-cyan-300' };
      case 'LOCATION':
        return { label: 'Spatial / Toll Colocation', color: 'border-purple-500/60 bg-purple-950/70 text-purple-300' };
      case 'ACTIVITY':
        return { label: 'Anomalous Activity', color: 'border-amber-500/60 bg-amber-950/70 text-amber-300' };
      case 'TEMPORAL':
        return { label: 'Temporal Synchrony', color: 'border-blue-500/60 bg-blue-950/70 text-blue-300' };
      case 'NETWORK':
        return { label: 'Cluster Topology', color: 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300' };
      default:
        return { label: type, color: 'border-slate-500/60 bg-slate-900 text-slate-300' };
    }
  };

  const getStatusBadge = (status: InsightReviewStatus) => {
    switch (status) {
      case 'verified_lead':
        return { label: 'Verified Lead', color: 'bg-emerald-950/80 border-emerald-500 text-emerald-300' };
      case 'under_review':
        return { label: 'Under Review', color: 'bg-amber-950/80 border-amber-500 text-amber-300' };
      case 'dismissed':
        return { label: 'Dismissed', color: 'bg-slate-900 border-slate-700 text-slate-400' };
      case 'false_positive':
        return { label: 'False Positive', color: 'bg-rose-950/80 border-rose-700 text-rose-300' };
      default:
        return { label: 'Not Reviewed', color: 'bg-slate-900/90 border-slate-700 text-slate-400' };
    }
  };

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'CDR':
        return <Phone className="w-3.5 h-3.5 text-teal-400" />;
      case 'VAHAN':
        return <Truck className="w-3.5 h-3.5 text-amber-400" />;
      case 'BANK_LEDGER':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn select-none text-setu-text">
      {/* Header Banner */}
      {/* Standardized Page Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Investigation Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl font-sans">
            Corroborated relationship patterns and anomaly detections{selectedCase ? ` for ${selectedCase.title} (${selectedCase.firNumber})` : ''}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setMethodologyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
          >
            <Info className="w-4 h-4 text-teal-400" />
            <span>Scoring Methodology</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-setu-surface border border-setu-border rounded-lg">
          <span className="text-[10px] font-mono text-setu-textMuted uppercase block">Flagged Insights</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">{aiInsights.length}</span>
            <span className="text-[11px] font-mono text-teal-400">Active Patterns</span>
          </div>
        </div>

        <div className="p-3 bg-setu-surface border border-setu-border rounded-lg">
          <span className="text-[10px] font-mono text-setu-textMuted uppercase block">Priority Distribution</span>
          <div className="flex items-center gap-3 mt-1 text-xs font-mono">
            <span className="text-red-400 font-bold">
              {aiInsights.filter(i => i.priority === 'HIGH').length} High
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold">
              {aiInsights.filter(i => i.priority === 'MEDIUM').length} Medium
            </span>
          </div>
        </div>

        <div className="p-3 bg-setu-surface border border-setu-border rounded-lg">
          <span className="text-[10px] font-mono text-setu-textMuted uppercase block">Investigator Review Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">{reviewedCount} / {aiInsights.length}</span>
            <span className="text-[11px] font-mono text-slate-400">Reviewed</span>
          </div>
        </div>

        <div className="p-3 bg-setu-surface border border-setu-border rounded-lg">
          <span className="text-[10px] font-mono text-setu-textMuted uppercase block">Detected Operational Clusters</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">{clusters.length}</span>
            <span className="text-[11px] font-mono text-slate-400">Cells Mapped</span>
          </div>
        </div>
      </div>

      {/* Mandatory Statutory Compliance & Data Quality Warning */}
      <div className="p-3.5 bg-slate-900/90 border border-teal-500/40 rounded-lg flex items-start gap-3 text-xs">
        <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-white font-mono uppercase tracking-wider text-[11px] flex items-center justify-between">
            <span>Statutory Evidentiary Disclaimer & Quality Audit Notice</span>
            <span className="text-[10px] text-teal-400 font-mono normal-case">Telephony drift ±2m corroborated • Banking UTR verified</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            SETU is an investigative decision-support system. AI insights identify correlations and anomalous patterns in primary records; they do NOT assert culpability, criminal intent, or replace statutory police judgment. Every finding must be corroborated with primary source records prior to judicial filing.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-setu-border pb-2">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-md text-xs font-mono font-semibold transition flex items-center gap-2 border ${
            activeTab === 'insights'
              ? 'bg-teal-950 border-teal-500 text-teal-300 shadow-sm'
              : 'bg-setu-card border-setu-border text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All AI Insights ({aiInsights.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clusters')}
          className={`px-4 py-2 rounded-md text-xs font-mono font-semibold transition flex items-center gap-2 border ${
            activeTab === 'clusters'
              ? 'bg-teal-950 border-teal-500 text-teal-300 shadow-sm'
              : 'bg-setu-card border-setu-border text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Network Pattern Clusters ({clusters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-md text-xs font-mono font-semibold transition flex items-center gap-2 border ${
            activeTab === 'timeline'
              ? 'bg-teal-950 border-teal-500 text-teal-300 shadow-sm'
              : 'bg-setu-card border-setu-border text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Timeline Activity Patterns (3)</span>
        </button>
      </div>

      {/* ======================= TAB 1: ALL INSIGHTS ======================= */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-3 bg-setu-surface border border-setu-border rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search insights, entities, or doc references..."
                className="w-full pl-8 pr-3 h-8 bg-setu-card border border-setu-border focus:border-teal-500 rounded-md text-xs text-white placeholder-slate-400 focus:outline-none font-sans"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Priority Filter */}
              <div className="flex items-center gap-1 bg-setu-card px-2 h-8 rounded-md border border-setu-border">
                <span className="text-[10px] font-mono text-setu-textMuted uppercase">Priority:</span>
                <select
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value as any)}
                  className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-setu-surface">All Priorities</option>
                  <option value="HIGH" className="bg-setu-surface">High Priority</option>
                  <option value="MEDIUM" className="bg-setu-surface">Medium Priority</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 bg-setu-card px-2 h-8 rounded-md border border-setu-border">
                <span className="text-[10px] font-mono text-setu-textMuted uppercase">Type:</span>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-setu-surface">All Types</option>
                  <option value="RELATIONSHIP" className="bg-setu-surface">Relationship</option>
                  <option value="LOCATION" className="bg-setu-surface">Location / Colocation</option>
                  <option value="ACTIVITY" className="bg-setu-surface">Activity Anomaly</option>
                  <option value="TEMPORAL" className="bg-setu-surface">Temporal</option>
                  <option value="NETWORK" className="bg-setu-surface">Network Topology</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-setu-card px-2 h-8 rounded-md border border-setu-border">
                <span className="text-[10px] font-mono text-setu-textMuted uppercase">Review:</span>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-sans focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-setu-surface">All Review States</option>
                  <option value="not_reviewed" className="bg-setu-surface">Not Reviewed</option>
                  <option value="under_review" className="bg-setu-surface">Under Review</option>
                  <option value="verified_lead" className="bg-setu-surface">Verified Lead</option>
                  <option value="dismissed" className="bg-setu-surface">Dismissed</option>
                  <option value="false_positive" className="bg-setu-surface">False Positive</option>
                </select>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setFilterPriority('ALL');
                  setFilterType('ALL');
                  setFilterStatus('ALL');
                  setSearchQuery('');
                }}
                className="flex items-center gap-1 px-2.5 h-8 rounded-md bg-setu-card hover:bg-slate-800 border border-setu-border text-slate-400 hover:text-white text-xs font-mono transition"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* List of Filtered Insights */}
          <div className="space-y-5">
            {filteredInsights.length === 0 ? (
              <div className="p-8 text-center bg-setu-surface border border-setu-border rounded-lg space-y-2">
                <p className="text-sm text-slate-400 font-mono">No insights match the selected filter criteria.</p>
                <button
                  onClick={() => {
                    setFilterPriority('ALL');
                    setFilterType('ALL');
                    setFilterStatus('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs text-teal-400 hover:underline font-mono"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredInsights.map(insight => {
                const typeBadge = getTypeBadge(insight.type);
                const statusBadge = getStatusBadge(insight.reviewStatus || 'not_reviewed');
                const isSelected = selectedInsightId === insight.id;

                return (
                  <div
                    key={insight.id}
                    className={`bg-setu-surface border rounded-xl overflow-hidden shadow-lg transition-all duration-150 ${
                      isSelected ? 'border-teal-500 shadow-teal-950/40' : 'border-setu-border hover:border-teal-500/50'
                    }`}
                  >
                    {/* Insight Card Header */}
                    <div className="p-4 sm:p-5 border-b border-setu-border bg-setu-card/70 flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                              insight.priority === 'HIGH'
                                ? 'bg-red-950/70 border-red-800 text-red-300'
                                : 'bg-amber-950/70 border-amber-800 text-amber-300'
                            }`}
                          >
                            {insight.priority} PRIORITY
                          </span>

                          {/* Insight Type Badge */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${typeBadge.color}`}>
                            {typeBadge.label}
                          </span>

                          {/* Review Status Badge */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${statusBadge.color}`}>
                            {statusBadge.label}
                          </span>

                          <span className="text-[10px] font-mono text-slate-500">
                            ID: {insight.id}
                          </span>
                        </div>

                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {insight.title}
                        </h2>

                        {insight.shortExplanation && (
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {insight.shortExplanation}
                          </p>
                        )}
                      </div>

                      {/* Confidence vs Priority Explainer Pill */}
                      <div className="shrink-0 bg-slate-900/80 p-3 rounded-lg border border-setu-border space-y-1.5 min-w-[210px]">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400 uppercase">Statistical Confidence:</span>
                          <span className="font-bold text-teal-300">{insight.confidence}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full"
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 pt-0.5">
                          High confidence based on {insight.evidenceReferences.length} verified records
                        </div>
                      </div>
                    </div>

                    {/* Insight Card Body */}
                    <div className="p-5 space-y-5 text-xs">
                      {/* 1. WHY THIS INSIGHT? Factor Decomposition */}
                      <div className="space-y-2 bg-slate-950/60 p-4 rounded-lg border border-teal-500/20">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-teal-400" />
                            Why This Insight Was Identified
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            Algorithmic Factor Breakdown
                          </span>
                        </div>

                        {insight.whyThisInsight && (
                          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/80 p-3 rounded border border-slate-800">
                            {insight.whyThisInsight}
                          </p>
                        )}

                        {/* List of specific detections */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-mono uppercase text-slate-400">Observed Trigger Conditions:</span>
                          <ul className="space-y-1.5 text-slate-300 font-sans">
                            {insight.whyDetected.map((reason, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                                <span className="leading-relaxed">{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Supporting Feature Contribution Bars */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-2">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                            Corroborating Evidence Features:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {insight.supportingFactors.map((factor, i) => (
                              <div
                                key={i}
                                className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-1"
                              >
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className="text-slate-300 font-medium truncate">{factor.factor}</span>
                                  <span className="text-teal-400 font-bold">{factor.score}/100</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-teal-500 rounded-full"
                                    style={{ width: `${factor.score}%` }}
                                  />
                                </div>
                                <p className="text-[10px] text-slate-400 leading-snug font-sans line-clamp-2">
                                  {factor.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Priority Score Points Breakdown (if available) */}
                        {insight.priorityScoreBreakdown && (
                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-slate-400">Score Contributions:</span>
                            {insight.priorityScoreBreakdown.map((item, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300"
                              >
                                {item.factor}: <strong className="text-white">+{item.points} pts</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Correlated Entities & Graph Focus */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-teal-400" />
                            Correlated Entities ({insight.relatedEntityIds.length})
                          </h3>
                          <button
                            onClick={() => highlightInsightInGraph(insight.id)}
                            className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
                          >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Highlight All in Network Canvas</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {insight.relatedEntityIds.map(entId => {
                            const ent = entities.find(e => e.id === entId);
                            return (
                              <button
                                key={entId}
                                onClick={() => {
                                  selectEntity(entId);
                                  setActiveView('graph');
                                }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-setu-border hover:border-teal-500/60 transition group text-left"
                              >
                                <div className="w-6 h-6 rounded bg-teal-950 border border-teal-700/60 flex items-center justify-center text-[10px] font-bold text-teal-300">
                                  {ent?.type === 'person' ? 'P' : ent?.type === 'phone' ? 'SIM' : ent?.type === 'vehicle' ? 'VEH' : ent?.type === 'account' ? 'A/C' : 'LOC'}
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition">
                                    {ent?.name || entId}
                                  </div>
                                  <div className="text-[10px] font-mono text-slate-400">
                                    {ent?.categoryLabel || 'Entity'} • {ent?.primaryIdentifier || entId}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Supporting Evidence Exhibits */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-teal-400" />
                            Supporting Evidentiary Exhibits ({insight.evidenceReferences.length})
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            Direct primary source traceability
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {insight.evidenceReferences.map(ev => (
                            <div
                              key={ev.id}
                              className="p-3 rounded-lg bg-slate-900/80 border border-setu-border hover:border-teal-500/60 transition flex flex-col justify-between gap-2"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-300 font-semibold flex items-center gap-1">
                                      {getRecordIcon(ev.recordType)}
                                      <span>{ev.recordType}</span>
                                    </span>
                                    <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                                      {ev.title}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => inspectEvidenceByDocRef(ev.docRef)}
                                    className="text-[10px] font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1 shrink-0"
                                    title="View primary document"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Inspect</span>
                                  </button>
                                </div>

                                <p className="text-[11px] text-slate-300 font-mono bg-[#070A12] p-2 rounded border border-slate-800/80 select-all">
                                  "{ev.snippet}"
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                                <span>Ref: {ev.docRef}</span>
                                <button
                                  onClick={() =>
                                    highlightEvidenceInGraph(
                                      ev.docRef,
                                      insight.relatedEntityIds,
                                      `Evidence: ${ev.title}`
                                    )
                                  }
                                  className="text-teal-400 hover:underline flex items-center gap-1"
                                >
                                  <Compass className="w-3 h-3" />
                                  <span>Show in Graph</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Actionable Recommendation */}
                      <div className="p-3.5 rounded-lg bg-teal-950/40 border border-teal-800/60 flex items-start gap-3 text-xs">
                        <AlertTriangle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] uppercase font-bold text-teal-300">
                            Recommended Investigative Next Step
                          </span>
                          <p className="text-slate-200 leading-relaxed font-sans">
                            {insight.suggestedAction}
                          </p>
                        </div>
                      </div>

                      {/* 5. Human Investigator Review & Chain of Custody */}
                      <div className="p-4 rounded-lg bg-slate-900/90 border border-teal-500/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 font-mono uppercase tracking-wide">
                            <UserCheck className="w-4 h-4 text-teal-400" />
                            Investigator Review & Endorsement
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">
                              Status:
                            </span>
                            <select
                              value={insight.reviewStatus || 'not_reviewed'}
                              onChange={e =>
                                updateInsightReview(insight.id, e.target.value as InsightReviewStatus)
                              }
                              className="bg-setu-card border border-setu-border text-white text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-teal-500 cursor-pointer"
                            >
                              <option value="not_reviewed">Not Reviewed</option>
                              <option value="under_review">Under Review</option>
                              <option value="verified_lead">Verified Lead</option>
                              <option value="dismissed">Dismissed</option>
                              <option value="false_positive">False Positive</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] text-setu-textMuted font-sans">
                            Investigator Case Note & Action Plan:
                          </label>
                          <textarea
                            value={
                              notesState[insight.id] !== undefined
                                ? notesState[insight.id]
                                : insight.investigatorNote || ''
                            }
                            onChange={e =>
                              setNotesState(prev => ({
                                ...prev,
                                [insight.id]: e.target.value,
                              }))
                            }
                            placeholder="Document judicial verification steps, physical observation reports, or forensic seizure requests..."
                            className="w-full h-18 p-2.5 rounded bg-[#070B14] border border-setu-border focus:border-teal-500 text-xs text-white placeholder-slate-600 focus:outline-none transition resize-none font-sans"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                          <div className="text-[10px] font-mono text-slate-400">
                            {insight.reviewedBy && (
                              <span>
                                Reviewed by: {insight.reviewedBy} • {insight.reviewedAt}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {savedNoteFeedback === insight.id && (
                              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 animate-fadeIn">
                                <Check className="w-3.5 h-3.5" />
                                Saved to dossier
                              </span>
                            )}

                            <button
                              onClick={() =>
                                handleSaveNote(
                                  insight.id,
                                  insight.reviewStatus === 'not_reviewed'
                                    ? 'verified_lead'
                                    : insight.reviewStatus
                                )
                              }
                              className="px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white transition font-mono shadow-sm"
                            >
                              Save Note & Status
                            </button>

                            <button
                              onClick={() =>
                                pinToWorkspace({
                                  type: 'hypothesis',
                                  title: insight.title,
                                  subtitle: `${insight.priority} Priority AI Insight`,
                                  column:
                                    insight.reviewStatus === 'verified_lead'
                                      ? 'verified'
                                      : 'active_leads',
                                  notes:
                                    notesState[insight.id] ||
                                    insight.investigatorNote ||
                                    insight.suggestedAction,
                                  tags: [insight.type, `${insight.priority} Priority`],
                                  confidence: `${insight.confidence}% Confidence`,
                                })
                              }
                              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-400 hover:text-amber-300 transition font-mono flex items-center gap-1"
                            >
                              <Pin className="w-3.5 h-3.5" />
                              <span>Pin</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-4 border-t border-setu-border bg-setu-card/70 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-[11px] font-mono text-slate-400">
                        Section 65B Indian Evidence Act compliant data lineage preserved
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => highlightInsightInGraph(insight.id)}
                          className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold font-mono shadow-sm transition"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Inspect on Network Canvas</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================= TAB 2: NETWORK CLUSTERS ======================= */}
      {activeTab === 'clusters' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 bg-setu-surface border border-setu-border rounded-lg space-y-1">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Algorithmic Cluster & Operational Cell Detection
            </h2>
            <p className="text-xs text-slate-300">
              Clusters identify high-density operational sub-graphs where multiple entities exhibit synchronized communication bursts, shared transit coordinates, or rapid transactional layering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clusters.map(c => (
              <div
                key={c.id}
                className="bg-setu-surface border border-setu-border hover:border-amber-500/60 rounded-xl p-5 space-y-4 shadow-lg flex flex-col justify-between transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-amber-300 font-bold uppercase">
                      {c.patternType}
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-300">
                      {c.confidence}% Match
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {c.name}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded border border-slate-800">
                    {c.whyItMatters}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>MEMBER ENTITIES ({c.entityIds.length}):</span>
                      <span>{c.relationshipCount} DIRECT LINKS</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.entityIds.map(eId => {
                        const ent = entities.find(e => e.id === eId);
                        return (
                          <span
                            key={eId}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200"
                          >
                            {ent?.name || eId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-setu-border">
                  <button
                    onClick={() => highlightClusterInGraph(c.id)}
                    className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-semibold transition shadow-sm"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Focus Cluster on Network Canvas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================= TAB 3: TIMELINE ACTIVITY PATTERNS ======================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 bg-setu-surface border border-setu-border rounded-lg space-y-1">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Chronological & Synchronized Activity Bursts
            </h2>
            <p className="text-xs text-slate-300">
              Correlated temporal sequences pinpointing suspicious colocation windows, synchronized device handoffs, and transit speeds exceeding civilian baselines.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                id: 'pat-1',
                title: 'Pattern 1: NH-44 Toll Plaza Triangulation Window',
                window: '2024-10-12 23:30 IST - 2024-10-13 00:15 IST (45 mins)',
                entitiesInvolved: ['ent-person-1', 'ent-person-2', 'ent-vehicle-1', 'ent-vehicle-2'],
                evidenceRefs: ['VAHAN-UP-2024-88', 'CDR-98110-OCT12'],
                summary: 'Commercial truck (UP-16-BT-4421) and decoy escort (HR-26-DQ-8819) logged within 140 meters of Jewar Toll Plaza with simultaneous tower handoffs.',
              },
              {
                id: 'pat-2',
                title: 'Pattern 2: Coordinated SIM Deactivation Burst',
                window: '2024-10-13 00:22 IST - 00:35 IST (13 mins)',
                entitiesInvolved: ['ent-phone-1', 'ent-phone-2', 'ent-person-1'],
                evidenceRefs: ['CDR-98110-OCT12', 'FIR-2024-492-ORIGINAL'],
                summary: 'Both primary burner SIMs disconnected abruptly from Sector 20 BTS within 80 seconds of consignment distress call.',
              },
              {
                id: 'pat-3',
                title: 'Pattern 3: Rapid Hawala Mule Disbursement Window',
                window: '2024-10-13 02:15 IST - 04:00 IST (105 mins)',
                entitiesInvolved: ['ent-account-1', 'ent-person-1', 'ent-person-3'],
                evidenceRefs: ['BANK-HDFC-99120'],
                summary: 'Structured fund dispersion of ₹85 Lakh across 3 secondary accounts in Surat and Mumbai prior to bank business hours.',
              },
            ].map(p => (
              <div
                key={p.id}
                className="bg-setu-surface border border-setu-border rounded-xl p-5 space-y-3 shadow-md hover:border-teal-500/50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-setu-border/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.title}</h3>
                    <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{p.window}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveView('timeline')}
                      className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-teal-300 transition flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Open in Timeline View</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {p.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Entities Involved:</span>
                    {p.entitiesInvolved.map(eId => {
                      const ent = entities.find(e => e.id === eId);
                      return (
                        <span key={eId} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200">
                          {ent?.name || eId}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Evidence:</span>
                    {p.evidenceRefs.map(ref => (
                      <button
                        key={ref}
                        onClick={() => inspectEvidenceByDocRef(ref)}
                        className="text-teal-400 hover:underline"
                      >
                        {ref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
