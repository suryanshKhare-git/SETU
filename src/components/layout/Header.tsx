import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../data/mockDataset';

import {
  FolderLock,
  Search,
  RotateCcw,
  Tv,
  X,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  QrCode,
  Menu,
} from 'lucide-react';
import { LiveQRCodeModal } from '../common/LiveQRCodeModal';

interface HeaderProps {
  onOpenShortcuts?: () => void;
  onOpenSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const {
    currentRole,
    setRole,
    selectedCase,
    setActiveView,
    setCaseSelectModalOpen,
    resetDemo,
    isPresentationMode,
    togglePresentationMode,
    demoToastMessage,
    clearDemoToast,
  } = useApp();

  const { investigator, logout } = useAuth();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  /* =======================================================
     LOGOUT
     ======================================================= */

  const handleLogout = async () => {
    setProfileMenuOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handlePresentationMode = async () => {
    const enteringPresentation = !isPresentationMode;
    togglePresentationMode();

    try {
      if (enteringPresentation && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else if (!enteringPresentation && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen can be declined by the browser; focus mode still applies.
    }
  };

  return (
    <header
      className="casework-header
        h-12
        w-full
        bg-[#0E1420]
        border-b
        border-slate-800/80
        px-4
        sm:px-6
        flex
        items-center
        justify-between
        gap-4
        select-none
        no-print
      "
    >

      {/* =================================================
          LEFT:
          ACTIVE CASE
      ================================================= */}

      <div className="flex items-center gap-2.5 text-xs min-w-0">

        <button
          onClick={onOpenSidebar}
          className="mobile-menu-toggle"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-slate-300 min-w-0">

          <FolderLock className="w-3.5 h-3.5 text-teal-400 shrink-0" />

          {selectedCase ? (
            <>
              <span className="font-mono font-semibold text-white shrink-0">
                {selectedCase.firNumber}
              </span>

              <span className="text-slate-600 shrink-0">
                /
              </span>

              <span className="text-slate-300 font-medium truncate max-w-[150px] sm:max-w-[320px]">
                {selectedCase.title}
              </span>
            </>
          ) : (
            <span className="text-slate-400 font-sans truncate">
              No investigation selected
            </span>
          )}

        </div>

        <button
          onClick={() =>
            setCaseSelectModalOpen(true)
          }
          className="
            px-2
            py-0.5
            rounded
            text-[11px]
            font-sans
            text-teal-400
            hover:text-teal-300
            hover:bg-slate-800/80
            transition
            cursor-pointer
            shrink-0
          "
        >
          {selectedCase
            ? 'Change Case'
            : 'Select Case'}
        </button>

      </div>

      {/* =================================================
          RIGHT CONTROLS
      ================================================= */}

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* =================================================
            UNIVERSAL SEARCH
        ================================================= */}

        <button
          onClick={() =>
            setActiveView('search')
          }
          className="
            hidden
            md:flex
            items-center
            gap-2
            px-2.5
            py-1
            rounded
            bg-slate-900
            border
            border-slate-800
            text-slate-400
            hover:text-slate-200
            text-xs
            transition
            cursor-pointer
          "
          title="Jump to Universal Search (or press /)"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />

          <span>
            Search entities...
          </span>

          <kbd className="px-1 text-[10px] font-mono bg-slate-800 rounded text-slate-400">
            /
          </kbd>
        </button>

        {/* =================================================
            PRESENTATION MODE
        ================================================= */}

        <button
          onClick={handlePresentationMode}
          className={`
            presentation-toggle
            flex
            items-center
            gap-1.5
            h-7
            px-2.5
            rounded
            text-xs
            font-mono
            transition
            cursor-pointer
            ${
              isPresentationMode
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }
          `}
          title="Toggle Large Typography & Canvas Scaling for Presentation Display"
        >
          <Tv className="w-3 h-3" />

          <span>
            {isPresentationMode
              ? 'PRESENT ON'
              : 'PRESENT'}
          </span>
        </button>

        {/* Live Permanent QR Code Button */}
        <button
          onClick={() => setQrModalOpen(true)}
          className="qr-toggle flex items-center gap-1.5 h-7 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition cursor-pointer border border-slate-700"
          title="Open Permanent Live QR Code for Mobile & Presentation Evaluation"
        >
          <QrCode className="w-3 h-3 text-teal-400" />
          <span className="hidden sm:inline">QR</span>
        </button>

        {/* =================================================
            RESET
        ================================================= */}
        <button
          onClick={resetDemo}
          className="reset-toggle
            flex
            items-center
            gap-1.5
            h-7
            px-2
            rounded
            bg-slate-800
            hover:bg-slate-700
            text-slate-400
            hover:text-slate-200
            text-xs
            transition
            cursor-pointer
            border
            border-slate-700
          "
          title="Reset Demo Dataset to Baseline"
        >
          <RotateCcw className="w-3 h-3" />

          <span className="hidden sm:inline">
            Reset
          </span>
        </button>

        {/* =================================================
            ROLE SWITCHER
        ================================================= */}

        <div className="relative">

          <button
            onClick={() => {
              setRoleMenuOpen(prev => !prev);
              setProfileMenuOpen(false);
            }}
            className="role-toggle
              flex
              items-center
              gap-1.5
              h-7
              px-2.5
              rounded
              bg-slate-800
              border
              border-slate-700
              text-xs
              text-slate-200
              hover:bg-slate-700
              transition
              cursor-pointer
              font-mono
            "
            title="Switch User Role"
          >

            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />

            <span className="font-semibold text-[11px]">
              {currentRole.title.toUpperCase()}
            </span>

            <ChevronDown className="w-3 h-3 text-slate-400" />

          </button>

          {roleMenuOpen && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-1
                w-52
                bg-[#111827]
                border
                border-slate-800
                rounded-md
                shadow-xl
                py-1
                z-50
              "
            >

              <div className="
                px-3
                py-1
                text-[10px]
                font-mono
                uppercase
                text-slate-500
                border-b
                border-slate-800
              ">
                Switch Operational Role
              </div>

              {USER_ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setRole(role.id);
                    setRoleMenuOpen(false);
                  }}
                  className={`
                    w-full
                    text-left
                    px-3
                    py-1.5
                    text-xs
                    flex
                    items-center
                    justify-between
                    hover:bg-slate-800
                    transition
                    cursor-pointer
                    ${
                      role.id === currentRole.id
                        ? 'text-teal-300 font-semibold bg-slate-900/60'
                        : 'text-slate-300'
                    }
                  `}
                >

                  <span>
                    {role.title}
                  </span>

                  <span className="
                    text-[10px]
                    font-mono
                    text-slate-500
                  ">
                    {role.id.toUpperCase()}
                  </span>

                </button>
              ))}

            </div>
          )}

