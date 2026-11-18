import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import MembersView from './components/MembersView';
import LoansView from './components/LoansView';
import MMFStatementView from './components/MMFStatementView';
import MarketplaceView from './components/MarketplaceView';
import GovernanceView from './components/GovernanceView';
import LedgerView from './components/LedgerView';
import OfficialDocumentsView from './components/OfficialDocumentsView';
import AdminAccessMailView from './components/AdminAccessMailView';
import AuthGateModal from './components/AuthGateModal';
import DepositModal from './components/DepositModal';
import DataEditorModal from './components/DataEditorModal';
import ExecutivePrivilegeModal from './components/ExecutivePrivilegeModal';
import FinancialRatificationModal from './components/FinancialRatificationModal';
import FirstLoginProfileModal from './components/FirstLoginProfileModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    toastMessage,
    authenticatedUser,
    isSuperAdmin,
    isRealSuperAdmin,
    impersonatedAdmin,
    exitImpersonation,
    currentMember
  } = useApp();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const canAccessAdmin = Boolean(isRealSuperAdmin || isSuperAdmin || impersonatedAdmin);

  // Restrict Admin tab to System Administrator only
  useEffect(() => {
    if (activeTab === 'admin' && !canAccessAdmin) {
      setActiveTab('dashboard');
    }
  }, [activeTab, canAccessAdmin, setActiveTab]);

  // Enforce mandatory full sign-up / profile completion before portal access
  const isProfileComplete = Boolean(
    authenticatedUser &&
    authenticatedUser.phone && authenticatedUser.phone.trim() !== '' &&
    authenticatedUser.nationalId && authenticatedUser.nationalId.trim() !== '' &&
    (authenticatedUser.profileCompleted || (typeof window !== 'undefined' && localStorage.getItem(`mgr_profile_completed_${authenticatedUser.memberId}`) === 'true'))
  );

  const mustCompleteFullSignUp = Boolean(authenticatedUser && !isProfileComplete);

  if (!authenticatedUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed top-6 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
            <div className={`p-3.5 rounded-xl shadow-xl border text-xs font-semibold flex items-start space-x-3 backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/95 text-white border-rose-800'
                : 'bg-[#0B0F19]/95 text-white border-slate-700'
            }`}>
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold-light)] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="leading-snug">{toastMessage.message}</p>
              </div>
            </div>
          </div>
        )}
        <AuthGateModal />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-outer)] text-slate-900 flex flex-col font-sans selection:bg-[var(--brand-primary)] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
          <div className={`p-3.5 rounded-xl shadow-xl border text-xs font-semibold flex items-start space-x-3 backdrop-blur-md ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/95 text-white border-rose-800'
              : 'bg-[#0B0F19]/95 text-white border-slate-700'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold-light)] shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="leading-snug">{toastMessage.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Impersonation Warning Banner (Exclusive to System Administrator) */}
      {impersonatedAdmin && (
        <div className="bg-[#6E3C1B] text-white px-3 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2 z-50 sticky top-0 shadow-md border-b border-white/20 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-5 h-5 rounded-full bg-[var(--accent-gold-light)] text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0">
              !
            </span>
            <span className="font-medium truncate text-white/95 text-[11px] sm:text-xs">
              <strong className="text-[var(--accent-gold-light)] uppercase tracking-wider text-[9px] sm:text-[10px] mr-1.5 font-bold bg-black/30 px-1.5 py-0.5 rounded border border-white/10">
                System Admin Impersonation
              </strong>
              Currently viewing portal as <strong className="text-white underline">{currentMember?.name} ({currentMember?.id})</strong> • Real Admin: <strong>{impersonatedAdmin.name}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={exitImpersonation}
            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-bold text-[11px] sm:text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Restore System Administrator session and return to Admin Dashboard"
          >
            <span>Exit Persona &amp; Return to Admin Dashboard</span>
            <span className="font-mono">➔</span>
          </button>
        </div>
      )}

      {/* Full-Screen Modern Web Application Shell */}
      <div className="mgr-app-shell flex-1 flex flex-col w-full bg-[var(--bg-surface)] min-h-screen relative min-w-0">
        
        {/* Top App Header */}
        <Header 
          onOpenDataEditor={() => setIsDataEditorOpen(true)} 
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Navigation Bar */}
        <BottomNav />

        {/* Dynamic Views */}
        <main className="mgr-main-canvas flex-1 w-full px-3.5 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-20 md:pb-6 bg-[var(--bg-canvas)] overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView 
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
              onOpenDataEditor={() => setIsDataEditorOpen(true)}
            />
          )}
          {activeTab === 'members' && (
            <MembersView 
              onOpenDepositModal={() => setIsDepositModalOpen(true)}
              onOpenDataEditor={() => setIsDataEditorOpen(true)}
            />
          )}
          {activeTab === 'loans' && (
            <LoansView onOpenDataEditor={() => setIsDataEditorOpen(true)} />
          )}
          {activeTab === 'mmf' && <MMFStatementView />}
          {activeTab === 'marketplace' && <MarketplaceView />}
          {activeTab === 'governance' && <GovernanceView />}
          {activeTab === 'ledger' && <LedgerView />}
          {activeTab === 'documents' && <OfficialDocumentsView />}
          {activeTab === 'admin' && <AdminAccessMailView />}
        </main>

        {/* Deposit Modal */}
        <DepositModal 
          isOpen={isDepositModalOpen} 
          onClose={() => setIsDepositModalOpen(false)} 
        />

        {/* Complete Club Data Editor Modal */}
        <DataEditorModal
          isOpen={isDataEditorOpen}
          onClose={() => setIsDataEditorOpen(false)}
        />

        {/* Executive Authority Security Modal */}
        <ExecutivePrivilegeModal />

        {/* Unanimous All-Member Financial Ratification Modal */}
        <FinancialRatificationModal />

        {/* Mandatory Full Sign-Up / Identity Verification Modal */}
        <FirstLoginProfileModal
          isOpen={isProfileModalOpen || Boolean(mustCompleteFullSignUp)}
          isEnforced={Boolean(mustCompleteFullSignUp)}
          onClose={() => {
            if (!mustCompleteFullSignUp) {
              setIsProfileModalOpen(false);
            }
          }}
        />

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
