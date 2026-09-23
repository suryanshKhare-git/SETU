import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Share2,
  ArrowRight,
  Shield,
} from 'lucide-react';

export const AnalysisProcessModal: React.FC = () => {
  const {
    isAnalysisModalOpen,
    setAnalysisModalOpen,
    analysisProgress,
    isAnalyzingNetwork,
    selectedCase,
    setActiveView,
  } = useApp();

  if (!isAnalysisModalOpen) return null;

  const completedSteps = analysisProgress.filter(s => s.status === 'completed').length;
  const progressPercent = Math.round((completedSteps / analysisProgress.length) * 100);

  const handleOpenGraph = () => {
    setAnalysisModalOpen(false);
    setActiveView('graph');
  };

  const handleOpenInsights = () => {
    setAnalysisModalOpen(false);
    setActiveView('insights');
  };

  return (
    <div
      onClick={() => {
        if (!isAnalyzingNetwork) setAnalysisModalOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-setu-surface border border-setu-border rounded-xl max-w-lg w-full shadow-2xl overflow-hidden font-sans text-setu-text"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-setu-border bg-setu-card/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-950/80 border border-teal-500/50 text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                Automated Network Intelligence Pipeline
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Knowledge Graph & Pattern Analysis
              </h2>
            </div>
          </div>
          {!isAnalyzingNetwork && (
            <button
              onClick={() => setAnalysisModalOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Case Info Banner */}
        <div className="px-5 py-2.5 bg-slate-900/80 border-b border-setu-border flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Active Docket:</span>
          <span className="text-white font-semibold">{selectedCase ? selectedCase.firNumber : 'DOCKET PENDING'}</span>
        </div>

        {/* Body Progress & Steps */}
        <div className="p-5 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                {isAnalyzingNetwork ? 'Executing Pipeline Analysis...' : 'Pipeline Execution Completed'}
              </span>
              <span className="text-teal-300 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-teal-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Sequential Steps List */}
          <div className="space-y-2.5 pt-2">
            {analysisProgress.map(step => (
              <div
                key={step.id}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                  step.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                    : step.status === 'active'
                    ? 'bg-teal-950/40 border-teal-500/70 text-white font-semibold shadow-sm'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : step.status === 'active' ? (
                      <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <span>{step.label}</span>
                </div>

                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {step.status === 'completed'
                    ? 'DONE'
                    : step.status === 'active'
                    ? 'PROCESSING'
                    : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Compliance notice */}
          <div className="p-2.5 rounded bg-slate-900/90 border border-setu-border flex items-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Deterministic Graph ML algorithm • Verifiable Section 65B audit log</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-setu-border bg-setu-card/70 flex items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400">
            {isAnalyzingNetwork ? 'Processing heuristics & graph metrics...' : 'Analysis complete!'}
          </div>

          <div className="flex items-center gap-2">
            {!isAnalyzingNetwork && (
              <>
                <button
                  onClick={handleOpenGraph}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-mono text-slate-200 hover:text-white transition flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Network Canvas</span>
                </button>
                <button
                  onClick={handleOpenInsights}
                  className="px-3.5 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Review Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
