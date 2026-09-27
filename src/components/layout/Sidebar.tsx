import React from 'react';
import { useApp } from '../../context/AppContext';
import type { AppView } from '../../context/AppContext';
import {
  Shield,
  LayoutDashboard,
  Briefcase,
  Users,
  Network,
  Lightbulb,
  Clock,
  Pin,
  FileText,
  ShieldAlert,
  Keyboard,
  UserCheck,
  PanelLeftClose,
  PanelLeftOpen,
  HeartHandshake,
} from 'lucide-react';

interface SidebarProps {
  onOpenShortcuts: () => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenShortcuts,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const {
    activeView,
    setActiveView,
    selectedCase,
    setCaseSelectModalOpen,
    setReportModalOpen,
    currentRole,
    entities,
    viewEntityProfile,
  } = useApp();

  const navItems: {
    id: AppView | 'reports' | 'shortcuts' | 'rehabilitation';
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    onClick?: () => void;
  }[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'cases',
      label: 'Cases',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'search',
      label: 'Entities',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'rehabilitation',
      label: 'Rehabilitation',
      icon: <HeartHandshake className="w-4 h-4" />,
      onClick: () => {
        const firstPerson = entities.find(entity => entity.type === 'person');
        if (firstPerson) viewEntityProfile(firstPerson.id);
      },
    },
    {
      id: 'graph',
      label: 'Network Analysis',
      icon: <Network className="w-4 h-4" />,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <Lightbulb className="w-4 h-4" />,
    },
    {
      id: 'location-intelligence',
      label: 'Location Intelligence',
      icon: <Pin className="w-4 h-4" />,
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'workspace',
      label: 'Pinboard',
      icon: <Pin className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => setReportModalOpen(true),
    },
    {
      id: 'audit-log',
      label: 'Settings / Audit',
      icon: <ShieldAlert className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: 'shortcuts',
      label: 'Help',
      icon: <Keyboard className="w-4 h-4" />,
      onClick: onOpenShortcuts,
    },
  ];

  return (
    <aside className={`casework-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobileOpen ? 'is-mobile-open' : ''} w-60 shrink-0 bg-[#0B0F17] border-r border-slate-800/80 flex flex-col h-screen select-none no-print`}>
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <button
          onClick={() => setActiveView('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-md bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-400 group-hover:border-teal-400 transition">
            <Shield className="w-4 h-4 text-teal-400" />
          </div>
          <span className="text-base font-bold tracking-wider text-white font-sans">
            SETU<span className="brand-unit"> / CASEWORK</span>
          </span>
        </button>

        <button
          onClick={onToggleCollapse}
          className="sidebar-collapse-toggle"
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Current Investigation Docket Widget */}
      <div className="p-3 border-b border-slate-800/80 bg-[#0E1420]/80">
        <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                selectedCase ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            {selectedCase ? 'Active Case' : 'No Active Case'}
          </span>

          <button
            onClick={() => setCaseSelectModalOpen(true)}
            className="text-teal-400 hover:text-teal-300 transition text-[10px] underline font-sans cursor-pointer"
          >
            {selectedCase ? 'Switch' : 'Select'}
          </button>
        </div>

        {selectedCase ? (
          <div
            onClick={() => setActiveView('cases')}
            className="p-2 rounded-md bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition cursor-pointer group"
            title="Click to view full case overview"
          >
            <div className="text-xs font-semibold text-white group-hover:text-teal-300 transition truncate">
              {selectedCase.firNumber}
            </div>

            <div className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
              {selectedCase.title}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCaseSelectModalOpen(true)}
            className="w-full p-2 text-left rounded-md bg-slate-900/50 border border-dashed border-slate-800 hover:border-slate-700 transition text-[11px] text-slate-400 hover:text-slate-300 cursor-pointer truncate"
          >
            Select a docket to begin...
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => {
          if (item.adminOnly && !currentRole.permissions.canViewAuditLogs) {
            return null;
          }

          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveView(item.id as AppView);
                }

                onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <span
                className={
                  isActive ? 'text-teal-400' : 'text-slate-500'
                }
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Officer & Role Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0E1420]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 truncate">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>

          <div className="truncate">
            <div className="text-white text-[11px] font-semibold truncate leading-tight">
              {currentRole.title}
            </div>

            <div className="text-[10px] text-slate-400 truncate leading-tight font-mono">
              {currentRole.badge}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};