import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Download, ShieldCheck, ExternalLink } from 'lucide-react';

interface LiveQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveQRCodeModal: React.FC<LiveQRCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use current live origin if not localhost, otherwise use default Render production URL
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const targetUrl = isLocalhost ? 'https://setu-crime-analysis.onrender.com' : window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none font-sans"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[#111827] border border-slate-800 rounded-lg shadow-2xl max-w-sm w-full overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0E1420]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-teal-950/80 border border-teal-800 text-teal-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Permanent Live QR Code
              </h2>
              <div className="text-[10px] font-mono text-teal-400">
                DIRECT ENCODED // NEVER EXPIRES
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4 bg-[#0B0F17]">
          <div className="p-3 bg-white rounded-lg shadow-inner border-2 border-slate-700">
            <img
              src="/setu_render_qr.png"
              alt="SETU Live Deployment QR Code"
              className="w-56 h-56 object-contain"
            />
          </div>

          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>NON-EXPIRING STATIC MATRIX (ISO/IEC 18004)</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs pt-1">
              Scan with any phone camera to access the live SETU deployment instantly. No account required.
            </p>
          </div>
        </div>

        {/* Link Details & Actions */}
        <div className="p-4 bg-[#0E1420] border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2 p-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono">
            <span className="truncate text-teal-300 select-all">{targetUrl}</span>
            <button
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition shrink-0"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="/setu_render_qr.png"
              download="SETU_Permanent_Live_QR.png"
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </a>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-8 px-3 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Link</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
