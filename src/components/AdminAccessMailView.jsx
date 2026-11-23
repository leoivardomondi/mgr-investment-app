import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MemberAvatarIcon from './MemberAvatarIcon';
import {
  ShieldCheck,
  Lock,
  Mail,
  Send,
  KeyRound,
  UserCheck,
  UserX,
  Power,
  Settings,
  CheckCircle2,
  FileText,
  Server,
  RefreshCw,
  RotateCcw,
  Eye,
  Download,
  Trash2,
  PlusCircle,
  Edit3,
  MapPin,
  Laptop,
  Smartphone,
  Search,
  Filter,
  Activity,
  Globe
} from 'lucide-react';

const PERMISSION_DEFINITIONS = [
  { key: 'view_dashboard', label: 'View Portfolio Dashboard', category: 'Self-Service' },
  { key: 'view_own_statements', label: 'View Statements & Audited Reports', category: 'Self-Service' },
  { key: 'submit_own_deposit', label: 'Log Personal M-Pesa / Bank Deposit', category: 'Self-Service' },
  { key: 'vote_and_ratify', label: 'Vote on Resolutions & Ratify Actions', category: 'Governance' },
  { key: 'request_loan', label: 'Request 80% Share-Backed Loan', category: 'Self-Service' },
  { key: 'manage_deposits', label: 'Approve & Reconcile Member Deposits', category: 'Treasury' },
  { key: 'manage_loans', label: 'Approve & Manage Member Loans', category: 'Treasury' },
  { key: 'distribute_dividends', label: 'Execute MMF & Mansa X Dividend Distributions', category: 'Treasury' },
  { key: 'edit_ledger', label: 'Post & Edit General Ledger Entries', category: 'Treasury' },
  { key: 'manage_members', label: 'Add, Edit & Approve Members', category: 'Governance' },
  { key: 'manage_policies', label: 'Author Bylaws, Advisories & Notices', category: 'Governance' },
  { key: 'send_official_mail', label: 'Dispatch Official Club Emails', category: 'Communications' },
  { key: 'manage_Estate_escrow', label: 'Manage Deceased Member Estate Escrow', category: 'Governance' },
  { key: 'manage_access_control', label: 'Grant Roles, Positions & Permissions (Admin)', category: 'Administration' },
  { key: 'reset_system_baseline', label: 'Reset System Baseline & Configure SMTP', category: 'Administration' }
];

const ACCESS_TIER_OPTIONS = [
  {
    id: 'super_admin',
    label: 'System & Security Administrator (IT)',
    badgeClass: 'bg-[#F6EFEA] text-[#6E3C1B] border border-[#E3D0C1]',
    description: 'Technical administration of system infrastructure, SMTP mail routing, SQLite/MySQL database synchronization, and security baseline.'
  },
  {
    id: 'treasury_admin',
    label: 'Treasury Administrator (Treasurer / CFO)',
    badgeClass: 'bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]',
    description: 'Full financial authority to reconcile Etica MMF & Mansa X deposits, issue member loans, distribute dividends, and manage the double-entry ledger.'
  },
  {
    id: 'executive_officer',
    label: 'Executive Leadership & Committee Officer (CEO, Chairman, Secretary, Compliance, Research)',
    badgeClass: 'bg-[#F4F1EA] text-[#2C3824] border border-[#D8D2C4]',
    description: 'Corporate governance authority for presiding over meetings, executive resolutions, statutory incorporation (Companies Act), policy drafting, and compliance.'
  },
  {
    id: 'general_member',
    label: 'General Member (Verified Shareholder)',
    badgeClass: 'bg-[#F7F6F2] text-[#3E4238] border border-[#E2DDD3]',
    description: 'Self-service access to view personal statements, record M-Pesa deposits, apply for 80% share-backed loans, and vote/ratify club resolutions.'
  },
  {
    id: 'estate_beneficiary',
    label: 'Estate Beneficiary (Read-Only Escrow)',
    badgeClass: 'bg-[#F9ECEC] text-[#6B2424] border border-[#E6C7C7]',
    description: 'Read-only custody access for declared beneficiaries of deceased members under Constitution Clause 4.2.'
  }
];

const OFFICIAL_POSITIONS = [
  'CEO',
  'Chairman',
  'Vice Chairman',
  'Treasurer',
  'Secretary',
  'Compliance Officer',
  'Research Officer',
  'System Administrator (IT)',
  'Member',
  'Beneficiary / Estate Record'
];

