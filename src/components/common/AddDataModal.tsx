import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  X,
  FileSpreadsheet,
  FileText,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const AddDataModal: React.FC = () => {
  const {
    isAddDataModalOpen,
    setAddDataModalOpen,
    loadSimulatedData,
    setActiveView,
    setWorkflowStep,
    selectedCase,
  } = useApp();

  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAddDataModalOpen) return null;

  const handleIngest = (type: string, title: string) => {
    setLoadingType(type);
    setTimeout(() => {
      loadSimulatedData(type);
      setLoadingType(null);
      setSuccessMessage(`Successfully parsed and normalized 1,420 records from ${title}. Entities linked to knowledge graph.`);
      setTimeout(() => {
        setSuccessMessage(null);
        setAddDataModalOpen(false);
        setWorkflowStep(3);
        setActiveView('graph');
      }, 1200);
    }, 600);
  };

  const sources = [
    {
      id: 'cdr',
      title: 'Telecom CDR / IPDR Records',
      agency: 'Department of Telecommunications / Airtel / Jio',
      format: 'CSV / Excel (50,000+ tower rows)',
      icon: <FileSpreadsheet className="w-5 h-5 text-teal-400" />,
      desc: 'Parses caller/callee IMEI, IMSI, call duration, cell tower azimuths, and colocation timestamps.',
    },
    {
      id: 'fir',
      title: 'CCTNS Crime Docket & Charge Sheet',
      agency: 'State Police Headquarters / NCR CCTNS',
      format: 'PDF / XML Legal Docket',
      icon: <FileText className="w-5 h-5 text-blue-400" />,
      desc: 'Extracts named co-accused, complainant, property seizure list, statutory IPC/BNS sections.',
    },
    {
      id: 'vahan',
      title: 'Vahan & FASTag Toll Passages',
      agency: 'Ministry of Road Transport / NHAI NETC',
      format: 'REST API / FASTag Lane Logs',
      icon: <Truck className="w-5 h-5 text-amber-400" />,
      desc: 'Resolves vehicle chassis, registered owner entity, electronic toll plaza timestamps, and ANPR images.',
    },
    {
      id: 'bank',
      title: 'Banking & Financial Ledger (STR / CTR)',
      agency: 'Reserve Bank of India / FIU-IND',
      format: 'ISO 20022 / Swift MT940 / CSV',
      icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
      desc: 'Correlates high-velocity RTGS deposits, hawala mule accounts, and PAN/Aadhaar signatory linkages.',
    },
  ];

  return (
    <div
      onClick={() => setAddDataModalOpen(false)}
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
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                STEP 2: RECORD INGESTION
              </div>
              <h2 className="text-base font-bold text-white">
                Add / Load Evidentiary Data
              </h2>
            </div>
          </div>

          <button
            onClick={() => setAddDataModalOpen(false)}
            className="p-1.5 rounded text-setu-textMuted hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="px-5 py-2.5 bg-slate-900/70 border-b border-setu-border flex items-center justify-between text-xs font-mono text-slate-400">
          <span>TARGET DOCKET: <strong className="text-teal-300">{selectedCase ? selectedCase.firNumber : 'NEW / UNASSIGNED'}</strong></span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            SHA-256 HASH VERIFIED
          </span>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border-b border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Sources */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Select a verified data connector to ingest and normalize records into the active entity resolution graph. Records are parsed, deduplicated, and mapped to suspect profiles automatically.
          </p>

          <div className="space-y-3 pt-2">
            {sources.map(s => {
              const isLoading = loadingType === s.id;

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-lg bg-setu-card border border-setu-border hover:border-teal-500/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded bg-slate-900/80 border border-slate-700/80 shrink-0 group-hover:border-teal-500/50 transition">
                      {s.icon}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                          {s.title}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-400">
                          {s.format}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {s.desc}
                      </p>
                      <div className="text-[10px] font-mono text-slate-500">
                        Authority: {s.agency}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isLoading || Boolean(loadingType)}
                    onClick={() => handleIngest(s.id, s.title)}
                    className="flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-md bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold font-mono transition shrink-0 shadow-sm"
                  >
                    {isLoading ? (
                      <span>Normalizing...</span>
                    ) : (
                      <>
                        <span>Load Sample</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-setu-border bg-setu-card/50 flex items-center justify-between text-xs text-setu-textMuted">
          <span className="font-mono text-[11px]">Notice: Demo dataset complies with Sec 65B IEA standards.</span>
          <button
            onClick={() => setAddDataModalOpen(false)}
            className="h-9 px-4 rounded-md bg-setu-card hover:bg-slate-800 border border-setu-border text-slate-200 text-xs font-medium transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
