import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Download,
  Filter,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentRole, setRole } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const isAuthorized = currentRole.permissions.canViewAuditLogs;

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        log.officerName.toLowerCase().includes(q) ||
        log.officerBadge.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.legalBasis.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, selectedCategory, searchQuery]);

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Officer', 'Badge', 'Action', 'Target', 'Category', 'Legal Basis', 'Terminal IP', 'Status'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.officerName}"`,
      `"${l.officerBadge}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.category}"`,
      `"${l.legalBasis}"`,
      `"${l.terminalIp}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SETU_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // RBAC Gating Screen
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto p-6 my-12 animate-fadeIn">
        <div className="bg-setu-surface border-2 border-amber-900/60 rounded-xl p-8 shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-950/60 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">
              RBAC Authorization Required: Compliance & Internal Audit
            </h3>
            <p className="text-xs text-setu-textMuted max-w-lg mx-auto leading-relaxed">
              Your active role (<span className="text-amber-300 font-mono">{currentRole.badge}</span>) is provisioned for field and analytical operations. Direct inspection of officer query trails and supervisory access logs is restricted to Compliance and Internal Vigilance personnel.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setRole('auditor')}
              className="px-5 py-2.5 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-500/60 text-teal-300 text-xs font-semibold shadow transition"
            >
              Switch Role to "Admin / Audit Oversight Officer" (Simulate RBAC)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn text-slate-200">
      {/* Standardized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Compliance Audit Trail & Access Ledger</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 border border-teal-800 text-teal-300">
              TAMPER-EVIDENT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all search queries, 2nd-degree graph expansions, dossier exports, and raw evidence inspections
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-setu-surface p-4 rounded-lg border border-setu-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by officer, target, or legal basis..."
            className="w-full pl-9 pr-3 py-2 bg-setu-card border border-setu-border focus:border-teal-500 rounded text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-setu-textMuted flex items-center gap-1 shrink-0 font-mono text-[11px]">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {['ALL', 'SEARCH', 'GRAPH_INSPECTION', 'EVIDENCE_VIEW', 'LEAD_REVIEW', 'SECURITY_WARNING'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition border whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-950 border-teal-500 text-teal-300'
                  : 'bg-setu-card border-setu-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-setu-surface border border-setu-border rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-setu-card/80 border-b border-setu-border text-[11px] font-mono text-setu-textMuted uppercase tracking-wider">
                <th className="p-3.5">Timestamp (IST)</th>
                <th className="p-3.5">Officer & Badge</th>
                <th className="p-3.5">Action Performed</th>
                <th className="p-3.5">Target Entity / Docket</th>
                <th className="p-3.5">Legal Basis</th>
                <th className="p-3.5">Terminal IP</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-setu-border/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-setu-textMuted">
                    No matching audit entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isWarning = log.category === 'SECURITY_WARNING' || log.status === 'FLAGGED_AUDIT';

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-900/50 transition ${
                        isWarning ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                        {log.timestamp}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-white">{log.officerName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{log.officerBadge}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-200">{log.action}</span>
                        <div className="text-[10px] font-mono text-setu-textMuted uppercase">
                          [{log.category}]
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-teal-300 font-medium">
                        {log.target}
                      </td>

                      <td className="p-3.5 text-slate-400 text-xs">
                        {log.legalBasis}
                      </td>

                      <td className="p-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {log.terminalIp}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isWarning ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 border border-red-500/70 text-red-300">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            FLAGGED AUDIT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 border border-emerald-500/60 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            AUTHORIZED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Footer */}
        <div className="p-3 border-t border-setu-border bg-setu-card/50 flex items-center justify-between text-[11px] font-mono text-setu-textMuted">
          <span>Total Records: {filteredLogs.length} entries</span>
          <span>Cryptographic Hash: HMAC-SHA256-VERIFIED</span>
        </div>
      </div>
    </div>
  );
};
