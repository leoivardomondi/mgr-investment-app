import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageContextBanner from './PageContextBanner';
import MemberAvatarIcon from './MemberAvatarIcon';
import { 
  COMMITTEE_TARGET_ALLOCATION, 
  CBK_MACRO_INDICATORS,
  CEO_DIVERSIFICATION_DIRECTIVE
} from '../data/benchmarkFinancialData';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  AlertCircle, 
  HandCoins, 
  Vote, 
  CheckCircle2, 
  Landmark, 
  ShieldAlert, 
  ArrowRight, 
  Clock, 
  Layers, 
  FileText,
  Coins,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  X,
  Sparkles,
  Megaphone,
  Pin,
  Calendar,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { recordAuditEvent } from '../utils/telemetry';

export default function DashboardView({ onOpenDepositModal }) {
  const { 
    members, 
    assets, 
    currentMember, 
    totalMemberShares, 
    totalAssetsValue, 
    retainedSurplus,
    setActiveTab,
    ledger,
    pendingFinancialActions,
    setActiveRatificationModalId,
    announcements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    isCurrentMemberExec,
    triggerExecRestriction,
    showToast
  } = useApp();

  const pendingRatifications = (pendingFinancialActions || []).filter(a => a.status === 'Pending Member Ratification');

  const myEquityPercent = totalMemberShares > 0 
    ? ((currentMember.shares / totalMemberShares) * 100).toFixed(2) 
    : '0.00';

  // Asset allocation percentages
  const mansaXPercent = totalAssetsValue > 0 ? ((assets.mansaX.totalBalance / totalAssetsValue) * 100).toFixed(1) : 0;
  const eticaPercent = totalAssetsValue > 0 ? ((assets.eticaMmf.statementBalance / totalAssetsValue) * 100).toFixed(1) : 0;
  const bankPercent = totalAssetsValue > 0 ? ((assets.bankAccount.balance / totalAssetsValue) * 100).toFixed(1) : 0;

  // Announcements Management State
  const [annFilter, setAnnFilter] = useState('ALL'); // 'ALL', 'BEREAVEMENT', 'INVESTMENT', 'GOVERNANCE'
  const [showDashboardPin, setShowDashboardPin] = useState(false);
  const [copiedDashboardPin, setCopiedDashboardPin] = useState(false);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState(null);
  const [annFormData, setAnnFormData] = useState({
    title: '',
    category: 'Bereavement & Demise Notice',
    priority: 'Urgent',
    date: new Date().toISOString().split('T')[0],
    content: '',
    actionLabel: 'View Estate Buyout Window',
    actionTarget: 'marketplace',
    pinned: false
  });

  const handleOpenCreateAnn = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Post Official Announcement",
        "Publishing club-wide news and formal notices is strictly restricted to the 7 Executive Committee members."
      );
      return;
    }
    setEditingAnnId(null);
    setAnnFormData({
      title: '',
      category: 'Bereavement & Demise Notice',
      priority: 'Urgent',
      date: new Date().toISOString().split('T')[0],
      content: '',
      actionLabel: 'View Estate Buyout Window',
      actionTarget: 'marketplace',
      pinned: false
    });
    setIsAnnModalOpen(true);
  };

  const handleOpenEditAnn = (ann) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Edit Announcement", "Restricted to Executive Committee members.");
      return;
    }
    setEditingAnnId(ann.id);
    setAnnFormData({
      title: ann.title || '',
      category: ann.category || 'General Notice',
      priority: ann.priority || 'Official Notice',
      date: ann.date || new Date().toISOString().split('T')[0],
      content: ann.content || '',
      actionLabel: ann.actionLabel || '',
      actionTarget: ann.actionTarget || 'marketplace',
      pinned: !!ann.pinned
    });
    setIsAnnModalOpen(true);
  };

  const handleSaveAnn = (e) => {
    e.preventDefault();
    if (!annFormData.title.trim()) {
      showToast("Please enter an announcement headline", "error");
      return;
    }
    if (!annFormData.content.trim()) {
      showToast("Please enter announcement details", "error");
      return;
    }

    if (editingAnnId) {
      updateAnnouncement(editingAnnId, annFormData);
    } else {
      addAnnouncement(annFormData);
    }
    setIsAnnModalOpen(false);
  };

  const handleDeleteAnn = (annId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Delete Announcement", "Restricted to Executive Committee members.");
      return;
    }
    if (window.confirm("Permanently delete this official announcement bulletin?")) {
      deleteAnnouncement(annId);
    }
  };

  const allAnnouncements = announcements || [];
  const filteredAnnouncements = allAnnouncements.filter(ann => {
    if (annFilter === 'BEREAVEMENT') return ann.category?.toLowerCase().includes('bereave') || ann.category?.toLowerCase().includes('demise');
    if (annFilter === 'INVESTMENT') return ann.category?.toLowerCase().includes('invest') || ann.category?.toLowerCase().includes('yield') || ann.category?.toLowerCase().includes('mmf');
    if (annFilter === 'GOVERNANCE') return ann.category?.toLowerCase().includes('governance') || ann.category?.toLowerCase().includes('resolution') || ann.category?.toLowerCase().includes('policy');
    return true;
  });

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">

      {/* Visual Guide & Human Context Banner */}
      <PageContextBanner
        eyebrow="Section I • Member Passbook & Treasury Overview"
        title="Investment Club Capital Stewardship & Yield Summary"
        description="This page shows your personal share passbook, your club equity stake, and how the 11 members' pooled deposits are deployed across CMA-licensed Money Market Funds, Mansa-X Special Funds, and Government Securities."
        imageUrl="/images/kenya_chama_self_help_group.jpg?v=sib"
        imageAlt="Standard Investment Bank (SIB) advisory desk in Kenya"
        imageCaption="Kenyan Chama & Self-Help Group • Pooled Share Capital & Audited Returns"
        stats={[
          { label: "Pooled Member Shares", value: `KES ${totalMemberShares.toLocaleString()}` },
          { label: "CBK Central Bank Rate", value: `${CBK_MACRO_INDICATORS.centralBankRate.toFixed(2)}% (Inflation ${CBK_MACRO_INDICATORS.inflationRate}%)` },
          { label: "Top MMF Net Benchmark", value: "11.79% p.a. (After 15% WHT)" }
        ]}
      />
      
      {/* Authentic Member Account Card */}
      <div className="equity-account-header p-5 relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/20 gap-3 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <MemberAvatarIcon
              member={currentMember}
              size="hero"
              className="border-2 border-[var(--accent-gold-light)] shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--accent-gold-light)] bg-black/25 px-2 py-0.5 rounded-xs">
                  Shareholder Passbook
                </span>
                <span className="text-xs text-white/85 font-mono-num">
                  Folio: {currentMember.id}
                </span>
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
                {currentMember.name}
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5 flex items-center space-x-1.5">
                <span>{currentMember.role}</span>
                <span>•</span>
                <span className="text-[var(--accent-gold-light)] font-semibold">{currentMember.committeeRole}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-white/80 font-medium uppercase tracking-wider block">
              Cumulative Active Shares
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-num text-[var(--accent-gold-light)] tracking-tight mt-0.5">
              KES {currentMember.shares.toLocaleString()}
            </div>
            <p className="text-[11px] text-white/80 mt-0.5 font-medium">
              Equates to <strong className="font-mono-num text-[var(--accent-gold-light)]">{myEquityPercent}%</strong> total club stake
            </p>
          </div>
        </div>

        {/* Account Details Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 relative z-10 text-xs">
          {(() => {
            const myDeps = currentMember.depositHistory || [];
            const myPrincipalDeposits = myDeps
              .filter(d => (!d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee'))) && d.type !== 'Yield / Dividend Deposit')
              .reduce((s, d) => s + Number(d.amount || 0), 0) || currentMember.shares;
            const myCreditedYieldDeposits = myDeps
              .filter(d => d.type === 'Yield / Dividend Deposit')
              .reduce((s, d) => s + Number(d.amount || 0), 0);
            const isQ4PostStatementMember = currentMember.id === 'MGR-011' || (currentMember.joinedDate && currentMember.joinedDate >= '2026-10-01') || currentMember.joinedDate === 'Q4-2026';
            const qualifyingPool = members
              .filter(m => m.id !== 'MGR-011' && (!m.joinedDate || m.joinedDate < '2026-10-01') && m.joinedDate !== 'Q4-2026')
              .reduce((s, m) => s + Number(m.shares || 0), 0);
            const totalYieldPool = Number(assets.mansaX?.interestAccrued || 41587) + 30931.74;
            const myAccruedYield = isQ4PostStatementMember
              ? 0
              : (qualifyingPool > 0 ? (Number(currentMember.shares || 0) / qualifyingPool) * totalYieldPool : 0);
            const myTotalYieldDeposits = myCreditedYieldDeposits + myAccruedYield;

            return (
              <>
                <div>
                  <span className="text-white/70 block text-[10px] uppercase font-semibold">Member Principal Deposits</span>
                  <p className="font-bold font-mono-num text-white text-sm sm:text-base mt-0.5">
                    KES {myPrincipalDeposits.toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="text-white/70 block text-[10px] uppercase font-semibold">Yield Deposits (Credited & Accrued)</span>
                  <p className="font-bold font-mono-num text-[var(--accent-gold-light)] text-sm sm:text-base mt-0.5">
                    + KES {myTotalYieldDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <span className="text-white/70 block text-[10px] uppercase font-semibold">Registration Status</span>
                  <p className="font-bold text-[var(--accent-gold-light)] text-sm sm:text-base mt-0.5 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline shrink-0" />
                    <span className="font-mono-num">{currentMember.regFeePaid ? 'KES 1,000 Paid' : 'Pending KES 1,000'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-white/70 block text-[10px] uppercase font-semibold">Compounded Total (Deps + Yields)</span>
                  <p className="font-bold font-mono-num text-white text-sm sm:text-base mt-0.5">
                    KES {(Number(currentMember.shares || 0) + myAccruedYield).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Prominent Logged-In Member 4-Digit PIN Security Bar */}
        <div className="mt-3.5 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <KeyRound className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/80 block">
                My 4-Digit Security PIN (KYC Vault &amp; Fiduciary Authorization Key)
              </span>
              <span className="text-white/70 text-[11px]">
                Your confidential PIN to authorize executive officers to inspect your KYC document vault or ratify transactions.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/35 border border-white/20 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
            <span className="font-mono-num font-extrabold text-base tracking-widest text-[var(--accent-gold-light)] min-w-[54px] text-center">
              {showDashboardPin ? (currentMember.accountPin || authenticatedUser?.accountPin || '1234') : '••••'}
            </span>
            <button
              type="button"
              onClick={() => {
                const willShow = !showDashboardPin;
                setShowDashboardPin(willShow);
                if (willShow) {
                  recordAuditEvent({
                    actionType: 'view',
                    actionSummary: 'Revealed secret 4-digit security PIN on dashboard overview',
                    targetResource: '4-Digit Security PIN'
                  });
                }
              }}
              className="px-2 py-1 rounded text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white transition cursor-pointer flex items-center gap-1"
              title={showDashboardPin ? 'Hide PIN' : 'Reveal PIN'}
            >
              {showDashboardPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showDashboardPin ? 'Hide' : 'Show'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const pinVal = currentMember.accountPin || authenticatedUser?.accountPin || '1234';
                navigator.clipboard.writeText(pinVal);
                setCopiedDashboardPin(true);
                setTimeout(() => setCopiedDashboardPin(false), 2000);
                recordAuditEvent({
                  actionType: 'access',
                  actionSummary: 'Copied 4-digit security PIN from dashboard',
                  targetResource: '4-Digit Security PIN'
                });
              }}
              className="px-2 py-1 rounded text-[10px] font-bold bg-[var(--accent-gold-light)] text-[var(--brand-primary)] hover:brightness-105 transition cursor-pointer flex items-center gap-1"
              title="Copy PIN to clipboard"
            >
              {copiedDashboardPin ? <Check className="w-3 h-3 text-emerald-800" /> : <Copy className="w-3 h-3" />}
              <span>{copiedDashboardPin ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar (Mobile Banking Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={onOpenDepositModal}
          className="bank-card p-3 bank-card-interactive flex items-center space-x-2.5 text-left group"
        >
          <div className="p-2 rounded-lg bg-[var(--brand-primary)] text-white group-hover:bg-[var(--brand-primary-hover)] transition shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-slate-900 group-hover:text-[var(--brand-primary)] transition">
              Deposit Shares
            </p>
            <p className="text-[10px] text-slate-500">M-Pesa / Bank</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className="bank-card p-3 bank-card-interactive flex items-center space-x-2.5 text-left group"
        >
          <div className="p-2 rounded-lg bg-slate-800 text-white group-hover:bg-slate-700 transition shrink-0">
            <HandCoins className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-slate-900 group-hover:text-slate-800 transition">
              Credit Desk
            </p>
            <p className="text-[10px] text-slate-500">Single Loan Portal</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className="bank-card p-3 bank-card-interactive flex items-center space-x-2.5 text-left group relative"
        >
          <div className="p-2 rounded-lg bg-[var(--accent-gold)] text-white group-hover:bg-[var(--accent-gold-hover)] transition shrink-0">
            <Vote className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-slate-900 group-hover:text-[var(--accent-gold)] transition">
              Voting & Policy
            </p>
            <p className="text-[10px] text-slate-500">All-member ballots</p>
          </div>
          {pendingRatifications.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--brand-primary)]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className="bank-card p-3 bank-card-interactive flex items-center space-x-2.5 text-left group"
        >
          <div className="p-2 rounded-lg bg-slate-100 text-slate-800 group-hover:bg-slate-200 transition shrink-0">
            <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
          </div>
          <div className="truncate">
            <p className="font-bold text-xs text-slate-900 group-hover:text-[var(--brand-primary)] transition">
              General Ledger
            </p>
            <p className="text-[10px] text-slate-500">Audited P&L statements</p>
          </div>
        </button>
      </div>

      {/* Unanimous Ratification Urgent Notice (If active) */}
      {pendingRatifications.length > 0 && (
        <div className="bank-card p-4 border-l-4 border-l-[var(--brand-primary)] bg-[var(--brand-tint)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)] bg-white px-2 py-0.5 rounded border border-rose-200">
                  Constitutional Requirement: Unanimous Ratification
                </span>
                <span className="text-[11px] text-rose-800 font-semibold">
                  {pendingRatifications.length} Action Pending All-Member Ratification
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {pendingRatifications[0]?.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Initiated by {pendingRatifications[0]?.initiatedBy}. Per club governance rules, all financial actions initiated by Executive Committee members must receive 100% unanimous approval from all 10 active members before execution.
              </p>
            </div>

            <button
              onClick={() => setActiveRatificationModalId(pendingRatifications[0]?.id)}
              className="px-3.5 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Coins className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
              <span>Review & Ratify Action</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Club Announcements & News Section (Dynamic & Manageable by Executive Committee) */}
      <div className="space-y-3">
        
        {/* Section Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-4 h-4 text-[var(--brand-primary)]" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
              Official Announcements & Club News
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredAnnouncements.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setAnnFilter('ALL')}
                className={`h-7 px-2.5 rounded-md text-xs transition ${
                  annFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAnnFilter('BEREAVEMENT')}
                className={`h-7 px-2.5 rounded-md text-xs transition ${
                  annFilter === 'BEREAVEMENT'
                    ? 'bg-white text-rose-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bereavement
              </button>
              <button
                onClick={() => setAnnFilter('INVESTMENT')}
                className={`h-7 px-2.5 rounded-md text-xs transition ${
                  annFilter === 'INVESTMENT'
                    ? 'bg-white text-[var(--accent-gold)] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Investments
              </button>
            </div>

            {/* Post Announcement Button (Executive Committee) */}
            <button
              onClick={handleOpenCreateAnn}
              className="h-8 px-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 shrink-0 shadow-xs"
              title="Post an official club announcement"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Post News</span>
              <span className="xs:hidden">Post</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && (
          <div className="bank-card p-6 text-center border-dashed border-2 border-slate-200 bg-slate-50/60 rounded-xl">
            <Megaphone className="w-7 h-7 text-slate-400 mx-auto mb-1.5 opacity-60" />
            <p className="text-xs font-bold text-slate-700">No Announcements in this category</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Switch filters or post a new announcement.</p>
          </div>
        )}

        {/* Dynamic Announcement Cards */}
        {filteredAnnouncements.map((ann) => {
          const isBereavement = ann.category?.toLowerCase().includes('bereave') || ann.category?.toLowerCase().includes('demise');
          const isInvestment = ann.category?.toLowerCase().includes('invest') || ann.category?.toLowerCase().includes('yield');

          return (
            <div
              key={ann.id}
              className={`bank-card p-4 transition ${
                isBereavement 
                  ? 'border-l-4 border-l-[var(--brand-primary)] bg-[var(--brand-tint)]/40'
                  : isInvestment 
                  ? 'border-l-4 border-l-[var(--accent-gold)] bg-white'
                  : 'border-l-4 border-l-slate-700 bg-white'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isBereavement 
                      ? 'bg-rose-100 text-[var(--brand-primary)]' 
                      : isInvestment 
                      ? 'bg-[var(--accent-gold-surface)] text-[var(--accent-gold)]' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isBereavement ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : isInvestment ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Megaphone className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isBereavement ? 'text-[var(--brand-primary)]' : isInvestment ? 'text-[var(--accent-gold)]' : 'text-slate-600'
                      }`}>
                        {ann.category}
                      </span>
                      <span className="text-[11px] text-slate-400">• {ann.date}</span>
                      {ann.priority && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          ann.priority === 'Urgent' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ann.priority}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                      {ann.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mt-1">
                      {ann.content}
                    </p>

                    <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Author: {ann.author}</span>
                    </div>

                    {ann.actionLabel && (
                      <div className="mt-2">
                        <button
                          onClick={() => setActiveTab(ann.actionTarget || 'marketplace')}
                          className={`inline-flex items-center space-x-1 text-xs font-bold hover:underline ${
                            isBereavement ? 'text-[var(--brand-primary)]' : 'text-[var(--accent-gold)]'
                          }`}
                        >
                          <span>{ann.actionLabel}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Executive Management Controls */}
                {isCurrentMemberExec && (
                  <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleOpenEditAnn(ann)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                      title="Edit Announcement"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnn(ann.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Financial Portfolio Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Members Deposits */}
        <div className="bank-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Deposits (C/F)
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono-num text-slate-900 mt-2">
            KES {totalMemberShares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {members.length} Member Accounts (Active Register)
          </p>
        </div>

        {/* Mansa X Special Funds */}
        <div className="bank-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Mansa X Funds
            </span>
            <span className="font-mono-num text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              ~20% p.a.
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono-num text-slate-900 mt-2">
            KES {Number(assets.mansaX.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5 font-mono-num">
            {Number(assets.mansaX.principal || 0) >= 1000 ? `${(Number(assets.mansaX.principal || 0) / 1000).toFixed(0)}k Principal` : `KES ${Number(assets.mansaX.principal || 0).toLocaleString()}`} + {Number(assets.mansaX.interestAccrued || 0).toLocaleString()} Yield
          </p>
        </div>

        {/* Etica Capital MMF */}
        <div className="bank-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Etica Capital MMF
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-md">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono-num text-slate-900 mt-2">
            KES {Number(assets.eticaMmf?.statementBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono-num">
            {assets.eticaMmf?.asOfDate ? `Statement ${assets.eticaMmf.asOfDate}` : 'Etica Capital MMF'}
          </p>
        </div>

        {/* Bank & Group Reserves */}
        <div className="bank-card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Bank & Reserve
            </span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-md">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-bold font-mono-num text-slate-900 mt-2">
            KES {(Number(assets.bankAccount?.balance || 0) + Number(assets.groupReserveAccount?.balance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono-num">
            Bank: {Number(assets.bankAccount?.balance || 0).toLocaleString()} • Reg Pool: {Number(assets.groupReserveAccount?.balance || 0).toLocaleString()}
          </p>
        </div>

      </div>

      {/* Asset Allocation Breakdown */}
      <div className="bank-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Group Capital Deployment & Liquidity
            </h3>
            <p className="text-[11px] text-slate-500 font-mono-num">
              Total Invested Funds: KES {totalAssetsValue.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('mmf')}
            className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center space-x-1"
          >
            <span>Statement Ops</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Corporate multi-segment bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${mansaXPercent}%` }} 
              className="bg-[var(--brand-primary)] h-full" 
              title={`Mansa X Special Funds: ${mansaXPercent}%`}
            />
            <div 
              style={{ width: `${eticaPercent}%` }} 
              className="bg-[var(--accent-gold)] h-full" 
              title={`Etica Capital MMF: ${eticaPercent}%`}
            />
            <div 
              style={{ width: `${bankPercent}%` }} 
              className="bg-[var(--accent-cyan)] h-full" 
              title={`Cash in Bank: ${bankPercent}%`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--brand-primary)] inline-block shrink-0"></span>
              <div className="truncate">
                <p className="font-bold text-slate-800">Mansa X (<span className="font-mono-num">{mansaXPercent}%</span>)</p>
                <p className="text-[10px] text-slate-500 font-mono-num">KES {assets.mansaX.totalBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-gold)] inline-block shrink-0"></span>
              <div className="truncate">
                <p className="font-bold text-slate-800">Etica MMF (<span className="font-mono-num">{eticaPercent}%</span>)</p>
                <p className="text-[10px] text-slate-500 font-mono-num">KES {assets.eticaMmf.statementBalance.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[var(--accent-cyan)] inline-block shrink-0"></span>
              <div className="truncate">
                <p className="font-bold text-slate-800">Bank (<span className="font-mono-num">{bankPercent}%</span>)</p>
                <p className="text-[10px] text-slate-500 font-mono-num">KES {assets.bankAccount.balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MGR Executive Committee Target Allocation Policy */}
        <div className="pt-3 border-t border-[var(--border-hairline)] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
              MGR Executive Committee Target Allocation Policy (Mansa-X Priority)
            </span>
            <span className="text-[10px] text-slate-500 font-mono-num">
              Mansa-X Target: ~20% p.a. • Etica MMF: 12.5% p.a.
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {COMMITTEE_TARGET_ALLOCATION.buckets.map((b, i) => (
              <div key={i} className="p-2.5 rounded bg-slate-50 border border-[var(--border-hairline)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono-num font-bold text-sm text-[var(--brand-primary)]">{b.targetPercent}%</span>
                  <span className="font-mono-num text-[10px] font-semibold px-1.5 py-0.5 rounded-xs bg-[var(--brand-tint)] text-[var(--brand-primary)]">
                    {b.projectedNetYield}
                  </span>
                </div>
                <p className="font-bold text-[11px] text-slate-900 mt-1 leading-tight">{b.assetClass}</p>
                <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2 leading-snug">{b.instruments}</p>
              </div>
            ))}
          </div>

          {/* CEO Diversification Principle Summary Strip */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                CEO Principle of Investment Diversification (John Kennedy Obalah — POL-006)
              </span>
              <button
                onClick={() => setActiveTab('mmf')}
                className="text-[10px] font-bold text-[var(--accent-gold)] hover:underline self-start sm:self-center"
              >
                View 6 Diversification Pillars &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
              {CEO_DIVERSIFICATION_DIRECTIVE.pillars.map((p, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-[var(--border-hairline)] flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[var(--accent-gold)] block">{p.code}</span>
                    <p className="font-bold text-slate-900 leading-snug mt-0.5">{p.institution}</p>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono-num mt-1 block truncate">{p.yieldBenchmark}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Member Standings Leaderboard */}
      <div className="bank-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Each Member Deposits & Yield Deposits Standings (C/F 30/10/2026)
            </h3>
            <p className="text-[11px] text-slate-500 font-mono-num">
              11 Official Member Accounts • Principal Deposits C/F: KES {totalMemberShares.toLocaleString()} • Total Assets: KES {(Number(assets.mansaX.totalBalance) + Number(assets.eticaMmf.statementBalance) + Number(assets.bankAccount.balance)).toLocaleString()} (Yield Surplus: +KES {Number(retainedSurplus || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </p>
          </div>
          <button
            onClick={() => setActiveTab('members')}
            className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center space-x-1"
          >
            <span>Full Register</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {(() => {
            const qualifyingPool = members
              .filter(m => m.id !== 'MGR-011' && (!m.joinedDate || m.joinedDate < '2026-10-01') && m.joinedDate !== 'Q4-2026')
              .reduce((s, m) => s + Number(m.shares || 0), 0);
            const totalYieldPool = Number(assets.mansaX?.interestAccrued || 41587) + 30931.74;

            return members
              .slice()
              .sort((a, b) => b.shares - a.shares)
              .slice(0, 6)
              .map((member, index) => {
                const sharePct = totalMemberShares > 0 ? (member.shares / totalMemberShares) * 100 : 0;
                const mDeps = member.depositHistory || [];
                const creditedYields = mDeps
                  .filter(d => d.type === 'Yield / Dividend Deposit')
                  .reduce((s, d) => s + Number(d.amount || 0), 0);
                const isQ4Member = member.id === 'MGR-011' || (member.joinedDate && member.joinedDate >= '2026-10-01') || member.joinedDate === 'Q4-2026';
                const accruedYield = isQ4Member
                  ? 0
                  : (qualifyingPool > 0 ? (Number(member.shares || 0) / qualifyingPool) * totalYieldPool : 0);
                const totalMemberYields = creditedYields + accruedYield;

                return (
                  <div 
                    key={member.id}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50/60 transition"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="font-bold font-mono-num text-xs text-slate-400 w-4 text-center">
                        {index + 1}
                      </span>
                      <MemberAvatarIcon
                        member={member}
                        size="md"
                      />
                      <div className="min-w-0 truncate">
                        <div className="flex items-center space-x-1.5">
                          <p className="font-semibold text-xs text-slate-900 truncate">
                            {member.name}
                          </p>
                          {member.status === 'Deceased' && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 px-1 rounded border border-rose-200">
                              Deceased
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {member.role} • {isCurrentMemberExec || member.id === currentMember?.id ? `${sharePct.toFixed(2)}% Equity Stake` : 'Confidential Stake'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <p className="font-bold font-mono-num text-xs text-slate-900">
                        Deps: {isCurrentMemberExec || member.id === currentMember?.id ? `KES ${member.shares.toLocaleString()}` : 'KES ••••••'}
                      </p>
                      <p className="text-[10px] font-bold font-mono-num text-emerald-700">
                        Yield Deps: {isCurrentMemberExec || member.id === currentMember?.id ? `+KES ${totalMemberYields.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '+KES ••••••'}
                      </p>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="bank-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Recent Accounting Postings
          </h3>
          <button
            onClick={() => setActiveTab('ledger')}
            className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center space-x-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {ledger.slice(0, 4).map((tx) => (
            <div key={tx.id} className="py-2 flex items-center justify-between">
              <div className="pr-2 min-w-0">
                <p className="font-medium text-slate-800 truncate">{tx.description}</p>
                <p className="text-[10px] text-slate-400"><span className="font-mono-num">{tx.date}</span> • {tx.debitAccount} to {tx.creditAccount}</p>
              </div>
              <span className="font-bold font-mono-num text-slate-900 shrink-0">
                KES {Number(tx.amount).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Post / Edit Announcement Modal */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[var(--brand-primary)] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-[var(--accent-gold-light)]" />
                <h3 className="font-bold text-base">
                  {editingAnnId ? 'Edit Official Announcement' : 'Post Official Club Announcement'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAnnModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnn} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Announcement Category
                  </label>
                  <select
                    value={annFormData.category}
                    onChange={(e) => setAnnFormData({ ...annFormData, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden font-medium"
                  >
                    <option value="Bereavement & Demise Notice">Bereavement & Demise Notice</option>
                    <option value="Investment & Yield Notice">Investment & Yield Notice</option>
                    <option value="Governance & Treasury">Governance & Treasury</option>
                    <option value="General Meeting / AGM">General Meeting / AGM</option>
                    <option value="Membership & Recruitment">Membership & Recruitment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Priority Level
                  </label>
                  <select
                    value={annFormData.priority}
                    onChange={(e) => setAnnFormData({ ...annFormData, priority: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                  >
                    <option value="Urgent">Urgent / High Priority</option>
                    <option value="Official Notice">Official Notice</option>
                    <option value="General">General News</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Announcement Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Governance or Treasury Notice"
                  value={annFormData.title}
                  onChange={(e) => setAnnFormData({ ...annFormData, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Date of Announcement
                </label>
                <input
                  type="date"
                  value={annFormData.date}
                  onChange={(e) => setAnnFormData({ ...annFormData, date: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Full Announcement Narrative <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write full notice details, instructions, or action items..."
                  value={annFormData.content}
                  onChange={(e) => setAnnFormData({ ...annFormData, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Action Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. View Estate Buyout Window"
                    value={annFormData.actionLabel}
                    onChange={(e) => setAnnFormData({ ...annFormData, actionLabel: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Action Target View
                  </label>
                  <select
                    value={annFormData.actionTarget}
                    onChange={(e) => setAnnFormData({ ...annFormData, actionTarget: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                  >
                    <option value="marketplace">Estate Buyout (Bereaved Member Shares)</option>
                    <option value="governance">Voting & Policy (Governance)</option>
                    <option value="members">Members Registry</option>
                    <option value="loans">Loan Facility (80%)</option>
                    <option value="mmf">MMF & Dividends</option>
                    <option value="ledger">Ledger & P&L</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  {editingAnnId ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
