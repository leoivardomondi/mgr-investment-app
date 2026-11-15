import React from 'react';
import { useApp, EXECUTIVE_COMMITTEE } from '../context/AppContext';
import { ShieldAlert, ShieldCheck, UserCheck, X, Lock, CheckCircle2 } from 'lucide-react';

export default function ExecutivePrivilegeModal() {
  const { 
    execSecurityModal, 
    closeExecSecurityModal, 
    setCurrentMemberId, 
    currentMember 
  } = useApp();

  if (!execSecurityModal || !execSecurityModal.isOpen) return null;

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
                  Executive Committee Authority Required
                </h3>
                <span className="text-[10px] bg-[var(--accent-gold-light)] text-[var(--brand-primary)] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Governance Rule
                </span>
              </div>
              <p className="text-xs text-[var(--accent-gold-light)]/90 mt-0.5 font-medium">
                MGR Investment Club Constitution • Section 4.2
              </p>
            </div>
          </div>
          <button
            onClick={closeExecSecurityModal}
            className="text-white/70 hover:text-white p-1 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-slate-700">
          
          {/* Action details */}
          <div className="bg-[var(--brand-tint)] border border-[var(--brand-tint-border)] rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center space-x-2 text-[var(--brand-primary)] font-bold text-sm">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Restricted Action: {execSecurityModal.actionTitle || 'Club Modification'}</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {execSecurityModal.message || 
                'Any action that affects other members (such as approving memberships, altering member balances, distributing MMF yields, managing group loans, or editing the general ledger) can strictly only be performed by members of the Executive Committee.'}
            </p>
            <div className="pt-1 text-[11px] text-slate-500">
              Current Active Persona: <strong className="text-slate-800">{currentMember?.name}</strong> ({currentMember?.role} — {currentMember?.committeeRole || 'General Member'})
            </div>
          </div>

          {/* Authorized Executive Committee Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Authorized Executive Committee Members (7):</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Click any name to switch persona
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {EXECUTIVE_COMMITTEE.map((exec) => (
                <button
                  key={exec.id}
                  onClick={() => {
                    setCurrentMemberId(exec.id);
                    closeExecSecurityModal();
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

          {/* Information box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Why is this restriction enforced?</p>
            <p>
              To protect member shares and ensure fiduciary accountability, general members (e.g. Richard Ruto, Alice Tuei, Rev Moses Okwayo) can manage their personal profiles, view balances, apply for personal loans (up to 80%), and cast ballots on resolutions. Cross-member modifications and treasury disbursements require Executive Committee sign-off.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium">
            MGR Investment Club Governance System
          </span>
          <button
            onClick={closeExecSecurityModal}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
