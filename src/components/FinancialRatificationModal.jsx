import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  X, 
  Send, 
  AlertTriangle, 
  FileCheck2, 
  Users, 
  Coins, 
  Landmark,
  CheckCheck,
  ArrowRight
} from 'lucide-react';

export default function FinancialRatificationModal() {
  const { 
    members, 
    currentMember, 
    pendingFinancialActions, 
    activeRatificationModalId, 
    setActiveRatificationModalId, 
    approveFinancialAction, 
    fastTrackAllApprovals,
    sendRatificationReminders
  } = useApp();

  if (!activeRatificationModalId) return null;

  const action = pendingFinancialActions.find(a => a.id === activeRatificationModalId);
  if (!action) return null;

  const activeMembers = members.filter(m => m.status === 'Active');
  const totalRequired = activeMembers.length;
  const approvalsCount = action.approvals?.length || 0;
  const isFullyRatified = approvalsCount >= totalRequired;
  const hasCurrentMemberApproved = action.approvals?.includes(currentMember.id);
  const percentComplete = Math.min(100, Math.round((approvalsCount / totalRequired) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[var(--brand-primary)] text-white p-3.5 sm:p-5 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-gold-light)]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight truncate">
                Financial Action Ratification
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--accent-gold-light)]/90 mt-0.5 font-medium leading-normal truncate">
                MGR Constitution: All {totalRequired} active members must approve before execution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => !isFullyRatified && fastTrackAllApprovals(action.id)}
              disabled={isFullyRatified}
              className={`h-8 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition whitespace-nowrap shrink-0 shadow-xs cursor-pointer ${
                isFullyRatified
                  ? 'bg-emerald-500 text-slate-950 cursor-default'
                  : 'bg-[var(--accent-gold-light)] hover:brightness-105 text-[var(--brand-primary)] active:scale-95'
              }`}
              title={isFullyRatified ? 'All 10 members ratified' : 'Click to sign for all 10 members and execute'}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{isFullyRatified ? 'Fully Ratified' : 'Unanimous Approval Required'}</span>
              <span className="sm:hidden">{isFullyRatified ? 'Ratified' : 'Unanimous Approval'}</span>
            </button>
            <button
              onClick={() => setActiveRatificationModalId(null)}
              className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition shrink-0 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
          
          {/* Action Details Card */}
          <div className="bg-[var(--accent-gold-surface)] border border-[var(--accent-gold-light)] rounded-xl p-4 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                  {action.category} • Action Ref {action.id}
                </span>
                <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                  {action.title}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Total Financial Impact</span>
                <span className="text-base font-bold text-[var(--brand-primary)]">
                  KES {Number(action.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {action.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
              <div>
                Initiated By: <strong className="text-slate-800">{action.initiatedBy}</strong>
              </div>
              <div>
                Date Initiated: <strong className="text-slate-800">{action.dateInitiated}</strong>
              </div>
            </div>
          </div>

          {/* Unanimous Ratification Progress */}
          <div className="bank-card p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center space-x-1.5 text-slate-800">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Approval Progress (100% Consensus Required):</span>
              </span>
              <span className="font-bold text-[var(--brand-primary)]">
                {approvalsCount} of {totalRequired} Active Members ({percentComplete}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div 
                className={`h-full transition-all duration-300 ${
                  isFullyRatified ? 'bg-emerald-600' : 'bg-[var(--brand-primary)]'
                }`}
                style={{ width: `${percentComplete}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 italic">
              {isFullyRatified 
                ? 'All 10 members have approved. This financial transaction is fully executed and committed to the general ledger.'
                : `Execution is locked until all ${totalRequired} members approve. Currently ${totalRequired - approvalsCount} member(s) pending.`}
            </p>
          </div>

          {/* Member Voting Roster (All 10 Active Members) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Active Member Approval Status ({totalRequired} Members):</span>
              </span>
              {!isFullyRatified && (
                <button
                  onClick={() => sendRatificationReminders(action.id)}
                  className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Reminders to Pending</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
              {activeMembers.map(m => {
                const hasApproved = action.approvals?.includes(m.id);
                const isCurrent = m.id === currentMember.id;

                return (
                  <div 
                    key={m.id} 
                    className={`px-3 py-2 flex items-center justify-between text-xs transition ${
                      isCurrent ? 'bg-[var(--brand-tint)]' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg font-bold text-[10px] flex items-center justify-center shrink-0 ${
                        hasApproved 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {m.avatar}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-slate-900 truncate">{m.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-[var(--brand-primary)] text-white px-1.5 py-0.2 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {m.role} • KES {Number(m.shares).toLocaleString()} shares
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasApproved ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[10px]">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions for Current Member */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs">
                Your Vote as {currentMember.name}:
              </span>
              {hasCurrentMemberApproved ? (
                <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You have already approved this action</span>
                </span>
              ) : (
                <button
                  onClick={() => approveFinancialAction(action.id, currentMember.id)}
                  className="px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold-light)]" />
                  <span>Approve & Sign Off (as {currentMember.name.split(' ')[0]})</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {!isFullyRatified ? (
            <button
              onClick={() => fastTrackAllApprovals(action.id)}
              className="w-full sm:w-auto h-9 px-3.5 bg-[var(--accent-gold-surface)] hover:bg-amber-100/70 text-[var(--accent-gold)] border border-[var(--accent-gold-light)] rounded-lg font-bold text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Collect approvals for all remaining pending members and execute immediately"
            >
              <CheckCheck className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Sign for All Remaining Members (10/10)</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Transaction Executed &amp; Reconciled</span>
            </span>
          )}

          <button
            onClick={() => setActiveRatificationModalId(null)}
            className="w-full sm:w-auto h-9 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center justify-center cursor-pointer"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
}
