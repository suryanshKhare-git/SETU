import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Shield,
  Layers,
  Activity,
  AlertTriangle,
  Scale,
} from 'lucide-react';

export const ScoringMethodologyModal: React.FC = () => {
  const { isMethodologyModalOpen, setMethodologyModalOpen } = useApp();

  if (!isMethodologyModalOpen) return null;

  return (
    <div
      onClick={() => setMethodologyModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-setu-surface border border-setu-border rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans text-setu-text max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-setu-border bg-setu-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-950/80 border border-teal-500/50 text-teal-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                Explainability & Algorithmic Governance
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Scoring Methodology & Decision-Support Principles
              </h2>
            </div>
          </div>
          <button
            onClick={() => setMethodologyModalOpen(false)}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close methodology modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* 1. Core Mission Statement */}
          <div className="p-3.5 rounded-lg bg-slate-900/90 border border-teal-500/30 flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-white font-mono uppercase text-[11px]">
                Transparent Decision-Support Architecture
              </h3>
              <p className="text-slate-300">
                SETU generates explainable graph correlations to assist law-enforcement detectives. Scores are calculated deterministically from primary records rather than opaque black-box neural predictions.
              </p>
            </div>
          </div>

          {/* 2. Four Multi-Factor Priority Components */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-white font-mono uppercase text-xs">
                Multi-Factor Priority Scoring Model (100 Points Max)
              </h3>
            </div>
            <p className="text-slate-400 text-xs">
              Entity priority indicates urgency for investigative inquiry, calculated as the sum of 4 weighted factors:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-900/70 border border-setu-border rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">1. Relationship Density</span>
                  <span className="text-teal-400 font-bold">Max 30 pts</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Evaluates degree centrality and the total count of direct links. Entities interacting with multiple distinct nodes receive proportional density weights.
                </p>
              </div>

              <div className="p-3 bg-slate-900/70 border border-setu-border rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">2. Cross-Modal Diversity</span>
                  <span className="text-teal-400 font-bold">Max 25 pts</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Rewards corroboration across independent channels: Telephony (CDR), Financial (Bank/Hawala), Transit (ANPR/Toll), and Official Registries (VAHAN/CCTNS). Single-source links receive lower priority.
                </p>
              </div>

              <div className="p-3 bg-slate-900/70 border border-setu-border rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">3. Temporal Incident Velocity</span>
                  <span className="text-teal-400 font-bold">Max 25 pts</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Evaluates activity concentration within the critical window (±2 hours of heist/interception). Burst communications and immediate spatial handoffs receive maximum temporal weight.
                </p>
              </div>

              <div className="p-3 bg-slate-900/70 border border-setu-border rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-white">4. Cross-Docket Association</span>
                  <span className="text-teal-400 font-bold">Max 20 pts</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Allocates points when an entity is cited across prior FIR dockets or identified as a common link between distinct state police syndicates.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Confidence vs Priority Distinction */}
          <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-lg border border-setu-border">
            <h3 className="font-bold text-teal-300 font-mono uppercase text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-400" />
              Critical Distinction: Confidence vs. Priority
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="font-mono font-bold text-white text-[11px] uppercase">Confidence (%)</span>
                <p className="text-slate-300 text-[11px]">
                  Statistical certainty that an observed relationship or pattern actually occurred, based on the volume, clarity, and forensic corroboration of primary exhibits.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-mono font-bold text-white text-[11px] uppercase">Priority (High/Med/Low)</span>
                <p className="text-slate-300 text-[11px]">
                  Urgency and operational importance of allocating detective resources to verify this entity or hypothesis during active case phases.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Responsible AI & Legal Safeguards */}
          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-500/40 space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-amber-300 font-bold font-mono uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Statutory Legal Safeguards & Responsible Terminology</span>
            </div>
            <ul className="space-y-1 text-slate-300 list-disc list-inside">
              <li>SETU never determines criminal intent, guilt, or legal liability.</li>
              <li>Entities are designated as "Entities of Interest" or "Correlated Nodes" rather than suspects.</li>
              <li>Human investigators retain sole legal responsibility for verifying findings under Section 65B of the Indian Evidence Act.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-setu-border bg-setu-card/70 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Compliant with Digital Personal Data Protection Act & Indian Criminal Procedure Codes
          </span>
          <button
            onClick={() => setMethodologyModalOpen(false)}
            className="px-4 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold font-mono transition shadow-sm"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
