import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Entity, EntityType } from '../../types';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import { BehavioralAnalysis } from './BehavioralAnalysis';
import {
  User,
  Phone,
  Truck,
  CreditCard,
  MapPin,
  FileText,
  Share2,
  Clock,
  FileCheck,
  StickyNote,
  Pin,
  ExternalLink,
  Shield,
  Send,
  Building2,
  ChevronRight,
} from 'lucide-react';

export const EntityProfileView: React.FC = () => {
  const {
    entities,
    edges,
    timeline,
    rawRecords,
    activeProfileEntityId,
    viewEntityProfile,
    selectEdge,
    setActiveView,
    pinToWorkspace,
    inspectEvidenceByDocRef,
    currentRole,
    logAuditAction,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'connections' | 'timeline' | 'records' | 'notes'>('connections');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<{ id: string; author: string; timestamp: string; text: string }[]>([
    {
      id: 'note-1',
      author: 'Inspector S. Rawat (IO)',
      timestamp: '2024-10-13 14:30 IST',
      text: 'Subject Vikram Malhotra placed on active CDR tower surveillance under Section 94 BNSS. Tower Sector 18 and Sector 62 logs prioritized.',
    },
    {
      id: 'note-2',
      author: 'SI Ajay Malik',
      timestamp: '2024-10-14 09:15 IST',
      text: 'Informant reports Vicky seen driving black Scorpio earlier in the week. Corroborated with Neeraj Yadav vehicle registration records.',
    },
  ]);

  const activeEntity: Entity =
    entities.find(e => e.id === activeProfileEntityId) || entities[0];

  // 1st degree connections
  const connectedEdges = edges.filter(
    e => e.source === activeEntity.id || e.target === activeEntity.id
  );

  // Filtered timeline events
  const relatedTimelineEvents = timeline.filter(event =>
    event.entityIds.includes(activeEntity.id)
  );

  // Filtered raw source records
  const relatedRawRecords = rawRecords.filter(rec =>
    rec.extractedEntities.includes(activeEntity.id)
  );

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'person':
        return <User className="w-6 h-6 text-cyan-400" />;
      case 'phone':
        return <Phone className="w-6 h-6 text-teal-400" />;
      case 'vehicle':
        return <Truck className="w-6 h-6 text-amber-400" />;
      case 'account':
        return <CreditCard className="w-6 h-6 text-emerald-400" />;
      case 'location':
        return <MapPin className="w-6 h-6 text-purple-400" />;
      case 'case':
        return <FileText className="w-6 h-6 text-blue-400" />;
      case 'organization':
        return <Building2 className="w-6 h-6 text-indigo-400" />;
      default:
        return <Shield className="w-6 h-6 text-slate-400" />;
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      author: currentRole.badge,
      timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
      text: newNoteText.trim(),
    };

    setCustomNotes(prev => [newNote, ...prev]);
    setNewNoteText('');
    logAuditAction('Added Case Diary Note to Entity', `${activeEntity.name} (${activeEntity.id})`, 'LEAD_REVIEW');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn text-slate-200">
      {/* Standardized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Subject Dossier & Profile</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-300">
              {activeEntity.categoryLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consolidated intelligence record, telephony linkages, timeline entries, and case diary notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Switcher */}
          <select
            value={activeEntity.id}
            onChange={e => viewEntityProfile(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500 font-sans"
          >
            {entities.map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.categoryLabel})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              pinToWorkspace({
                entityId: activeEntity.id,
                type: 'entity',
                title: activeEntity.name,
                subtitle: activeEntity.categoryLabel,
                column: 'active_leads',
                notes: activeEntity.summary,
                tags: activeEntity.tags,
                confidence: 'Subject Profile',
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 text-xs font-medium transition"
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Pin</span>
          </button>

          <button
            onClick={() => setActiveView('graph')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>View on Graph</span>
          </button>
        </div>
      </div>

      {/* Top Summary Card (Who/What this entity is) */}
      <div className="bg-setu-surface border border-setu-border rounded-lg p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-xl bg-setu-card border border-setu-borderLight shrink-0 shadow-inner">
              {getEntityIcon(activeEntity.type)}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {activeEntity.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-teal-950/80 border border-teal-500/60 text-teal-300">
                  {activeEntity.categoryLabel}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300">
                  {activeEntity.primaryIdentifier}
                </span>
              </div>

              {activeEntity.aliases && (
                <div className="text-xs text-setu-textMuted flex items-center gap-2">
                  <span className="text-slate-500 font-mono">Aliases / Aliased Records:</span>
                  <span className="text-slate-200 font-mono font-medium">
                    {activeEntity.aliases.join(', ')}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-1">
                {activeEntity.summary}
              </p>
            </div>
          </div>

          {/* Sighting & Jurisdiction metadata */}
          <div className="shrink-0 bg-slate-900/80 p-3.5 rounded-lg border border-setu-border space-y-2 text-xs font-mono">
            <div className="text-[11px] text-setu-textMuted uppercase">Surveillance Window</div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div>First Seen: {activeEntity.firstSighted}</div>
              <div>Last Seen: {activeEntity.lastSighted}</div>
              <div className="text-teal-400">Jurisdiction: {activeEntity.jurisdiction}</div>
            </div>
          </div>
        </div>

        {/* Intelligence Signal / Risk Alert */}
        {activeEntity.riskIndicator && (
          <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-lg flex items-start gap-2.5 text-xs">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Intelligence Record Flag: </span>
              <span className="text-amber-200/90">{activeEntity.riskIndicator}</span>
            </div>
          </div>
        )}

        {/* Attribute Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-setu-border/60">
          <span className="text-xs text-setu-textMuted mr-1 font-mono">Mapped Attributes:</span>
          {Object.entries(activeEntity.metadata).map(([k, v]) => (
            <span
              key={k}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
            >
              <span className="text-slate-500 font-sans">{k}: </span>
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* 4 Tabs Header */}
      <div className="border-b border-setu-border flex items-center gap-1">
        {[
          { id: 'connections', label: `Connections (${connectedEdges.length})`, icon: <Share2 className="w-4 h-4" /> },
          { id: 'timeline', label: `Timeline (${relatedTimelineEvents.length})`, icon: <Clock className="w-4 h-4" /> },
          { id: 'records', label: `Source Records (${relatedRawRecords.length})`, icon: <FileCheck className="w-4 h-4" /> },
          { id: 'notes', label: `Case Notes (${customNotes.length})`, icon: <StickyNote className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-teal-400 text-teal-300 bg-setu-surface/70'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-setu-surface border border-setu-border rounded-lg p-5 shadow-sm">
        {/* TAB 1: CONNECTIONS */}
        {activeTab === 'connections' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-setu-textMuted">
              <span>All 1st-Degree Network Links for {activeEntity.name}</span>
              <span className="font-mono text-[11px]">Click link to inspect plain-language explainability</span>
            </div>

            {connectedEdges.length === 0 ? (
              <p className="text-xs text-setu-textMuted py-4 text-center">No connections recorded for this entity.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {connectedEdges.map(edge => {
                  const otherId = edge.source === activeEntity.id ? edge.target : edge.source;
                  const otherEntity = entities.find(e => e.id === otherId);

                  return (
                    <div
                      key={edge.id}
                      className="p-4 rounded-lg bg-slate-900/70 border border-setu-border hover:border-teal-500/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-teal-300 transition text-sm">
                            {otherEntity?.name || otherId}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 border border-slate-700 text-teal-300">
                            {otherEntity?.categoryLabel}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {otherEntity?.primaryIdentifier}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-amber-400 font-mono">
                          {edge.leadLabel}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {edge.plainLanguageExplanation}
                        </p>

                        <div className="pt-1">
                          <ConfidenceMeter
                            band={edge.confidenceBand}
                            range={edge.confidenceRange}
                            showDetails={false}
                          />
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-setu-border/50">
                        <button
                          onClick={() => {
                            selectEdge(edge.id);
                            setActiveView('graph');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-950/80 hover:bg-teal-900 border border-teal-500/60 text-xs font-medium text-teal-300 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Explain in Graph
                        </button>

                        {otherEntity && (
                          <button
                            onClick={() => viewEntityProfile(otherEntity.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-slate-200 transition"
                          >
                            Jump to Profile
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-setu-textMuted">
              <span>Chronological Event Trace</span>
              <span className="font-mono text-[11px]">{relatedTimelineEvents.length} events logged</span>
            </div>

            {relatedTimelineEvents.length === 0 ? (
              <p className="text-xs text-setu-textMuted py-4 text-center">No timeline events recorded directly involving this entity.</p>
            ) : (
              <div className="relative border-l-2 border-teal-500/40 ml-3 pl-6 space-y-6">
                {relatedTimelineEvents.map(evt => (
                  <div key={evt.id} className="relative group">
                    {/* Dot on timeline */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-teal-400 border-2 border-setu-bg shadow-sm" />

                    <div className="bg-slate-900/70 p-4 rounded-lg border border-setu-border space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-teal-400 font-semibold">
                          {evt.displayDate}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                          {evt.evidenceWeight}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white">
                        {evt.title}
                      </h4>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evt.summary}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-setu-textMuted border-t border-setu-border/50">
                        <span>Doc Ref: {evt.sourceDocRef}</span>
                        <button
                          onClick={() => inspectEvidenceByDocRef(evt.sourceDocRef)}
                          className="text-teal-400 hover:text-teal-300 flex items-center gap-1"
                        >
                          View Raw Record
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RECORDS */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-setu-textMuted">
              <span>Evidentiary Records Citing This Entity ({relatedRawRecords.length})</span>
              <span className="font-mono text-[11px]">Furnished with Sec 65B/63 BSA Certification</span>
            </div>

            {relatedRawRecords.length === 0 ? (
              <p className="text-xs text-setu-textMuted py-4 text-center">No source records directly mapped to this entity index.</p>
            ) : (
              <div className="space-y-3">
                {relatedRawRecords.map(rec => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-lg bg-slate-900/80 border border-setu-border hover:border-teal-500/60 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-teal-300 font-bold">
                          {rec.recordType}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {rec.title}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-setu-textMuted">{rec.timestamp}</span>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Authority: {rec.issuingAuthority} | Ref: {rec.documentNumber}
                    </div>

                    <div className="bg-[#080C14] p-3 rounded font-mono text-xs text-slate-300 leading-relaxed border border-slate-800 max-h-48 overflow-y-auto select-all">
                      <pre className="whitespace-pre-wrap">{rec.rawText}</pre>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-emerald-400 font-mono">
                        ✓ {rec.legalAdmissibilityNote}
                      </span>
                      <button
                        onClick={() => inspectEvidenceByDocRef(rec.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-teal-950/70 border border-teal-500/50 text-teal-300 text-xs font-medium hover:bg-teal-900 transition"
                      >
                        Inspect Certified Record
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-setu-textMuted">
              <span>Investigator Case Diary Notes & Evidentiary Annotations</span>
              <span className="font-mono text-[11px]">Strict Timestamped Audit Log</span>
            </div>

            {/* Add Note Input */}
            <form onSubmit={handleAddNote} className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-setu-border">
              <label className="text-xs font-medium text-slate-300">
                Add Officer Note to Entity Profile:
              </label>
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Type observations, interrogation leads, or judicial remand notes..."
                className="w-full h-20 p-2.5 rounded bg-[#070B14] border border-setu-border focus:border-teal-500 text-xs text-white placeholder-slate-600 focus:outline-none transition resize-none font-sans"
              />
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] font-mono text-slate-500">
                  Logged as: {currentRole.badge}
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-950 border border-teal-500/60 text-teal-300 text-xs font-medium hover:bg-teal-900 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Record Entry
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3">
              {customNotes.map(n => (
                <div key={n.id} className="p-3.5 rounded-lg bg-slate-900/70 border border-setu-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-teal-300 font-mono">{n.author}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {activeEntity.type === 'person' && (
        <BehavioralAnalysis
          entity={activeEntity}
          connectedEdges={connectedEdges}
          relatedRecords={relatedRawRecords}
          onInspectEvidence={inspectEvidenceByDocRef}
        />
      )}
    </div>
  );
};
