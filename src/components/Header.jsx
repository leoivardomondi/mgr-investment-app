import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getMemberTwoNames } from '../data/initialData';
import MemberAvatarIcon from './MemberAvatarIcon';
import MemberKycModal from './MemberKycModal';
import {
  Bell,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  Landmark,
  Edit3,
  Lock,
  Coins,
  User,
  Palette,
  Check,
  LogOut,
  Settings,
  Smartphone,
  Download,
  X,
  FileText
} from 'lucide-react';

const DESIGN_LANGUAGES = [
  {
    id: 'swiss',
    name: 'Nairobi Gazette',
    subtitle: 'Cotton Paper, Acacia Green & Ochre',
    badge: 'Default',
    swatch: '#1D3B2A',
    accent: '#9A5B25'
  },
  {
    id: 'terminal',
    name: 'Espresso & Brass',
    subtitle: 'Dark Roasted Mahogany & Brass Ink',
    badge: 'Boardroom',
    swatch: '#181411',
    accent: '#C89B57'
  },
  {
    id: 'fintech',
    name: 'Savanna Limestone',
    subtitle: 'Warm Stone, Olive Bark & Terracotta',
    badge: 'Field',
    swatch: '#2C3824',
    accent: '#9E4E28'
  }
];

export default function Header({ onOpenDataEditor, onOpenProfileModal }) {
  const {
    members,
    currentMember,
    setCurrentMemberId,
    notifications,
    resetToFactoryDefaults,
    isCurrentMemberExec,
    triggerExecRestriction,
    pendingFinancialActions,
    setActiveRatificationModalId,
    designLanguage,
    setDesignLanguage,
    dbSyncStatus,
    currentUserRbac,
    canSwitchMemberPersona,
    logoutSession,
    setActiveTab
  } = useApp();

  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showDesignDropdown, setShowDesignDropdown] = useState(false);
  const [showKycVault, setShowKycVault] = useState(false);
  const [deferredPwaPrompt, setDeferredPwaPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPwaPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsStandaloneApp(true);
      setDeferredPwaPrompt(null);
      setShowInstallModal(false);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (deferredPwaPrompt) {
      deferredPwaPrompt.prompt();
      const choice = await deferredPwaPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPwaPrompt(null);
      }
      return;
    }
    setShowInstallModal(true);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingRatifications = (pendingFinancialActions || []).filter(a => a.status === 'Pending Member Ratification');
  const pendingRatificationCount = pendingRatifications.length;

  const execMembers = members.filter(m => m.committeeRole === 'Executive Committee');
  const generalMembers = members.filter(m => m.committeeRole !== 'Executive Committee' && m.status !== 'Deceased');
  const deceasedMembers = members.filter(m => m.status === 'Deceased');

  const activeDesignObj = DESIGN_LANGUAGES.find(d => d.id === designLanguage) || DESIGN_LANGUAGES[0];

  const handleOpenDataEditor = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Update Club Financial & Member Records",
        "Modifying member shares, adjusting group financial asset balances, or adding manual general ledger entries can strictly only be performed by the 7 Executive Committee members."
      );
      return;
    }
    onOpenDataEditor();
  };

  return (
    <header className="sticky top-0 z-40 mgr-glass-header text-white shadow-sm w-full">
      {/* Top Institutional Bar */}
      <div className="w-full px-3 sm:px-6 lg:px-10 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Crest */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shadow-inner shrink-0">
            <Landmark className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[var(--accent-gold-light)]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 min-w-0">
              <span className="md:hidden font-extrabold text-base tracking-tight text-white">
                MGR
              </span>
              <span className="hidden md:inline font-bold text-sm md:text-base tracking-tight text-white whitespace-nowrap">
                MGR INVESTMENT GROUP
              </span>
              <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono-num font-semibold uppercase tracking-widest bg-white/10 text-[var(--accent-gold-light)] border border-white/10">
                FY 2026
              </span>
              <span
                className={`hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono-num font-semibold uppercase tracking-wider border ${
                  dbSyncStatus?.mode === 'connected' || dbSyncStatus?.mode === 'saving'
                    ? 'bg-white/10 text-[var(--accent-gold-light)] border-white/20'
                    : 'bg-white/10 text-white/75 border-white/15'
                }`}
                title={
                  dbSyncStatus?.mode === 'connected' || dbSyncStatus?.mode === 'saving'
                    ? `Shared cPanel Database Connected (${dbSyncStatus.driver?.toUpperCase()}) • Last updated by ${dbSyncStatus.updatedBy || 'System'}`
                    : 'Local Storage Mode (Automatically switches to shared SQLite/MySQL DB when uploaded to cPanel)'
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dbSyncStatus?.mode === 'saving'
                      ? 'bg-amber-300 animate-pulse'
                      : dbSyncStatus?.mode === 'connected'
                        ? 'bg-[var(--accent-gold)]'
                        : 'bg-slate-300'
                  }`}
                />
                <span>
                  {dbSyncStatus?.mode === 'saving'
                    ? 'Syncing DB...'
                    : dbSyncStatus?.mode === 'connected'
                      ? `Live DB (${dbSyncStatus.driver === 'mysql' ? 'MySQL' : 'SQLite'})`
                      : 'Local Cache'}
                </span>
              </span>
            </div>
            <p className="text-[10px] text-slate-300/80 font-normal hidden lg:block leading-none mt-0.5 whitespace-nowrap">
              Private Wealth Ledger &amp; Share Registry • Audited Double-Entry
            </p>
          </div>
        </div>

        {/* User Account Profile, Design Language & Alerts */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          
          {/* Quick Official Documents & PDF Repository */}
          <button
            onClick={() => setActiveTab('documents')}
            className="h-8 sm:h-9 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 px-2 sm:px-2.5 rounded-lg text-xs text-white/90 hover:text-white transition shrink-0"
            title="Official Club Documents, Charters & Downloadable PDFs"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent-gold-light)] shrink-0" />
            <span className="hidden md:inline text-[11px] font-semibold whitespace-nowrap">
              Docs &amp; PDFs
            </span>
          </button>

          {/* Design Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDesignDropdown(!showDesignDropdown);
                setShowMemberDropdown(false);
                setShowNotifModal(false);
              }}
              className="h-8 sm:h-9 flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 px-2 sm:px-2.5 rounded-lg text-xs text-white/90 hover:text-white transition shrink-0"
              title="Switch Institutional Design Language"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--accent-gold-light)] shrink-0" />
              <span className="hidden xl:inline text-[11px] font-semibold whitespace-nowrap">
                {activeDesignObj.name}
              </span>
              <ChevronDown className="w-3 h-3 text-white/60 shrink-0 hidden sm:inline" />
            </button>

            {showDesignDropdown && (
              <>
                {/* Backdrop to close on tap outside */}
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                  onClick={() => setShowDesignDropdown(false)}
                />
                <div className="fixed top-14 inset-x-3 sm:inset-x-auto sm:right-12 md:sm:right-16 w-auto sm:w-80 max-w-[calc(100vw-24px)] mx-auto sm:mx-0 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in max-h-[calc(100vh-70px)] overflow-y-auto">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center space-x-1.5">
                      <Palette className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Instant Theme
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        • Design Language
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDesignDropdown(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                      title="Close menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {DESIGN_LANGUAGES.map((dl) => {
                      const isSelected = designLanguage === dl.id;
                      return (
                        <button
                          key={dl.id}
                          onClick={() => {
                            setDesignLanguage(dl.id);
                            setShowDesignDropdown(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left flex items-center justify-between rounded-lg transition ${
                            isSelected
                              ? 'bg-slate-900 text-white'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className="w-7 h-7 rounded-md border border-white/20 flex items-center justify-center shrink-0 shadow-xs"
                              style={{ backgroundColor: dl.swatch }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: dl.accent }}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold truncate">{dl.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                  isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {dl.badge}
                                </span>
                              </div>
                              <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {dl.subtitle}
                              </p>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Member Profile & RBAC Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMemberDropdown(!showMemberDropdown);
                setShowDesignDropdown(false);
                setShowNotifModal(false);
              }}
              className="h-8 sm:h-9 flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/15 border border-white/15 px-2 sm:px-2.5 rounded-lg text-xs transition shrink-0 max-w-[130px] sm:max-w-[200px]"
              title="Authenticated Member Account & Access Controls"
            >
              <MemberAvatarIcon
                member={currentMember}
                size="xs"
                className="border-white/30"
              />
              <div className="items-center gap-1.5 text-left hidden sm:flex min-w-0">
                <span className="font-semibold text-xs text-white whitespace-nowrap leading-none truncate max-w-[110px]">
                  {getMemberTwoNames(currentMember?.name)}
                </span>
                {isCurrentMemberExec ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-gold-light)] shrink-0" title="Executive Committee Member" />
                ) : (
                  <User className="w-3.5 h-3.5 text-white/70 shrink-0" title="General Member" />
                )}
              </div>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70 shrink-0" />
            </button>

            {showMemberDropdown && (
              <>
                {/* Backdrop to close on tap outside */}
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                  onClick={() => setShowMemberDropdown(false)}
                />
                <div className="fixed top-14 inset-x-3 sm:inset-x-auto sm:right-4 w-auto sm:w-84 max-w-[calc(100vw-24px)] mx-auto sm:mx-0 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in max-h-[calc(100vh-70px)] overflow-y-auto">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/70">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Authenticated Account
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono-num font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900">
                          {currentUserRbac?.accessLevel?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowMemberDropdown(false)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Close menu"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {currentMember?.name} ({currentMember?.id})
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Position: <strong>{currentUserRbac?.positionTitle || currentMember?.role}</strong> • {currentUserRbac?.membershipTier || currentMember?.committeeRole}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1 font-mono">
                    <Smartphone className="w-3 h-3 text-slate-400" />
                    <span>Phone:</span>
                    {currentMember?.phone ? (
                      <strong className="text-slate-900">{currentMember.phone}</strong>
                    ) : (
                      <span className="text-amber-700 font-semibold italic">Not added yet</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMemberDropdown(false);
                      if (onOpenProfileModal) onOpenProfileModal();
                    }}
                    className="w-full mt-2 py-1.5 px-2 rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Smartphone className="w-3 h-3 text-[var(--accent-gold-light)]" />
                    <span>{currentMember?.phone ? 'Update Phone & Member No.' : 'Add Phone & Member Number'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMemberDropdown(false);
                      setShowKycVault(true);
                    }}
                    className="w-full mt-1.5 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Lock className="w-3 h-3 text-amber-700" />
                    <span>My Legal Documents &amp; Secret PIN</span>
                  </button>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('admin');
                        setShowMemberDropdown(false);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Settings className="w-3 h-3 text-amber-300" />
                      <span>Access &amp; Mail Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMemberDropdown(false);
                        logoutSession();
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {canSwitchMemberPersona && (
                  <>
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Admin Persona Preview</span>
                      <span className="text-[10px] text-amber-700 font-semibold lowercase">click to preview</span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {/* Executive Committee Section */}
                      <div className="p-1">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-slate-900 bg-amber-50/80 border border-amber-200/60 rounded flex items-center justify-between">
                          <span className="flex items-center space-x-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Executive Committee (7 Authorized)</span>
                          </span>
                          <span className="text-[9px] bg-slate-900 text-amber-300 px-1.5 py-0.2 rounded font-bold">Admin Authority</span>
                        </div>

                        <div className="mt-1 space-y-0.5">
                          {execMembers.map(member => (
                            <button
                              key={member.id}
                              onClick={() => {
                                setCurrentMemberId(member.id);
                                setShowMemberDropdown(false);
                              }}
                              className={`w-full px-2.5 py-1.5 text-left flex items-center space-x-2 rounded-lg hover:bg-slate-50 transition ${
                                currentMember.id === member.id ? 'bg-slate-100 font-semibold text-slate-900 ring-1 ring-slate-300' : ''
                              }`}
                            >
                              <MemberAvatarIcon member={member} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-900 truncate">
                                    {member.name}
                                  </p>
                                  <span className="text-[10px] font-semibold text-amber-700">
                                    {member.role}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono-num">
                                  KES {member.shares.toLocaleString()} shares
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* General Members Section */}
                      <div className="p-1">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 rounded flex items-center justify-between">
                          <span>General Members (Self-Service View)</span>
                          <span className="text-[9px] text-slate-500 font-medium">Read-Only Treasury</span>
                        </div>

                        <div className="mt-1 space-y-0.5">
                          {generalMembers.map(member => (
                            <button
                              key={member.id}
                              onClick={() => {
                                setCurrentMemberId(member.id);
                                setShowMemberDropdown(false);
                              }}
                              className={`w-full px-2.5 py-1.5 text-left flex items-center space-x-2 rounded-lg hover:bg-slate-50 transition ${
                                currentMember.id === member.id ? 'bg-slate-100 font-semibold text-slate-900 ring-1 ring-slate-300' : ''
                              }`}
                            >
                              <MemberAvatarIcon member={member} size="sm" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-900 truncate">
                                    {member.name}
                                  </p>
                                  <span className="text-[10px] text-slate-500">
                                    {member.role}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-mono-num">
                                  KES {member.shares.toLocaleString()} shares
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Deceased Member Section */}
                      {deceasedMembers.length > 0 && (
                        <div className="p-1">
                          <div className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded flex items-center justify-between">
                            <span>Estate / Bereaved Record</span>
                            <span className="text-[9px] text-rose-600">Exit Clause</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {deceasedMembers.map(member => (
                              <div
                                key={member.id}
                                className="w-full px-2.5 py-1.5 text-left flex items-center space-x-2 rounded-lg bg-rose-50/50"
                              >
                                <div className="w-6 h-6 rounded bg-rose-200 text-rose-800 font-bold text-[9px] flex items-center justify-center shrink-0">
                                  {member.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-slate-900 font-medium truncate">
                                    {member.name}
                                  </p>
                                  <p className="text-[10px] text-rose-600 truncate font-mono-num">
                                    Deceased (Sept 2026) • KES {member.shares.toLocaleString()} estate shares
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                </div>
              </>
            )}
          </div>

          {/* Pending Financial Actions Ratification Button */}
          {pendingRatificationCount > 0 && (
            <button
              onClick={() => setActiveRatificationModalId(pendingRatifications[0]?.id)}
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-2.5 flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition shrink-0 relative cursor-pointer"
              title="Financial action requires unanimous member ratification"
            >
              <Coins className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Ratify</span>
              <span className="absolute -top-1 -right-1 sm:static sm:top-auto sm:right-auto w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] flex items-center justify-center font-black leading-none shadow-xs">
                {pendingRatificationCount}
              </span>
            </button>
          )}

          {/* Install App (PWA / Android APK) Button */}
          {!isStandaloneApp && (
            <button
              onClick={handleTriggerInstall}
              className="h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/15 text-[var(--paper-warm)] transition shrink-0 whitespace-nowrap cursor-pointer"
              title="Install MGR Investment App on Android, iOS, or Desktop (PWA / APK)"
            >
              <Smartphone className="w-3.5 h-3.5 text-[var(--accent-gold-light)] shrink-0" />
              <span className="hidden lg:inline">Install App</span>
            </button>
          )}

          {/* Direct Data Editor / Update Records Button */}
          {onOpenDataEditor && (
            <button
              onClick={handleOpenDataEditor}
              className={`h-8 sm:h-9 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 rounded-lg text-xs font-semibold transition border shrink-0 whitespace-nowrap ${
                isCurrentMemberExec
                  ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
              }`}
              title={isCurrentMemberExec ? "Update, edit, or correct any member or account records" : "Restricted to Executive Committee"}
            >
              {isCurrentMemberExec ? (
                <Edit3 className="w-3.5 h-3.5 text-[var(--accent-gold-light)] shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              )}
              <span className="hidden md:inline">Update Records</span>
            </button>
          )}

          {/* Notifications Bell */}
          <button
            onClick={() => {
              setShowNotifModal(!showNotifModal);
              setShowMemberDropdown(false);
              setShowDesignDropdown(false);
            }}
            className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-white transition shrink-0 relative"
            aria-label="Alerts"
            title="Notifications & Alerts"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 sm:h-4 px-1 bg-emerald-500 text-white font-mono-num text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center shadow leading-none">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Reset Baseline Figures Button */}
          {isCurrentMemberExec && (
            <button
              onClick={() => {
                if (window.confirm("Restore official October 30, 2026 statement baseline figures?")) {
                  resetToFactoryDefaults();
                }
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-white/80 hover:text-white transition shrink-0"
              title="Reset to 30/10/2026 Baseline Figures"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </button>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => logoutSession()}
            className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center bg-white/10 hover:bg-rose-500/30 border border-white/15 rounded-lg text-white/90 hover:text-white transition shrink-0"
            title="Sign Out of MGR Portal"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </button>

        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifModal && (
        <>
          {/* Backdrop to close on tap outside */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setShowNotifModal(false)}
          />
          <div className="fixed top-14 inset-x-3 sm:inset-x-auto sm:right-4 w-auto sm:w-96 max-w-[calc(100vw-24px)] mx-auto sm:mx-0 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50 text-slate-800 animate-in fade-in max-h-[calc(100vh-70px)] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-[var(--accent-gold)]" />
                <h3 className="font-bold text-sm text-slate-900">Notifications &amp; Alerts</h3>
              </div>
              <button 
                onClick={() => setShowNotifModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-3 rounded-xl border text-xs bg-slate-50/70 border-slate-200"
                >
                  <div className="flex items-center justify-between font-semibold mb-1 text-slate-900">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono-num">{notif.date}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    {notif.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {/* PWA / Android APK Install Guide Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1D3B2A] text-[var(--accent-gold-light)] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Install MGR Investment App (PWA &amp; Android)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Full-screen mobile &amp; desktop app connected to your live SQLite server
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              {deferredPwaPrompt && (
                <button
                  onClick={handleTriggerInstall}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>One-Click Install App Now</span>
                </button>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">
                  1. Android (Chrome / Samsung Internet — WebAPK):
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tap the browser menu <strong>(⋮)</strong> in the top-right corner and select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>. Android automatically compiles and installs a signed native <strong>WebAPK</strong> on your phone with the MGR icon.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">
                  2. iPhone / iPad (Safari iOS):
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Tap the <strong>Share</strong> button at the bottom of Safari and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <p className="font-bold text-amber-950">
                  3. Standalone `.apk` File (PWABuilder / TWA):
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Because your cPanel site now serves a verified <code>manifest.webmanifest</code>, <code>sw.js</code>, and <code>512x512</code> icons, you can also paste your live cPanel URL into <strong>pwabuilder.com</strong> to download a standalone signed <code>MGR-Invest.apk</code> file for WhatsApp distribution.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member KYC & Confidential Legal Documents Modal */}
      {showKycVault && (
        <MemberKycModal
          isOpen={showKycVault}
          member={currentMember}
          onClose={() => setShowKycVault(false)}
        />
      )}
    </header>
  );
}
