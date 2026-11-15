import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageContextBanner from './PageContextBanner';
import { 
  HandCoins, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  FileText,
  Trash2,
  Edit3
} from 'lucide-react';

export default function LoansView({ onOpenDataEditor }) {
  const { 
    members, 
    loans, 
    currentMember, 
    issueLoan, 
    updateLoan,
    deleteLoan,
    addHistoricalLoan,
    assets,
    showToast,
    isCurrentMemberExec,
    triggerExecRestriction 
  } = useApp();

  const [selectedBorrowerId, setSelectedBorrowerId] = useState(currentMember.id);
  const [loanAmount, setLoanAmount] = useState('');
  const [fundingMode, setFundingMode] = useState('Group Treasury');
  const [funderMemberId, setFunderMemberId] = useState('MGR-001');
  const [loanNotes, setLoanNotes] = useState('');

  // Historical / Existing Loan Reconciliation State
  const [showHistoricalLoanForm, setShowHistoricalLoanForm] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState(null);
  const [histLoanForm, setHistLoanForm] = useState({
    borrowerId: 'MGR-001',
    principal: '',
    interestAmount: '',
    balanceRemaining: '',
    dateIssued: '2026-06-15',
    dueDate: '2026-12-15',
    fundingSource: 'Group Treasury',
    status: 'Settled / Repaid',
    notes: '',
    adjustCurrentBalances: false
  });

  const borrower = members.find(m => m.id === selectedBorrowerId) || currentMember;
  const maxBorrowable = borrower.shares * 0.80;
  const numLoanAmount = parseFloat(loanAmount) || 0;
  const exceeds80Percent = numLoanAmount > maxBorrowable;
  const interestAmount = numLoanAmount * 0.10; // 10% interest
  const totalRepayable = numLoanAmount + interestAmount;

  // Specific check for Richard Ruto
  const rutoMember = members.find(m => m.id === 'MGR-008') || { name: 'Richard Ruto', shares: 2540.00 };
  const rutoLoans = loans.filter(l => l.borrowerId === 'MGR-008');

  const handleApplyLoan = (e) => {
    e.preventDefault();

    if (selectedBorrowerId !== currentMember.id && !isCurrentMemberExec) {
      triggerExecRestriction(
        "Borrowing on Behalf of Another Member",
        "A member can strictly only apply for a loan against their own shares. Issuing or approving loans for other members is restricted to the Executive Committee."
      );
      return;
    }

    if (numLoanAmount <= 0) {
      showToast('Please enter a valid loan amount', 'error');
      return;
    }

    if (exceeds80Percent) {
      showToast(`Cannot exceed 80% ceiling (KES ${maxBorrowable.toLocaleString()})`, 'error');
      return;
    }

    if (fundingMode === 'Peer Member' && selectedBorrowerId === funderMemberId) {
      showToast('A member cannot fund their own peer loan', 'error');
      return;
    }

    const success = issueLoan({
      borrowerId: selectedBorrowerId,
      amount: numLoanAmount,
      fundingMode,
      funderMemberId: fundingMode === 'Peer Member' ? funderMemberId : null,
      notes: loanNotes
    });

    if (success) {
      setLoanAmount('');
      setLoanNotes('');
    }
  };

  const handleOpenDataEditor = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Update Club Loan & Financial Records",
        "Altering loan terms, balances, or collateral shares is strictly reserved for the 7 Executive Committee members."
      );
      return;
    }
    if (onOpenDataEditor) onOpenDataEditor();
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">

      {/* Visual Context Banner with Documentary Photography */}
      <PageContextBanner
        eyebrow="Section III • Member Credit Facility & Collateral Appraisal"
        title="Self-Guaranteed 80% Share Loans & Peer Liquidity"
        description="Active members may borrow up to 80% of their verified deposits carried forward. Under MGR Investment Club bylaws, a 10% facility fee is credited directly to the Group Reserve Account for collective growth and reserve building."
        imageUrl="/images/east_africa_sacco_group.jpg"
        imageAlt="East African Investment Club and Chama credit review meeting"
        imageCaption="MGR Investment Club Credit Appraisal • 80% Share Collateral & Zero External Debt"
        stats={[
          { label: "Your Eligible 80% Limit", value: `KES ${(currentMember.shares * 0.8).toLocaleString()}` },
          { label: "MGR Facility Fee", value: "10.0% Credited to Group Reserve" },
          { label: "Loan Protection Rule", value: "100% Share-Backed Collateral" }
        ]}
      />
      
      {/* Title & Policy Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Member Credit Facility & Loan Assessment
          </h2>
          <p className="text-xs text-slate-500">
            Automated compliance: Max 80% share ceiling & 10% interest directly credited to Group Account
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenDataEditor && (
            <button
              onClick={handleOpenDataEditor}
              className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded-md border border-slate-300 text-xs font-semibold flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Update Club Records</span>
            </button>
          )}
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-md border border-[var(--brand-tint-border)] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>80% Collateral Policy</span>
          </div>
        </div>
      </div>

      {/* Official Ruto & Member Loan Verification Notice */}
      <div className="bank-card p-3.5 border-l-4 border-l-[var(--brand-primary)] bg-[var(--accent-gold-surface)]">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-lg shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">
              Verified Club Financial Data: Does Richard Ruto Have a Loan?
            </h3>
            <p className="text-slate-700 leading-relaxed">
              <strong>Official Status: NO.</strong> As per the signed accounts update dated 30/10/2026 by CEO John Kennedy Obalah, 
              <strong> Richard Ruto has KES 0.00 in loans</strong>. His full deposit carried forward is <strong>KES 3,540.00</strong> (0.50% equity). 
              His 80% eligible borrowing limit is <strong>KES 2,832.00</strong>, with 100% of his shares unencumbered.
            </p>
          </div>
        </div>
      </div>

      {/* Main Loan Application Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Application Form */}
        <div className="lg:col-span-7 bank-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <HandCoins className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Issue / Process Loan Application</span>
          </h3>

          <form onSubmit={handleApplyLoan} className="space-y-3.5">
            
            {/* Borrower Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Borrower Member *
                </label>
                {!isCurrentMemberExec && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Locked to own account (Exec only can borrow for others)
                  </span>
                )}
              </div>
              {isCurrentMemberExec ? (
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  {members.filter(m => m.status === 'Active').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role}) — Shares: KES {m.shares.toLocaleString()} (Max Loan: KES {(m.shares * 0.8).toLocaleString()})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>{currentMember.name} ({currentMember.role}) — Shares: KES {currentMember.shares.toLocaleString()}</span>
                  <span className="text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-600 font-bold">Personal</span>
                </div>
              )}
            </div>

            {/* Requested Principal */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Loan Principal Amount (KES) *
                </label>
                <span className="text-[11px] font-semibold text-[var(--brand-primary)]">
                  Max Allowed (80%): KES {maxBorrowable.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">KES</span>
                <input
                  type="number"
                  required
                  min="500"
                  max={maxBorrowable}
                  step="100"
                  placeholder={`Up to ${maxBorrowable}`}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className={`w-full pl-11 pr-3 py-2 bg-slate-50 border rounded-lg text-xs font-bold text-slate-900 focus:outline-none ${
                    exceeds80Percent 
                      ? 'border-rose-500 bg-rose-50/20' 
                      : 'border-slate-200 focus:border-[var(--brand-primary)]'
                  }`}
                />
              </div>

              {exceeds80Percent && (
                <p className="text-[11px] text-rose-700 font-semibold mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Exceeds 80% ceiling! Maximum borrowable is KES {maxBorrowable.toLocaleString()}</span>
                </p>
              )}

              {/* Quick shortcut buttons */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] text-slate-400">Quick:</span>
                {[0.25, 0.50, 0.75, 0.80].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setLoanAmount(Math.floor(borrower.shares * ratio).toString())}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 transition"
                  >
                    {(ratio * 100)}% (KES {Math.floor(borrower.shares * ratio).toLocaleString()})
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Source / Peer Liquidity Option */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <label className="block text-xs font-semibold text-slate-800">
                Loan Liquidity Disbursement Channel
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className={`cursor-pointer p-2.5 rounded-lg border flex flex-col items-start transition ${
                  fundingMode === 'Group Treasury'
                    ? 'bg-white border-[var(--brand-primary)] text-slate-900 ring-1 ring-[var(--brand-primary)]'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="fundingMode"
                    value="Group Treasury"
                    checked={fundingMode === 'Group Treasury'}
                    onChange={() => setFundingMode('Group Treasury')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs">Group Treasury</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Funded from Bank or MMF cash
                  </span>
                </label>

                <label className={`cursor-pointer p-2.5 rounded-lg border flex flex-col items-start transition ${
                  fundingMode === 'Peer Member'
                    ? 'bg-white border-[var(--brand-primary)] text-slate-900 ring-1 ring-[var(--brand-primary)]'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="fundingMode"
                    value="Peer Member"
                    checked={fundingMode === 'Peer Member'}
                    onChange={() => setFundingMode('Peer Member')}
                    className="sr-only"
                  />
                  <span className="font-bold text-xs">Direct Member Cash</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Peer funds applicant directly
                  </span>
                </label>
              </div>

              {/* If Peer Funding Selected */}
              {fundingMode === 'Peer Member' && (
                <div className="pt-2 border-t border-slate-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center space-x-1 text-xs text-slate-800 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>Select Member Providing Direct Liquid Cash:</span>
                  </div>
                  <select
                    value={funderMemberId}
                    onChange={(e) => setFunderMemberId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
                  >
                    {members
                      .filter(m => m.id !== selectedBorrowerId && m.status === 'Active')
                      .map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role}) — Capital: KES {m.shares.toLocaleString()}
                        </option>
                      ))}
                  </select>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 leading-relaxed">
                    <strong>Double-entry rule:</strong> The applicant's loan collateral is instantly debited from their shares and credited to the payee ({members.find(m => m.id === funderMemberId)?.name}) who disbursed liquid cash.
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loan Purpose / Remarks
              </label>
              <input
                type="text"
                placeholder="e.g. Emergency liquidity / business financing"
                value={loanNotes}
                onChange={(e) => setLoanNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={exceeds80Percent || numLoanAmount <= 0}
              className={`w-full py-2 rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2 ${
                exceeds80Percent || numLoanAmount <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white'
              }`}
            >
              <span>Disburse Loan (Debit 10% to Group Account)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </form>
        </div>

        {/* Calculation Audit Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bank-card p-5 space-y-3.5">
            <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5 uppercase tracking-wider pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Loan Audit & Ledger Impact</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower Active Shares:</span>
                <span className="font-bold text-slate-900">KES {borrower.shares.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">80% Maximum Ceiling:</span>
                <span className="font-bold text-slate-900">KES {maxBorrowable.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Requested Principal:</span>
                <span className="font-bold text-slate-900">KES {numLoanAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between bg-[var(--brand-tint)] p-2 rounded-lg text-[var(--brand-primary)]">
                <span className="font-semibold">10% Group Interest Fee:</span>
                <span className="font-bold">+ KES {interestAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Total Loan Payable:</span>
                <span className="font-bold text-slate-900">KES {totalRepayable.toLocaleString()}</span>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">Accounting Protocol:</p>
                <p>• <strong>KES {interestAmount.toLocaleString()}</strong> is directly debited from member's shares and credited to the Group Account.</p>
                <p>• Remaining shares after debit: <strong>KES {Math.max(0, borrower.shares - interestAmount - (fundingMode === 'Peer Member' ? numLoanAmount : 0)).toLocaleString()}</strong></p>
              </div>

            </div>
          </div>

          {/* Group Reserve Status */}
          <div className="bank-card p-4 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900">Current Group Reserve Pool</h4>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Group Reserve Balance:</span>
              <span className="font-bold text-[var(--brand-primary)]">
                KES {assets.groupReserveAccount.balance.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Fueled by 10% loan interest fees + KES 1,000 non-refundable subscription fees.
            </p>
          </div>

        </div>

      </div>

      {/* Active Loans Record Registry & Committee Credit Schedule */}
      <div className="bank-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-slate-900">
                Single Unified Loan & Credit Standing Register
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[var(--brand-tint)] text-[var(--brand-primary)] border border-[var(--brand-tint-border)] uppercase tracking-wider">
                {isCurrentMemberExec ? 'Committee Full Register View' : 'Personal Loan View'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isCurrentMemberExec
                ? 'Centralized Executive Committee view of all member credit limits, encumbered shares, and active/historical loan balances'
                : 'Centralized view of your personal credit facility, eligible 80% share limit, and active loan status'}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {isCurrentMemberExec && (
              <button
                type="button"
                onClick={() => {
                  setEditingLoanId(null);
                  setHistLoanForm({
                    borrowerId: selectedBorrowerId || currentMember.id,
                    principal: '',
                    interestAmount: '',
                    balanceRemaining: '0',
                    dateIssued: '2026-06-15',
                    dueDate: '2026-09-15',
                    fundingSource: 'Group Treasury',
                    status: 'Settled / Repaid',
                    notes: 'Historical loan record entered to match current member standings.',
                    adjustCurrentBalances: false
                  });
                  setShowHistoricalLoanForm(prev => !prev);
                }}
                className="px-2.5 py-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded text-xs font-bold transition"
              >
                {showHistoricalLoanForm ? 'Close Form' : '+ Log Old / Past Loan Record'}
              </button>
            )}
            <span className="px-2.5 py-0.5 bg-slate-100 rounded text-xs font-semibold text-slate-700">
              {loans.filter(l => l.status === 'Active').length} Active • {loans.length} Total
            </span>
          </div>
        </div>

        {/* Historical Loan Entry or Existing Loan Edit Form (Executive Committee Only) */}
        {isCurrentMemberExec && (showHistoricalLoanForm || editingLoanId) && (
          <div className="p-4 bg-slate-50 rounded-xl border-2 border-[var(--brand-primary)] space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-sm text-[var(--brand-primary)]">
                {editingLoanId ? `Edit Loan Record (${editingLoanId}) to Match Current Standings` : 'Log Historical / Past Loan Record to Match Current Standings'}
              </span>
              {!editingLoanId && (
                <label className="flex items-center space-x-1.5 text-[11px] text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={histLoanForm.adjustCurrentBalances}
                    onChange={(e) => setHistLoanForm({ ...histLoanForm, adjustCurrentBalances: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span>Also debit 10% fee from current shares & credit Group Reserve</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Borrower Member</label>
                <select
                  value={histLoanForm.borrowerId}
                  onChange={(e) => setHistLoanForm({ ...histLoanForm, borrowerId: e.target.value })}
                  disabled={!!editingLoanId}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Principal (KES)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 5000"
                  value={histLoanForm.principal}
                  onChange={(e) => {
                    const p = e.target.value;
                    const calcFee = p ? (parseFloat(p) * 0.10).toFixed(2) : '';
                    setHistLoanForm({
                      ...histLoanForm,
                      principal: p,
                      interestAmount: calcFee
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">10% Group Fee (KES)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 500"
                  value={histLoanForm.interestAmount}
                  onChange={(e) => setHistLoanForm({ ...histLoanForm, interestAmount: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Current Balance (KES)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0 if settled"
                  value={histLoanForm.balanceRemaining}
                  onChange={(e) => setHistLoanForm({ ...histLoanForm, balanceRemaining: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date Issued</label>
                <input
                  type="date"
                  value={histLoanForm.dateIssued}
                  onChange={(e) => setHistLoanForm({ ...histLoanForm, dateIssued: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Due / Settled Date</label>
                <input
                  type="date"
                  value={histLoanForm.dueDate}
                  onChange={(e) => setHistLoanForm({ ...histLoanForm, dueDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Funding Source</label>
                <input
                  type="text"
                  value={histLoanForm.fundingSource}
                  onChange={(e) => setHistLoanForm({ ...histLoanForm, fundingSource: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Loan Standing Status</label>
                <select
                  value={histLoanForm.status}
                  onChange={(e) => {
                    const st = e.target.value;
                    setHistLoanForm({
                      ...histLoanForm,
                      status: st,
                      balanceRemaining: st === 'Settled / Repaid' ? '0' : histLoanForm.balanceRemaining
                    });
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold"
                >
                  <option value="Active">Active (Unpaid Balance)</option>
                  <option value="Settled / Repaid">Settled / Repaid (KES 0.00 Balance)</option>
                  <option value="Offset via Shares">Offset via Member Shares</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Reconciliation Notes / Repayment Proof</label>
              <input
                type="text"
                placeholder="e.g. Repaid via Stanbic transfer or offset against Q2 shares..."
                value={histLoanForm.notes}
                onChange={(e) => setHistLoanForm({ ...histLoanForm, notes: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowHistoricalLoanForm(false);
                  setEditingLoanId(null);
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingLoanId) {
                    updateLoan(editingLoanId, {
                      principal: parseFloat(histLoanForm.principal) || 0,
                      interestAmount: parseFloat(histLoanForm.interestAmount) || 0,
                      balanceRemaining: parseFloat(histLoanForm.balanceRemaining) || 0,
                      dateIssued: histLoanForm.dateIssued,
                      dueDate: histLoanForm.dueDate,
                      fundingSource: histLoanForm.fundingSource,
                      status: histLoanForm.status,
                      notes: histLoanForm.notes
                    });
                    setEditingLoanId(null);
                  } else {
                    const ok = addHistoricalLoan(histLoanForm);
                    if (ok) setShowHistoricalLoanForm(false);
                  }
                }}
                className="px-3.5 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded text-xs font-bold"
              >
                {editingLoanId ? 'Save Loan Standing Changes' : 'Save Historical Loan Record'}
              </button>
            </div>
          </div>
        )}

        {/* Executive Committee Full Member Credit Eligibility Table (or Personal Row for General Members) */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">Member Account</th>
                <th className="py-2 px-3">Committee / Role</th>
                <th className="py-2 px-3 text-right">Active Shares (KES)</th>
                <th className="py-2 px-3 text-right">80% Eligible Limit (KES)</th>
                <th className="py-2 px-3 text-right">Active Loan Balance</th>
                <th className="py-2 px-3 text-center">Collateral Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono-num">
              {(isCurrentMemberExec ? members.filter(m => m.status === 'Active') : [currentMember]).map((m) => {
                const memberActiveLoans = loans.filter(l => l.borrowerId === m.id && l.status === 'Active');
                const memberLoanBalance = memberActiveLoans.reduce((s, l) => s + (l.balanceRemaining || l.principal || 0), 0);
                const maxLimit = m.shares * 0.80;
                return (
                  <tr
                    key={m.id}
                    onClick={() => isCurrentMemberExec && setSelectedBorrowerId(m.id)}
                    className={`transition ${
                      selectedBorrowerId === m.id ? 'bg-[var(--accent-gold-surface)]' : 'hover:bg-slate-50'
                    } ${isCurrentMemberExec ? 'cursor-pointer' : ''}`}
                  >
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">
                      {m.name}
                      <span className="ml-1.5 text-[10px] font-mono-num text-slate-400 font-normal">({m.id})</span>
                    </td>
                    <td className="py-2 px-3 font-sans text-[11px] text-slate-600">
                      {m.role} • <span className="font-semibold text-slate-700">{m.committeeRole}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {m.shares.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[var(--brand-primary)]">
                      {maxLimit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {memberLoanBalance > 0 ? `KES ${memberLoanBalance.toLocaleString()}` : 'KES 0.00'}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      {memberLoanBalance > 0 ? (
                        <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Encumbered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          100% Unencumbered
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {loans.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-[var(--accent-emerald)] mx-auto" />
            <p className="font-bold text-xs text-slate-800">Zero Active Loans Across All Members</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Richard Ruto and all 11 members have KES 0.00 in loan liabilities. All member capital accounts are 100% unencumbered.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {(isCurrentMemberExec ? loans : loans.filter(l => l.borrowerId === currentMember.id)).map((loan) => (
              <div key={loan.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{loan.borrowerName}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.2 rounded">
                      {loan.status}
                    </span>
                    <span className="text-[10px] text-slate-400">{loan.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Issued: {loan.dateIssued} • Due: {loan.dueDate} • Source: <span className="font-semibold text-slate-700">{loan.fundingSource}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">{loan.notes}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right shrink-0 font-mono-num">
                    <p className="font-bold text-slate-900">
                      Principal: KES {Number(loan.principal || 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-[var(--brand-primary)] font-semibold">
                      Bal: KES {Number(loan.balanceRemaining ?? loan.principal ?? 0).toLocaleString()} (+10% Fee: KES {Number(loan.interestAmount || 0).toLocaleString()})
                    </p>
                  </div>
                  {isCurrentMemberExec && (
                    <div className="flex items-center space-x-1">
                      {loan.status === 'Active' && (
                        <button
                          onClick={() => updateLoan(loan.id, { status: 'Settled / Repaid', balanceRemaining: 0 })}
                          className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] font-bold hover:bg-emerald-100 transition"
                          title="Mark loan as fully repaid / settled"
                        >
                          Mark Settled
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowHistoricalLoanForm(false);
                          setEditingLoanId(loan.id);
                          setHistLoanForm({
                            borrowerId: loan.borrowerId,
                            principal: loan.principal,
                            interestAmount: loan.interestAmount,
                            balanceRemaining: loan.balanceRemaining ?? loan.principal ?? 0,
                            dateIssued: loan.dateIssued || '2026-06-15',
                            dueDate: loan.dueDate || '2026-12-15',
                            fundingSource: loan.fundingSource || 'Group Treasury',
                            status: loan.status || 'Active',
                            notes: loan.notes || '',
                            adjustCurrentBalances: false
                          });
                        }}
                        className="p-1 text-slate-500 hover:text-[var(--brand-primary)] transition"
                        title="Edit Loan Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete loan ${loan.id}?`)) {
                            deleteLoan(loan.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Loan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