export default function AdminAccessMailView() {
  const {
    members,
    assets,
    totalMemberShares,
    currentMember,
    currentUserRbac,
    rbacUsers,
    hasPermission,
    isSuperAdmin,
    isRealSuperAdmin,
    impersonatedAdmin,
    loginAsMember,
    exitImpersonation,
    buildDefaultPermissionsForRole,
    adminUpdateUserAccess,
    adminToggleUserStatus,
    changeOwnPassword,
    mailSettings,
    saveServerMailSettings,
    sendOfficialClubEmail,
    mailLogs,
    securityAuditLogs,
    refreshSecurityBootstrap,
    resetToFactoryDefaults,
    setCurrentMemberId
  } = useApp();

  const canManageAccess = isSuperAdmin || isRealSuperAdmin || hasPermission('manage_access_control');
  const canSendMail = isSuperAdmin || isRealSuperAdmin || hasPermission('send_official_mail');

  const [subTab, setSubTab] = useState('rbac'); // 'rbac' | 'impersonate' | 'mail' | 'smtp' | 'security'
  const [selectedMemberId, setSelectedMemberId] = useState(currentMember?.id || 'MGR-001');
  const [editMemberId, setEditMemberId] = useState(currentMember?.id || 'MGR-001');

  // Impersonation Search & Filter State
  const [impersonateSearch, setImpersonateSearch] = useState('');
  const [impersonateFilter, setImpersonateFilter] = useState('all'); // 'all' | 'exec' | 'general' | 'deceased'

  // Telemetry & Audit Trail Filtering & Search State
  const [auditFilterType, setAuditFilterType] = useState('all'); // 'all' | 'download' | 'access' | 'view' | 'update' | 'create' | 'delete' | 'auth'
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // Selected user for editing
  const selectedUserObj = rbacUsers.find(u => u.memberId === selectedMemberId) || rbacUsers[0];
  const selectedMemberRecord = members.find(m => m.id === selectedMemberId) || members[0];

  const [editName, setEditName] = useState(selectedUserObj?.name || selectedMemberRecord?.name || '');
  const [editNationalId, setEditNationalId] = useState(selectedUserObj?.nationalId || selectedMemberRecord?.nationalId || '');
  const [editLocation, setEditLocation] = useState(selectedUserObj?.locationCity || selectedMemberRecord?.location || '');
  const [editAccountPin, setEditAccountPin] = useState(selectedUserObj?.accountPin || selectedMemberRecord?.accountPin || '1234');
  const [editPosition, setEditPosition] = useState(selectedUserObj?.positionTitle || 'Member');
  const [editTier, setEditTier] = useState(selectedUserObj?.membershipTier || 'General Member');
  const [editAccessLevel, setEditAccessLevel] = useState(selectedUserObj?.accessLevel || 'general_member');
  const [editAccountStatus, setEditAccountStatus] = useState(selectedUserObj?.accountStatus || 'Active');
  const [editEmail, setEditEmail] = useState(selectedUserObj?.email || '');
  const [editPhone, setEditPhone] = useState(selectedUserObj?.phone || '');
  const [editPermissions, setEditPermissions] = useState(
    selectedUserObj?.permissions || buildDefaultPermissionsForRole('general_member', 'Member')
  );
  const [tempPassword, setTempPassword] = useState('');
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const [savingUser, setSavingUser] = useState(false);

  // Mail Composer State
  const [mailAudience, setMailAudience] = useState('all_active');
  const [mailTargetMemberId, setMailTargetMemberId] = useState('MGR-011');
  const [mailCustomEmail, setMailCustomEmail] = useState('');
  const [mailSubject, setMailSubject] = useState(
    'MGR Investment Group — Official Share Register & Accounts Verification (30/10/2026)'
  );
  const [mailBody, setMailBody] = useState(
    `<p>Dear Member,</p>
<p>Following the direct deposits of <strong>Kshs 1,000/=</strong> (Ref: UJDGFAA8WB on 13/10/26) and <strong>Kshs 17,000/=</strong> (Ref: UJSGF05XHV on 28/10/26) to <strong>Etica Capital MMF (Paybill 4096483, Acc 34236M)</strong> by Member No. 011 Leoivard Omondi Ongule, the official accounts stand at:</p>
<ul>
  <li><strong>Total Member Deposits C/F:</strong> KES ${Number(totalMemberShares || 710675).toLocaleString(undefined, { minimumFractionDigits: 2 })} (Excludes non-refundable KES 1,000/= Registration Fee deducted to 2026 Incorporation Pool)</li>
  <li><strong>Registration / Group Reserve Pool:</strong> KES ${Number(assets?.groupReserveAccount?.balance || 11000).toLocaleString(undefined, { minimumFractionDigits: 2 })} (${members.length} &times; KES 1,000/= 2026 Legal Incorporation Fund)</li>
  <li><strong>Mansa X Special Funds:</strong> KES ${Number(assets?.mansaX?.principal || 500000).toLocaleString(undefined, { minimumFractionDigits: 2 })} Principal + KES ${Number(assets?.mansaX?.interestAccrued || 41587).toLocaleString(undefined, { minimumFractionDigits: 2 })} Q3 Interest = KES ${Number(assets?.mansaX?.totalBalance || 541587).toLocaleString(undefined, { minimumFractionDigits: 2 })} (~20% annualised)</li>
  <li><strong>Etica Capital MMF:</strong> KES ${Number(assets?.eticaMmf?.statementBalance || 250209.74).toLocaleString(undefined, { minimumFractionDigits: 2 })} (Official Statement as at ${assets?.eticaMmf?.asOfDate || '31/10/2026'}, includes Leoivard's 18k and October interest)</li>
  <li><strong>Cash in Bank:</strong> KES ${Number(assets?.bankAccount?.balance || 2512).toLocaleString(undefined, { minimumFractionDigits: 2 })} (Equity Bank Kenya - Chama Joint Account)</li>
  <li><strong>Total Chama Portfolio Value:</strong> KES ${(Number(assets?.mansaX?.totalBalance || 541587) + Number(assets?.eticaMmf?.statementBalance || 250209.74) + Number(assets?.bankAccount?.balance || 2512)).toLocaleString(undefined, { minimumFractionDigits: 2 })} (Balanced Sheet)</li>
</ul>
<p>Please sign in to the MGR Investment Group Portal to verify your shares and ratify pending committee actions.</p>
<p>Yours sincerely,<br/><strong>John Kennedy Obalah</strong><br/>CEO</p>`
  );
  const [sendingMail, setSendingMail] = useState(false);

  // SMTP / Mail Server Config State
  const [smtpForm, setSmtpForm] = useState(mailSettings);
  const [savingSmtp, setSavingSmtp] = useState(false);

  // Personal Password Change State
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSelectMemberForRbac = (u) => {
    setSelectedMemberId(u.memberId);
    setEditMemberId(u.memberId);
    const mRecord = members.find(m => m.id === u.memberId) || {};
    setEditName(u.name || mRecord.name || '');
    setEditNationalId(u.nationalId || mRecord.nationalId || '');
    setEditLocation(u.locationCity || mRecord.location || '');
    setEditAccountPin(u.accountPin || mRecord.accountPin || '1234');
    setEditPosition(u.positionTitle);
    setEditTier(u.membershipTier);
    setEditAccessLevel(u.accessLevel);
    setEditAccountStatus(u.accountStatus || 'Active');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditPermissions(u.permissions || buildDefaultPermissionsForRole(u.accessLevel, u.positionTitle));
    setTempPassword('');
  };

  const handleQuickToggleStatus = async (targetId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
    await adminToggleUserStatus(targetId, nextStatus);
    if (targetId === selectedMemberId) {
      setEditAccountStatus(nextStatus);
    }
  };

  const handleAccessLevelPresetChange = (newLevel) => {
    setEditAccessLevel(newLevel);
    if (newLevel === 'super_admin' || newLevel === 'treasury_admin' || newLevel === 'executive_officer') {
      setEditTier('Executive Committee');
    } else if (newLevel === 'estate_beneficiary') {
      setEditTier('Estate Escrow (Deceased)');
      setEditAccountStatus('Estate Read-Only');
    } else {
      setEditTier('General Member');
    }
    setEditPermissions(buildDefaultPermissionsForRole(newLevel, editPosition));
  };

  const handlePositionPresetChange = (newPos) => {
    setEditPosition(newPos);
    let autoLevel = editAccessLevel;
    if (newPos.includes('System Administrator') || newPos.includes('IT')) {
      autoLevel = 'super_admin';
    } else if (newPos.includes('CEO') || newPos.includes('Chairman')) {
      if (!newPos.includes('Vice')) autoLevel = 'super_admin';
      else autoLevel = 'executive_officer';
    } else if (newPos === 'Treasurer') {
      autoLevel = 'treasury_admin';
    } else if (['Vice Chairman', 'Secretary', 'Compliance Officer', 'Research Officer'].includes(newPos)) {
      autoLevel = 'executive_officer';
    } else if (newPos.includes('Beneficiary')) {
      autoLevel = 'estate_beneficiary';
    } else {
      autoLevel = 'general_member';
    }
    setEditAccessLevel(autoLevel);
    setEditTier(
      autoLevel === 'general_member'
        ? 'General Member'
        : autoLevel === 'estate_beneficiary'
          ? 'Estate Escrow (Deceased)'
          : 'Executive Committee'
    );
    setEditPermissions(buildDefaultPermissionsForRole(autoLevel, newPos));
  };

  const handleTogglePerm = (permKey) => {
    setEditPermissions(prev => ({
      ...prev,
      [permKey]: !prev[permKey]
    }));
  };

  const handleSaveUserAccess = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    const res = await adminUpdateUserAccess({
      memberId: selectedMemberId,
      newMemberId: editMemberId,
      name: editName,
      nationalId: editNationalId,
      locationCity: editLocation,
      accountPin: editAccountPin,
      positionTitle: editPosition,
      membershipTier: editTier,
      accessLevel: editAccessLevel,
      accountStatus: editAccountStatus,
      email: editEmail,
      phone: editPhone,
      permissions: editPermissions,
      newPassword: tempPassword,
      notifyUserByEmail: notifyByEmail
    });
    if (res && res.ok && res.memberId) {
      setSelectedMemberId(res.memberId);
      setEditMemberId(res.memberId);
    }
    setTempPassword('');
    setSavingUser(false);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingMail(true);
    await sendOfficialClubEmail({
      audience: mailAudience,
      memberId: mailTargetMemberId,
      customEmail: mailCustomEmail,
      subject: mailSubject,
      messageHtml: mailBody
    });
    setSendingMail(false);
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSavingSmtp(true);
    await saveServerMailSettings(smtpForm);
    setSavingSmtp(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const res = await changeOwnPassword(currPass, newPass);
    if (res.ok) {
      setCurrPass('');
      setNewPass('');
    }
  };

  const filteredImpersonateMembers = members.filter(m => {
    if (impersonateFilter === 'exec' && m.committeeRole !== 'Executive Committee') return false;
    if (impersonateFilter === 'general' && (m.committeeRole === 'Executive Committee' || m.status === 'Deceased')) return false;
    if (impersonateFilter === 'deceased' && m.status !== 'Deceased') return false;

    if (!impersonateSearch) return true;
    const q = impersonateSearch.toLowerCase().trim();
    const uRbac = rbacUsers.find(u => u.memberId === m.id);
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.id && m.id.toLowerCase().includes(q)) ||
      (m.phone && m.phone.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      (uRbac?.positionTitle && uRbac.positionTitle.toLowerCase().includes(q)) ||
      (uRbac?.email && uRbac.email.toLowerCase().includes(q))
    );
  });

  if (!isRealSuperAdmin && !canManageAccess && !impersonatedAdmin) {
    return (
      <div className="bank-card p-8 text-center space-y-4 max-w-lg mx-auto my-12 bg-white border border-[#E2DDD3] shadow-md rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 font-editorial">
            Restricted to System Administrator
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Admin Dashboard, user impersonation controls, and server configuration are strictly restricted to the designated System Administrator. General members and non-admin executive officers cannot view or execute admin actions.
          </p>
        </div>
        <div className="pt-2">
          <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Current Session: {currentMember?.name} ({currentUserRbac?.accessLevel?.replace('_', ' ') || 'General Member'})
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="bank-card p-4 sm:p-6 bg-gradient-to-r from-[#1D3B2A] to-[#13281C] text-white border-0 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--accent-gold-light)] border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator Dashboard &amp; Governance Console</span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl font-bold text-white">
              Admin Dashboard, Account Impersonation &amp; System Control
            </h1>
            <p className="text-xs text-white/80 max-w-3xl leading-relaxed">
              Exclusively available to the System Administrator to manage member access tiers, sign into member accounts for self-service audit &amp; support, dispatch official emails, and inspect the security audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-black/25 border border-white/15 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-white/60 block">Active Admin Session</span>
              <span className="font-bold text-white">
                {currentMember?.name} • <span className="text-[var(--accent-gold-light)]">{currentUserRbac?.positionTitle || currentMember?.role}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => refreshSecurityBootstrap()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync SQLite</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("⚠️ RESTORE BASELINE FIGURES:\n\nAre you sure you want to restore the official October 30, 2026 statement baseline figures? This will restore all verified member share balances, asset accounts, and ledger schedules to factory baseline.")) {
                  resetToFactoryDefaults();
                }
              }}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs font-bold text-amber-200 flex items-center gap-1.5 transition cursor-pointer"
              title="Restore official 30/10/2026 statement baseline figures (Restricted to System Administrator)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>Set to 30/10/2026 Baseline</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation pills */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-white/15">
          <button
            type="button"
            onClick={() => setSubTab('rbac')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'rbac' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. Roles &amp; Permissions (RBAC)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('impersonate')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'impersonate' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>2. Log In As Member (Impersonation)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('mail')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'mail' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>3. Official Email Dispatch &amp; Outbox</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('smtp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'smtp' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>4. cPanel Mail / SMTP Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('security')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>5. Telemetry &amp; Security Logs</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RBAC & MEMBER POSITIONS */}
      {subTab === 'rbac' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Member Roster */}
          <div className="lg:col-span-5 bank-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <h2 className="font-bold text-sm text-slate-900">
                  MGR Member Directory &amp; Access Tiers
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select any member to inspect or customize their position &amp; permissions
                </p>
              </div>
              <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                {rbacUsers.length} Accounts
              </span>
            </div>

            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {rbacUsers.map((u) => {
                const mObj = members.find(m => m.id === u.memberId) || { id: u.memberId, name: u.name, gender: 'male' };
                const tierMeta = ACCESS_TIER_OPTIONS.find(t => t.id === u.accessLevel) || ACCESS_TIER_OPTIONS[3];
                const isSelected = u.memberId === selectedMemberId;
                const enabledCount = Object.values(u.permissions || {}).filter(Boolean).length;

                return (
                  <div
                    key={u.memberId}
                    onClick={() => handleSelectMemberForRbac(u)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--brand-tint)] border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MemberAvatarIcon member={mObj} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {u.name}
                            </p>
                            <span className="font-mono-num text-[10px] font-bold text-slate-500">
                              ({u.memberId})
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-[var(--brand-primary)] truncate">
                            {u.positionTitle} • <span className="text-slate-500 font-normal">{u.membershipTier}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${tierMeta.badgeClass}`}>
                        {u.accessLevel.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[120px] sm:max-w-none">{u.email}</span>
                        {u.accountStatus === 'Deactivated' || u.accountStatus === 'Suspended' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            {u.accountStatus.toUpperCase()}
                          </span>
                        ) : u.accountStatus === 'Estate Read-Only' ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                            ESTATE
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono-num font-bold text-slate-700 hidden sm:inline">
                          {enabledCount}/15
                        </span>
                        {canManageAccess && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickToggleStatus(u.memberId, u.accountStatus || 'Active');
                            }}
                            title={u.accountStatus === 'Deactivated' || u.accountStatus === 'Suspended' ? 'Activate this user account' : 'Deactivate this user account'}
                            className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 cursor-pointer text-[10px] border ${
                              u.accountStatus === 'Deactivated' || u.accountStatus === 'Suspended'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <Power className="w-2.5 h-2.5" />
                            <span>{u.accountStatus === 'Deactivated' || u.accountStatus === 'Suspended' ? 'Activate' : 'Deactivate'}</span>
                          </button>
                        )}
                        {isRealSuperAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              loginAsMember(u.memberId);
                            }}
                            title="Log in and view portal as this member"
                            className="px-2 py-0.5 rounded bg-[#1D3B2A] hover:bg-[#13281C] text-white font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                          >
                            <KeyRound className="w-2.5 h-2.5 text-[var(--accent-gold-light)]" />
                            <span>Log In</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Access Control & Position Editor */}
          <div className="lg:col-span-7 bank-card p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <MemberAvatarIcon member={selectedMemberRecord} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-slate-900">
                      {selectedUserObj?.name}
                    </h2>
                    <span className="font-mono-num text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {selectedUserObj?.memberId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Share Standing: <strong className="font-mono-num text-slate-800">KES {Number(selectedMemberRecord?.shares || 0).toLocaleString()}</strong> • Status:{' '}
                    <span className={`inline-block font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      editAccountStatus === 'Deactivated' || editAccountStatus === 'Suspended'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : editAccountStatus === 'Estate Read-Only'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {editAccountStatus.toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canManageAccess && (
                  <button
                    type="button"
                    onClick={() => handleQuickToggleStatus(selectedMemberId, editAccountStatus)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-xs ${
                      editAccountStatus === 'Deactivated' || editAccountStatus === 'Suspended'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                    }`}
                  >
                    {editAccountStatus === 'Deactivated' || editAccountStatus === 'Suspended' ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Activate Account</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Deactivate Account</span>
                      </>
                    )}
                  </button>
                )}
                {!canManageAccess && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Read-Only (Super Admin Required to Edit)</span>
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveUserAccess} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Full Name
                  </label>
                  <input
                    disabled={!canManageAccess}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Member Number / ID
                  </label>
                  <input
                    disabled={!canManageAccess}
                    type="text"
                    value={editMemberId}
                    onChange={(e) => setEditMemberId(e.target.value.trim())}
                    placeholder="e.g. MGR-001 or 011"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-[var(--brand-primary)] bg-white disabled:bg-slate-100"
                    title="Change official member identifier (cascades across database, loans & votes)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    National ID / Passport No.
                  </label>
                  <input
                    disabled={!canManageAccess}
                    type="text"
                    value={editNationalId}
                    onChange={(e) => setEditNationalId(e.target.value.trim())}
                    placeholder="e.g. 12345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    County / City of Residence
                  </label>
                  <input
                    disabled={!canManageAccess}
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Nairobi, Kenya"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4-Digit Security PIN (KYC Vault &amp; Approvals)
                  </label>
                  <input
                    disabled={!canManageAccess}
                    type="text"
                    maxLength={4}
                    value={editAccountPin}
                    onChange={(e) => setEditAccountPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="4 digits"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold tracking-widest text-[var(--brand-primary)] bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Security Status
                  </label>
                  <select
                    disabled={!canManageAccess}
                    value={editAccountStatus}
                    onChange={(e) => setEditAccountStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  >
                    <option value="Active">Active (Full Sign-In &amp; Access Enabled)</option>
                    <option value="Deactivated">Deactivated (Sign-In Blocked by Admin)</option>
                    <option value="Suspended">Suspended (Sign-In Blocked)</option>
                    <option value="Estate Read-Only">Estate Read-Only (Beneficiary View)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Club Position / Title
                  </label>
                  <select
                    disabled={!canManageAccess}
                    value={editPosition}
                    onChange={(e) => handlePositionPresetChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  >
                    {OFFICIAL_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Membership Category
                  </label>
                  <select
                    disabled={!canManageAccess}
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  >
                    <option value="Executive Committee">Executive Committee</option>
                    <option value="General Member">General Member</option>
                    <option value="Estate Escrow (Deceased)">Estate Escrow (Deceased)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    System Access Role Tier
                  </label>
                  <select
                    disabled={!canManageAccess}
                    value={editAccessLevel}
                    onChange={(e) => handleAccessLevelPresetChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  >
                    {ACCESS_TIER_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email (For OTP &amp; Notices)
                  </label>
                  <input
                    type="email"
                    disabled={!canManageAccess}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Phone Number
                  </label>
                  <input
                    type="text"
                    disabled={!canManageAccess}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    Granular Position &amp; Membership Permissions (15 Capabilities)
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Toggle individual rights for {selectedUserObj?.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PERMISSION_DEFINITIONS.map((perm) => {
                    const checked = !!editPermissions[perm.key];
                    return (
                      <label
                        key={perm.key}
                        className={`p-2 rounded-lg border text-xs flex items-start gap-2 transition ${
                          checked
                            ? 'bg-white border-[#1D3B2A] text-slate-900 font-semibold'
                            : 'bg-slate-100/70 border-slate-200 text-slate-500'
                        } ${canManageAccess ? 'cursor-pointer' : 'opacity-80'}`}
                      >
                        <input
                          type="checkbox"
                          disabled={!canManageAccess}
                          checked={checked}
                          onChange={() => handleTogglePerm(perm.key)}
                          className="mt-0.5 rounded text-[var(--brand-primary)]"
                        />
                        <div className="min-w-0">
                          <span className="block leading-tight">{perm.label}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">
                            {perm.category}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Admin Password Reset & Email Notification */}
              {canManageAccess && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Assign New Password (Optional)
                    </label>
                    <input
                      type="text"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Leave blank to keep existing password"
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono-num text-slate-900"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-2 sm:pt-4">
                    <input
                      type="checkbox"
                      checked={notifyByEmail}
                      onChange={(e) => setNotifyByEmail(e.target.checked)}
                      className="mt-0.5 rounded text-[var(--brand-primary)]"
                    />
                    <span>
                      Email <strong>{selectedUserObj?.name}</strong> their updated position, access rights &amp; temporary password via cPanel Mail
                    </span>
                  </label>
                </div>
              )}

              {canManageAccess && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingUser ? 'Saving to SQLite...' : `Save Position & Access for ${selectedUserObj?.name}`}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM ADMIN LOG IN AS MEMBER (IMPERSONATION) */}
      {subTab === 'impersonate' && (
        <div className="space-y-4">
          {/* Institutional Information & Security Notice */}
          <div className="bank-card p-5 bg-white border border-[#E2DDD3] space-y-3 shadow-xs rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1D3B2A] text-[var(--accent-gold-light)] flex items-center justify-center shrink-0 shadow-inner">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-editorial">
                    System Administrator Account Impersonation &amp; Support Console
                  </h2>
                  <p className="text-xs text-slate-600">
                    Strictly authorized for the System Administrator to test member self-service portals, audit personal shares, verify loan limits, and provide direct technical support.
                  </p>
                </div>
              </div>

              {impersonatedAdmin ? (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Active Persona</span>
                    <span className="text-xs font-bold text-slate-900">{currentMember?.name} ({currentMember?.id})</span>
                  </div>
                  <button
                    type="button"
                    onClick={exitImpersonation}
                    className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Exit Persona</span>
                    <span className="font-mono">➔</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-[#EDF1ED] border border-[#CCD7CD] px-3 py-1.5 rounded-xl text-xs shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#1D3B2A]" />
                  <span className="font-bold text-[#1D3B2A]">
                    System Admin Status: Authenticated ({currentUserRbac?.name || currentMember?.name})
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">🔒 Zero Password Exposure</span>
                <p className="text-[11px] leading-relaxed">
                  You can inspect exactly what any member sees in their portal without accessing or resetting their private account password or 4-digit PIN.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">📜 Forensic Audit Logging</span>
                <p className="text-[11px] leading-relaxed">
                  Every account impersonation action is logged in the permanent security audit register with timestamp, device details, and original admin ID.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">⚡ Persistent Return Banner</span>
                <p className="text-[11px] leading-relaxed">
                  While impersonating, a prominent banner remains at the top of every page. One click returns you directly to this System Admin dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Member Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member by name, ID (e.g. MGR-002), phone, or position..."
                value={impersonateSearch}
                onChange={(e) => setImpersonateSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Members' },
                { id: 'exec', label: 'Executive Committee (7)' },
                { id: 'general', label: 'General Members' },
                { id: 'deceased', label: 'Deceased Estate' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setImpersonateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    impersonateFilter === f.id
                      ? 'bg-[var(--brand-primary)] text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Member Impersonation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredImpersonateMembers.map(m => {
              const uRbac = rbacUsers.find(u => u.memberId === m.id);
              const isCurrent = currentMember?.id === m.id;
              const isExec = m.committeeRole === 'Executive Committee';
              const isDeceased = m.status === 'Deceased';

              return (
                <div
                  key={m.id}
                  className={`bank-card p-4 flex flex-col justify-between space-y-3 transition border rounded-2xl ${
                    isCurrent
                      ? 'bg-[var(--brand-tint)]/40 border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20 shadow-md'
                      : 'bg-white border-[#E2DDD3] hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MemberAvatarIcon member={m} size="md" />
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 truncate">
                            {m.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <span className="font-mono-num font-bold text-slate-700 bg-slate-100 px-1 rounded">
                              {m.id}
                            </span>
                            <span>•</span>
                            <span className="font-semibold truncate text-[var(--brand-primary)]">
                              {uRbac?.positionTitle || m.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isDeceased
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : isExec
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {isDeceased ? 'DECEASED' : isExec ? 'EXECUTIVE' : 'GENERAL'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Net Shares</span>
                        <span className="font-mono-num font-bold text-slate-800">
                          KES {Number(m.shares || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Access Level</span>
                        <span className="font-mono-num font-bold text-slate-800 capitalize">
                          {uRbac?.accessLevel?.replace('_', ' ') || 'General Member'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono space-y-0.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="truncate">
                        <span className="text-slate-400">Phone: </span>
                        <strong className="text-slate-700">{m.phone || 'Not registered'}</strong>
                      </div>
                      <div className="truncate">
                        <span className="text-slate-400">Email: </span>
                        <span className="text-slate-700">{uRbac?.email || 'member@domain.com'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    {isCurrent ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#1D3B2A] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Currently Active</span>
                        </span>
                        {impersonatedAdmin && (
                          <button
                            type="button"
                            onClick={exitImpersonation}
                            className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                          >
                            Exit Persona
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isRealSuperAdmin}
                        onClick={() => loginAsMember(m.id)}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isRealSuperAdmin
                            ? 'bg-[#1D3B2A] hover:bg-[#13281C] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        }`}
                        title={isRealSuperAdmin ? `Log in and view portal as ${m.name}` : 'Restricted to System Administrator'}
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
                        <span>Log In As {m.name.split(' ')[0]} ➔</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredImpersonateMembers.length === 0 && (
            <div className="bank-card p-8 text-center text-slate-500 text-xs">
              No members matched your search query &ldquo;{impersonateSearch}&rdquo;.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OFFICIAL EMAIL DISPATCH & OUTBOX */}
      {subTab === 'mail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bank-card p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Compose Official Treasury / Governance Email</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatches formatted HTML emails directly through your cPanel server (`mail()` or configured SMTP).
              </p>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Recipient Group
                  </label>
                  <select
                    value={mailAudience}
                    onChange={(e) => setMailAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  >
                    <option value="all_active">All 10 Active Members</option>
                    <option value="executive">Executive Committee (7 Members)</option>
                    <option value="all_members">All 11 Records (Incl. Estate)</option>
                    <option value="single">Single Specific Member</option>
                    <option value="custom">Custom External Email Address</option>
                  </select>
                </div>

                {mailAudience === 'single' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Member
                    </label>
                    <select
                      value={mailTargetMemberId}
                      onChange={(e) => setMailTargetMemberId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    >
                      {rbacUsers.map(u => (
                        <option key={u.memberId} value={u.memberId}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {mailAudience === 'custom' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={mailCustomEmail}
                      onChange={(e) => setMailCustomEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message Content (HTML or Plain Text)
                </label>
                <textarea
                  rows={8}
                  required
                  value={mailBody}
                  onChange={(e) => setMailBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-num text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Active Transport: <strong>{mailSettings.transport === 'smtp' ? `SMTP (${mailSettings.smtpHost})` : 'cPanel Native PHP mail()'}</strong>
                </span>
                <button
                  type="submit"
                  disabled={sendingMail || !canSendMail}
                  className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendingMail ? 'Dispatching Email...' : 'Send Official Email'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Outbox & Delivery Log */}
          <div className="lg:col-span-6 bank-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="font-bold text-base text-slate-900">
                  SQLite Dispatched Email Outbox Log
                </h2>
                <p className="text-xs text-slate-500">
                  Audit record of all OTP codes, access notices, and treasury circulars sent
                </p>
              </div>
              <span className="text-xs font-mono-num font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                {mailLogs.length} Sent
              </span>
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {mailLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No emails logged yet. Send a test notice or OTP to populate the SQLite mail log.
                </div>
              ) : (
                mailLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {log.subject}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD] shrink-0">
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>To: <strong>{log.recipient_email}</strong></span>
                      <span className="font-mono-num text-[10px] text-slate-400">{log.created_at}</span>
                    </div>
                    {log.body_preview && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-200/60">
                        {log.body_preview}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CPANEL MAIL / SMTP CONFIGURATION */}
      {subTab === 'smtp' && (
        <div className="bank-card p-5 max-w-3xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>cPanel Mail &amp; SMTP Server Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              By default, cPanel&apos;s native <code>PHP mail()</code> works out-of-the-box using your domain&apos;s local Exim mail router. You may also configure a dedicated cPanel Email Account via authenticated SMTP.
            </p>
          </div>

          <form onSubmit={handleSaveSmtp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mail Delivery Transport
                </label>
                <select
                  value={smtpForm.transport || 'php_mail'}
                  onChange={(e) => setSmtpForm({ ...smtpForm, transport: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="php_mail">cPanel Native PHP mail() (Zero-Config Default)</option>
                  <option value="smtp">Authenticated cPanel SMTP Socket (SSL/TLS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={smtpForm.fromName || ''}
                  onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Email Address (cPanel Domain Email)
                </label>
                <input
                  type="email"
                  value={smtpForm.fromEmail || ''}
                  onChange={(e) => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reply-To Email Address
                </label>
                <input
                  type="email"
                  value={smtpForm.replyTo || ''}
                  onChange={(e) => setSmtpForm({ ...smtpForm, replyTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            {smtpForm.transport === 'smtp' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    cPanel SMTP Host
                  </label>
                  <input
                    type="text"
                    value={smtpForm.smtpHost || ''}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtpHost: e.target.value })}
                    placeholder="mail.yourdomain.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={smtpForm.smtpPort || 465}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtpPort: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-num font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Encryption
                    </label>
                    <select
                      value={smtpForm.smtpEncryption || 'ssl'}
                      onChange={(e) => setSmtpForm({ ...smtpForm, smtpEncryption: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    >
                      <option value="ssl">SSL (Port 465)</option>
                      <option value="tls">STARTTLS (Port 587)</option>
                      <option value="none">None (Port 25)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Username (Full cPanel Email)
                  </label>
                  <input
                    type="text"
                    value={smtpForm.smtpUsername || ''}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtpUsername: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={smtpForm.smtpPassword || ''}
                    onChange={(e) => setSmtpForm({ ...smtpForm, smtpPassword: e.target.value })}
                    placeholder="Enter cPanel email password"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!smtpForm.notifyOnLogin}
                  onChange={(e) => setSmtpForm({ ...smtpForm, notifyOnLogin: e.target.checked })}
                />
                <span>Send Security Email Alert on Every Member Login</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!smtpForm.notifyOnDeposit}
                  onChange={(e) => setSmtpForm({ ...smtpForm, notifyOnDeposit: e.target.checked })}
                />
                <span>Email Receipt on Verified Deposit</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={savingSmtp || !canManageAccess}
              className="px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 disabled:opacity-50 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              {savingSmtp ? 'Saving Settings...' : 'Save Mail Server Configuration'}
            </button>
          </form>

          {/* System Financial Baseline Reset Tool Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DDD3] space-y-2.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2DDD3] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">
                    System Financial Baseline Restoration (October 30, 2026)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Restores verified initial ledger statements, member equity deposits, and asset valuations
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0 self-start sm:self-auto">
                System Admin Tool
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              If experimental entries, testing records, or mock transactions have altered the ledger, clicking below restores the official audited figures: <strong>KES 710,675.00</strong> net member shares, <strong>KES 541,587.00</strong> Mansa X, <strong>KES 250,209.74</strong> Etica MMF, and <strong>KES 2,512.00</strong> Equity Bank.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("⚠️ RESTORE BASELINE FIGURES:\n\nAre you sure you want to restore the official October 30, 2026 statement baseline figures? This will reset all modified balances, ledgers, and loan records to the verified baseline figures.")) {
                    resetToFactoryDefaults();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                <span>Reset Portal to Official 30/10/2026 Baseline Figures</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PERSONAL PASSWORD & AUDIT TELEMETRY (KYC, DOWNLOADS, DATA ACCESS, IP, OPEN LOCATION, DEVICE, BROWSER) */}
      {subTab === 'security' && (() => {
        const fallbackAuditLogs = [
          {
            id: 'mgr_audit_init_1',
            action_type: 'download',
            action_summary: 'Downloaded Official PDF: MGR_Member_App_Guide_and_Orientation_Circular.pdf',
            actor_id: 'MGR-011',
            actor_name: 'Leoivard Omondi Ongule',
            actor_role: 'Treasurer',
            target_resource: 'MGR_Member_App_Guide_and_Orientation_Circular.pdf',
            ip_address: '102.219.208.12',
            location_open: 'Kisumu, Kisumu County, Kenya',
            latitude: '-0.091702',
            longitude: '34.767956',
            device_info: 'Android Mobile (Samsung Galaxy)',
            browser_info: 'Google Chrome 128',
            created_at: '2026-11-17 18:42:15'
          },
          {
            id: 'mgr_audit_init_2',
            action_type: 'access',
            action_summary: 'Inspected KYC Document Vault for Member MGR-003 (PIN Authorized)',
            actor_id: 'MGR-001',
            actor_name: 'John Kennedy Obalah',
            actor_role: 'Chief Executive Officer (CEO)',
            target_resource: 'KYC Vault: National ID & KRA PIN',
            ip_address: '197.237.12.84',
            location_open: 'Nairobi, Nairobi County, Kenya',
            latitude: '-1.286389',
            longitude: '36.817223',
            device_info: 'Windows 11 PC (Desktop)',
            browser_info: 'Google Chrome 129',
            created_at: '2026-11-17 17:15:30'
          },
          {
            id: 'mgr_audit_init_3',
            action_type: 'view',
            action_summary: 'Viewed Q3 Mansa X Portfolio Ledger & Yield Prorating Policy',
            actor_id: 'MGR-009',
            actor_name: 'Dr Joash Migosi PhD',
            actor_role: 'Research Officer',
            target_resource: 'Mansa X Special Funds & Yield Accruals',
            ip_address: '105.160.44.19',
            location_open: 'Nairobi, Kenya',
            latitude: '-1.292066',
            longitude: '36.821946',
            device_info: 'Apple Mac (macOS Sonoma)',
            browser_info: 'Apple Safari 17.5',
            created_at: '2026-11-17 15:30:10'
          },
          {
            id: 'mgr_audit_init_4',
            action_type: 'update',
            action_summary: 'Updated Member Profile & Registered 4-Digit Security PIN',
            actor_id: 'MGR-004',
            actor_name: 'Dan Aloo',
            actor_role: 'Executive Chairman',
            target_resource: 'Member Profile: National ID & Location City',
            ip_address: '41.89.22.10',
            location_open: 'Nakuru, Rift Valley, Kenya',
            latitude: '-0.303099',
            longitude: '36.080025',
            device_info: 'Windows 10 PC',
            browser_info: 'Microsoft Edge 128',
            created_at: '2026-11-17 14:05:22'
          },
          {
            id: 'mgr_audit_init_5',
            action_type: 'create',
            action_summary: 'New Member Registration: MGR-011 Leoivard Omondi Ongule',
            actor_id: 'MGR-011',
            actor_name: 'Leoivard Omondi Ongule',
            actor_role: 'Treasurer',
            target_resource: 'Share Registry • Cap 30A',
            ip_address: '102.219.208.12',
            location_open: 'Kisumu, Kenya',
            latitude: '-0.091702',
            longitude: '34.767956',
            device_info: 'Android Mobile',
            browser_info: 'Google Chrome 128',
            created_at: '2026-11-17 12:00:00'
          }
        ];

        const allLogs = securityAuditLogs && securityAuditLogs.length > 0 ? securityAuditLogs : fallbackAuditLogs;

        // KPI Calculations
        const totalCount = allLogs.length;
        const downloadCount = allLogs.filter(e => e.action_type === 'download' || (e.action_summary && e.action_summary.toLowerCase().includes('download'))).length;
        const accessCount = allLogs.filter(e => e.action_type === 'access' || (e.action_summary && (e.action_summary.toLowerCase().includes('access') || e.action_summary.toLowerCase().includes('vault')))).length;
        const viewCount = allLogs.filter(e => e.action_type === 'view' || (e.action_summary && e.action_summary.toLowerCase().includes('view'))).length;
        const updateCount = allLogs.filter(e => e.action_type === 'update' || (e.action_summary && (e.action_summary.toLowerCase().includes('update') || e.action_summary.toLowerCase().includes('edit')))).length;
        const createCount = allLogs.filter(e => e.action_type === 'create' || (e.action_summary && (e.action_summary.toLowerCase().includes('create') || e.action_summary.toLowerCase().includes('sign up')))).length;
        const deleteCount = allLogs.filter(e => e.action_type === 'delete' || (e.action_summary && (e.action_summary.toLowerCase().includes('delete') || e.action_summary.toLowerCase().includes('revoke')))).length;
        const uniqueLocationsCount = new Set(allLogs.map(e => e.location_open || e.ip_address).filter(Boolean)).size;

        // Filter and Search Logic
        const filteredLogs = allLogs.filter(item => {
          if (auditFilterType !== 'all') {
            const t = (item.action_type || '').toLowerCase();
            const s = (item.action_summary || '').toLowerCase();
            if (auditFilterType === 'download' && t !== 'download' && !s.includes('download')) return false;
            if (auditFilterType === 'access' && t !== 'access' && !s.includes('access') && !s.includes('vault')) return false;
            if (auditFilterType === 'view' && t !== 'view' && !s.includes('view')) return false;
            if (auditFilterType === 'update' && t !== 'update' && !s.includes('update') && !s.includes('edit')) return false;
            if (auditFilterType === 'create' && t !== 'create' && !s.includes('create') && !s.includes('sign up')) return false;
            if (auditFilterType === 'delete' && t !== 'delete' && !s.includes('delete') && !s.includes('revoke')) return false;
            if (auditFilterType === 'auth' && t !== 'auth' && !s.includes('auth') && !s.includes('login') && !s.includes('password')) return false;
          }
          if (auditSearchQuery.trim()) {
            const q = auditSearchQuery.toLowerCase().trim();
            const matches =
              (item.actor_name || '').toLowerCase().includes(q) ||
              (item.actor_id || '').toLowerCase().includes(q) ||
              (item.action_summary || '').toLowerCase().includes(q) ||
              (item.target_resource || '').toLowerCase().includes(q) ||
              (item.ip_address || '').toLowerCase().includes(q) ||
              (item.location_open || '').toLowerCase().includes(q) ||
              (item.device_info || '').toLowerCase().includes(q) ||
              (item.browser_info || '').toLowerCase().includes(q);
            if (!matches) return false;
          }
          return true;
        });

        const getBadgeMeta = (type = '', summary = '') => {
          const t = (type || '').toLowerCase();
          const s = (summary || '').toLowerCase();
          if (t === 'download' || s.includes('download')) {
            return {
              label: 'Download',
              icon: <Download className="w-3 h-3 text-[#1D3B2A]" />,
              style: 'bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]'
            };
          }
          if (t === 'access' || s.includes('access') || s.includes('vault')) {
            return {
              label: 'Data Access',
              icon: <Lock className="w-3 h-3 text-[#78350F]" />,
              style: 'bg-[#FDF6E2] text-[#78350F] border border-[#FDE68A]'
            };
          }
          if (t === 'view' || s.includes('view')) {
            return {
              label: 'View',
              icon: <Eye className="w-3 h-3 text-[#334155]" />,
              style: 'bg-[#F8F7F4] text-[#334155] border border-[#CBD5E1]'
            };
          }
          if (t === 'update' || s.includes('update') || s.includes('edit')) {
            return {
              label: 'Update',
              icon: <Edit3 className="w-3 h-3 text-[#2C3824]" />,
              style: 'bg-[#F4F1EA] text-[#2C3824] border border-[#D8D2C4]'
            };
          }
          if (t === 'create' || s.includes('create') || s.includes('sign up')) {
            return {
              label: 'Create',
              icon: <PlusCircle className="w-3 h-3 text-[#1D3B2A]" />,
              style: 'bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]'
            };
          }
          if (t === 'delete' || s.includes('delete') || s.includes('revoke')) {
            return {
              label: 'Delete',
              icon: <Trash2 className="w-3 h-3 text-[#991B1B]" />,
              style: 'bg-[#FDF2F2] text-[#991B1B] border border-[#FECACA]'
            };
          }
          return {
            label: 'Auth',
            icon: <ShieldCheck className="w-3 h-3 text-[#6E3C1B]" />,
            style: 'bg-[#F6EFEA] text-[#6E3C1B] border border-[#E3D0C1]'
          };
        };

        return (
          <div className="space-y-5">
            {/* TOP ROW: PASSWORD MANAGEMENT & AUDIT TELEMETRY OVERVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Executive Password Card */}
              <div className="lg:col-span-4 bank-card p-5 space-y-4">
                <div className="border-b border-[#D8D2C4] pb-3">
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#1D3B2A]" />
                    <span>Change My Personal Password</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Update security password for <strong>{currentMember?.name} ({currentMember?.id})</strong> stored via salted bcrypt in SQLite.
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={currPass}
                      onChange={(e) => setCurrPass(e.target.value)}
                      placeholder="Enter current password (default: MGR@2026)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      New Password (Min. 6 Characters)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D3B2A]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-xs shadow-sm cursor-pointer transition min-h-[40px]"
                  >
                    Update My Password
                  </button>
                </form>
              </div>

              {/* Statutory Compliance & Telemetry Banner */}
              <div className="lg:col-span-8 bank-card p-5 space-y-4 bg-[#FAF8F5] border border-[#D8D2C4]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8D2C4] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#1D3B2A]" />
                      <h2 className="font-bold text-sm sm:text-base text-slate-900">
                        Statutory Audit Telemetry &amp; Access Register
                      </h2>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Constitution of Kenya Art. 31 &amp; Data Protection Act 2019 • Live tracking of data access, PDF downloads, views, updates, creations, deletions, IP, open location, and device environment.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshSecurityBootstrap}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#1D3B2A] border border-[#D8D2C4] hover:bg-slate-50 transition shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#1D3B2A]" />
                    <span>Refresh Audit Stream</span>
                  </button>
                </div>

                {/* KPI METRIC CARDS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Total Actions</span>
                      <Activity className="w-3 h-3 text-[#1D3B2A]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-slate-900 mt-1">
                      {totalCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Logged in Registry</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Downloads</span>
                      <Download className="w-3 h-3 text-[#1D3B2A]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#1D3B2A] mt-1">
                      {downloadCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">PDF Documents</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Data Access</span>
                      <Lock className="w-3 h-3 text-[#78350F]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#78350F] mt-1">
                      {accessCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">KYC Vault Inquiries</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Document Views</span>
                      <Eye className="w-3 h-3 text-[#334155]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#334155] mt-1">
                      {viewCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Statements &amp; Policies</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Updates &amp; Edits</span>
                      <Edit3 className="w-3 h-3 text-[#2C3824]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#2C3824] mt-1">
                      {updateCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Profiles &amp; Records</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Creations</span>
                      <PlusCircle className="w-3 h-3 text-[#1D3B2A]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#1D3B2A] mt-1">
                      {createCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">New Accounts / Rows</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Deletions</span>
                      <Trash2 className="w-3 h-3 text-[#991B1B]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#991B1B] mt-1">
                      {deleteCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Revocations / Purges</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#D8D2C4] shadow-xs">
                    <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                      <span>Open Geographies</span>
                      <Globe className="w-3 h-3 text-[#6E3C1B]" />
                    </p>
                    <p className="text-lg font-bold font-mono-num text-[#6E3C1B] mt-1">
                      {uniqueLocationsCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">Unique IP Locales</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIT LOG TELEMETRY TABLE CARD */}
            <div className="bank-card p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1D3B2A]" />
                    <span>Granular Action Ledger &amp; Open Location Telemetry</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing {filteredLogs.length} of {allLogs.length} events • All client locations, IPs, devices, and browsers are recorded openly for institutional accountability.
                  </p>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative w-full md:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Search member, IP, location, device..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#1D3B2A]"
                  />
                  {auditSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setAuditSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* ACTION CATEGORY FILTER BUTTONS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3" />
                  <span>Filter:</span>
                </span>

                {[
                  { id: 'all', label: `All (${totalCount})` },
                  { id: 'download', label: `Downloads (${downloadCount})` },
                  { id: 'access', label: `Data Access (${accessCount})` },
                  { id: 'view', label: `Views (${viewCount})` },
                  { id: 'update', label: `Updates (${updateCount})` },
                  { id: 'create', label: `Creations (${createCount})` },
                  { id: 'delete', label: `Deletions (${deleteCount})` },
                  { id: 'auth', label: 'Auth & Logins' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAuditFilterType(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                      auditFilterType === tab.id
                        ? 'bg-[#1D3B2A] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-slate-700 hover:bg-slate-100 border border-[#D8D2C4]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TABLE CONTAINER */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#D8D2C4] text-slate-700 font-bold">
                        <th className="py-2.5 px-3">Date &amp; Time</th>
                        <th className="py-2.5 px-3">Actor &amp; Role</th>
                        <th className="py-2.5 px-3">Action Type</th>
                        <th className="py-2.5 px-3">Summary &amp; Target Resource</th>
                        <th className="py-2.5 px-3">Open Physical Location &amp; IP</th>
                        <th className="py-2.5 px-3">Device &amp; Browser</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No telemetry audit records match your search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((item) => {
                          const badge = getBadgeMeta(item.action_type, item.action_summary);
                          const lat = item.latitude;
                          const lon = item.longitude;
                          const mapUrl = (lat && lon && String(lat).trim() !== '' && String(lon).trim() !== '')
                            ? `https://www.google.com/maps?q=${lat},${lon}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location_open || 'Nairobi, Kenya')}`;

                          const isMobile = (item.device_info || '').toLowerCase().includes('mobile') || (item.device_info || '').toLowerCase().includes('android') || (item.device_info || '').toLowerCase().includes('iphone');

                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition">
                              {/* Date & Time */}
                              <td className="py-2.5 px-3 whitespace-nowrap align-top font-mono-num text-[11px] text-slate-600">
                                {item.created_at || 'Just now'}
                              </td>

                              {/* Actor */}
                              <td className="py-2.5 px-3 align-top whitespace-nowrap">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{item.actor_name || 'Member'}</span>
                                  {item.actor_id && (
                                    <span className="text-[9px] font-mono-num font-bold px-1.5 py-0.2 rounded bg-[#F8F7F4] text-[#4A4742] border border-[#DDD9D0]">
                                      {item.actor_id}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  {item.actor_role || 'General Member'}
                                </div>
                              </td>

                              {/* Action Type Badge */}
                              <td className="py-2.5 px-3 align-top whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${badge.style}`}>
                                  {badge.icon}
                                  <span>{badge.label}</span>
                                </span>
                              </td>

                              {/* Action Summary & Target Resource */}
                              <td className="py-2.5 px-3 align-top max-w-xs sm:max-w-md">
                                <p className="font-semibold text-slate-900 leading-snug">
                                  {item.action_summary}
                                </p>
                                {item.target_resource && (
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 break-all">
                                    Target: {item.target_resource}
                                  </p>
                                )}
                              </td>

                              {/* Open Physical Location & IP */}
                              <td className="py-2.5 px-3 align-top whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900">
                                      {item.location_open || 'Nairobi, Kenya'}
                                    </span>
                                    <a
                                      href={mapUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF8F5] text-[#1D3B2A] border border-[#D8D2C4] hover:bg-[#EDF1ED] transition cursor-pointer"
                                      title="Open open physical location coordinates in Google Maps"
                                    >
                                      <MapPin className="w-3 h-3 text-[#1D3B2A]" />
                                      <span>Open Map ↗</span>
                                    </a>
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-mono-num">
                                    IP: <strong>{item.ip_address || '102.219.208.12'}</strong>
                                    {lat && lon && (
                                      <span className="ml-1 text-slate-400">
                                        ({Number(lat).toFixed(4)}, {Number(lon).toFixed(4)})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Device & Browser */}
                              <td className="py-2.5 px-3 align-top whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-slate-800 font-semibold text-[11px]">
                                    {isMobile ? (
                                      <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    ) : (
                                      <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    )}
                                    <span>{item.device_info || 'Desktop PC'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 pl-4">
                                    {item.browser_info || 'Web Browser'}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

