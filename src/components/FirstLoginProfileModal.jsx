import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MemberAvatarIcon from './MemberAvatarIcon';
import {
  Smartphone,
  Hash,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export default function FirstLoginProfileModal({ isOpen, onClose }) {
  const {
    authenticatedUser,
    currentMember,
    members,
    updateUserProfile,
    showToast
  } = useApp();

  const activeMemberId = authenticatedUser?.memberId || currentMember?.id || 'MGR-001';
  const initialActiveMember = members.find(m => m.id === activeMemberId) || currentMember || {};

  const [memberId, setMemberId] = useState(activeMemberId);
  const [phone, setPhone] = useState(authenticatedUser?.phone || initialActiveMember.phone || '');
  const [email, setEmail] = useState(authenticatedUser?.email || initialActiveMember.email || '');
  const [accountPin, setAccountPin] = useState(authenticatedUser?.accountPin || initialActiveMember.accountPin || '1234');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const activeMember = members.find(m => m.id === memberId) || currentMember || {};

  // Normalize Kenyan phone numbers
  const handlePhoneChange = (val) => {
    setErrorMsg('');
    setPhone(val);
  };

  const formatKenyanPhone = (raw) => {
    let cleaned = raw.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '+254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254') && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+254') && cleaned.length > 0 && !cleaned.startsWith('+')) {
      cleaned = '+254' + cleaned;
    }
    return cleaned;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const formattedPhone = formatKenyanPhone(phone.trim());
    const digitsOnly = formattedPhone.replace(/\D/g, '');

    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile phone number to continue.');
      return;
    }

    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      setErrorMsg('Please enter a valid mobile number (e.g. 0712 345 678 or +254 712 345 678).');
      return;
    }

    if (!memberId.trim()) {
      setErrorMsg('Please confirm your Member Number (e.g. MGR-001 through MGR-011).');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserProfile({
        phone: formattedPhone,
        memberId: memberId.trim().toUpperCase(),
        email: email.trim(),
        accountPin: accountPin.trim()
      });

      setLoading(false);
      if (res && res.ok) {
        if (onClose) onClose();
      } else {
        setErrorMsg(res?.error || 'Could not save profile details.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('An unexpected error occurred while saving profile.');
    }
  };

  const handleSkip = () => {
    if (authenticatedUser?.memberId) {
      localStorage.setItem(`mgr_first_login_dismissed_${authenticatedUser.memberId}`, 'true');
    }
    if (onClose) onClose();
    showToast('You can add your phone number anytime from your profile in the top menu.', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[#244833] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            title="Skip for now"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-gold)] text-slate-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Member Setup
            </span>
            <span className="text-white/60 text-xs">• First Sign-In Verification</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            Welcome, {activeMember.name || authenticatedUser?.name || 'Member'}!
          </h2>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            Please add your official mobile phone number and confirm your Member Number to complete your investment club account setup.
          </p>
        </div>

        {/* Member Profile Summary Card */}
        <div className="px-5 sm:px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MemberAvatarIcon member={activeMember} size="md" />
            <div>
              <p className="text-xs font-bold text-slate-900">{activeMember.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeMember.role || 'Member'} • <span className="font-mono font-bold text-[var(--brand-primary)]">{memberId || activeMember.id}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" />
              Registered Shareholder
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member Number Confirmation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                Member Number (Member ID) <span className="text-rose-600">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Official Register ID</span>
            </label>
            <div className="relative">
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name} ({m.role || 'Member'})
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Select or confirm your assigned MGR membership identifier from the register.
            </p>
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                Mobile Phone Number (M-Pesa / Safaricom) <span className="text-rose-600">*</span>
              </span>
              <span className="text-[10px] text-[var(--brand-primary)] font-semibold">Required</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="e.g. 0712 345 678 or +254 712 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)] font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used for automated M-Pesa deposit matching, transaction alerts, and urgent Chama voting dispatches.
            </p>
          </div>

          {/* Optional Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address (Optional)
              </span>
              <span className="text-[10px] text-slate-400">Monthly PDF Statements</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. personal.email@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Provide your personal email if you wish to receive audited monthly statements and executive meeting notices.
            </p>
          </div>

          {/* Account Security PIN */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span>Account Security PIN (Kenya DPA 2019 Gate)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPin ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={8}
              value={accountPin}
              onChange={(e) => setAccountPin(e.target.value)}
              placeholder="e.g. 1234"
              className="w-36 px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-mono font-bold text-sm tracking-widest text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
            />
            <p className="text-[11px] text-amber-900 leading-snug">
              🔒 Give this secret PIN to an Executive Committee officer only when you authorize them to inspect or download your uploaded legal KYC files (ID, Passport Photo, KRA PIN, Signed Club Docs).
            </p>
          </div>

          {/* Security & Verification Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Chama Legal Compliance:</strong> In accordance with Kenya Cap 108 cooperative governance, all shareholder records must maintain verified contact details for annual general meeting audits.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
