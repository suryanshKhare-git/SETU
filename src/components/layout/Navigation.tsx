import React from 'react';
import { useApp, AppView } from '../../context/AppContext';
import {
  Home,
  Search,
  Share2,
  Clock,
  LayoutGrid,
  UserCheck,
  ShieldAlert,
  Lock,
  Sparkles,
  FileCheck,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentRole,
    workspaceCards,
    edges,
    aiInsights,
    setReportModalOpen,
  } = useApp();

  const unreviewedLeadsCount = edges.filter(e => e.isAIGenerated && e.reviewStatus === 'unreviewed').length;

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: string | number; adminOnly?: boolean }[] = [
    {
      id: 'home',
      label: 'Overview',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'search',
      label: 'Universal Search',
      icon: <Search className="w-4 h-4" />,
    },
    {
      id: 'graph',
      label: 'Network Graph',
      icon: <Share2 className="w-4 h-4" />,
      badge: unreviewedLeadsCount > 0 ? `${unreviewedLeadsCount} Leads` : undefined,
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      badge: aiInsights.length > 0 ? `${aiInsights.length} Leads` : undefined,
    },
    {
      id: 'timeline',
      label: 'Timeline Analysis',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'workspace',
      label: 'Case Workspace',
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: workspaceCards.length > 0 ? workspaceCards.length : undefined,
    },
    {
      id: 'entity-profile',
      label: 'Entity Profile',
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      icon: <ShieldAlert className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  return (
    <nav className="bg-setu-bg border-b border-setu-border px-4 flex items-center justify-between overflow-x-auto no-print">
      <div className="flex items-center gap-1">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          const isRestricted = item.adminOnly && !currentRole.permissions.canViewAuditLogs;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition relative whitespace-nowrap ${
                isActive
                  ? 'border-teal-400 text-teal-300 bg-setu-surface/80 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>

              {/* Admin Lock indicator if restricted */}
              {item.adminOnly && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] px-1 py-0.2 rounded font-mono ${
                    isRestricted
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                      : 'bg-teal-950/60 text-teal-400 border border-teal-800/40'
                  }`}
                  title={isRestricted ? 'Requires Compliance / Admin Role' : 'Authorized'}
                >
                  <Lock className="w-2.5 h-2.5" />
                  ADMIN
                </span>
              )}

              {/* Badge for unreviewed leads or pinned workspace items */}
              {item.badge && !item.adminOnly && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 border border-amber-700/60 text-amber-300 font-semibold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-setu-textMuted py-2 pr-2">
        <button
          onClick={() => setReportModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-teal-950/80 hover:bg-teal-900 border border-teal-500/60 text-teal-300 text-xs font-semibold font-mono transition shadow-sm"
        >
          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Generate Report</span>
        </button>

        <div className="flex items-center gap-2 text-slate-500 pl-2 border-l border-setu-border">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span>HUMAN REVIEW MANDATORY</span>
        </div>
      </div>
    </nav>
  );
};
