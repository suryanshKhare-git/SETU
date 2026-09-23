import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, Award, Hash, Building2, Calendar } from 'lucide-react';

export const EvidenceSourceModal: React.FC = () => {
  const { inspectedRawRecord, closeEvidenceModal } = useApp();

  if (!inspectedRawRecord) return null;

  return (
    <div
      onClick={closeEvidenceModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-setu-surface border border-setu-borderLight rounded-lg shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden text-setu-text"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-setu-border flex items-center justify-between bg-setu-card/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-teal-950/60 border border-teal-500/40 text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-setu-accent">
                  {inspectedRawRecord.recordType} RECORD
                </span>
                <span className="text-xs font-mono text-setu-textMuted">
                  REF: {inspectedRawRecord.documentNumber}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                {inspectedRawRecord.title}
              </h3>
            </div>
          </div>
          <button
            onClick={closeEvidenceModal}
            className="p-1.5 rounded text-setu-textMuted hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Bar */}
        <div className="grid grid-cols-3 gap-2 px-6 py-2.5 bg-slate-900/60 border-b border-setu-border text-xs font-mono">
          <div className="flex items-center gap-1.5 text-setu-textMuted">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate">{inspectedRawRecord.issuingAuthority}</span>
          </div>
          <div className="flex items-center gap-1.5 text-setu-textMuted">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{inspectedRawRecord.timestamp}</span>
          </div>
          <div className="flex items-center gap-1.5 text-setu-textMuted justify-end">
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span>Jurisdiction: {inspectedRawRecord.jurisdiction}</span>
          </div>
        </div>

        {/* Admissibility Notice */}
        <div className="px-6 py-2.5 bg-emerald-950/20 border-b border-emerald-900/40 flex items-start gap-2.5">
          <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-medium text-emerald-300">Evidentiary Chain & Admissibility Note: </span>
            <span className="text-emerald-400/90">{inspectedRawRecord.legalAdmissibilityNote}</span>
          </div>
        </div>

        {/* Raw Text Content */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs bg-[#070A12] leading-relaxed">
          <pre className="whitespace-pre-wrap break-words text-slate-300 font-mono select-all">
            {inspectedRawRecord.rawText}
          </pre>
        </div>

        {/* Extracted Entities Footer */}
        <div className="px-6 py-3 border-t border-setu-border bg-setu-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-setu-textMuted">Extracted Entity Keys:</span>
            <div className="flex flex-wrap gap-1.5">
              {inspectedRawRecord.extractedEntities.map(ent => (
                <span
                  key={ent}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 border border-slate-700 text-teal-300"
                >
                  {ent}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={closeEvidenceModal}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
