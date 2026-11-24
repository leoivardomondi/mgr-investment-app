import React, { useState } from 'react';
import { useApp, EXECUTIVE_COMMITTEE } from '../context/AppContext';
import { 
  X, 
  Edit3, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Landmark, 
  Users, 
  HandCoins, 
  PlusCircle,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Lock
} from 'lucide-react';

export default function DataEditorModal({ isOpen, onClose }) {
  const { 
    members, 
    updateMember, 
    updateMemberNumber,
    deleteMember, 
    assets, 
    updateAssets, 
    retainedSurplus,
    ledger,
    addLedgerEntry, 
    updateLedgerEntry,
    deleteLedgerEntry,
    reconcileMemberDepositsToShares,
    addMemberDepositRecord,
    updateMemberDepositRecord,
    deleteMemberDepositRecord,
    getQuarterForDate,
    showToast,
    isCurrentMemberExec,
    currentMember,
    setCurrentMemberId
  } = useApp();

  const [activeTab, setActiveTab] = useState('members'); // 'members', 'deposits', 'assets', 'ledger'
  
  // Member edit state
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberForm, setEditMemberForm] = useState({});

  // Deposit messages reconciliation state
  const [selectedDepMemberId, setSelectedDepMemberId] = useState('MGR-001');
  const [editingDepId, setEditingDepId] = useState(null);
  const [depForm, setDepForm] = useState({
    date: '2026-05-01',
    amount: '',
    destination: 'Mansa X Special Funds',
    type: 'Share Capital',
    transactionRef: '',
    transactionMessage: '',
    attributedQuarter: 'Q2-2026'
  });

  // Ledger edit state
  const [editingLedgerId, setEditingLedgerId] = useState(null);
  const [editLedgerForm, setEditLedgerForm] = useState({});

  // Asset edit state
  const [assetForm, setAssetForm] = useState({
    mansaXPrincipal: assets.mansaX.principal,
    mansaXInterest: assets.mansaX.interestAccrued,
    eticaBalance: assets.eticaMmf.statementBalance,
    bankBalance: assets.bankAccount.balance,
    groupReserveBalance: assets.groupReserveAccount.balance
  });

  // New Ledger Entry State
  const [ledgerForm, setLedgerForm] = useState({
    description: '',
    debitAccount: 'Cash in Bank',
    creditAccount: 'Members Capital Pool',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  if (!isCurrentMemberExec) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-[var(--brand-primary)] text-white p-4.5 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-[var(--accent-gold-light)]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-base text-white">
                    Executive Access Barrier
                  </h3>
                  <span className="text-[10px] bg-[var(--accent-gold-light)] text-[var(--brand-primary)] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Secured
                  </span>
                </div>
                <p className="text-xs text-[var(--accent-gold-light)]/90 mt-0.5 font-medium">
                  Direct Record & Account Modification Protocol
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs text-slate-700">
            <div className="bg-[var(--brand-tint)] border border-[var(--brand-tint-border)] rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center space-x-2 text-[var(--brand-primary)] font-bold text-sm">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Restricted to MGR Executive Committee</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                You are currently signed in as <strong>{currentMember?.name}</strong> ({currentMember?.role} — {currentMember?.committeeRole || 'General Member'}). 
                Under club governance rules, updating other members' shares, modifying loans, adjusting fund balances (Mansa X, Etica MMF, Bank), or editing the accounting ledger can strictly only be performed by the 7 Executive Committee members.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Switch to Authorized Executive Committee Member:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                {EXECUTIVE_COMMITTEE.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => {
                      setCurrentMemberId(exec.id);
                      showToast(`Switched persona to ${exec.name} (${exec.role})`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-tint)] transition text-left group"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--brand-primary)] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {exec.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 group-hover:text-[var(--brand-primary)] text-xs truncate">
                          {exec.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {exec.role}
                        </p>
                      </div>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--brand-primary)] shrink-0 ml-1.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium">
              MGR Investment Club Security
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition"
            >
              Cancel & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleStartEditMember = (member) => {
    setEditingMemberId(member.id);
    setEditMemberForm({
      id: member.id,
      name: member.name,
      shares: member.shares,
      role: member.role,
      status: member.status,
      phone: member.phone || '',
      email: member.email || '',
      notes: member.notes || ''
    });
  };

  const handleSaveMember = async (memberId) => {
    const newId = (editMemberForm.id || '').trim();
    if (newId && newId !== memberId) {
      const res = await updateMemberNumber({ oldMemberId: memberId, newMemberId: newId });
      if (!res || !res.ok) {
        return;
      }
      updateMember(newId, editMemberForm);
    } else {
      updateMember(memberId, editMemberForm);
    }
    setEditingMemberId(null);
  };

  const handleSaveAssets = (e) => {
    e.preventDefault();
    const principal = parseFloat(assetForm.mansaXPrincipal) || 0;
    const interest = parseFloat(assetForm.mansaXInterest) || 0;
    const etica = parseFloat(assetForm.eticaBalance) || 0;
    const bank = parseFloat(assetForm.bankBalance) || 0;
    const reserve = parseFloat(assetForm.groupReserveBalance) || 0;

    updateAssets({
      mansaX: {
        ...assets.mansaX,
        principal,
        interestAccrued: interest,
        totalBalance: principal + interest
      },
      eticaMmf: {
        ...assets.eticaMmf,
        statementBalance: etica
      },
      bankAccount: {
        ...assets.bankAccount,
        balance: bank
      },
      groupReserveAccount: {
        ...assets.groupReserveAccount,
        balance: reserve
      }
    });
  };

  const handleAddLedger = (e) => {
    e.preventDefault();
    if (!ledgerForm.description.trim() || !ledgerForm.amount) {
      showToast('Please enter description and amount', 'error');
      return;
    }

    addLedgerEntry(ledgerForm);
    setLedgerForm({
      description: '',
      debitAccount: 'Cash in Bank',
      creditAccount: 'Members Capital Pool',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white max-w-4xl w-full rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-lg">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                MGR Club Data Management & Records Editor
              </h3>
              <p className="text-xs text-slate-500">
                Update, add, or correct any real member balances, asset accounts, and ledger postings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg my-3 shrink-0 overflow-x-auto">
          {[
            { id: 'members', label: `Edit Members & Shares (${members.length})`, icon: Users },
            { id: 'deposits', label: 'Match Deposit Messages', icon: CheckCircle2 },
            { id: 'assets', label: 'Edit Asset Accounts', icon: Landmark },
            { id: 'ledger', label: `Historical & Financial Moves (${ledger.length})`, icon: FileSpreadsheet },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition ${
                  isActive ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          
          {/* 1. EDIT MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Directly adjust member names, active shares, roles, or statuses:</span>
                <span className="font-bold text-[var(--brand-primary)]">Total: KES {members.reduce((s, m) => s + parseFloat(m.shares || 0), 0).toLocaleString()}</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2 px-2.5">ID</th>
                      <th className="py-2 px-2.5">Member Name</th>
                      <th className="py-2 px-2.5">Active Shares (KES)</th>
                      <th className="py-2 px-2.5">Role</th>
                      <th className="py-2 px-2.5">Status</th>
                      <th className="py-2 px-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {members.map(m => {
                      const isEditing = editingMemberId === m.id;

                      if (isEditing) {
                        return (
                          <tr key={m.id} className="bg-[var(--accent-gold-surface)]">
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                value={editMemberForm.id ?? m.id}
                                onChange={(e) => setEditMemberForm({ ...editMemberForm, id: e.target.value.trim() })}
                                className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-[var(--brand-primary)]"
                                placeholder="MGR-001"
                                title="Edit Member Registry ID / Number"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                value={editMemberForm.name}
                                onChange={(e) => setEditMemberForm({ ...editMemberForm, name: e.target.value })}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 font-semibold"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="number"
                                step="1"
                                value={editMemberForm.shares}
                                onChange={(e) => setEditMemberForm({ ...editMemberForm, shares: e.target.value })}
                                className="w-32 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 font-bold"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                value={editMemberForm.role}
                                onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value })}
                                className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <select
                                value={editMemberForm.status}
                                onChange={(e) => setEditMemberForm({ ...editMemberForm, status: e.target.value })}
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900"
                              >
                                <option value="Active">Active</option>
                                <option value="Deceased">Deceased</option>
                                <option value="Pending Approval">Pending Approval</option>
                              </select>
                            </td>
                            <td className="py-2 px-2.5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleSaveMember(m.id)}
                                className="px-2.5 py-1 bg-[var(--brand-primary)] text-white rounded font-bold text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingMemberId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-bold text-slate-400">{m.id}</td>
                          <td className="py-2 px-2.5 font-bold text-slate-900">
                            {m.name}
                          </td>
                          <td className="py-2 px-2.5 font-bold text-slate-900">
                            KES {Number(m.shares).toLocaleString()}
                          </td>
                          <td className="py-2 px-2.5 text-slate-600">{m.role}</td>
                          <td className="py-2 px-2.5">
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              m.status === 'Active'
                                ? 'bg-[var(--accent-emerald-surface)] text-[var(--accent-emerald)]'
                                : m.status === 'Deceased'
                                ? 'bg-rose-50 text-rose-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 text-right space-x-2">
                            <button
                              onClick={() => handleStartEditMember(m)}
                              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                            >
                              Edit
                            </button>
                            {members.length > 1 && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete member ${m.name}?`)) {
                                    deleteMember(m.id);
                                  }
                                }}
                                className="text-xs text-rose-600 hover:text-rose-800"
                                title="Remove member"
                              >
                                <Trash2 className="w-3.5 h-3.5 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 1B. MATCH MEMBER DEPOSIT MESSAGES TO STANDINGS */}
          {activeTab === 'deposits' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">Member Deposit Messages vs. Current Share Standings</p>
                  <p className="text-[11px] text-slate-500">
                    Ensure every member's old M-Pesa / Bank confirmation messages match their current shares carried forward (C/F).
                  </p>
                </div>
                <select
                  value={selectedDepMemberId}
                  onChange={(e) => {
                    setSelectedDepMemberId(e.target.value);
                    setEditingDepId(null);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                >
                  {members.map(m => {
                    const sumDeps = (m.depositHistory || []).filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee'))).reduce((s, d) => s + Number(d.amount || 0), 0);
                    const matched = Math.abs(Number(m.shares || 0) - sumDeps) < 0.01;
                    return (
                      <option key={m.id} value={m.id}>
                        {m.name} — Shares: KES {Number(m.shares).toLocaleString()} ({matched ? 'Matched' : `Diff: KES ${(m.shares - sumDeps).toLocaleString()}`})
                      </option>
                    );
                  })}
                </select>
              </div>

              {(() => {
                const targetM = members.find(m => m.id === selectedDepMemberId) || members[0];
                const depList = targetM.depositHistory || [];
                const sumShares = depList.filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee'))).reduce((s, d) => s + Number(d.amount || 0), 0);
                const principalDeposits = depList.filter(d => (!d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee'))) && d.type !== 'Yield / Dividend Deposit').reduce((s, d) => s + Number(d.amount || 0), 0);
                const yieldDeposits = depList.filter(d => d.type === 'Yield / Dividend Deposit').reduce((s, d) => s + Number(d.amount || 0), 0);
                const isQ4Member = targetM.id === 'MGR-011' || (targetM.joinedDate && targetM.joinedDate >= '2026-10-01') || targetM.joinedDate === 'Q4-2026';
                const qualifyingBase = members.filter(m => m.id !== 'MGR-011' && (!m.joinedDate || m.joinedDate < '2026-10-01') && m.joinedDate !== 'Q4-2026').reduce((s, m) => s + Number(m.shares || 0), 0);
                const accruedYield = isQ4Member ? 0 : (qualifyingBase > 0 ? (Number(targetM.shares || 0) / qualifyingBase) * Number(retainedSurplus || 0) : 0);
                const diff = Number(targetM.shares || 0) - sumShares;
                const isMatched = Math.abs(diff) < 0.01;

                return (
                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className="space-y-1">
                        <div>
                          <span className="font-bold">{targetM.name} ({targetM.id}):</span>{' '}
                          <span>Member Deposits = <strong>KES {principalDeposits.toLocaleString()}</strong></span>{' '}
                          <span>• Credited Yield Deposits = <strong>KES {yieldDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>{' '}
                          <span>• Accrued Q3 Yield = <strong>+KES {accruedYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                        </div>
                        <div className="text-[11px] opacity-90">
                          Total Recorded Share & Yield Messages = <strong>KES {sumShares.toLocaleString()}</strong> • Current Share Standing = <strong>KES {Number(targetM.shares).toLocaleString()}</strong>
                        </div>
                      </div>
                      {!isMatched ? (
                        <button
                          type="button"
                          onClick={() => reconcileMemberDepositsToShares(targetM.id)}
                          className="px-3 py-1 bg-[var(--brand-primary)] text-white rounded font-bold text-xs shrink-0"
                        >
                          Auto-Match Deposit Messages to Standings
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 bg-[#EDF1ED] text-[#1D3B2A] rounded border border-[#CCD7CD] font-bold text-[10px] uppercase shrink-0">
                          100% Matched
                        </span>
                      )}
                    </div>

                    {/* Add / Edit Deposit Message Form */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                      <p className="font-bold text-slate-900">
                        {editingDepId ? `Edit Deposit / Yield Record (${editingDepId})` : `Add Member Deposit or Yield Deposit for ${targetM.name}`}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Date</label>
                          <input
                            type="date"
                            value={depForm.date}
                            onChange={(e) => setDepForm({ ...depForm, date: e.target.value, attributedQuarter: getQuarterForDate(e.target.value) })}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Deposit Type</label>
                          <select
                            value={depForm.type || 'Share Capital'}
                            onChange={(e) => setDepForm({ ...depForm, type: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                          >
                            <option value="Share Capital">Member Share Deposit</option>
                            <option value="Yield / Dividend Deposit">Yield / Dividend Deposit</option>
                            <option value="Registration Fee">Registration Fee</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Amount (KES)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 11800"
                            value={depForm.amount}
                            onChange={(e) => setDepForm({ ...depForm, amount: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Destination</label>
                          <select
                            value={depForm.destination}
                            onChange={(e) => setDepForm({ ...depForm, destination: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                          >
                            <option value="Mansa X Special Funds">Mansa X Special Funds</option>
                            <option value="Etica Capital MMF">Etica Capital MMF</option>
                            <option value="Cash in Bank">Cash in Bank</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Ref Code</label>
                          <input
                            type="text"
                            placeholder="Ref Code"
                            value={depForm.transactionRef}
                            onChange={(e) => setDepForm({ ...depForm, transactionRef: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Confirmation SMS / Bank Message</label>
                        <input
                          type="text"
                          placeholder="Confirmed. Ksh ... sent to Mansa X Special Funds..."
                          value={depForm.transactionMessage}
                          onChange={(e) => setDepForm({ ...depForm, transactionMessage: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        {editingDepId && (
                          <button
                            type="button"
                            onClick={() => setEditingDepId(null)}
                            className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (editingDepId) {
                              updateMemberDepositRecord(targetM.id, editingDepId, depForm, true);
                              setEditingDepId(null);
                            } else {
                              addMemberDepositRecord(targetM.id, depForm, true);
                            }
                            setDepForm({
                              date: '2026-05-01',
                              amount: '',
                              destination: 'Mansa X Special Funds',
                              type: 'Share Capital',
                              transactionRef: '',
                              transactionMessage: '',
                              attributedQuarter: 'Q2-2026'
                            });
                          }}
                          className="px-3 py-1 bg-[var(--brand-primary)] text-white rounded text-xs font-bold"
                        >
                          {editingDepId ? 'Update Deposit Message & Sync Standing' : '+ Save Deposit Message & Sync Standing'}
                        </button>
                      </div>
                    </div>

                    {/* Existing Deposit Messages List */}
                    <div className="space-y-2">
                      {depList.map(dep => (
                        <div key={dep.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">{dep.date} • {dep.destination}</span>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded font-bold text-slate-700">{dep.type}</span>
                              <span className="font-mono text-[11px] text-slate-500">Ref: {dep.transactionRef}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono italic">"{dep.transactionMessage}"</p>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="font-bold text-[var(--brand-primary)]">KES {Number(dep.amount).toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingDepId(dep.id);
                                setDepForm({
                                  date: dep.date,
                                  amount: dep.amount,
                                  destination: dep.destination,
                                  type: dep.type || 'Share Capital',
                                  transactionRef: dep.transactionRef,
                                  transactionMessage: dep.transactionMessage,
                                  attributedQuarter: dep.attributedQuarter || 'Q2-2026'
                                });
                              }}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-semibold text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMemberDepositRecord(targetM.id, dep.id, true)}
                              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 rounded text-[10px] font-semibold text-rose-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 2. EDIT GROUP ASSETS */}
          {activeTab === 'assets' && (
            <form onSubmit={handleSaveAssets} className="space-y-4 max-w-xl mx-auto py-2">
              <p className="text-xs text-slate-600 leading-relaxed">
                Update the official account balances holding MGR Investment Club's financed assets:
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Mansa X Special Funds</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Principal Investment (KES)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={assetForm.mansaXPrincipal}
                      onChange={(e) => setAssetForm({ ...assetForm, mansaXPrincipal: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Interest Accrued (KES)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={assetForm.mansaXInterest}
                      onChange={(e) => setAssetForm({ ...assetForm, mansaXInterest: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Etica Capital MMF & Bank Account</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Etica MMF Statement Balance (KES)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={assetForm.eticaBalance}
                      onChange={(e) => setAssetForm({ ...assetForm, eticaBalance: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cash in Bank (Stanbic Operations)
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={assetForm.bankBalance}
                      onChange={(e) => setAssetForm({ ...assetForm, bankBalance: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Group Reserve / Subscription Pool</h4>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Group Reserve Balance (KES 1,000/= Registration Fees Pool)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={assetForm.groupReserveBalance}
                    onChange={(e) => setAssetForm({ ...assetForm, groupReserveBalance: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Save Group Asset Balances
              </button>
            </form>
          )}

          {/* 3. POST OR EDIT HISTORICAL FINANCIAL MOVES IN GENERAL LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-5 py-1">
              <form onSubmit={handleAddLedger} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-900">
                  Log New or Historical Financial Move (Double-Entry Ledger Adjustment)
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Description / Historical Narrative *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. May 2026 Mansa X Special Fund Transfer / Historical Adjustment"
                    value={ledgerForm.description}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Debit Account *</label>
                    <input
                      type="text"
                      required
                      value={ledgerForm.debitAccount}
                      onChange={(e) => setLedgerForm({ ...ledgerForm, debitAccount: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Credit Account *</label>
                    <input
                      type="text"
                      required
                      value={ledgerForm.creditAccount}
                      onChange={(e) => setLedgerForm({ ...ledgerForm, creditAccount: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount (KES) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 5000"
                      value={ledgerForm.amount}
                      onChange={(e) => setLedgerForm({ ...ledgerForm, amount: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Historical Date *</label>
                    <input
                      type="date"
                      required
                      value={ledgerForm.date}
                      onChange={(e) => setLedgerForm({ ...ledgerForm, date: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
                >
                  Post Financial Move to General Ledger
                </button>
              </form>

              {/* Existing Historical Ledger Moves Table (Editable & Deletable) */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-900">
                  Existing Historical Ledger Entries ({ledger.length} Records — Edit to Match Standings)
                </p>
                <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-64">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-[10px] font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="py-2 px-2.5">Date</th>
                        <th className="py-2 px-2.5">Description</th>
                        <th className="py-2 px-2.5">Debit / Credit</th>
                        <th className="py-2 px-2.5 text-right">Amount (KES)</th>
                        <th className="py-2 px-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {ledger.map(tx => {
                        if (editingLedgerId === tx.id) {
                          return (
                            <tr key={tx.id} className="bg-[var(--accent-gold-surface)]">
                              <td className="py-2 px-2">
                                <input
                                  type="date"
                                  value={editLedgerForm.date}
                                  onChange={(e) => setEditLedgerForm({ ...editLedgerForm, date: e.target.value })}
                                  className="px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px]"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  value={editLedgerForm.description}
                                  onChange={(e) => setEditLedgerForm({ ...editLedgerForm, description: e.target.value })}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px]"
                                />
                              </td>
                              <td className="py-2 px-2 space-y-1">
                                <input
                                  type="text"
                                  value={editLedgerForm.debitAccount}
                                  onChange={(e) => setEditLedgerForm({ ...editLedgerForm, debitAccount: e.target.value })}
                                  className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]"
                                  placeholder="Debit"
                                />
                                <input
                                  type="text"
                                  value={editLedgerForm.creditAccount}
                                  onChange={(e) => setEditLedgerForm({ ...editLedgerForm, creditAccount: e.target.value })}
                                  className="w-full px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]"
                                  placeholder="Credit"
                                />
                              </td>
                              <td className="py-2 px-2 text-right">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editLedgerForm.amount}
                                  onChange={(e) => setEditLedgerForm({ ...editLedgerForm, amount: e.target.value })}
                                  className="w-24 px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px] font-bold text-right"
                                />
                              </td>
                              <td className="py-2 px-2 text-right whitespace-nowrap space-x-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateLedgerEntry(tx.id, editLedgerForm);
                                    setEditingLedgerId(null);
                                  }}
                                  className="px-2 py-1 bg-[var(--brand-primary)] text-white rounded text-[10px] font-bold"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLedgerId(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px]"
                                >
                                  Cancel
                                </button>
                              </td>
                            </tr>
                          );
                        }
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[11px] text-slate-600">{tx.date}</td>
                            <td className="py-2 px-2.5 text-slate-900 font-medium">{tx.description}</td>
                            <td className="py-2 px-2.5 text-[10px] text-slate-500">
                              Dr: {tx.debitAccount} <br /> Cr: {tx.creditAccount}
                            </td>
                            <td className="py-2 px-2.5 text-right font-bold font-mono text-slate-900 whitespace-nowrap">
                              KES {Number(tx.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-2 px-2.5 text-right whitespace-nowrap space-x-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLedgerId(tx.id);
                                  setEditLedgerForm({
                                    date: tx.date,
                                    description: tx.description,
                                    debitAccount: tx.debitAccount,
                                    creditAccount: tx.creditAccount,
                                    amount: tx.amount
                                  });
                                }}
                                className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete ledger entry ${tx.id}?`)) {
                                    deleteLedgerEntry(tx.id);
                                  }
                                }}
                                className="text-[11px] text-rose-600 hover:underline"
                              >
                                Del
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
