import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkspaceCard } from '../../types';
import { ExportDossierModal } from './ExportDossierModal';
import {
  Plus,
  FileDown,
  Trash2,
  ExternalLink,
  StickyNote,
} from 'lucide-react';

export const CaseWorkspace: React.FC = () => {
  const {
    workspaceCards,
    updateWorkspaceCard,
    removeWorkspaceCard,
    pinToWorkspace,
    viewEntityProfile,
    selectEdge,
    setActiveView,
  } = useApp();

  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [showAddHypothesis, setShowAddHypothesis] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('Hypothesis');

  const columns: { id: WorkspaceCard['column']; title: string; subtitle: string; badgeColor: string }[] = [
    {
      id: 'assessment',
      title: 'Under Assessment',
      subtitle: 'Incoming entities & unverified tips',
      badgeColor: 'border-cyan-700/60 bg-cyan-950/40 text-cyan-300',
    },
    {
      id: 'active_leads',
      title: 'Active Investigative Leads',
      subtitle: 'Prioritized lines of operational inquiry',
      badgeColor: 'border-amber-700/60 bg-amber-950/40 text-amber-300',
    },
    {
      id: 'verified',
      title: 'Verified & Corroborated',
      subtitle: 'Evidentiary links confirmed by IO',
      badgeColor: 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300',
    },
    {
      id: 'ruled_out',
      title: 'Ruled Out / Inconclusive',
      subtitle: 'Dismissed or insufficient evidence',
      badgeColor: 'border-slate-700 bg-slate-900/60 text-slate-400',
    },
  ];

  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    pinToWorkspace({
      type: 'hypothesis',
      title: newTitle.trim(),
      subtitle: 'Investigator Working Theory',
      column: 'active_leads',
      notes: newNotes.trim() || 'Working hypothesis created during case conference.',
      tags: [newTag.trim() || 'Theory'],
      confidence: 'Working Theory',
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddHypothesis(false);
  };

  const handleMoveCard = (cardId: string, targetCol: WorkspaceCard['column']) => {
    updateWorkspaceCard(cardId, { column: targetCol });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn text-slate-200">
      {/* Standardized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Case Workspace & Pinboard</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {workspaceCards.length} Pinned Items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Organize pinned suspects, CDR linkages, and emerging theories across case development stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddHypothesis(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>Add Theory</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Dossier</span>
          </button>
        </div>
      </div>

      {/* Add Hypothesis Modal / Inline Form */}
      {showAddHypothesis && (
        <div className="p-4 rounded-lg bg-setu-card border border-teal-500/50 shadow-xl space-y-3 animate-slideDown">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
              <StickyNote className="w-4 h-4" />
              New Case Theory / Hypothesis Card
            </h4>
            <button
              onClick={() => setShowAddHypothesis(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateHypothesis} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] text-slate-400">Hypothesis Title:</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g., Staged diversion via Western Peripheral Toll..."
                className="w-full px-3 py-2 rounded bg-[#070B14] border border-setu-border text-xs text-white focus:outline-none focus:border-teal-500 font-medium"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Tag / Category:</label>
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="e.g., Logistics, Hawala"
                className="w-full px-3 py-2 rounded bg-[#070B14] border border-setu-border text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] text-slate-400">Investigator Rationale & Corroboration Needed:</label>
              <textarea
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="Detail the supporting indicators and what additional subpoenas/warrants are required..."
                className="w-full h-16 px-3 py-2 rounded bg-[#070B14] border border-setu-border text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-teal-950 border border-teal-500/70 text-teal-300 text-xs font-semibold hover:bg-teal-900 transition"
              >
                Save to Active Leads
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4-Column Pinboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map(col => {
          const cardsInCol = workspaceCards.filter(c => c.column === col.id);

          return (
            <div
              key={col.id}
              className="bg-setu-surface border border-setu-border rounded-lg flex flex-col min-h-[500px] shadow-sm"
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-setu-border bg-setu-card/50 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {col.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${col.badgeColor}`}>
                    {cardsInCol.length}
                  </span>
                </div>
                <p className="text-[11px] text-setu-textMuted">{col.subtitle}</p>
              </div>

              {/* Column Cards */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {cardsInCol.length === 0 ? (
                  <div className="p-6 text-center text-setu-textMuted text-xs italic border border-dashed border-setu-border/70 rounded-lg my-4">
                    No items in this stage
                  </div>
                ) : (
                  cardsInCol.map(card => (
                    <div
                      key={card.id}
                      className="bg-slate-900/85 hover:bg-slate-900 border border-setu-border hover:border-teal-500/50 rounded-lg p-3.5 space-y-2.5 transition shadow-sm group"
                    >
                      {/* Card Top */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {card.title}
                          </h4>
                          <div className="text-[10px] text-teal-400 font-mono">
                            {card.subtitle}
                          </div>
                        </div>

                        <button
                          onClick={() => removeWorkspaceCard(card.id)}
                          className="text-slate-600 hover:text-red-400 transition p-1"
                          title="Remove from board"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Card Notes */}
                      <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#070A12] p-2 rounded border border-slate-800">
                        {card.notes}
                      </p>

                      {/* Tags & Confidence */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {card.confidence && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-teal-950/80 border border-teal-800 text-teal-300">
                            {card.confidence}
                          </span>
                        )}
                        {card.tags.map(t => (
                          <span
                            key={t}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* Metadata & Quick Links */}
                      <div className="pt-2 border-t border-setu-border/60 flex items-center justify-between text-[10px] font-mono text-setu-textMuted">
                        <span>Pinned: {card.pinnedAt}</span>

                        {card.entityId && (
                          <button
                            onClick={() => viewEntityProfile(card.entityId!)}
                            className="text-teal-400 hover:text-teal-200 flex items-center gap-1"
                          >
                            Profile <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}

                        {card.edgeId && (
                          <button
                            onClick={() => {
                              selectEdge(card.edgeId!);
                              setActiveView('graph');
                            }}
                            className="text-teal-400 hover:text-teal-200 flex items-center gap-1"
                          >
                            Graph <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>

                      {/* Move Card Column Action Buttons */}
                      <div className="pt-1.5 flex items-center justify-end gap-1">
                        {col.id !== 'assessment' && (
                          <button
                            onClick={() => handleMoveCard(card.id, 'assessment')}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
                            title="Move to Assessment"
                          >
                            ← Assess
                          </button>
                        )}
                        {col.id !== 'active_leads' && (
                          <button
                            onClick={() => handleMoveCard(card.id, 'active_leads')}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-800/40 transition"
                            title="Move to Active Leads"
                          >
                            → Lead
                          </button>
                        )}
                        {col.id !== 'verified' && (
                          <button
                            onClick={() => handleMoveCard(card.id, 'verified')}
                            className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40 transition"
                            title="Move to Verified"
                          >
                            ✓ Verify
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Dossier Modal */}
      <ExportDossierModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
