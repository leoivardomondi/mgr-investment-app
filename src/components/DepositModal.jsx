import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getQuarterForDate } from '../data/initialData';
import { 
  X, 
  ArrowUpRight, 
  Wallet, 
  CheckCircle2, 
  Coins,
  Calendar,
  FileText,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function DepositModal({ isOpen, onClose }) {
  const { members, recordDeposit, showToast, currentMember } = useApp();

  const [selectedMemberId, setSelectedMemberId] = useState(currentMember.id);
  const [depositDate, setDepositDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [depositAmount, setDepositAmount] = useState('');
  const [targetFund, setTargetFund] = useState('Etica MMF');
  const [includeRegFee, setIncludeRegFee] = useState(() => {
    const tm = members.find(m => m.id === currentMember.id);
    return !tm?.regFeePaid;
  });
  const [transactionRef, setTransactionRef] = useState('');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [depositNotes, setDepositNotes] = useState('');

  if (!isOpen) return null;

  const attributedQuarter = getQuarterForDate(depositDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return;
    }

    if (!depositDate) {
      showToast('Please select the exact deposit date', 'error');
      return;
    }

    if (!transactionMessage.trim() && !transactionRef.trim()) {
      showToast('Transaction confirmation message / SMS reference must be attached for quarterly audit!', 'error');
      return;
    }

    const success = recordDeposit({
      memberId: selectedMemberId,
      amount,
      destination: targetFund,
      depositDate,
      transactionRef: transactionRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
      transactionMessage: transactionMessage.trim(),
      includeRegFee,
      notes: depositNotes
    });

    if (success) {
      setDepositAmount('');
      setTransactionRef('');
      setTransactionMessage('');
      setDepositNotes('');
      onClose();
    }
  };

  const targetMember = members.find(m => m.id === selectedMemberId) || currentMember;
  const numAmount = parseFloat(depositAmount) || 0;
  const regFeeDeduction = includeRegFee ? 1000.00 : 0.00;
  const netCreditedToShares = Math.max(0, numAmount - regFeeDeduction);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white max-w-lg w-full rounded-2xl p-5 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-lg">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Record Member Contribution & Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Attach deposit date and transaction SMS for quarterly MMF yield attribution
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-3 text-xs">
          
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Member Account *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedMemberId(newId);
                const tm = members.find(m => m.id === newId);
                setIncludeRegFee(!tm?.regFeePaid);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:border-[var(--brand-primary)]"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role}) — Shares: KES {m.shares.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Deposit Date & Quarter Attribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>Deposit Date *</span>
              </label>
              <input
                type="date"
                required
                value={depositDate}
                onChange={(e) => setDepositDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                <span>Attributed Quarter</span>
              </label>
              <div className="px-3 py-1.5 bg-[var(--accent-gold-surface)] border border-[var(--accent-gold-light)] rounded-lg text-xs font-bold text-[var(--brand-primary)] flex items-center justify-between">
                <span>{attributedQuarter} Principal</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  {attributedQuarter === 'Q3-2026' ? 'Q3 Interest Eligible' : attributedQuarter === 'Q4-2026' ? 'Qualifies Q4+' : 'Historic Inception'}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount (KES) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">KES</span>
              <input
                type="number"
                required
                min="500"
                step="100"
                placeholder="e.g. 17000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            {/* Quick buttons */}
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="text-[10px] text-slate-400">Quick:</span>
              {[1000, 5000, 10000, 17000, 40000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt.toString())}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 transition"
                >
                  KES {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Target Fund Destination */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Asset / MMF Destination *
            </label>
            <select
              value={targetFund}
              onChange={(e) => setTargetFund(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
            >
              <option value="Etica MMF">Etica Capital MMF (Current Savings & Deposit MMF)</option>
              <option value="Mansa X">Mansa X Special Funds (~20% High Yield Special Fund)</option>
              <option value="Bank">Cash in Bank (Equity Bank Chama Joint Account)</option>
            </select>
          </div>

          {/* Mandatory Transaction SMS / Reference */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                <span>Transaction SMS Message & Proof *</span>
              </label>
              <span className="text-[10px] bg-[var(--accent-gold-light)] text-[var(--brand-primary)] font-bold px-1.5 py-0.5 rounded">
                Required by Committee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  required
                  placeholder="M-Pesa / Bank Ref Code (e.g. QK891280LM)"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>
              <div className="text-[11px] text-slate-500 flex items-center">
                M-Pesa code or Bank transaction reference
              </div>
            </div>

            <textarea
              required
              rows={2}
              placeholder="Paste full M-Pesa or Bank SMS confirmation here (e.g. 'QK891280LM Confirmed. Ksh5,000 sent to ETICA CAPITAL LTD for account 34236M on ...')..."
              value={transactionMessage}
              onChange={(e) => setTransactionMessage(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 leading-snug focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          {/* Registration fee toggle */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRegFee}
                onChange={(e) => setIncludeRegFee(e.target.checked)}
                className="mt-0.5 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900">
                  Deduct KES 1,000/= Registration Fee (Not Part of Member Deposit)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The registration fee is credited non-refundable to the Group Incorporation Pool (2026) and will NOT be added to member deposit or share capital.
                </p>
              </div>
            </label>
          </div>

          {/* Net Breakdown */}
          {numAmount > 0 && (
            <div className="p-2.5 bg-[var(--accent-gold-surface)] rounded-lg border border-[var(--accent-gold-light)] text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Gross Payment Received:</span>
                <span className="font-bold text-slate-900">KES {numAmount.toLocaleString()}</span>
              </div>
              {includeRegFee && (
                <div className="flex justify-between text-rose-700 font-semibold">
                  <span>Deducted Non-Refundable Reg Fee:</span>
                  <span>- KES 1,000.00 (To 2026 Reg Pool)</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Net Credited to Member Deposit / Shares:</span>
                <span className="text-[var(--brand-primary)]">KES {netCreditedToShares.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5">
                Principal allocation will be tagged as <strong>{attributedQuarter}</strong> based on deposit date ({depositDate}).
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify & Attach to {attributedQuarter} Audit Trail</span>
          </button>

        </form>
      </div>
    </div>
  );
}
