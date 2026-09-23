import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Entity, EntityType } from '../../types';
import {
  X,
  User,
  Phone,
  Truck,
  CreditCard,
  MapPin,
  FileText,
  Pin,
  ExternalLink,
  Shield,
  ArrowUpRight,
  Compass,
  AlertTriangle,
  Info,
  Building2,
} from 'lucide-react';
import { AIAnalysisService } from '../../services/aiAnalysisService';

interface NodeDetailsDrawerProps {
  entity: Entity;
  onClose: () => void;
}

export const NodeDetailsDrawer: React.FC<NodeDetailsDrawerProps> = ({ entity, onClose }) => {
  const {
    viewEntityProfile,
    pinToWorkspace,
    edges,
    entities,
    selectEdge,
    highlightNeighborsOf,
    inspectEvidenceByDocRef,
    rawRecords,
    selectedCase,
    setMethodologyModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'relationships' | 'evidence'>('overview');

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-4 h-4 text-cyan-400" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-teal-400" />;
      case 'vehicle':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'account':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-purple-400" />;
      case 'case':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'organization':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      default:
        return <Shield className="w-4 h-4 text-slate-400" />;
    }
  };

  // Find all connected edges and neighbor entities
  const connectedEdges = edges.filter(e => e.source === entity.id || e.target === entity.id);

  // Find related raw evidence records that cite this entity
  const relatedEvidence = rawRecords.filter(r => r.extractedEntities.includes(entity.id));

  // Multi-factor breakdown
  const breakdown = AIAnalysisService.calculatePriorityBreakdown(entity, edges);

  return (
    <div className="w-96 sm:w-[420px] bg-[#0B0F17] border-l border-slate-800 flex flex-col h-full shadow-2xl z-30 animate-slideLeft overflow-hidden text-slate-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-slate-800 border border-slate-700">
            {getEntityIcon(entity.type)}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Entity Inspector
            </div>
            <h3 className="text-sm font-bold text-white truncate max-w-[240px]">
              {entity.name}
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Requirement 14: Key Information Strip */}
      <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 bg-slate-950/70 text-center py-2 px-1">
        <div>
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Priority</span>
          <span className={`text-xs font-mono font-bold ${breakdown.totalScore >= 75 ? 'text-amber-400' : 'text-teal-400'}`}>
            {breakdown.totalScore >= 75 ? 'HIGH' : 'MEDIUM'} ({breakdown.totalScore})
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Connections</span>
          <span className="text-xs font-mono font-bold text-white">
            {connectedEdges.length} Links
          </span>
        </div>
        <div>
          <span className="text-[9px] font-mono uppercase text-slate-400 block">Case</span>
          <span className="text-xs font-mono font-bold text-slate-300 truncate block px-1">
            {selectedCase ? selectedCase.firNumber.split(' ')[0] : 'N/A'}
          </span>
        </div>
      </div>

      {/* Tab Navigation (Requirement 14: Collapsible/Tabbed sections) */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/40 text-xs px-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-teal-500 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('relationships')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'relationships'
              ? 'border-teal-500 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Relationships ({connectedEdges.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition ${
            activeTab === 'evidence'
              ? 'border-teal-500 text-teal-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Evidence ({relatedEvidence.length})
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Multi-Factor Priority Breakdown Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-300">
                    Priority Score Breakdown
                  </span>
                </div>
                <button
                  onClick={() => setMethodologyModalOpen(true)}
                  className="text-[10px] font-mono text-teal-400 hover:underline flex items-center gap-1"
                >
                  <Info className="w-3 h-3" />
                  Methodology
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Corroborated Score:</span>
                  <span className="font-bold text-teal-300">{breakdown.totalScore} / 100</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500"
                    style={{ width: `${breakdown.totalScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {breakdown.factors.map((f, idx) => (
                  <div key={idx} className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-300">{f.factor}</span>
                      <span className="text-teal-300 font-bold">+{f.points} pts</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal font-sans">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-mono text-amber-400/90 pt-1 flex items-start gap-1.5 border-t border-slate-800">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Decision-support scoring based on corroborated records. Does not determine guilt.</span>
              </div>
            </div>

            {/* Identifiers & Details */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[11px]">Type / Category:</span>
                <span className="font-semibold text-teal-300 font-mono text-[11px] px-2 py-0.5 rounded bg-teal-950 border border-teal-800">
                  {entity.categoryLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[11px]">Primary Identifier:</span>
                <span className="font-mono text-white font-medium">{entity.primaryIdentifier}</span>
              </div>

              {entity.aliases && entity.aliases.length > 0 && (
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px]">Aliases:</span>
                  <span className="text-slate-300 text-right font-mono text-[11px]">
                    {entity.aliases.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400 font-mono text-[11px]">Jurisdiction:</span>
                <span className="text-slate-300 text-[11px]">{entity.jurisdiction || 'NCR Territory'}</span>
              </div>
            </div>

            {/* Investigative Synopsis */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Investigative Synopsis
              </h4>
              <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs">
                {entity.summary}
              </p>
            </div>

            {/* Timestamps */}
            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between px-1">
              <span>First Sighted: {entity.firstSighted}</span>
              <span>Last Sighted: {entity.lastSighted}</span>
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[11px]">Connected Nodes ({connectedEdges.length})</span>
              <span className="text-[10px] text-teal-400 font-mono">Click to inspect link</span>
            </div>

            {connectedEdges.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No connections recorded for this node.</p>
            ) : (
              connectedEdges.map(edge => {
                const otherId = edge.source === entity.id ? edge.target : edge.source;
                const otherEntity = entities.find(e => e.id === otherId);

                return (
                  <button
                    key={edge.id}
                    onClick={() => selectEdge(edge.id)}
                    className="w-full text-left p-2.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between group"
                  >
                    <div className="space-y-0.5">
                      <div className="text-[11px] font-semibold text-slate-200 group-hover:text-teal-300 transition flex items-center gap-1.5">
                        <span>{otherEntity?.name || otherId}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          ({otherEntity?.categoryLabel})
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-400/90 font-mono">
                        {edge.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 group-hover:text-teal-400 transition">
                      <span className="text-[10px] font-mono">{edge.confidenceBand}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[11px]">Primary Source Records ({relatedEvidence.length})</span>
              <span className="text-[10px] text-teal-400 font-mono">Click to view source</span>
            </div>

            {relatedEvidence.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No primary evidence documents cite this entity directly.</p>
            ) : (
              relatedEvidence.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => inspectEvidenceByDocRef(rec.id)}
                  className="p-2.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold">
                      {rec.recordType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{rec.documentNumber}</span>
                  </div>
                  <div className="text-xs font-semibold text-white">{rec.title}</div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{rec.rawText}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Action Footer: ONE Clear Primary Action + Secondary Actions (Requirement 14) */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 flex flex-col gap-2">
        {/* ONE Clear Primary Action */}
        <button
          onClick={() => highlightNeighborsOf(entity.id)}
          className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition shadow-sm"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Highlight on Canvas</span>
        </button>

        {/* Secondary Supporting Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => viewEntityProfile(entity.id)}
            className="flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Full Profile</span>
          </button>

          <button
            onClick={() =>
              pinToWorkspace({
                entityId: entity.id,
                type: 'entity',
                title: entity.name,
                subtitle: entity.categoryLabel,
                column: 'active_leads',
                notes: entity.summary,
                tags: entity.tags,
                confidence: `Priority Score ${breakdown.totalScore}/100`,
              })
            }
            className="flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-medium transition"
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Pin to Case</span>
          </button>
        </div>
      </div>
    </div>
  );
};
