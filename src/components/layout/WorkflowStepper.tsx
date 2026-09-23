import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderOpen,
  Upload,
  Share2,
  Compass,
  Sparkles,
  FileCheck,
  Check,
  ChevronRight,
} from 'lucide-react';

export const WorkflowStepper: React.FC = () => {
  const {
    workflowStep,
    setWorkflowStep,
    setActiveView,
    setCaseSelectModalOpen,
    setAddDataModalOpen,
    setReportModalOpen,
    selectedEntityId,
    selectEntity,
    entities,
    selectedCase,
    runNetworkAnalysis,
  } = useApp();

  const steps = [
    {
      stepNumber: 1,
      title: 'Select Case',
      desc: selectedCase ? selectedCase.firNumber : 'No case selected',
      icon: <FolderOpen className="w-3.5 h-3.5" />,
      onClick: () => {
        setCaseSelectModalOpen(true);
      },
    },
    {
      stepNumber: 2,
      title: 'Add / Load Data',
      desc: 'Ingest CDR / FIR',
      icon: <Upload className="w-3.5 h-3.5" />,
      onClick: () => {
        setAddDataModalOpen(true);
      },
    },
    {
      stepNumber: 3,
      title: 'Analyze Network',
      desc: 'Pipeline Execution',
      icon: <Share2 className="w-3.5 h-3.5" />,
      onClick: () => {
        runNetworkAnalysis();
      },
    },
    {
      stepNumber: 4,
      title: 'Explore Connections',
      desc: 'Nodes & Neighbors',
      icon: <Compass className="w-3.5 h-3.5" />,
      onClick: () => {
        setWorkflowStep(4);
        setActiveView('graph');
        if (!selectedEntityId && entities.length > 0) {
          selectEntity(entities[0].id);
        }
      },
    },
    {
      stepNumber: 5,
      title: 'Review Insights',
      desc: 'AI Explanations',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      onClick: () => {
        setWorkflowStep(5);
        setActiveView('insights');
      },
    },
    {
      stepNumber: 6,
      title: 'Generate Report',
      desc: 'Court-Ready Dossier',
      icon: <FileCheck className="w-3.5 h-3.5" />,
      onClick: () => {
        setWorkflowStep(6);
        setReportModalOpen(true);
      },
    },
  ];

  return (
    <div className="bg-setu-surface/95 border-b border-setu-border px-3 sm:px-6 py-2 no-print select-none shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto scrollbar-thin">
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-setu-border hidden lg:flex">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
            INVESTIGATION WORKFLOW
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-max">
          {steps.map((s, index) => {
            const isCompleted = workflowStep > s.stepNumber;
            const isCurrent = workflowStep === s.stepNumber;

            return (
              <React.Fragment key={s.stepNumber}>
                <button
                  onClick={s.onClick}
                  title={`Step ${s.stepNumber}: ${s.title}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs transition relative group ${
                    isCurrent
                      ? 'bg-teal-950/90 border-teal-500 text-teal-200 ring-1 ring-teal-500/40 shadow-sm font-semibold'
                      : isCompleted
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/70'
                      : 'bg-setu-bg/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-teal-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.stepNumber}
                  </span>

                  <div className="text-left flex flex-col">
                    <span className="leading-tight truncate text-[11px] sm:text-xs">
                      {s.title}
                    </span>
                    <span className="text-[9px] font-mono opacity-70 leading-tight hidden sm:block">
                      {s.desc}
                    </span>
                  </div>
                </button>

                {index < steps.length - 1 && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isCompleted ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0 pl-2">
          <span className="text-slate-500">Case:</span>
          <span className="text-white font-semibold">{selectedCase ? selectedCase.firNumber : 'No docket'}</span>
        </div>
      </div>
    </div>
  );
};
