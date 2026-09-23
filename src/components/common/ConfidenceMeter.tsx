import React from 'react';
import { SignalBand, FactorScore } from '../../types';
import { ShieldCheck, Info } from 'lucide-react';

interface ConfidenceMeterProps {
  band: SignalBand;
  range: string;
  factors?: FactorScore[];
  showDetails?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  band,
  range,
  factors = [],
  showDetails = true,
}) => {
  const getBadgeStyle = () => {
    switch (band) {
      case 'Strong Signal':
        return 'bg-teal-950/70 border-teal-500/60 text-teal-300';
      case 'Moderate Signal':
        return 'bg-amber-950/70 border-amber-500/60 text-amber-300';
      case 'Weak Signal':
        return 'bg-slate-900/80 border-slate-600 text-slate-300';
      case 'Direct Official Registry':
        return 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  const getBarColor = () => {
    switch (band) {
      case 'Strong Signal':
        return 'from-teal-600 to-teal-400';
      case 'Moderate Signal':
        return 'from-amber-600 to-amber-400';
      case 'Weak Signal':
        return 'from-slate-600 to-slate-400';
      case 'Direct Official Registry':
        return 'from-emerald-600 to-emerald-400';
      default:
        return 'from-teal-600 to-teal-400';
    }
  };

  // Determine an approximate width percentage for the meter bar
  const getWidthPercent = () => {
    if (band === 'Direct Official Registry') return '100%';
    if (band === 'Strong Signal') return '88%';
    if (band === 'Moderate Signal') return '68%';
    return '42%';
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${getBadgeStyle()}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{band}</span>
          </span>
          <span className="text-xs font-mono text-setu-textMuted">{range}</span>
        </div>
        <span className="text-[11px] text-setu-textMuted uppercase tracking-wider font-mono">
          Evidence Weight
        </span>
      </div>

      {/* Visual meter bar */}
      <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full bg-gradient-to-r ${getBarColor()} transition-all duration-500 rounded-full`}
          style={{ width: getWidthPercent() }}
        />
      </div>

      {/* Factor Breakdown if present */}
      {showDetails && factors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-setu-border/60 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-setu-textMuted font-medium">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-setu-accent" />
              Factor Contribution Matrix
            </span>
            <span className="text-[10px] font-mono">AI Model v3.2-Explain</span>
          </div>

          <div className="space-y-1.5">
            {factors.map((f, idx) => (
              <div key={idx} className="bg-slate-900/60 p-2 rounded border border-setu-border/50 text-xs">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="text-slate-300 font-sans">{f.factor}</span>
                  <span className="text-setu-accent font-semibold text-[11px]">
                    {f.score}/100 ({f.weight})
                  </span>
                </div>
                <p className="text-[11px] text-setu-textMuted leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
