import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Sparkles,
  ArrowRight,
  FolderOpen,
  CheckCircle2,
  User,
  Phone,
  Truck,
  CreditCard,
  MapPin,
  FileText,
  Building2,
  Shield,
} from 'lucide-react';

export const CaseManagementView: React.FC = () => {
  const {
    selectedCase,
    cases,
    selectCase,
    entities,
    edges,
    aiInsights,
    timeline,
    setActiveView,
    viewEntityProfile,
    selectEntity,
    selectEdge,
    runNetworkAnalysis,
    setCaseSelectModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'entities' | 'relationships' | 'activity'>('entities');

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'PERSON':
        return <User className="w-3.5 h-3.5 text-teal-400" />;
      case 'PHONE':
        return <Phone className="w-3.5 h-3.5 text-sky-400" />;
      case 'VEHICLE':
        return <Truck className="w-3.5 h-3.5 text-amber-400" />;
      case 'ACCOUNT':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-400" />;
      case 'LOCATION':
        return <MapPin className="w-3.5 h-3.5 text-rose-400" />;
      case 'COMPANY':
        return <Building2 className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  if (!selectedCase) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0B0F17] text-slate-100 font-sans">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-lg bg-[#111827] border border-slate-800">
          <div className="w-12 h-12 rounded-full bg-teal-950/80 border border-teal-800 text-teal-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">No Case Selected</h2>
            <p className="text-xs text-slate-400">
              Select an active case docket to view case details, entities, and relationship graphs.
            </p>
          </div>
          <button
            onClick={() => setCaseSelectModalOpen(true)}
            className="h-10 px-5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            Select Case Docket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0B0F17] text-slate-100 p-6 space-y-6 select-none font-sans">
      {/* Standardized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300 font-bold">
              {selectedCase.firNumber}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {selectedCase.policeStation}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              ACTIVE INVESTIGATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {selectedCase.title}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {selectedCase.synopsis}
          </p>
        </div>

        {/* ONE Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={runNetworkAnalysis}
            className="flex items-center gap-2 h-10 px-5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Analyze Network</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Core Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Entities in Docket</div>
          <div className="text-2xl font-bold font-mono text-white">{entities.length}</div>
          <div className="text-[11px] text-slate-500">People, phones, vehicles, accounts</div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Corroborated Relationships</div>
          <div className="text-2xl font-bold font-mono text-teal-400">{edges.length}</div>
          <div className="text-[11px] text-slate-500">Communications, transit, finance</div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Flagged Insights</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{aiInsights.length}</div>
          <div className="text-[11px] text-slate-500">Requiring investigator validation</div>
        </div>

        <div className="p-4 rounded-lg bg-[#111827] border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Jurisdiction & Scope</div>
          <div className="text-sm font-bold text-white truncate">{selectedCase.jurisdiction}</div>
          <div className="text-[11px] text-slate-500">State Special Operations Cell</div>
        </div>
      </div>

      {/* Key Findings Section */}
      <div className="p-5 rounded-lg bg-[#111827] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Key Corroborated Findings</span>
          </h2>
          <button
            onClick={() => setActiveView('insights')}
            className="text-xs text-teal-400 hover:underline font-medium cursor-pointer"
          >
            View All Insights ({aiInsights.length}) →
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {aiInsights.slice(0, 3).map(insight => (
            <div key={insight.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      insight.priority === 'HIGH'
                        ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                        : 'bg-teal-950/80 border-teal-800 text-teal-300'
                    }`}
                  >
                    {insight.priority} PRIORITY
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {insight.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
                  {insight.whyThisInsight || insight.shortExplanation}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveView('insights');
                }}
                className="h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 shrink-0 transition cursor-pointer"
              >
                Inspect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Data Exploration Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('entities')}
              className={`pb-2.5 text-xs font-semibold transition border-b-2 cursor-pointer ${
                activeTab === 'entities'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Entities ({entities.length})
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`pb-2.5 text-xs font-semibold transition border-b-2 cursor-pointer ${
                activeTab === 'relationships'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Relationships ({edges.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-2.5 text-xs font-semibold transition border-b-2 cursor-pointer ${
                activeTab === 'activity'
                  ? 'border-teal-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Chronological Activity ({timeline.length})
            </button>
          </div>

          <button
            onClick={() => setActiveView('graph')}
            className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium pb-2.5 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Open Network Canvas</span>
          </button>
        </div>

        {/* Tab 1: Clean Entities Table */}
        {activeTab === 'entities' && (
          <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1420] text-slate-400 border-b border-slate-800 text-[11px] font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Jurisdiction</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {entities.map(ent => (
                  <tr key={ent.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-2.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(ent.type)}
                        <span>{ent.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] font-mono text-slate-300">
                        {ent.categoryLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {ent.primaryIdentifier}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{ent.jurisdiction}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                          ent.riskLevel === 'HIGH' || ent.status === 'flagged'
                            ? 'bg-amber-950/60 border-amber-700 text-amber-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {ent.riskLevel || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            selectEntity(ent.id);
                            setActiveView('graph');
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                        >
                          Graph
                        </button>
                        <button
                          onClick={() => viewEntityProfile(ent.id)}
                          className="px-2 py-1 rounded bg-teal-950/80 hover:bg-teal-900 border border-teal-800 text-teal-300 text-xs transition cursor-pointer"
                        >
                          Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Clean Relationships Table */}
        {activeTab === 'relationships' && (
          <div className="bg-[#111827] border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1420] text-slate-400 border-b border-slate-800 text-[11px] font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Entity A</th>
                  <th className="py-3 px-4">Relationship</th>
                  <th className="py-3 px-4">Entity B</th>
                  <th className="py-3 px-4">Signal Band</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {edges.map(edge => {
                  const sourceEnt = entities.find(e => e.id === edge.source);
                  const targetEnt = entities.find(e => e.id === edge.target);

                  return (
                    <tr key={edge.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {sourceEnt?.name || edge.source}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-teal-300 text-[11px]">
                        {edge.label}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {targetEnt?.name || edge.target}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                        {edge.confidenceBand}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                            edge.reviewStatus === 'verified_lead'
                              ? 'bg-emerald-950 border-emerald-800 text-emerald-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {edge.reviewStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            selectEdge(edge.id);
                            setActiveView('graph');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                        >
                          Inspect on Graph
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Chronological Activity List */}
        {activeTab === 'activity' && (
          <div className="bg-[#111827] border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="divide-y divide-slate-800/60">
              {timeline.map(event => (
                <div key={event.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-teal-400 font-semibold">
                        {event.displayDate}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {event.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {event.title}
                    </div>
                    <p className="text-xs text-slate-400 max-w-3xl">
                      {event.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveView('timeline')}
                    className="h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 shrink-0 transition cursor-pointer"
                  >
                    View in Timeline
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Switch Case Repository Strip */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-slate-500" />
          <span>Registered Investigation Dockets:</span>
          {cases.map(c => (
            <button
              key={c.caseId}
              onClick={() => selectCase(c.caseId)}
              className={`px-2 py-0.5 rounded font-mono text-xs transition cursor-pointer border ${
                c.caseId === selectedCase.caseId
                  ? 'bg-teal-950 border-teal-700 text-teal-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.firNumber}
            </button>
          ))}
        </div>

        <span className="font-mono text-[11px] text-slate-500">
          Strict Section 65B IEA / 63 BSA Hash Verification Active
        </span>
      </div>
    </div>
  );
};
