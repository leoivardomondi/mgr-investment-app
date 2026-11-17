import React, { useState } from 'react';
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
  const { activeTab, toastMessage, authenticatedUser } = useApp();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDataEditorOpen, setIsDataEditorOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
