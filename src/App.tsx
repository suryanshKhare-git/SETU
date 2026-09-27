import React, { useEffect, useState } from 'react';

import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { HomePage } from './components/home/HomePage';
import { CaseManagementView } from './components/cases/CaseManagementView';
import { UniversalSearch } from './components/search/UniversalSearch';
import { NetworkGraphView } from './components/graph/NetworkGraphView';
import { InvestigationInsightsView } from './components/insights/InvestigationInsightsView';
import { EntityProfileView } from './components/entity/EntityProfileView';
import { TimelineView } from './components/timeline/TimelineView';
import { CaseWorkspace } from './components/workspace/CaseWorkspace';
import { AuditLogView } from './components/audit/AuditLogView';

/* =========================================================
   LOCATION INTELLIGENCE
   ========================================================= */

import { LocationIntelligenceView } from './components/location/LocationIntelligenceView';

import { EvidenceSourceModal } from './components/common/EvidenceSourceModal';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { CaseSelectModal } from './components/common/CaseSelectModal';
import { AddDataModal } from './components/common/AddDataModal';
import { ExportDossierModal } from './components/workspace/ExportDossierModal';
import { AnalysisProcessModal } from './components/common/AnalysisProcessModal';
import { ScoringMethodologyModal } from './components/common/ScoringMethodologyModal';

import { Login } from './components/Login';
import { Register } from './components/Register';

/* =========================================================
   AUTHENTICATION SCREEN
   ========================================================= */

