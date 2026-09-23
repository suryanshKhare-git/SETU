import React from 'react';
import { BookOpenCheck, CheckCircle2, ExternalLink, HeartHandshake, ShieldAlert, Wrench } from 'lucide-react';
import { ConnectionEdge, Entity, RawSourceRecord } from '../../types';
import { buildBehavioralAnalysis, BehavioralFinding } from '../../services/behavioralAnalysisService';

interface BehavioralAnalysisProps {
  entity: Entity;
  connectedEdges: ConnectionEdge[];
  relatedRecords: RawSourceRecord[];
  onInspectEvidence: (recordId: string) => void;
}

const Finding: React.FC<{ finding: BehavioralFinding; onInspectEvidence: (recordId: string) => void }> = ({ finding, onInspectEvidence }) => (
  <div className="rounded-lg bg-slate-900/70 border border-setu-border p-3.5 space-y-2">
    <div className="text-xs font-semibold text-white">{finding.title}</div>
    <p className="text-xs text-slate-300 leading-relaxed">{finding.description}</p>
    <div className="flex items-center justify-between gap-2 pt-1 border-t border-setu-border/60">
      <span className="text-[10px] font-mono text-slate-400">Evidence: {finding.evidenceLabel}</span>
      {finding.evidenceRecordId && (
        <button
          onClick={() => onInspectEvidence(finding.evidenceRecordId!)}
          className="shrink-0 inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 transition"
        >
          View record <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

export const BehavioralAnalysis: React.FC<BehavioralAnalysisProps> = ({ entity, connectedEdges, relatedRecords, onInspectEvidence }) => {
  const analysis = buildBehavioralAnalysis(entity, connectedEdges, relatedRecords);

  return (
    <section className="bg-setu-surface border border-setu-border rounded-lg p-5 shadow-sm space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-setu-border">
        <div className="p-2 rounded bg-teal-950/70 border border-teal-500/50"><HeartHandshake className="w-4 h-4 text-teal-300" /></div>
        <div>
          <h3 className="text-sm font-bold text-white">Context &amp; Support Options</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">A simple view of what the available records may indicate and which support options may help. It does not determine why someone committed an offence or predict future behaviour.</p>
        </div>
      </div>

      {!analysis.hasDocumentedInformation ? (
        <div className="rounded-lg bg-slate-900/70 border border-setu-border p-4 flex items-start gap-2.5 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>There is not enough documented information to identify relevant circumstances or support options.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400"><ShieldAlert className="w-4 h-4" />What the records may indicate</div>
              {analysis.contributingFactors.length ? analysis.contributingFactors.map(finding => <Finding key={finding.title} finding={finding} onInspectEvidence={onInspectEvidence} />) : <p className="text-xs text-slate-400">No relevant circumstances are documented in this profile.</p>}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400"><CheckCircle2 className="w-4 h-4" />Existing strengths or supports</div>
              {analysis.protectiveFactors.length ? analysis.protectiveFactors.map(finding => <Finding key={finding.title} finding={finding} onInspectEvidence={onInspectEvidence} />) : <p className="text-xs text-slate-400">No existing strengths or supports are documented in this profile.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            <div className="rounded-lg bg-slate-900/70 border border-setu-border p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-3"><Wrench className="w-4 h-4" />Possible support needs</div>
              <div className="flex flex-wrap gap-2">{analysis.rehabilitationNeeds.map(need => <span key={need} className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] text-slate-300">{need}</span>)}</div>
            </div>
            <div className="rounded-lg bg-slate-900/70 border border-setu-border p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-3"><BookOpenCheck className="w-4 h-4" />Suggested next steps</div>
              <ul className="space-y-2">{analysis.recommendedInterventions.map(item => <li key={item} className="text-xs text-slate-300 leading-relaxed flex gap-2"><span className="text-teal-400">→</span><span>{item}</span></li>)}</ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
