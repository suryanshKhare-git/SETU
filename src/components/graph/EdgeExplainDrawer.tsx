import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConnectionEdge, ReviewStatus } from '../../types';
import { ConfidenceMeter } from '../common/ConfidenceMeter';
import {
  X,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Pin,
  Network,
  Activity,
  Info,
  UserCheck,
  Compass,
} from 'lucide-react';

interface EdgeExplainDrawerProps {
  edge: ConnectionEdge;
  onClose: () => void;
}

export const EdgeExplainDrawer: React.FC<EdgeExplainDrawerProps> = ({ edge, onClose }) => {
  const {
    entities,
    updateEdgeReview,
    pinToWorkspace,
    inspectEvidenceByDocRef,
    highlightEvidenceInGraph,
    currentRole,
  } = useApp();

  const [reviewNote, setReviewNote] = useState<string>(edge.reviewNotes || '');
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);

  const sourceEntity = entities.find(e => e.id === edge.source);
  const targetEntity = entities.find(e => e.id === edge.target);

  const handleReviewAction = (status: ReviewStatus) => {
    updateEdgeReview(edge.id, status, reviewNote);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'verified_lead':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-emerald-950/80 border border-emerald-500/70 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            HUMAN VERIFIED LEAD
          </span>
        );
      case 'needs_evidence':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-amber-950/80 border border-amber-500/70 text-amber-300">
            <HelpCircle className="w-3.5 h-3.5" />
            NEEDS MORE EVIDENCE
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-900 border border-slate-700 text-slate-400">
            <XCircle className="w-3.5 h-3.5" />
            DISMISSED / INCONCLUSIVE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-900 border border-teal-800/60 text-teal-300">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            PENDING INVESTIGATOR REVIEW
          </span>
        );
    }
  };

  return (
    <div className="w-96 sm:w-[460px] bg-[#0B0F17] border-l border-slate-800 flex flex-col h-full shadow-2xl z-30 animate-slideLeft overflow-hidden text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-slate-800 border border-slate-700 text-teal-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Relationship Inspector
            </div>
            <h3 className="text-sm font-bold text-white truncate max-w-[280px]">
              {edge.label}
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

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Requirement 4: ENTITY A ↓ RELATIONSHIP ↓ ENTITY B Layout & Metrics */}
        <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-3 font-sans">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            <span>Verified Topology</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300 text-[10px]">
              {edge.connectionType.toUpperCase()}
            </span>
          </div>

          {/* Entity A */}
          <div className="flex items-start justify-between p-2.5 rounded-md bg-slate-900/90 border border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Origin</div>
              <div className="text-xs font-bold text-white mt-0.5">{sourceEntity?.name || edge.source}</div>
              <div className="text-[10px] font-mono text-teal-400">{sourceEntity?.primaryIdentifier}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {sourceEntity?.categoryLabel || 'Entity'}
            </span>
          </div>

          {/* Down Arrow & Relationship Label */}
          <div className="flex items-center justify-center gap-2 py-0.5 text-slate-500">
            <div className="h-px bg-slate-800 flex-1" />
            <div className="px-3 py-1 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-mono text-teal-300 font-semibold flex items-center gap-1.5 shadow-sm">
              <span>↓ {edge.label} ↓</span>
            </div>
            <div className="h-px bg-slate-800 flex-1" />
          </div>

          {/* Entity B */}
          <div className="flex items-start justify-between p-2.5 rounded-md bg-slate-900/90 border border-slate-800">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Destination</div>
              <div className="text-xs font-bold text-white mt-0.5">{targetEntity?.name || edge.target}</div>
              <div className="text-[10px] font-mono text-teal-400">{targetEntity?.primaryIdentifier}</div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {targetEntity?.categoryLabel || 'Entity'}
            </span>
          </div>

          {/* Relationship Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
            <div className="bg-slate-900/60 p-2 rounded-md border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Strength</span>
              <span className="text-teal-300 font-bold">{edge.confidenceBand} ({edge.confidenceRange})</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-md border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Evidence Count</span>
              <span className="text-white font-bold">{edge.sourceCitations.length} Source Document(s)</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-md border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">First Observed</span>
              <span className="text-slate-300">{edge.sourceCitations[0]?.timestamp || '2024-10-12 18:30 IST'}</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-md border border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Observed Records</span>
              <span className="text-slate-300">
                {edge.connectionType === 'telephony' ? '28 Calls & SMS' : edge.connectionType === 'spatial' ? '4 Tower / ANPR pings' : edge.connectionType === 'financial' ? '3 Layered Transfers' : 'Continuous Registration'}
              </span>
            </div>
          </div>

          {/* Canvas Highlight Trigger */}
          <button
            onClick={() =>
              highlightEvidenceInGraph(
                edge.sourceCitations[0]?.docRef || edge.id,
                [edge.source, edge.target],
                `Link: ${sourceEntity?.name || edge.source} ⟷ ${targetEntity?.name || edge.target}`
              )
            }
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-teal-300 hover:text-teal-200 transition"
          >
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Focus This Link Pair on Canvas</span>
          </button>
        </div>

        {/* Lead Classification & Disclaimer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-slate-400 uppercase">
              Evidentiary Classification
            </div>
            {getStatusBadge(edge.reviewStatus)}
          </div>

          <div className="p-2.5 rounded-md bg-teal-950/30 border border-teal-800/50 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-teal-200 text-xs">
                {edge.leadLabel}
              </div>
              <p className="text-[11px] text-teal-300/80 mt-0.5 leading-normal">
                Corroborated relationship pattern for investigative decision-support. Official judicial filing requires manual verification.
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase">
            Confidence & Weight Assessment
          </div>
          <ConfidenceMeter
            band={edge.confidenceBand}
            range={edge.confidenceRange}
            factors={edge.factorBreakdown}
            showDetails={true}
          />
        </div>

        {/* Plain Language AI Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            Investigative Rationale
          </div>
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans">
            {edge.plainLanguageExplanation}
          </div>
        </div>

        {/* Underlying Evidence Citations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Source Evidence ({edge.sourceCitations.length})
            </div>
            <span className="text-[10px] text-teal-400 font-mono">Click to inspect</span>
          </div>

          <div className="space-y-2">
            {edge.sourceCitations.map(cite => (
              <div
                key={cite.id}
                className="p-3 rounded-md bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition group cursor-pointer"
                onClick={() => inspectEvidenceByDocRef(cite.docRef)}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold">
                      {cite.recordType}
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:text-teal-300 transition">
                      {cite.title}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition" />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-mono bg-slate-950/80 p-2 rounded border border-slate-800 my-1.5 select-all">
                  "{cite.snippet}"
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Doc Ref: {cite.docRef}</span>
                  {cite.timestamp && <span>Recorded: {cite.timestamp}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Human Oversight Review & Verification Controls */}
        <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 font-mono uppercase tracking-wide">
              <UserCheck className="w-4 h-4 text-teal-400" />
              Investigator Verification
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              IO: {currentRole.badge}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-sans">
              Investigator Note / Verification Reference:
            </label>
            <textarea
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="Add investigator notes, verification references, or forensic test requests..."
              className="w-full h-18 p-2.5 rounded-md bg-slate-950 border border-slate-700 focus:border-teal-500 text-xs text-white placeholder-slate-600 focus:outline-none transition resize-none font-sans"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleReviewAction('verified_lead')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-emerald-950 hover:bg-emerald-900/80 border border-emerald-600 text-xs font-medium text-emerald-200 transition shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verify Lead
            </button>

            <button
              onClick={() => handleReviewAction('needs_evidence')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-amber-950 hover:bg-amber-900/80 border border-amber-600 text-xs font-medium text-amber-200 transition shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Needs More Proof
            </button>

            <button
              onClick={() => handleReviewAction('unreviewed')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Mark as Reviewed
            </button>

            <button
              onClick={() => handleReviewAction('dismissed')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              Dismiss Lead
            </button>
          </div>

          {saveFeedback && (
            <div className="text-center text-xs font-mono text-emerald-400 pt-1 animate-fadeIn">
              ✓ Evidentiary review status updated & logged in chain of custody.
            </div>
          )}

          {edge.reviewedBy && (
            <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Last reviewed by: {edge.reviewedBy}</span>
              <span>{edge.reviewedAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <button
          onClick={() =>
            pinToWorkspace({
              edgeId: edge.id,
              type: 'connection',
              title: edge.leadLabel,
              subtitle: `${sourceEntity?.name || edge.source} ⟷ ${targetEntity?.name || edge.target}`,
              column: edge.reviewStatus === 'verified_lead' ? 'verified' : 'active_leads',
              notes: edge.plainLanguageExplanation,
              tags: ['AI Lead', edge.confidenceBand],
              confidence: edge.confidenceRange,
            })
          }
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-400 hover:text-amber-300 transition"
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Pin to Workspace</span>
        </button>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
