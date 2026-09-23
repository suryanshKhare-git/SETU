import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus Universal Search Bar from any screen' },
    { key: 'Esc', description: 'Close active drawer, modal, or dismiss search preview' },
    { key: 'Alt + 1', description: 'Jump to Universal Search view' },
    { key: 'Alt + 2', description: 'Jump to Network Graph view' },
    { key: 'Alt + 3', description: 'Jump to Chronological Timeline view' },
    { key: 'Alt + 4', description: 'Jump to Case Workspace Pinboard' },
    { key: 'Alt + 5', description: 'Jump to Entity Profile view' },
    { key: 'Alt + 6', description: 'Jump to Audit Log view (Admin/Compliance role)' },
    { key: '?', description: 'Open this Keyboard Shortcuts cheat-sheet' },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-setu-surface border border-setu-borderLight rounded-lg shadow-2xl max-w-lg w-full overflow-hidden text-setu-text"
      >
        <div className="px-6 py-4 border-b border-setu-border flex items-center justify-between bg-setu-card/60">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-setu-accent" />
            <h3 className="text-base font-semibold text-white">Keyboard Navigation & Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-setu-textMuted hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-setu-textMuted leading-relaxed">
            SETU is designed for high-pressure tactical environments with rapid keyboard command workflows.
          </p>

          <div className="divide-y divide-setu-border/60">
            {shortcuts.map((s, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-300">{s.description}</span>
                <kbd className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-teal-400 font-semibold text-[11px] shadow-sm">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-setu-border bg-setu-card/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
          >
            Dismiss (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
