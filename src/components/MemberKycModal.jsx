import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import MemberAvatarIcon from './MemberAvatarIcon';
import PrivacyCharterModal from './PrivacyCharterModal';
import {
  Lock,
  Unlock,
  ShieldCheck,
  FileText,
  Upload,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  X,
  File,
  Image as ImageIcon,
  KeyRound,
  Scale,
  Clock,
  Sparkles,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  {
    type: 'NATIONAL_ID',
    title: 'Kenyan National ID / Passport',
    desc: 'Government-issued National ID Card (Front & Back) or Bio-Data page of valid Passport.',
    required: true,
    accept: 'image/*,.pdf'
  },
  {
    type: 'PASSPORT_PHOTO',
    title: 'Passport-Size Photograph',
    desc: 'Recent official color portrait photo on clear neutral background.',
    required: true,
    accept: 'image/*'
  },
  {
    type: 'KRA_PIN',
    title: 'KRA PIN Certificate',
    desc: 'Kenya Revenue Authority PIN Registration Certificate (PDF or scanned image).',
    required: true,
    accept: '.pdf,image/*'
  },
  {
    type: 'SIGNUP_DOC',
    title: 'Signed Club Membership Application / LLP Agreement',
    desc: 'Signed MGR Club Constitution adherence form, application, or LLP signature page.',
    required: false,
    accept: '.pdf,image/*'
  },
  {
    type: 'OTHER_DOC',
    title: 'Other Legal & Banking Proofs',
    desc: 'Bank account confirmation letter, utility proof of residence, or legal affidavit.',
    required: false,
    accept: '.pdf,image/*,.doc,.docx'
  }
];

