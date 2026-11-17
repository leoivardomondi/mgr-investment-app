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
  EyeOff,
  CreditCard,
  MapPin,
  Lock
} from 'lucide-react';
import { recordAuditEvent } from '../utils/telemetry';

export default function FirstLoginProfileModal({ isOpen, onClose, isEnforced = false }) {
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
  const [name, setName] = useState(authenticatedUser?.name || initialActiveMember.name || '');
  const [phone, setPhone] = useState(authenticatedUser?.phone || initialActiveMember.phone || '');
  const [nationalId, setNationalId] = useState(authenticatedUser?.nationalId || initialActiveMember.nationalId || '');
  const [locationCity, setLocationCity] = useState(authenticatedUser?.locationCity || initialActiveMember.location || 'Nairobi');
  const [email, setEmail] = useState(authenticatedUser?.email || initialActiveMember.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountPin, setAccountPin] = useState(authenticatedUser?.accountPin || initialActiveMember.accountPin || '1234');
  
  const [agreedConstitution, setAgreedConstitution] = useState(true);
  const [agreedPrivacy, setAgreedPrivacy] = useState(true);

  const [showPin, setShowPin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successPinNotice, setSuccessPinNotice] = useState(null);

  if (!isOpen) return null;

  const activeMember = members.find(m => m.id === memberId) || currentMember || {};

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

    if (!name.trim()) {
      setErrorMsg('Please confirm your official full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }

    if (digitsOnly.length < 10 || digitsOnly.length > 13) {
      setErrorMsg('Please enter a valid Kenyan phone number (e.g. 0712 345 678 or +254 712 345 678).');
      return;
    }

    if (!nationalId.trim()) {
      setErrorMsg('National ID / Passport Number is mandatory under Kenya Data Protection Act 2019.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid personal email address for audited statements.');
      return;
    }

    if (!locationCity.trim()) {
      setErrorMsg('Please state your county or physical location of residence.');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg('Personal password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter identical passwords.');
        return;
      }
    }

    const cleanPin = accountPin.trim();
    if (cleanPin.length < 4 || cleanPin.length > 8 || !/^\d+$/.test(cleanPin)) {
      setErrorMsg('Security PIN must be 4 to 8 numeric digits (e.g. 1234).');
      return;
    }

    if (!agreedConstitution) {
      setErrorMsg('You must ratify and agree to abide by the MGR Club Constitution & LLP Agreement.');
      return;
    }

    if (!agreedPrivacy) {
      setErrorMsg('You must agree to data processing compliance under Kenya Constitution Art. 31 & DPA 2019.');
      return;
    }

    setLoading(true);
    try {
      const res = await updateUserProfile({
        phone: formattedPhone,
        memberId: memberId.trim().toUpperCase(),
        email: email.trim(),
        nationalId: nationalId.trim(),
        locationCity: locationCity.trim(),
        newPassword: password ? password : null,
        accountPin: cleanPin
      });

      // Record audit trail event
      await recordAuditEvent({
        actionType: 'create',
        actionSummary: `Member ${memberId} completed mandatory full registration (Phone: ${formattedPhone}, ID: ${nationalId}, PIN: ${cleanPin})`,
        targetResource: `Member Profile: ${memberId}`,
        actorId: memberId,
        actorName: name,
        actorRole: activeMember.role || 'Member'
      });

      setLoading(false);
      if (res && res.ok) {
        setSuccessPinNotice(cleanPin);
        showToast(`Registration verified! Your 4-Digit Security PIN is: ${cleanPin}`);
        setTimeout(() => {
          if (onClose) onClose();
        }, 3500);
      } else {
        setErrorMsg(res?.error || 'Could not save profile details.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('An unexpected error occurred while saving profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#1D3B2A] to-[#13281C] text-white p-4 sm:p-6 relative">
          {!isEnforced && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FAF6EC] text-[#5A4518] border border-[#E8DCB8] flex items-center gap-1 font-mono-num">
              <Sparkles className="w-3 h-3 text-[#8A6B32]" />
              Mandatory Full Registration
            </span>
            <span className="text-white/60 text-xs font-mono">• Cap 30A &amp; DPA 2019 Gate</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white font-editorial">
            Official Member Onboarding &amp; Profile Setup
          </h2>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            All registered members must complete full identity verification and confirm their secret 4-digit security PIN before accessing club ledgers.
          </p>
        </div>

        {/* Success Confirmation Banner Showing 4-Digit PIN */}
        {successPinNotice && (
          <div className="p-4 bg-[#EDF1ED] border-b border-[#CCD7CD] text-xs text-[#1D3B2A] space-y-1.5 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#1D3B2A] shrink-0" />
              <span>Full Registration Successfully Completed!</span>
            </div>
            <p className="leading-relaxed">
              Your confidential <strong>4-Digit Security PIN</strong> is:
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-[#CCD7CD] font-mono-num font-extrabold text-lg text-slate-900 tracking-widest">
              <KeyRound className="w-4 h-4 text-[#8A6B32]" />
              <span>{successPinNotice}</span>
            </div>
            <p className="text-[11px] text-slate-600">
              💡 <strong>Where to see your PIN:</strong> You can view, reveal, or copy this 4-digit PIN anytime directly on your <strong>Dashboard overview</strong> or by clicking your <strong>Profile menu</strong> in the top header.
            </p>
          </div>
        )}

        {/* Member Profile Summary Card */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#FAF8F5] border-b border-[#E2DDD3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MemberAvatarIcon member={activeMember} size="md" />
            <div>
              <p className="text-xs font-bold text-slate-900">{activeMember.name || name}</p>
              <p className="text-[11px] text-slate-500 font-medium font-mono-num">
                {activeMember.role || 'Member'} • <strong className="text-[#1D3B2A]">{memberId || activeMember.id}</strong>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD] text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-[#1D3B2A]" />
              Shareholder Verification
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Member ID & Name Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#1D3B2A]" />
                <span>Member Number</span>
                <span className="text-rose-600">*</span>
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-[#1D3B2A] font-mono-num"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <span>Official Full Name</span>
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Official Name"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-none focus:border-[#1D3B2A]"
              />
            </div>
          </div>

          {/* Mobile Phone Number & National ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#1D3B2A]" />
                <span>Mobile Phone (M-Pesa)</span>
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => {
                  setErrorMsg('');
                  setPhone(e.target.value);
                }}
                placeholder="e.g. 0712 345 678"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3B2A] font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#1D3B2A]" />
                <span>National ID / Passport No.</span>
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="e.g. 12345678"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3B2A] font-mono-num"
              />
            </div>
          </div>

          {/* Email Address & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#1D3B2A]" />
                <span>Email Address</span>
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3B2A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1D3B2A]" />
                <span>County / City of Residence</span>
                <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="e.g. Nairobi / Kisumu / Mombasa"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1D3B2A]"
              />
            </div>
          </div>

          {/* Account Security PIN Card */}
          <div className="p-3 bg-[#FAF8F5] border border-[#E2DDD3] rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1D3B2A] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#1D3B2A]" />
                <span>Choose Your 4-Digit Security PIN</span>
                <span className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-[10px] text-[#5A4518] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPin ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={8}
              required
              value={accountPin}
              onChange={(e) => setAccountPin(e.target.value)}
              placeholder="e.g. 1234"
              className="w-36 px-3 py-1.5 rounded-lg border border-[#CCD7CD] bg-white font-mono-num font-extrabold text-sm tracking-widest text-slate-900 focus:outline-none focus:border-[#1D3B2A]"
            />
            <p className="text-[11px] text-slate-600 leading-snug">
              🔒 <strong>Where you will see this PIN:</strong> Once saved, your PIN will always be visible and copyable right on your <strong>main Dashboard</strong> and in your <strong>top-right profile dropdown</strong>. You will give this PIN only when authorizing executive officers to inspect your KYC document vault or ratify sensitive withdrawals.
            </p>
          </div>

          {/* Optional Password Update */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Set Personal Password (Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-slate-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password (min 6 chars)"
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#1D3B2A]"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-[#1D3B2A]"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Leave blank to keep your current password. Changing replaces the default cooperative password.
            </p>
          </div>

          {/* Statutory Compliance Agreement Checkboxes */}
          <div className="space-y-2 pt-1 text-xs text-slate-700">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedConstitution}
                onChange={(e) => setAgreedConstitution(e.target.checked)}
                className="mt-0.5 accent-[#1D3B2A] rounded cursor-pointer"
              />
              <span className="leading-snug">
                I formally ratify and agree to abide by the <strong>MGR Club Constitution, LLP Agreement, and 2027 Corporate Roadmap</strong>.
              </span>
            </label>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 accent-[#1D3B2A] rounded cursor-pointer"
              />
              <span className="leading-snug">
                I consent to confidential data processing and KYC file custody under <strong>Constitution of Kenya Art. 31 and Data Protection Act 2019</strong>.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:bg-[#162E21] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold-light)]" />
              <span>{loading ? 'Submitting Registration...' : 'Complete Full Registration & Enter Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
