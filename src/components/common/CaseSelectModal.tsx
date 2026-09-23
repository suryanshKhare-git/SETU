import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderOpen,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const CaseSelectModal: React.FC = () => {
  const {
    isCaseSelectModalOpen,
    setCaseSelectModalOpen,
    cases,
    selectedCase,
    selectCase,
    setActiveView,
    setWorkflowStep,
  } = useApp();

  if (!isCaseSelectModalOpen) return null;

  return (
    <div
      onClick={() => setCaseSelectModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-setu-surface border border-setu-borderLight rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-setu-text"
      >
        {/* Header */}
        <div className="p-4 border-b border-setu-border flex items-center justify-between bg-setu-card/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-teal-950/80 border border-teal-800 text-teal-300">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                INVESTIGATION REPOSITORY
              </div>
              <h2 className="text-base font-bold text-white">
                Select Active Case Docket
              </h2>
            </div>
          </div>

          <button
            onClick={() => setCaseSelectModalOpen(false)}
            className="p-1.5 rounded text-setu-textMuted hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-setu-border flex items-center justify-between text-xs font-mono text-slate-400">
          <span>SELECT A DOCKET TO LOAD ENTITY GRAPH & CORRELATIONS</span>
          <span className="text-teal-400 font-semibold">{cases.length} REGISTERED CASES</span>
        </div>

        {/* Case Cards List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cases.map(caseItem => {
            const isCurrent = selectedCase ? caseItem.caseId === selectedCase.caseId : false;

            return (
              <div
                key={caseItem.caseId}
                onClick={() => {
                  selectCase(caseItem.caseId);
                }}
                className={`p-4 rounded-lg border transition cursor-pointer relative group ${
                  isCurrent
                    ? 'bg-teal-950/40 border-teal-500/80 ring-1 ring-teal-500/30'
                    : 'bg-setu-card/70 border-setu-border hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 border border-slate-700 text-white">
                        {caseItem.firNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                          caseItem.riskLevel === 'HIGH'
                            ? 'bg-red-950/60 border-red-800/60 text-red-300'
                            : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                        }`}
                      >
                        {caseItem.riskLevel} PRIORITY
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition">
                      {caseItem.title}
                    </h3>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      selectCase(caseItem.caseId);
                      setWorkflowStep(3);
                      setActiveView('graph');
                    }}
                    className={`flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-semibold font-mono transition shrink-0 ${
                      isCurrent
                        ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-sm'
                        : 'bg-setu-card text-slate-200 hover:bg-slate-800 border border-setu-border'
                    }`}
                  >
                    <span>{isCurrent ? 'Open Graph' : 'Select Case'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {caseItem.synopsis}
                </p>

                <div className="pt-2.5 border-t border-setu-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-setu-textMuted">
                  <div className="flex items-center gap-3">
                    <span>
                      Entities:{' '}
                      <strong className="text-slate-200">
                        {caseItem.entityCount || 12}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Relationships:{' '}
                      <strong className="text-slate-200">
                        {caseItem.edgeCount || 16}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>{caseItem.policeStation}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{caseItem.lastUpdated || 'Active'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-setu-border bg-setu-card/50 flex items-center justify-between text-xs text-setu-textMuted">
          <span className="font-mono text-[11px]">Authorized investigative repository dockets.</span>
          <button
            onClick={() => setCaseSelectModalOpen(false)}
            className="h-9 px-4 rounded-md bg-setu-card hover:bg-slate-800 border border-setu-border text-slate-200 text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