const AuthenticationScreen: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

  /*
   * Login.tsx expects:
   * onRegister
   */

  if (!showRegister) {
    return (
      <Login
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  /*
   * Register.tsx expects:
   * onLogin
   */

  return (
    <Register
      onLogin={() => setShowRegister(false)}
    />
  );
};

/* =========================================================
   AUTH GATE
   ========================================================= */

const AuthGate: React.FC = () => {
  const { investigator } = useAuth();

  /*
   * No authenticated investigator
   * → Login / Register
   *
   * Authenticated investigator
   * → Main application
   */

  if (!investigator) {
    return <AuthenticationScreen />;
  }

  return <MainContent />;
};

/* =========================================================
   MAIN CONTENT
   ========================================================= */

const MainContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectEntity,
    selectEdge,
    closeEvidenceModal,
    setCaseSelectModalOpen,
    setAddDataModalOpen,
    setReportModalOpen,
    setMethodologyModalOpen,
    setAnalysisModalOpen,
    isPresentationMode,
    selectedCase,
  } = useApp();

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  /* =======================================================
     GLOBAL KEYBOARD SHORTCUTS
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      const targetTag =
        target?.tagName?.toLowerCase();

      const isInput =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        target?.isContentEditable;

      /* ---------------------------------------------------
         ESCAPE
      --------------------------------------------------- */

      if (e.key === 'Escape') {
        selectEntity(null);
        selectEdge(null);

        closeEvidenceModal();

        setCaseSelectModalOpen(false);
        setAddDataModalOpen(false);
        setReportModalOpen(false);
        setMethodologyModalOpen(false);
        setAnalysisModalOpen(false);

        setShortcutsOpen(false);

        return;
      }

      /* ---------------------------------------------------
         QUESTION MARK
      --------------------------------------------------- */

      if (e.key === '?' && !isInput) {
        e.preventDefault();

        setShortcutsOpen(prev => !prev);

        return;
      }

      /* ---------------------------------------------------
         SLASH SEARCH
      --------------------------------------------------- */

      if (e.key === '/' && !isInput) {
        e.preventDefault();

        setActiveView('search');

        return;
      }

      /* ---------------------------------------------------
         ALT NAVIGATION
      --------------------------------------------------- */

      if (e.altKey) {
        const key = e.key.toLowerCase();

        if (key === '0' || key === 'h') {
          e.preventDefault();
          setActiveView('home');
        }

        else if (key === '1') {
          e.preventDefault();
          setActiveView('cases');
        }

        else if (key === '2') {
          e.preventDefault();
          setActiveView('search');
        }

        else if (key === '3') {
          e.preventDefault();
          setActiveView('graph');
        }

        else if (key === '4') {
          e.preventDefault();
          setActiveView('timeline');
        }

        else if (key === '5') {
          e.preventDefault();
          setActiveView('workspace');
        }

        else if (key === '6') {
          e.preventDefault();
          setActiveView('audit-log');
        }
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    selectEntity,
    selectEdge,
    closeEvidenceModal,
    setActiveView,
    setCaseSelectModalOpen,
    setAddDataModalOpen,
    setReportModalOpen,
    setMethodologyModalOpen,
    setAnalysisModalOpen,
  ]);

  /* =======================================================
     MAIN APPLICATION UI
     ======================================================= */

  return (
    <div
      className={`casework-shell ${
        isPresentationMode
          ? 'presentation-mode'
          : ''
      } h-screen flex overflow-hidden bg-[#0B0F17] text-slate-100 font-sans`}
    >

      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}

      <Sidebar
        onOpenShortcuts={() =>
          setShortcutsOpen(true)
        }
        isCollapsed={sidebarCollapsed}
        isMobileOpen={mobileNavOpen}
        onToggleCollapse={() =>
          setSidebarCollapsed(
            previous => !previous
          )
        }
        onCloseMobile={() =>
          setMobileNavOpen(false)
        }
      />

      {mobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-nav-scrim"
          onClick={() =>
            setMobileNavOpen(false)
          }
        />
      )}

      {/* =================================================
          MAIN WORKSPACE
      ================================================= */}

      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
          h-screen
          overflow-hidden
        "
      >

        {/* HEADER */}

        <Header
          onOpenSidebar={() =>
            setMobileNavOpen(true)
          }
        />

        {isPresentationMode && (
          <div className="presentation-briefing-bar no-print">
            <span className="presentation-live-dot" />

            <span className="presentation-case-label">
              Live case briefing
            </span>

            <span className="presentation-case-name">
              {selectedCase
                ? `${selectedCase.firNumber} · ${selectedCase.title}`
                : 'No investigation selected'}
            </span>
          </div>
        )}

        {/* =================================================
            DYNAMIC VIEW
        ================================================= */}

        <main
          className="
            flex-1
            flex
            flex-col
            min-w-0
            overflow-y-auto
          "
        >

          {/* HOME */}

          {activeView === 'home' && (
            <HomePage />
          )}

          {/* CASES */}

          {activeView === 'cases' && (
            <CaseManagementView />
          )}

          {/* SEARCH */}

          {activeView === 'search' && (
            <UniversalSearch />
          )}

          {/* GRAPH */}

          {activeView === 'graph' && (
            <NetworkGraphView />
          )}

          {/* INSIGHTS */}

          {activeView === 'insights' && (
            <InvestigationInsightsView />
          )}

          {/* TIMELINE */}

          {activeView === 'timeline' && (
            <TimelineView />
          )}

          {/* WORKSPACE */}

          {activeView === 'workspace' && (
            <CaseWorkspace />
          )}

          {/* ENTITY PROFILE */}

          {activeView === 'entity-profile' && (
            <EntityProfileView />
          )}

          {/* AUDIT LOG */}

          {activeView === 'audit-log' && (
            <AuditLogView />
          )}

          {/* =================================================
              LOCATION INTELLIGENCE
          ================================================= */}

          {activeView === 'location-intelligence' && (
            <LocationIntelligenceView />
          )}

        </main>

        {isPresentationMode && (
          <nav
            className="presentation-deck no-print"
            aria-label="Presentation navigation"
          >
            {[
              {
                id: 'home' as const,
                label: 'Overview',
              },
              {
                id: 'graph' as const,
                label: 'Network',
              },
              {
                id: 'insights' as const,
                label: 'Insights',
              },
              {
                id: 'timeline' as const,
                label: 'Timeline',
              },
              {
                id: 'workspace' as const,
                label: 'Board',
              },
            ].map((item, index) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveView(item.id)
                }
                className={
                  activeView === item.id
                    ? 'is-active'
                    : ''
                }
              >
                <span>
                  {String(index + 1).padStart(2, '0')}
                </span>

                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* =================================================
          GLOBAL MODALS
      ================================================= */}

      <EvidenceSourceModal />

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() =>
          setShortcutsOpen(false)
        }
      />

      <CaseSelectModal />

      <AddDataModal />

      <ExportDossierModal />

      <AnalysisProcessModal />

      <ScoringMethodologyModal />

    </div>
  );
};

/* =========================================================
   ROOT APP
   ========================================================= */

export function App() {
  return (
    <ThemeProvider>

      <AuthProvider>

        <AppProvider>

          <AuthGate />

        </AppProvider>

      </AuthProvider>

    </ThemeProvider>
  );
}

export default App;