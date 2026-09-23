import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Plus, FolderOpen } from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    setActiveView,
    selectedCase,
    cases,
    selectCase,
    setCaseSelectModalOpen,
    setAddDataModalOpen,
    loadDemoCase,
    entities,
    edges,
    aiInsights,
  } = useApp();

  return (
    <div className="casework-page flex-1 overflow-y-auto bg-[#0B0F17] text-slate-100 p-8 sm:p-12 select-none font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* A. HEADER */}
        <div className="space-y-1">
          <div className="eyebrow">Investigation control room</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Casework overview
          </h1>
          <p className="text-sm text-slate-400">
            {selectedCase
              ? 'Continue your investigation or select a case to begin.'
              : 'Choose an investigation docket below to begin.'}
          </p>
        </div>

        {/* B. COMPACT METRICS */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8 py-3 px-4 rounded-lg bg-[#0E1420] border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Cases:</span>
            <span className="font-mono font-semibold text-white">{cases.length}</span>
          </div>
          <div className="h-3 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Entities:</span>
            <span className="font-mono font-semibold text-white">{selectedCase ? entities.length : '—'}</span>
          </div>
          <div className="h-3 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Relationships:</span>
            <span className="font-mono font-semibold text-teal-400">{selectedCase ? edges.length : '—'}</span>
          </div>
          <div className="h-3 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Insights:</span>
            <span className="font-mono font-semibold text-amber-400">{selectedCase ? aiInsights.length : '—'}</span>
          </div>
        </div>

        {/* C. INVESTIGATION SECTION */}
        {selectedCase ? (
          <div className="p-6 rounded-lg bg-[#111827] border border-slate-800 space-y-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Current Investigation
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300">
                    {selectedCase.firNumber}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {selectedCase.title}
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  Entities: {entities.length} <span className="text-slate-600 mx-1">|</span> Relationships: {edges.length}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveView('cases')}
                  className="flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <span>Open Investigation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCaseSelectModalOpen(true)}
                  className="h-10 px-3.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
                  title="Switch to another docket"
                >
                  Switch
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-lg bg-[#111827] border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-teal-400 uppercase tracking-wider font-semibold">
                  SELECT INVESTIGATION
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  Choose a Case to Begin
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Select a case docket from the options below or choose from the dropdown.
                </p>
              </div>

              {/* Quick Case Selection Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  aria-label="Choose case docket"
                  defaultValue=""
                  onChange={e => {
                    if (e.target.value) {
                      selectCase(e.target.value);
                      setActiveView('cases');
                    }
                  }}
                  className="h-9 px-3 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="" disabled>
                    Choose case docket...
                  </option>
                  {cases.map(c => (
                    <option key={c.caseId} value={c.caseId}>
                      {c.firNumber} — {c.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setCaseSelectModalOpen(true)}
                  className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
                  title="Open Case Repository"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-teal-400" />
                  <span>Browse</span>
                </button>
              </div>
            </div>

            {/* Direct 1-Click Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {cases.map(c => (
                <div
                  key={c.caseId}
                  onClick={() => {
                    selectCase(c.caseId);
                    setActiveView('cases');
                  }}
                  className="p-4 rounded-md bg-[#0E1420] border border-slate-800 hover:border-teal-500/70 hover:bg-slate-800/60 transition cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-teal-300">
                        {c.firNumber}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        ACTIVE
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {c.synopsis}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-medium">
                    <span>Choose Case</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D. RECENT CASES */}
        <div className="space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Recent Cases
          </div>
          <div className="rounded-lg bg-[#111827] border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0E1420] text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-4 font-semibold">Case Name</th>
                  <th className="py-2.5 px-4 font-semibold">Case #</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map(c => {
                  const isCurrent = selectedCase ? c.caseId === selectedCase.caseId : false;
                  return (
                    <tr key={c.caseId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {c.title}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">{c.firNumber}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            selectCase(c.caseId);
                            setActiveView('cases');
                          }}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* E. QUICK ACTIONS */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAddDataModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>New Case</span>
          </button>
          <button
            onClick={() => setCaseSelectModalOpen(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Select Case</span>
          </button>
          <button
            onClick={loadDemoCase}
            className="h-9 px-3 rounded-md text-slate-500 hover:text-slate-400 hover:bg-slate-900 text-xs font-mono transition cursor-pointer ml-auto"
            title="Reset or load controlled demo dataset"
          >
            Load Demo Case
          </button>
        </div>
      </div>
    </div>
  );
};
