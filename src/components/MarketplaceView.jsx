import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageContextBanner from './PageContextBanner';
import MemberAvatarIcon from './MemberAvatarIcon';
import { 
  ShieldAlert, 
  ShoppingBag, 
  Calculator, 
  ArrowRight
} from 'lucide-react';

export default function MarketplaceView() {
  const { 
    members, 
    currentMember, 
    purchaseDeceasedShares, 
    showToast,
    totalMemberShares,
    isCurrentMemberExec,
    triggerExecRestriction
  } = useApp();

  const deceasedMember = members.find(m => m.status === 'Deceased') || {
    id: "MGR-007",
    name: "Frederick Ongule Seunda",
    shares: 13019.00,
    deceasedDate: "11th September 2026",
    beneficiaryName: "Beneficiary of Late Frederick Ongule Seunda",
    sharesForSale: 13019.00,
    sharesSold: 0.00
  };

  const availableShares = Math.max(0, deceasedMember.shares);
  const sharesSoldToMembers = (deceasedMember.sharesSold || 0);

  const [buyerMemberId, setBuyerMemberId] = useState(currentMember.status === 'Active' ? currentMember.id : 'MGR-001');
  const [purchaseAmount, setPurchaseAmount] = useState('');

  const numPurchase = parseFloat(purchaseAmount) || 0;
  const buyer = members.find(m => m.id === buyerMemberId) || currentMember;

  // Beneficiary exit clause calculations (Net of KES 1,000 non-refundable registration fee)
  const terminalShareValue = deceasedMember.shares || 13019.00;
  const estimatedAccruedInterest = 1145.00;
  const liabilitiesDeduction = 0.00;
  const totalBeneficiaryDues = terminalShareValue + estimatedAccruedInterest - liabilitiesDeduction;

  const handlePurchaseShares = (e) => {
    e.preventDefault();

    if (buyerMemberId !== currentMember.id && !isCurrentMemberExec) {
      triggerExecRestriction(
        "Purchasing Shares for Another Member",
        "A member can only purchase shares for their own account. Authorizing or allocating share transfers for other members is restricted to the Executive Committee."
      );
      return;
    }

    if (numPurchase <= 0) {
      showToast('Please enter a valid amount of shares to purchase', 'error');
      return;
    }

    if (numPurchase > availableShares) {
      showToast(`Cannot purchase more than available shares (KES ${availableShares.toLocaleString()})`, 'error');
      return;
    }

    const success = purchaseDeceasedShares({
      buyerId: buyerMemberId,
      sharesToBuy: numPurchase
    });

    if (success) {
      setPurchaseAmount('');
    }
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">

      {/* Visual Context Banner with Documentary Photography */}
      <PageContextBanner
        eyebrow="Section V • Bereavement Protocol & Estate Settlement"
        title="Internal Estate Share Acquisition & Beneficiary Escrow"
        description="When a fellow member passes away, this page calculates their full terminal dues (principal shares plus pro-rata interest) and allows active members to purchase the estate's shares at 1:1 par value so 100% cash is released to the family beneficiary without breaking our 6-month MMF/Mansa-X lock-in."
        imageUrl="/images/african_family_reunion.jpg"
        imageAlt="African family parents and child protected by cooperative estate succession"
        imageCaption="African Family Stewardship • Dignified 1:1 Par Value Family Settlement"
        stats={[
          { label: "Estate Principal (MGR-007)", value: `KES ${deceasedMember.shares.toLocaleString()}` },
          { label: "Accrued Q3 Yield", value: "KES 1,145.00" },
          { label: "Total Beneficiary Payout", value: `KES ${totalBeneficiaryDues.toLocaleString()}` }
        ]}
      />
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Estate Share Acquisition & Exit Clause Portal
          </h2>
          <p className="text-xs text-slate-500">
            Bereavement protocol, beneficiary terminal dues calculator, and internal member share buyout
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-50 text-rose-800 rounded-md border border-rose-200 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
          <span>Exit Clause Policy Active</span>
        </div>
      </div>

      {/* Bereavement Notice & Beneficiary Protocol */}
      <div className="bank-card p-4 border-l-4 border-l-rose-800 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <MemberAvatarIcon
              member={deceasedMember}
              memberId="MGR-007"
              status="Deceased"
              size="xl"
              className="border-rose-300"
            />
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-wider">
                  Deceased Member Account
                </span>
                <span className="text-xs text-slate-500">Member No: {deceasedMember.id}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Late {deceasedMember.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deceased date: <strong>11th September 2026</strong>. 
                In compliance with the MGR constitution exit clause, terminal dues are scheduled for payout to designated beneficiary at financial year end.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-right shrink-0">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Estate Shareholding</p>
            <p className="text-base font-bold text-rose-900 mt-0.5">
              KES {deceasedMember.shares.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">
              {(deceasedMember.shares / totalMemberShares * 100).toFixed(2)}% of Club Capital
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Buyout Form */}
        <div className="lg:col-span-7 bank-card p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Acquire Estate Shares</span>
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              {availableShares > 0 ? 'Open for Internal Acquisition' : 'Fully Acquired'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Active members may purchase Frederick's shares at face value (1:1). 
            Purchased shares are transferred immediately to the buyer's capital account, and liquidation proceeds are held in escrow for prompt settlement to the beneficiary.
          </p>

          <form onSubmit={handlePurchaseShares} className="space-y-3 pt-1">
            
            {/* Purchasing Member Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Purchasing Member *
                </label>
                {!isCurrentMemberExec && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    Locked to own account (Exec only can transfer for others)
                  </span>
                )}
              </div>
              {isCurrentMemberExec ? (
                <select
                  value={buyerMemberId}
                  onChange={(e) => setBuyerMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  {members.filter(m => m.status === 'Active').map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role}) — Current Shares: KES {m.shares.toLocaleString()}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>{currentMember.name} ({currentMember.role}) — Current Shares: KES {currentMember.shares.toLocaleString()}</span>
                  <span className="text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-600 font-bold">Personal</span>
                </div>
              )}
            </div>

            {/* Shares to Acquire */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Shares to Acquire (KES) *
                </label>
                <span className="text-[11px] font-semibold text-[var(--brand-primary)]">
                  Available: KES {availableShares.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">KES</span>
                <input
                  type="number"
                  required
                  min="500"
                  max={availableShares}
                  step="100"
                  placeholder={`Up to ${availableShares}`}
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              {/* Quick shortcut buttons */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] text-slate-400">Quick:</span>
                {[1000, 2500, 5000, availableShares].filter(amt => amt <= availableShares && amt > 0).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPurchaseAmount(amt.toString())}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-700 transition"
                  >
                    KES {amt.toLocaleString()} {amt === availableShares ? '(All)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Impact Preview */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>{buyer.name}'s New Shareholding:</span>
                <span className="text-[var(--brand-primary)] font-bold">
                  KES {(buyer.shares + numPurchase).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Remaining Frederick Shares:</span>
                <span>KES {Math.max(0, availableShares - numPurchase).toLocaleString()}</span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={availableShares <= 0 || numPurchase <= 0 || numPurchase > availableShares}
              className={`w-full py-2 rounded-lg font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2 ${
                availableShares <= 0 || numPurchase <= 0 || numPurchase > availableShares
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white'
              }`}
            >
              <span>Confirm Share Purchase & Reallocate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </form>
        </div>

        {/* Beneficiary Calculator */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bank-card p-5 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 flex items-center space-x-1.5 uppercase tracking-wider pb-2 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Beneficiary Settlement Ledger</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[170px] truncate">
                  {deceasedMember.beneficiaryName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Base Capital Deposits:</span>
                <span className="font-bold text-slate-900">KES {terminalShareValue.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Accrued Interest (Pro-Rata):</span>
                <span className="font-bold text-slate-900">+ KES {estimatedAccruedInterest.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Liabilities / Loans:</span>
                <span className="font-semibold text-slate-600">- KES {liabilitiesDeduction.toLocaleString()}</span>
              </div>

              <div className="flex justify-between bg-slate-50 p-2 rounded border border-slate-200">
                <span className="font-bold text-slate-800 text-xs">Total Dues at FY-End:</span>
                <span className="font-bold text-[var(--brand-primary)] text-xs">
                  KES {totalBeneficiaryDues.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 space-y-0.5 leading-relaxed">
                <p className="font-bold text-slate-700">Exit Policy Clause Note:</p>
                <p>
                  Settlement will occur upon closing of the 2026 financial year books, either directly from the group treasury or via the internal member share buyout proceeds above.
                </p>
              </div>

            </div>
          </div>

          {/* Shares Sold Tracking */}
          <div className="bank-card p-3.5 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-900">Internal Acquisition Progress</h4>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                style={{ width: `${(sharesSoldToMembers / terminalShareValue) * 100}%` }}
                className="bg-[var(--brand-primary)] h-full"
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Sold: KES {sharesSoldToMembers.toLocaleString()}</span>
              <span>Available: KES {availableShares.toLocaleString()}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