        </div>

        {/* =================================================
            INVESTIGATOR PROFILE
        ================================================= */}

        <div className="relative">

          <button
            onClick={() => {
              setProfileMenuOpen(prev => !prev);
              setRoleMenuOpen(false);
            }}
            className="profile-toggle
              flex
              items-center
              gap-2
              h-8
              px-2
              rounded-lg
              bg-slate-800
              border
              border-slate-700
              hover:bg-slate-700
              transition
              cursor-pointer
            "
            title="Investigator Profile"
          >

            {/* Avatar */}

            <div className="
              w-6
              h-6
              rounded-full
              bg-teal-950
              border
              border-teal-500/60
              flex
              items-center
              justify-center
            ">
              <User className="w-3.5 h-3.5 text-teal-300" />
            </div>

            {/* Name */}

            <div className="hidden sm:block text-left max-w-[130px]">

              <div className="
                text-[10px]
                font-semibold
                text-slate-200
                truncate
              ">
                {investigator?.name ||
                  'Investigator'}
              </div>

              <div className="
                text-[9px]
                font-mono
                text-slate-500
                truncate
              ">
                {investigator?.investigatorId ||
                  'INV-001'}
              </div>

            </div>

            <ChevronDown className="w-3 h-3 text-slate-500" />

          </button>

          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {profileMenuOpen && (
            <div
              className="
                absolute
                right-0
                top-full
                mt-1
                w-72
                bg-[#111827]
                border
                border-slate-700
                rounded-xl
                shadow-2xl
                overflow-hidden
                z-[60]
              "
            >

              {/* PROFILE HEADER */}

              <div className="
                px-4
                py-4
                bg-slate-900/80
                border-b
                border-slate-800
              ">

                <div className="flex items-center gap-3">

                  <div className="
                    w-11
                    h-11
                    rounded-full
                    bg-teal-950
                    border
                    border-teal-500/60
                    flex
                    items-center
                    justify-center
                  ">
                    <User className="w-5 h-5 text-teal-300" />
                  </div>

                  <div className="min-w-0">

                    <div className="
                      text-sm
                      font-semibold
                      text-white
                      truncate
                    ">
                      {investigator?.name ||
                        'Investigator'}
                    </div>

                    <div className="
                      text-[10px]
                      font-mono
                      text-teal-400
                      truncate
                    ">
                      {investigator?.investigatorId ||
                        'INV-001'}
                    </div>

                  </div>

                </div>

              </div>

              {/* DETAILS */}

              <div className="px-4 py-3 space-y-2.5">

                <div className="flex items-start gap-2">

                  <ShieldCheck className="
                    w-3.5
                    h-3.5
                    text-teal-400
                    mt-0.5
                    shrink-0
                  " />

                  <div className="min-w-0">

                    <div className="
                      text-[9px]
                      uppercase
                      font-mono
                      text-slate-500
                    ">
                      Department
                    </div>

                    <div className="
                      text-xs
                      text-slate-200
                      truncate
                    ">
                      {investigator?.department ||
                        'Investigation'}
                    </div>

                  </div>

                </div>

                <div>

                  <div className="
                    text-[9px]
                    uppercase
                    font-mono
                    text-slate-500
                  ">
                    Designation
                  </div>

                  <div className="
                    text-xs
                    text-slate-300
                    truncate
                  ">
                    {investigator?.designation ||
                      'Investigation Officer'}
                  </div>

                </div>

                <div>

                  <div className="
                    text-[9px]
                    uppercase
                    font-mono
                    text-slate-500
                  ">
                    Official Email
                  </div>

                  <div className="
                    text-xs
                    text-slate-300
                    truncate
                  ">
                    {investigator?.email ||
                      'Not available'}
                  </div>

                </div>

                <div>

                  <div className="
                    text-[9px]
                    uppercase
                    font-mono
                    text-slate-500
                  ">
                    Mobile
                  </div>

                  <div className="
                    text-xs
                    text-slate-300
                  ">
                    {investigator?.mobile ||
                      'Not available'}
                  </div>

                </div>

              </div>

              {/* LOGOUT */}

              <div className="
                border-t
                border-slate-800
                p-2
              ">

                <button
                  onClick={handleLogout}
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    rounded-lg
                    text-xs
                    font-semibold
                    text-red-300
                    hover:text-red-200
                    hover:bg-red-950/40
                    transition
                    cursor-pointer
                  "
                >

                  <LogOut className="w-4 h-4" />

                  <span>
                    Logout Investigator
                  </span>

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* =================================================
          DEMO TOAST
      ================================================= */}

      {demoToastMessage && (
        <div className="
          fixed
          top-4
          right-4
          z-[100]
          flex
          items-center
          gap-2
          px-3
          py-2
          bg-slate-900
          border
          border-teal-500/60
          rounded
          shadow-xl
          text-xs
          font-mono
          text-teal-300
          animate-fadeIn
        ">

          <span>
            {demoToastMessage}
          </span>

          <button
            onClick={clearDemoToast}
            className="
              text-slate-400
              hover:text-white
              ml-1
              cursor-pointer
            "
          >
            <X className="w-3 h-3" />
          </button>

        </div>
      )}

      {/* Live Permanent QR Code Modal */}
      <LiveQRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </header>
  );
};
