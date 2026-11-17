import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import MemberAvatarIcon from './MemberAvatarIcon';
import PrivacyCharterModal from './PrivacyCharterModal';
import {
  Landmark,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Users,
  Smartphone,
  UserPlus,
  Scale
} from 'lucide-react';

export default function AuthGateModal() {
  const {
    members,
    rbacUsers,
    loginWithCredentials,
    signupUser,
    requestEmailOtp,
    verifyEmailOtp
  } = useApp();

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp_request' | 'otp_verify' | 'signup'
  const [identifier, setIdentifier] = useState('MGR-001');
  const [password, setPassword] = useState('MGR@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Sign Up Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupPin, setSignupPin] = useState('1234');
  const [showSignupPin, setShowSignupPin] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showQuickPicker, setShowQuickPicker] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      setInfoMsg('To install on Android: tap browser menu (⋮) -> "Install app" or "Add to Home screen". On iPhone: tap Share -> "Add to Home Screen".');
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    const res = await loginWithCredentials(identifier, password);
    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Invalid Member ID or password.');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    const res = await requestEmailOtp(identifier);
    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to send verification code.');
      return;
    }
    setInfoMsg(res.message || `Verification code sent to ${res.email || 'your registered email'}.`);
    setAuthMode('otp_verify');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await verifyEmailOtp({
      identifier,
      otpCode,
      newPassword
    });
    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || 'Invalid or expired verification code.');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!signupName.trim()) {
      setErrorMsg('Please enter your official full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!signupPhone.trim()) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter identical passwords.');
      return;
    }
    if (signupPin.length < 4 || signupPin.length > 8) {
      setErrorMsg('Account Security PIN must be 4 to 8 digits (e.g. 1234).');
      return;
    }
    if (!privacyAgreed) {
      setErrorMsg('You must agree to MGR Club Privacy Policy & Data Protection Rules (Kenya Constitution Art. 31 & DPA 2019) to register.');
      return;
    }

    setLoading(true);
    const res = await signupUser({
      name: signupName.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      password: signupPassword,
      accountPin: signupPin.trim(),
      privacyAgreed: true
    });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Failed to create member account.');
    }
  };

  const getRoleBadge = (memberId) => {
    const u = rbacUsers.find(r => r.memberId === memberId);
    if (u?.positionTitle && u.positionTitle !== 'Member') {
      if (u.positionTitle.includes('CEO')) {
        return { label: 'CEO', style: 'bg-[#F6EFEA] text-[#6E3C1B] border border-[#E3D0C1]' };
      }
      if (u.positionTitle.includes('Chairman') && !u.positionTitle.includes('Vice')) {
        return { label: 'Chairman', style: 'bg-[#F6EFEA] text-[#6E3C1B] border border-[#E3D0C1]' };
      }
      if (u.positionTitle === 'Treasurer') {
        return { label: 'Treasurer', style: 'bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]' };
      }
    }
    if (!u) return { label: 'Member', style: 'bg-[#F8F7F4] text-[#4A4742] border border-[#DDD9D0]' };
    if (u.accessLevel === 'super_admin') {
      return { label: u.positionTitle || 'Executive Leadership', style: 'bg-[#F6EFEA] text-[#6E3C1B] border border-[#E3D0C1]' };
    }
    if (u.accessLevel === 'treasury_admin') {
      return { label: 'Treasurer', style: 'bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]' };
    }
    if (u.accessLevel === 'executive_officer') {
      return { label: 'Executive Officer', style: 'bg-[#F4F1EA] text-[#2C3824] border border-[#D8D2C4]' };
    }
    if (u.accessLevel === 'estate_beneficiary') {
      return { label: 'Estate Escrow', style: 'bg-[#F9ECEC] text-[#6B2424] border border-[#E6C7C7]' };
    }
    return { label: 'General Member', style: 'bg-[#F8F7F4] text-[#4A4742] border border-[#DDD9D0]' };
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-outer)] flex flex-col justify-between p-2.5 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl w-full mx-auto my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col lg:grid lg:grid-cols-12">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden mgr-glass-header text-white p-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4 text-[var(--accent-gold-light)]" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                MGR INVESTMENT GROUP
              </h1>
              <p className="text-[10px] text-white/75 font-mono">
                Private Share Registry • Cap 30A
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-white/10 text-[var(--accent-gold-light)] border border-white/15">
            FY 2026
          </span>
        </div>

        {/* Left Institutional Column (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 mgr-glass-header text-white p-6 sm:p-8 flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5 text-[var(--accent-gold-light)]" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-white">
                  MGR INVESTMENT GROUP
                </h1>
                <p className="text-[11px] text-white/75">
                  Investment Club Share Registry &amp; Audited Accounts
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--accent-gold-light)] border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
                <span>Audited Private Share Registry • Cap 30A</span>
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-tight">
                Authenticated Member &amp; Executive Portal
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Sign in with your official Membership Number (<strong>MGR-001</strong> – <strong>MGR-011</strong>) or registered email address. New members may register directly for authenticated access.
              </p>
            </div>

            <div className="bg-black/25 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
              <p className="font-bold text-[var(--accent-gold-light)] uppercase tracking-wider text-[10px]">
                App Governance &amp; System Access Hierarchy
              </p>
              <ul className="space-y-2 text-[11px] text-white/85 leading-snug">
                <li>• <strong>System Administrator:</strong> IT web infrastructure, cPanel mail routing (SMTP), SQLite/MySQL database synchronization &amp; audit security.</li>
                <li>• <strong>Executive Leadership (CEO &amp; Chairman):</strong> Corporate governance, general meeting presidency, executive committee resolutions &amp; statutory incorporation (Companies Act).</li>
                <li>• <strong>Treasury Custodian (Treasurer):</strong> Custody of Etica MMF &amp; Mansa X reconciliations, double-entry ledger, loan disbursements &amp; dividend distribution.</li>
                <li>• <strong>Executive Officers (Secretary, Compliance, Research, Vice Chair):</strong> Legal compliance audits, secretarial registers, fund performance intelligence &amp; committee actions.</li>
                <li>• <strong>General Members (Shareholders):</strong> Self-service equity ledger, personal deposit logging, 80% share-backed loans &amp; democratic voting / unanimous ratification.</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 mt-6 space-y-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
            >
              <Smartphone className="w-4 h-4 text-[var(--accent-gold-light)]" />
              <span>Install Mobile App (Android WebAPK / iOS PWA)</span>
            </button>
            <div className="text-[11px] text-white/70 flex items-center justify-between">
              <span>Etica Paybill: <strong>4096483</strong> • Acc: <strong>34236M</strong></span>
              <span className="font-mono-num">FY 2026</span>
            </div>
          </div>
        </div>

        {/* Right Interaction Column: Clear Log In vs Register Switcher */}
        <div className="lg:col-span-7 p-4 sm:p-7 lg:p-8 flex flex-col justify-between bg-white text-slate-900">
          <div>
            {/* Primary Segmented Tabs: Log In vs Register */}
            <div className="grid grid-cols-2 p-1 bg-[#F4F1EA] rounded-xl border border-[#D8D2C4] mb-4 sm:mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer min-h-[44px] ${
                  authMode !== 'signup'
                    ? 'bg-white text-[#1D3B2A] shadow-xs border border-[#CCD7CD]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4 text-[#1D3B2A] shrink-0" />
                <span className="font-semibold sm:font-bold">Log In</span>
                <span className="hidden sm:inline text-[11px] font-normal text-slate-500">(Existing Member)</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`py-2.5 px-2 sm:px-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer min-h-[44px] ${
                  authMode === 'signup'
                    ? 'bg-[#1D3B2A] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span className="font-semibold sm:font-bold">Register</span>
                <span className="hidden sm:inline text-[11px] font-normal opacity-80">(New User)</span>
              </button>
            </div>

            {/* Sub-Header info depending on mode */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  {authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4 text-[#1D3B2A]" />
                      <span>New Member Registration</span>
                    </>
                  ) : authMode === 'otp_request' ? (
                    <>
                      <Mail className="w-4 h-4 text-[#1D3B2A]" />
                      <span>Email OTP Sign-In / Password Reset</span>
                    </>
                  ) : authMode === 'otp_verify' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#1D3B2A]" />
                      <span>Verify 6-Digit Email Code</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#1D3B2A]" />
                      <span>Member Account Sign In</span>
                    </>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {authMode === 'signup'
                    ? 'Register your account under the Kenya Data Protection Act 2019'
                    : authMode === 'otp_request' || authMode === 'otp_verify'
                      ? 'Secure passwordless sign-in via cPanel mail verification'
                      : <>Default initial member password: <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono-num font-bold text-slate-800">MGR@2026</code></>}
                </p>
              </div>

              {authMode !== 'signup' && (
                <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                      authMode === 'password' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('otp_request');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                      authMode === 'otp_request' || authMode === 'otp_verify' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Email OTP
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {infoMsg && (
              <div className="mb-4 p-3 rounded-xl bg-[#EDF1ED] border border-[#CCD7CD] text-[#1D3B2A] text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1D3B2A] shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {/* TAB 1: PASSWORD LOGIN */}
            {authMode === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Member ID, Email Address, or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. MGR-001, MGR-004, MGR-011 or registered email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('otp_request')}
                      className="text-[11px] font-semibold text-[#1D3B2A] hover:underline"
                    >
                      Forgot password / Use Email OTP?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Sign In to MGR Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Mobile OTP switcher link */}
                <div className="sm:hidden text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('otp_request')}
                    className="text-xs font-semibold text-[#1D3B2A] hover:underline"
                  >
                    Need to sign in with Email Verification Code instead?
                  </button>
                </div>

                {/* Switch to Register link */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D2C4] text-center space-y-1">
                  <p className="text-xs text-slate-700">
                    New to MGR Investment Club?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="font-bold text-xs text-[#1D3B2A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Register a New Member Account Here</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: NEW MEMBER SIGN UP / REGISTRATION */}
            {authMode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. John Kennedy Obalah, Sarah Njoki..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. member@mgrinvestment.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Phone (M-Pesa / Safaricom)
                    </label>
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="e.g. 0712 345 678 or +254..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showSignupPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                        className="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Secret User Account PIN */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D2C4] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1D3B2A] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#6E3C1B]" />
                      <span>Set 4-Digit User Account Security PIN</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignupPin(!showSignupPin)}
                      className="text-[11px] font-semibold text-[#6E3C1B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showSignupPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSignupPin ? 'Hide PIN' : 'Reveal PIN'}</span>
                    </button>
                  </div>

                  <div className="relative max-w-xs">
                    <input
                      type={showSignupPin ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={signupPin}
                      onChange={(e) => setSignupPin(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8D2C4] bg-white font-mono font-bold text-base tracking-widest text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                    />
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug">
                    🔒 <strong>Executive Authorization Key:</strong> You will provide this secret PIN to an Executive Committee officer only when you authorize them to inspect or download legal documents you upload (National ID, Passport Photo, KRA PIN, Club Sign-Up Documents).
                  </p>
                </div>

                {/* Privacy Policy & Data Protection Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-start space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={privacyAgreed}
                      onChange={(e) => setPrivacyAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#1D3B2A] focus:ring-[#1D3B2A] w-4 h-4 shrink-0"
                    />
                    <span className="text-[11px] text-slate-700 leading-relaxed">
                      I agree to the <strong>MGR Club Privacy Policy &amp; Data Protection Rules</strong> in accordance with <strong>Article 31 of the Constitution of Kenya (Right to Privacy)</strong> and the <strong>Kenya Data Protection Act 2019</strong>. I consent to secure encrypted KYC custody with member-controlled PIN authorization.
                    </span>
                  </label>

                  <div className="pl-6">
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-[11px] font-semibold text-[#1D3B2A] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>View Kenyan Data Protection &amp; Club Privacy Charter</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Creating Member Account...' : 'Complete Sign Up & Enter Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1">
                  <p className="text-xs text-slate-600">
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setErrorMsg('');
                        setInfoMsg('');
                      }}
                      className="font-bold text-[#1D3B2A] hover:underline cursor-pointer"
                    >
                      Sign In with Password
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB 3: EMAIL OTP REQUEST */}
            {authMode === 'otp_request' && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Member ID or Registered Email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. MGR-001, MGR-004, MGR-011 or registered email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Our cPanel Mail Server will dispatch a 6-digit verification code to your registered email address.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? 'Dispatching Code...' : 'Send 6-Digit Email Code'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="text-xs font-semibold text-[#1D3B2A] hover:underline cursor-pointer"
                  >
                    ← Back to Password Sign In
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: EMAIL OTP VERIFY */}
            {authMode === 'otp_verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    6-Digit Email Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-mono-num font-bold tracking-widest text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Set New Password (Optional — leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A] min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setErrorMsg('');
                      setInfoMsg('');
                    }}
                    className="text-xs font-semibold text-[#1D3B2A] hover:underline cursor-pointer"
                  >
                    ← Back to Password Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Quick Account Picker for Founding Members (Shown strictly on Log In tab) */}
            {authMode !== 'signup' && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowQuickPicker(!showQuickPicker)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer min-h-[42px]"
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1D3B2A] shrink-0" />
                    <span>Founding Member Quick Pre-fill (11 Accounts)</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#1D3B2A] shrink-0">
                    {showQuickPicker ? '▲ Hide List' : '▼ View (11 Members)'}
                  </span>
                </button>

                {showQuickPicker && (
                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1 animate-in fade-in">
                    {members.map((m) => {
                      const badge = getRoleBadge(m.id);
                      const isSelected = identifier.toUpperCase() === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setIdentifier(m.id);
                            setErrorMsg('');
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer min-h-[44px] ${
                            isSelected
                              ? 'bg-[#EDF1ED] border-[#1D3B2A] ring-1 ring-[#1D3B2A]'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <MemberAvatarIcon member={m} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {m.name}
                              </span>
                              <span className="font-mono-num text-[10px] font-bold text-slate-500 shrink-0">
                                {m.id}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1 mt-0.5">
                              <span className="text-[10px] text-slate-600 truncate">
                                {m.role}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${badge.style}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Mobile-only app installation & paybill info */}
            <div className="lg:hidden mt-5 pt-4 border-t border-slate-200 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
              >
                <Smartphone className="w-4 h-4 text-[#1D3B2A]" />
                <span>Install Mobile App (Android APK / iOS PWA)</span>
              </button>
              <div className="text-[10px] text-slate-500 text-center">
                Etica Paybill: <strong>4096483</strong> • Acc: <strong>34236M</strong> • Cap 30A
              </div>
            </div>

          </div>
        </div>

      </div>

      <PrivacyCharterModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}

