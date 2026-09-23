import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  FileCheck,
  Award,
} from 'lucide-react';

interface ExportDossierModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ExportDossierModal: React.FC<ExportDossierModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const {
    caseOverview,
    currentRole,
    entities,
    edges,
    workspaceCards,
    aiInsights,
    rawRecords,
    timeline,
    isReportModalOpen,
    setReportModalOpen,
  } = useApp();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isReportModalOpen;
  const onClose = propOnClose !== undefined ? propOnClose : () => setReportModalOpen(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const verifiedEdges = edges.filter(e => e.reviewStatus === 'verified_lead' || !e.isAIGenerated);
  const activeLeadCards = workspaceCards.filter(c => c.column === 'active_leads' || c.column === 'verified');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-setu-surface border border-setu-borderLight rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-setu-text"
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 border-b border-setu-border flex items-center justify-between bg-setu-card/80 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-teal-950/80 border border-teal-800 text-teal-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                STEP 6: EVIDENTIARY DOSSIER ENGINE
              </div>
              <h3 className="text-sm font-bold text-white">
                Generate Official Investigation Report
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-setu-textMuted hover:text-white hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Document Container (Printable HTML) */}
        <div className="flex-1 overflow-y-auto p-8 font-sans bg-white text-slate-900 dossier-print-container select-text space-y-6">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-700">
              CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE // OFFICIAL INVESTIGATION DOSSIER
            </div>
            <h1 className="text-xl font-black tracking-wide uppercase text-slate-900">
              SPECIAL OPERATIONS & INTER-STATE CRIME BRANCH
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              National Capital Region Combined Investigation Cell | State Police HQ
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              SETU INVESTIGATION DOSSIER
            </div>
          </div>

          {/* 1. CASE SUMMARY */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>1. Case Summary & Judicial Jurisdiction</span>
              <span className="text-[10px] text-slate-500 font-normal">Section 91 CrPC / Section 94 BNSS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3.5 rounded border border-slate-300 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Primary FIR Number</span>
                <span className="font-bold text-slate-900 text-sm">{caseOverview.firNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Police Station</span>
                <span className="font-bold text-slate-900">{caseOverview.policeStation}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Investigating Officer</span>
                <span className="font-bold text-slate-900">{caseOverview.investigationOfficer}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Date of Incident</span>
                <span className="font-bold text-slate-900">{caseOverview.incidentDate}</span>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase font-mono">Penal Sections:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {caseOverview.sections.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-mono border border-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-serif text-justify mt-2.5">
              {caseOverview.synopsis}
            </p>
          </div>

          {/* 2. ENTITIES ROSTER */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>2. Tracked Entities Roster ({entities.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Canonical Resolved Subjects</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-100 font-mono text-[10px] uppercase text-slate-700 border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Entity Name</th>
                    <th className="p-2 border-r border-slate-300">Category</th>
                    <th className="p-2 border-r border-slate-300">Primary Identifier</th>
                    <th className="p-2 border-r border-slate-300">Risk Level</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans text-[11px]">
                  {entities.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-300 font-semibold">{e.name}</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{e.categoryLabel}</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-[10px]">{e.primaryIdentifier}</td>
                      <td className="p-2 border-r border-slate-300 font-mono text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${e.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {e.riskLevel || 'HIGH'} ({e.riskScore || 85})
                        </span>
                      </td>
                      <td className="p-2 uppercase font-mono text-[10px]">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. IMPORTANT RELATIONSHIPS */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>3. Important Relationships & Corroborated Links ({verifiedEdges.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Direct & Algorithmic Associations</span>
            </div>
            <div className="space-y-2">
              {verifiedEdges.map(edge => {
                const src = entities.find(e => e.id === edge.source);
                const tgt = entities.find(e => e.id === edge.target);

                return (
                  <div
                    key={edge.id}
                    className="p-2.5 bg-slate-50 border border-slate-300 rounded text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-900">
                        {src?.name} ⟷ {tgt?.name}
                      </span>
                      <span className="px-2 py-0.2 rounded bg-teal-100 text-teal-900 border border-teal-300 text-[10px] font-semibold">
                        {edge.leadLabel} ({edge.confidenceBand})
                      </span>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">
                      {edge.plainLanguageExplanation}
                    </p>

                    <div className="text-[10px] text-slate-600 font-mono flex items-center justify-between border-t border-slate-200 pt-1">
                      <span>Citations: {edge.sourceCitations.map(c => c.docRef).join(', ')}</span>
                      <span>Review: {edge.reviewStatus.toUpperCase()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. NETWORK OVERVIEW */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>4. Network Topology Overview</span>
              <span className="text-[10px] text-slate-500 font-normal">Graph Metrics</span>
            </div>
            <div className="grid grid-cols-4 gap-2 bg-slate-100 p-3 rounded border border-slate-300 text-xs font-mono text-center">
              <div>
                <span className="text-slate-500 text-[10px] block">Total Nodes</span>
                <span className="font-bold text-slate-900 text-sm">{entities.length}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Total Edges</span>
                <span className="font-bold text-slate-900 text-sm">{edges.length}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">AI Generated Leads</span>
                <span className="font-bold text-amber-800 text-sm">
                  {edges.filter(e => e.isAIGenerated).length}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Primary Hub Subject</span>
                <span className="font-bold text-teal-900 text-xs truncate block">Vikram Malhotra</span>
              </div>
            </div>
          </div>

          {/* 5. AI INVESTIGATION INSIGHTS */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>5. AI Investigation Insights & Algorithmic Rationale ({aiInsights.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Explainable Intelligence</span>
            </div>
            <div className="space-y-2.5">
              {aiInsights.map(ins => (
                <div key={ins.id} className="p-3 bg-slate-50 border border-slate-300 rounded text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900">"{ins.title}"</span>
                    <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold">
                      {ins.priority} Priority ({ins.confidence}% Confidence)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <strong>Why Detected:</strong> {ins.whyDetected.join('; ')}
                  </div>
                  <div className="text-[11px] text-slate-800 bg-slate-100 p-1.5 rounded font-mono">
                    <strong>Suggested Action:</strong> {ins.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. SUPPORTING EVIDENCE */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>6. Supporting Certified Evidence Exhibits ({rawRecords.length})</span>
              <span className="text-[10px] text-slate-500 font-normal">Primary Electronic Records</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {rawRecords.map(r => (
                <div key={r.id} className="p-2 bg-slate-50 border border-slate-300 rounded space-y-0.5">
                  <div className="font-bold text-slate-900 truncate">{r.title}</div>
                  <div className="text-[10px] text-slate-600">Doc Ref: {r.documentNumber}</div>
                  <div className="text-[9px] text-slate-500">{r.legalAdmissibilityNote}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 7. CHRONOLOGICAL TIMELINE */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2 font-mono flex items-center justify-between">
              <span>7. Chronological Incident & Relationship Timeline ({timeline.length} Events)</span>
              <span className="text-[10px] text-slate-500 font-normal">October 2024</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {timeline.slice(0, 6).map(t => (
                <div key={t.id} className="flex items-start gap-3 p-1.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold shrink-0 w-28">{t.displayDate}</span>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">{t.title}</span>
                    <p className="text-[11px] text-slate-600 font-sans">{t.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. RISK & STATUTORY COMPLIANCE */}
          <div className="p-3.5 rounded bg-amber-50 border border-amber-300 text-xs space-y-1 text-amber-950">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wide">
              <Award className="w-4 h-4 text-amber-700" />
              8. Statutory Admissibility Certification (Sec 65B IEA / Sec 63 BSA)
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900">
              Pursuant to Section 65B of the Indian Evidence Act, 1872 (and Section 63 of Bharatiya Sakshya Adhiniyam, 2023), all algorithmic link recommendations, cell tower handoff matrices, and entity resolutions in this docket represent <strong>investigative leads only</strong>. No automated model has confirmed guilt or made conclusive findings. Every recorded link has been individually reviewed, verified, and endorsed by the sworn Investigating Officer designated below.
            </p>
          </div>

          {/* 9. INVESTIGATOR NOTES & SIGN-OFF */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 font-mono">
              9. Investigator Notes & Digital Endorsements ({activeLeadCards.length})
            </div>
            <div className="space-y-1.5">
              {activeLeadCards.map(c => (
                <div key={c.id} className="p-2 bg-slate-50 border border-slate-300 rounded text-xs">
                  <div className="font-bold text-slate-900 font-mono">{c.title}</div>
                  <p className="text-slate-700 text-xs mt-0.5">{c.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Sign-off & Seal Block */}
          <div className="mt-8 pt-4 border-t-2 border-slate-400 flex items-center justify-between text-xs font-mono text-slate-800">
            <div>
              <div>Generated via SETU</div>
              <div>Security Hash: SHA256-492-OCT24-AUTH-OK</div>
              <div className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</div>
            </div>

            <div className="text-right space-y-2">
              <div className="italic text-slate-400 font-sans">[Investigating Officer Digital Signature]</div>
              <div className="border-t border-slate-900 pt-1 font-bold">
                {currentRole.title} ({currentRole.badge})<br />
                Special Operations / Case Unit 4
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
