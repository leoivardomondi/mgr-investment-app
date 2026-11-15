import React from 'react';
import {
  ShieldCheck,
  Scale,
  Lock,
  FileText,
  CheckCircle2,
  X
} from 'lucide-react';

export default function PrivacyCharterModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="mgr-glass-header text-white p-5 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[var(--accent-gold-light)]" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                <span>Privacy &amp; Data Protection Charter</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  Kenya DPA 2019
                </span>
              </h2>
              <p className="text-xs text-white/75">
                Constitution of Kenya (Art. 31) &amp; MGR Club Confidentiality Bylaws
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          
          {/* Constitutional Anchor Alert */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>1.0 Constitutional Foundation — Article 31, Constitution of Kenya 2010</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-900/90 italic pl-6">
              "Every person has the right to privacy, which includes the right not to have— (c) information relating to their family or private affairs unnecessarily required or revealed; or (d) the privacy of their communications infringed."
            </p>
            <p className="text-[11px] text-emerald-800 pl-6">
              MGR Investment Group operates with strict fidelity to Article 31, ensuring that personal identities, financial contributions, and KYC records remain sovereign to each member.
            </p>
          </div>

          {/* Data Protection Act 2019 Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>2.0 Statutory Compliance — Kenya Data Protection Act, 2019</span>
            </h3>
            <p>
              In accordance with Act No. 24 of 2019 and regulations set by the Office of the Data Protection Commissioner (ODPC) Kenya, MGR Club serves as a responsible Data Controller and Data Fiduciary for all member records.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Lawfulness &amp; Fairness</span>
                <span className="text-[11px] text-slate-600">Personal data is processed strictly to maintain accurate share capital, credit eligibility, and audited financial statements.</span>
              </div>
              <div className="div-card p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Purpose Limitation</span>
                <span className="text-[11px] text-slate-600">Member details are never sold, rented, monetized, or shared with unauthorized commercial 3rd parties.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Data Minimization</span>
                <span className="text-[11px] text-slate-600">Only regulatory KYC proofs required for joint Chama banking (Equity Bank Kenya) and MMF compliance are collected.</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">Integrity &amp; Confidentiality</span>
                <span className="text-[11px] text-slate-600">All uploaded documents are encrypted and locked behind user-controlled cryptographic authorization keys.</span>
              </div>
            </div>
          </div>

          {/* Member PIN Protection Mechanism */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
              <Lock className="w-4 h-4 text-amber-700 shrink-0" />
              <span>3.0 The Dual-Key Access Model: User Account PIN Gate</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Unlike traditional systems where system administrators have unrestricted access to confidential files, MGR Club enforces a <strong>Zero-Knowledge Member Authorization Gate</strong>:
            </p>
            <ul className="space-y-1.5 text-[11px] text-amber-950 pl-5 list-disc">
              <li>
                <strong>Sensitive Legal Files:</strong> Your National ID, Passport Photograph, KRA PIN Certificate, and signed Club Membership agreements are placed in a locked vault.
              </li>
              <li>
                <strong>Executive Access Requirement:</strong> Even the Chairman, CEO, or Treasurer <em>cannot view or download</em> your uploaded legal documents unless you explicitly provide them with your 4-digit Account Security PIN.
              </li>
              <li>
                <strong>Audit Trail Logging:</strong> Every time an executive enters your PIN to access documents, an immutable security event is recorded in the official audit trail with the officer's name, timestamp, and IP address.
              </li>
            </ul>
          </div>

          {/* Member Rights */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>4.0 Your Rights as a Data Subject</span>
            </h3>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <p>• <strong>Right of Access:</strong> You can inspect, download, or review all your financial records and uploaded documents at any time.</p>
              <p>• <strong>Right to Rectify:</strong> You may update your phone number, email address, next of kin, or replace uploaded documents whenever circumstances change.</p>
              <p>• <strong>Right to Revoke:</strong> You can change your Account PIN at any moment from your portal profile, instantly invalidating any prior executive access permission.</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compliant with ODPC Kenya Guidelines &amp; LLP Act</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs transition cursor-pointer"
          >
            I Understand &amp; Agree
          </button>
        </div>

      </div>
    </div>
  );
}