export default function MemberKycModal({ isOpen, onClose, member }) {
  const {
    authenticatedUser,
    currentMember,
    unlockedMemberPins,
    lockMemberVault,
    uploadKycDocument,
    deleteKycDocument,
    verifyMemberPin,
    generateNewMemberPin,
    updateAccountPin,
    showToast
  } = useApp();

  const [enteredPin, setEnteredPin] = useState('');
  const [showEnteredPin, setShowEnteredPin] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');
  
  // Own PIN Management State
  const [showOwnPin, setShowOwnPin] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPinVal, setNewPinVal] = useState('');
  const [pinCopied, setPinCopied] = useState(false);
  const [isGeneratingPin, setIsGeneratingPin] = useState(false);

  // Live Timer State (re-renders countdown every second)
  const [, setClockTick] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Uploading State
  const [selectedCategory, setSelectedCategory] = useState('NATIONAL_ID');
  const [customTitle, setCustomTitle] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showPrivacyCharter, setShowPrivacyCharter] = useState(false);

  if (!isOpen || !member) return null;

  const isOwnProfile = (authenticatedUser && authenticatedUser.memberId === member.id) ||
    (currentMember && currentMember.id === member.id && !authenticatedUser);
  const isVaultUnlocked = isOwnProfile || Boolean(unlockedMemberPins[member.id]);

  // Resolve member's documents and PIN data
  const docsList = Array.isArray(member.kycDocuments) ? member.kycDocuments : [];
  const currentPin = member.accountPin || (isOwnProfile ? (authenticatedUser?.accountPin || '1234') : '1234');
  const pinExpiresAt = member.pinExpiresAt || (isOwnProfile ? authenticatedUser?.pinExpiresAt : null);
  const pinUsedById = member.pinUsedById || (isOwnProfile ? authenticatedUser?.pinUsedById : null);
  const pinUsedByName = member.pinUsedByName || (isOwnProfile ? authenticatedUser?.pinUsedByName : null);
  const pinUsedAt = member.pinUsedAt || (isOwnProfile ? authenticatedUser?.pinUsedAt : null);

  // Calculate 24-hour remaining validity
  const getPinExpirationStatus = () => {
    if (!pinExpiresAt) {
      return { hasExpiry: false, isExpired: false, label: '24-Hour Timer Starts on Copy / Generation', remainingSeconds: 0 };
    }
    const expiresMs = new Date(pinExpiresAt).getTime();
    const diffMs = expiresMs - Date.now();
    if (diffMs <= 0) {
      return { hasExpiry: true, isExpired: true, label: 'EXPIRED (24-Hour Window Ended)', remainingSeconds: 0 };
    }
    const totalSecs = Math.floor(diffMs / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return {
      hasExpiry: true,
      isExpired: false,
      label: `${hrs}h ${mins}m ${secs}s remaining`,
      remainingSeconds: totalSecs,
      hrs,
      mins
    };
  };

  const expStatus = getPinExpirationStatus();

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setPinError('');
    if (!enteredPin.trim()) {
      setPinError('Please enter the 4-digit Account Security PIN provided by the member.');
      return;
    }
    setPinLoading(true);
    const res = await verifyMemberPin({
      targetMemberId: member.id,
      enteredPin: enteredPin.trim()
    });
    setPinLoading(false);
    if (!res.ok) {
      setPinError(res.error || 'Invalid PIN. Access denied as per Kenyan Privacy Policy.');
    } else {
      setEnteredPin('');
    }
  };

  const handleCopyPin = async () => {
    let pinToCopy = currentPin;
    // Once copied, it strictly starts/refreshes the 24-hour countdown from the moment of copying.
    // If expired, automatically generate a fresh random 4-digit PIN.
    if (expStatus.isExpired) {
      const res = await generateNewMemberPin({ memberId: member.id });
      if (res?.ok && res.accountPin) {
        pinToCopy = res.accountPin;
      }
    } else {
      const res = await generateNewMemberPin({ memberId: member.id, newPin: currentPin });
      if (res?.ok && res.accountPin) {
        pinToCopy = res.accountPin;
      }
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(pinToCopy);
      }
    } catch {
      // fallback
    }
    setPinCopied(true);
    showToast(`PIN ${pinToCopy} copied! 24-hour countdown started. Can only be used by 1 executive.`);
    setTimeout(() => setPinCopied(false), 3000);
  };

  const handleGenerateFreshPin = async () => {
    setIsGeneratingPin(true);
    const res = await generateNewMemberPin({ memberId: member.id });
    setIsGeneratingPin(false);
    if (res && res.ok) {
      const generated = res.accountPin;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(generated);
        }
      } catch {
        // fallback
      }
      setPinCopied(true);
      showToast(`Fresh 24-hour PIN ${generated} generated & copied to clipboard! Unclaimed for 1 executive.`);
      setTimeout(() => setPinCopied(false), 3000);
    }
  };

  const handleSaveCustomPin = async (e) => {
    e.preventDefault();
    if (newPinVal.length < 4 || newPinVal.length > 8) {
      showToast('PIN must be between 4 and 8 digits.', 'error');
      return;
    }
    await updateAccountPin({ memberId: member.id, newPin: newPinVal });
    setIsEditingPin(false);
    setNewPinVal('');
  };

  const handleFileUpload = (e, catType, defaultTitle) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit. Please upload a smaller document.', 'error');
      return;
    }

    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      const titleToUse = customTitle.trim() || defaultTitle;
      await uploadKycDocument({
        memberId: member.id,
        docType: catType,
        title: titleToUse,
        fileName: file.name,
        fileData: base64Data,
        mimeType: file.type || 'application/pdf',
        size: file.size
      });
      setUploadLoading(false);
      setCustomTitle('');
    };
    reader.onerror = () => {
      setUploadLoading(false);
      showToast('Failed to read file.', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownloadDoc = (doc) => {
    if (!doc.fileData) {
      showToast('Document file payload not available', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = doc.fileData;
    link.download = doc.fileName || `${doc.title || 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${doc.fileName}`);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in">
        <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90dvh]">
          
          {/* Header */}
          <div className="mgr-glass-header text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <MemberAvatarIcon member={member} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="font-bold text-sm sm:text-base tracking-tight text-white truncate max-w-[170px] sm:max-w-none">
                    {member.name}
                  </h2>
                  <span className="font-mono text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-[var(--accent-gold-light)] border border-white/20">
                    {member.id}
                  </span>
                  {isVaultUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      <Unlock className="w-3 h-3" />
                      <span>Vault Unlocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                      <Lock className="w-3 h-3" />
                      <span>PIN Protected</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/75 flex items-center gap-1 mt-0.5 truncate">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Confidential KYC &amp; Legal Vault (Kenya DPA 2019)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPrivacyCharter(true)}
                className="hidden md:inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] font-semibold text-white transition cursor-pointer"
                title="View Kenyan Constitution Article 31 & Data Protection Charter"
              >
                <Scale className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
                <span>Privacy Charter</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
            
            {/* PIN GATE FOR EXECUTIVES VIEWING ANOTHER MEMBER */}
            {!isVaultUnlocked && (
              <div className="p-5 sm:p-7 bg-slate-50 rounded-2xl border-2 border-amber-300/80 text-center space-y-3.5 max-w-lg mx-auto my-2 shadow-xs">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shadow-xs">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    Kenya Constitution Art. 31 • Single-Executive 24h Gate
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    Member Account PIN Required
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    Under the <strong>Kenya Data Protection Act 2019</strong> and MGR Club Confidentiality Bylaws, <strong>{member.name}</strong>'s legal documents (National ID, Passport Photo, KRA PIN, Signed Club Docs) are locked.
                  </p>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-semibold space-y-1">
                    <p>• Please ask {member.name} to copy and share their 4-digit Account Security PIN.</p>
                    <p className="text-[10px] text-amber-800 font-normal">
                      ⏰ <em>Note: PINs expire automatically after 24 hours and can only be used by one executive.</em>
                    </p>
                  </div>
                </div>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start text-left gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{pinError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyPin} className="space-y-3 pt-1">
                  <div className="relative max-w-xs mx-auto">
                    <input
                      type={showEnteredPin ? 'text' : 'password'}
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      placeholder="Enter 4-Digit PIN"
                      className="w-full text-center px-4 py-2.5 pr-10 text-base sm:text-lg font-mono font-bold tracking-widest rounded-xl border-2 border-slate-300 focus:border-[var(--brand-primary)] focus:outline-none bg-white text-slate-900 min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEnteredPin(!showEnteredPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showEnteredPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={pinLoading}
                    className="w-full max-w-xs mx-auto py-2.5 px-4 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer min-h-[44px]"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{pinLoading ? 'Verifying Authorization...' : 'Verify PIN & Unlock Vault'}</span>
                  </button>
                </form>

                <p className="text-[10px] text-slate-400 pt-1">
                  🔒 All unlock attempts are bound exclusively to the officer entering the PIN and logged in the MGR Audit Trail.
                </p>
              </div>
            )}

            {/* UNLOCKED VAULT CONTENT */}
            {isVaultUnlocked && (
              <>
                {/* Executive Re-Lock & Authorization Banner */}
                {!isOwnProfile && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start sm:items-center space-x-2 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-xs font-semibold leading-snug">
                        Exclusive Access: Unlocked for you via <strong>{member.name}</strong>'s 24-hour authorization PIN.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        lockMemberVault(member.id);
                        showToast(`Vault for ${member.name} locked.`);
                      }}
                      className="py-1.5 px-3 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shrink-0 min-h-[36px]"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Lock Vault Again</span>
                    </button>
                  </div>
                )}

                {/* Own Profile: PIN Management with 24-Hour Expiration & Single-Executive Binding */}
                {isOwnProfile && (
                  <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[var(--brand-tint)] to-emerald-50/70 rounded-xl border border-[var(--brand-tint-border)] space-y-3">
                    
                    {/* Top Row: Title + Expiration Countdown */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                          <KeyRound className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
                          <span>Secret Account Security PIN (24-Hour Expiration)</span>
                        </span>
                        <p className="text-[11px] text-slate-600">
                          Share this PIN with an Executive Committee officer to authorize them to inspect or download your KYC legal records.
                        </p>
                      </div>

                      {/* 24-Hour Countdown Badge */}
                      <div className="shrink-0">
                        {expStatus.isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <Clock className="w-3 h-3 text-rose-600" />
                            <span>PIN Expired (24h Ended)</span>
                          </span>
                        ) : expStatus.hasExpiry ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
                            <Clock className="w-3 h-3 text-emerald-700" />
                            <span>Expires in: {expStatus.label}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>24-Hour Clock Starts on Copy</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expired Alert Banner */}
                    {expStatus.isExpired && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-in fade-in">
                        <div className="flex items-start space-x-2 text-rose-900">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                          <div>
                            <span className="font-bold">Authorization PIN Expired (24h Window Ended)</span>
                            <p className="text-[11px] text-rose-700 mt-0.5">
                              This PIN is no longer valid. Under MGR bylaws, legal document inspection requires a fresh 24-hour PIN.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleGenerateFreshPin}
                          disabled={isGeneratingPin}
                          className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 min-h-[36px]"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>{isGeneratingPin ? 'Generating...' : 'Generate New 24h PIN'}</span>
                        </button>
                      </div>
                    )}

                    {/* Middle Row: PIN Display + Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                      
                      {/* PIN Digits Display */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-white px-3.5 py-2 rounded-xl border border-slate-300 shadow-xs font-mono font-bold text-base sm:text-lg tracking-widest text-slate-900 min-h-[44px]">
                          <span>{showOwnPin ? currentPin : '••••'}</span>
                          <button
                            type="button"
                            onClick={() => setShowOwnPin(!showOwnPin)}
                            className="ml-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                            title={showOwnPin ? 'Hide PIN' : 'Reveal PIN'}
                          >
                            {showOwnPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Copy PIN (Starts/Refreshes 24h Window) */}
                        <button
                          type="button"
                          onClick={handleCopyPin}
                          className="flex-1 sm:flex-none py-2 px-3 sm:px-3.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer min-h-[44px]"
                          title="Copy PIN and activate 24-hour expiration window"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>{pinCopied ? 'Copied!' : 'Copy PIN'}</span>
                        </button>
                      </div>

                      {/* Action Buttons: Generate New & Change PIN */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isGeneratingPin}
                          onClick={handleGenerateFreshPin}
                          className="flex-1 sm:flex-none py-2 px-3 sm:px-3.5 bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                          title="Generate a fresh random 4-digit PIN with a new 24-hour window"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
                          <span>{isGeneratingPin ? 'Generating...' : 'Generate New 24h PIN'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingPin(!isEditingPin);
                            setNewPinVal('');
                          }}
                          className="py-2 px-3 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer min-h-[44px]"
                        >
                          {isEditingPin ? 'Cancel' : 'Set Custom'}
                        </button>
                      </div>
                    </div>

                    {/* Single-Executive Binding Status Banner */}
                    <div className="p-2.5 rounded-lg border text-[11px] leading-snug flex items-center justify-between gap-2 flex-wrap bg-white/80 border-slate-200">
                      <div className="flex items-center gap-1.5">
                        {pinUsedById ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Single-Executive Lock:</strong> Claimed exclusively by <strong>{pinUsedByName || pinUsedById}</strong> {pinUsedAt ? `(${new Date(pinUsedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}.
                            </span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              <strong>Single-Executive Rule:</strong> Unclaimed. The first executive to enter this PIN will be the only one who can use it within the 24 hours.
                            </span>
                          </>
                        )}
                      </div>
                      {pinUsedById && (
                        <span className="text-[10px] text-slate-500 italic">
                          Generate a new PIN to authorize a different executive.
                        </span>
                      )}
                    </div>

                    {/* Change PIN Custom Form */}
                    {isEditingPin && (
                      <form onSubmit={handleSaveCustomPin} className="pt-2 border-t border-slate-200/80 flex items-center gap-2 flex-wrap animate-in fade-in">
                        <span className="text-[11px] font-semibold text-slate-700">Set custom 4-8 digit PIN:</span>
                        <input
                          type="password"
                          required
                          inputMode="numeric"
                          maxLength={8}
                          value={newPinVal}
                          onChange={(e) => setNewPinVal(e.target.value)}
                          placeholder="e.g. 5678"
                          className="w-28 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-white"
                        />
                        <button
                          type="submit"
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition cursor-pointer min-h-[36px]"
                        >
                          Save &amp; Start 24h
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Upload Section (If Own Profile) */}
                {isOwnProfile && (
                  <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>Upload Official Document to Encrypted Vault</span>
                      </span>
                      <span className="text-[11px] text-slate-500">Max size: 10MB • PDF, JPG, PNG</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Document Type
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 min-h-[42px]"
                        >
                          {DOCUMENT_CATEGORIES.map(cat => (
                            <option key={cat.type} value={cat.type}>
                              {cat.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Custom Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="e.g. National ID Copy 2026"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 min-h-[42px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Select File (PDF / Image)
                        </label>
                        <label className="w-full py-2 px-3 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs min-h-[42px]">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadLoading ? 'Uploading...' : 'Choose File to Upload'}</span>
                          <input
                            type="file"
                            disabled={uploadLoading}
                            accept="image/*,.pdf"
                            onChange={(e) => {
                              const cat = DOCUMENT_CATEGORIES.find(c => c.type === selectedCategory);
                              handleFileUpload(e, selectedCategory, cat?.title || 'Document');
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploaded Documents Gallery grouped by category */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                      <span>Uploaded Legal Files ({docsList.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Encrypted under Kenya DPA 2019
                    </span>
                  </div>

                  {docsList.length === 0 ? (
                    <div className="p-6 sm:p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                      <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-xs text-slate-700">No legal documents uploaded yet</p>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        {isOwnProfile
                          ? 'Please upload your National ID, Passport Photo, KRA PIN Certificate, and signed membership documents above.'
                          : 'This member has not yet uploaded confidential legal records to their vault.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {docsList.map((doc) => {
                        const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf');
                        const isImg = doc.mimeType?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName || '');

                        return (
                          <div
                            key={doc.id}
                            className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between space-y-2.5 transition"
                          >
                            <div className="flex items-start space-x-2.5">
                              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isPdf ? 'bg-rose-100 text-rose-700' : isImg ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {isPdf ? <File className="w-4 h-4 sm:w-5 sm:h-5" /> : isImg ? <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-0.5 truncate max-w-full">
                                  {doc.type ? doc.type.replace('_', ' ') : 'KYC Document'}
                                </span>
                                <h5 className="font-bold text-xs text-slate-900 truncate" title={doc.title}>
                                  {doc.title || doc.fileName}
                                </h5>
                                <p className="text-[10px] text-slate-500 truncate" title={doc.fileName}>
                                  {doc.fileName} • {formatFileSize(doc.size)}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                  Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent'}
                                </p>
                              </div>
                            </div>

                            {/* Actions with touch-friendly heights */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer min-h-[36px]"
                              >
                                <Eye className="w-3 h-3 text-slate-600" />
                                <span>Preview</span>
                              </button>

                              <div className="flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadDoc(doc)}
                                  className="py-1 px-3 rounded-lg bg-[var(--brand-primary)] hover:opacity-95 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs min-h-[36px]"
                                  title="Download verified document"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>

                                {isOwnProfile && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Delete document "${doc.title || doc.fileName}" from your vault?`)) {
                                        deleteKycDocument({ memberId: member.id, docId: doc.id });
                                      }
                                    }}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                    title="Delete document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mandatory Checkbox / KYC Guidance Note */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    All legal records uploaded here satisfy Kenya Revenue Authority (KRA), Equity Bank Chama joint account, and Capital Markets Authority (CMA) Know-Your-Customer mandates while keeping member privacy sovereign under Article 31 of the Kenyan Constitution.
                  </p>
                </div>
              </>
            )}

          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowPrivacyCharter(true)}
              className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer min-h-[36px]"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Privacy Charter</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer min-h-[40px]"
            >
              Close Vault
            </button>
          </div>

        </div>
      </div>

      {/* Lightbox / Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            <div className="p-3 sm:p-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <span className="font-bold text-xs truncate max-w-[200px] sm:max-w-md">
                {previewDoc.title || previewDoc.fileName}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="py-1 px-2.5 rounded-lg bg-[var(--brand-primary)] text-white text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[36px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 overflow-y-auto max-h-[75dvh] flex items-center justify-center bg-slate-100">
              {previewDoc.mimeType?.includes('image') || /\.(jpg|jpeg|png|webp|gif)$/i.test(previewDoc.fileName || '') ? (
                <img
                  src={previewDoc.fileData}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[70dvh] rounded-lg shadow-md object-contain"
                />
              ) : previewDoc.mimeType?.includes('pdf') || previewDoc.fileName?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewDoc.fileData}
                  title={previewDoc.title}
                  className="w-full h-[65dvh] rounded-lg border border-slate-300"
                />
              ) : (
                <div className="text-center p-8 space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="font-bold text-slate-700">Preview not supported for this file format.</p>
                  <p className="text-xs text-slate-500">Please download the file to inspect it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Charter Modal */}
      <PrivacyCharterModal
        isOpen={showPrivacyCharter}
        onClose={() => setShowPrivacyCharter(false)}
      />
    </>
  );
}
