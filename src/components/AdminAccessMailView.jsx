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
  Settings,
  CheckCircle2,
  FileText,
  Server,
  RefreshCw,
  Eye
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
    label: 'Super Administrator (CEO / Chairman)',
    badgeClass: 'bg-[#F6EFEA] text-[#6E3C1B] border border-[#E3D0C1]',
    description: 'Unrestricted administrative control over RBAC permissions, mail server, treasury, and all member records.'
  },
  {
    id: 'treasury_admin',
    label: 'Treasury Administrator (Treasurer)',
    badgeClass: 'bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]',
    description: 'Full financial authority to reconcile Etica MMF & Mansa X deposits, issue loans, distribute dividends, and manage the ledger.'
  },
  {
    id: 'executive_officer',
    label: 'Executive Committee Officer',
    badgeClass: 'bg-[#F4F1EA] text-[#2C3824] border border-[#D8D2C4]',
    description: 'Position-based authority for Vice Chairman, Secretary, Compliance Officer, and Research Officer.'
  },
  {
    id: 'general_member',
    label: 'General Member (Verified Shareholder)',
    badgeClass: 'bg-[#F7F6F2] text-[#3E4238] border border-[#E2DDD3]',
    description: 'Self-service access to view statements, record own deposits, apply for 80% loans, and vote/ratify.'
  },
  {
    id: 'estate_beneficiary',
    label: 'Estate Beneficiary (Read-Only Escrow)',
    badgeClass: 'bg-[#F9ECEC] text-[#6B2424] border border-[#E6C7C7]',
    description: 'Read-only access for declared beneficiaries of deceased members under Bylaw Clause 4.2.'
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
    buildDefaultPermissionsForRole,
    adminUpdateUserAccess,
    changeOwnPassword,
    mailSettings,
    saveServerMailSettings,
    sendOfficialClubEmail,
    mailLogs,
    securityAuditLogs,
    refreshSecurityBootstrap,
    setCurrentMemberId
  } = useApp();

  const canManageAccess = isSuperAdmin || hasPermission('manage_access_control');
  const canSendMail = isSuperAdmin || hasPermission('send_official_mail');

  const [subTab, setSubTab] = useState('rbac'); // 'rbac' | 'mail' | 'smtp' | 'security'
  const [selectedMemberId, setSelectedMemberId] = useState(currentMember?.id || 'MGR-001');
  const [editMemberId, setEditMemberId] = useState(currentMember?.id || 'MGR-001');

  // Selected user for editing
  const selectedUserObj = rbacUsers.find(u => u.memberId === selectedMemberId) || rbacUsers[0];
  const selectedMemberRecord = members.find(m => m.id === selectedMemberId) || members[0];

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
    setEditPosition(u.positionTitle);
    setEditTier(u.membershipTier);
    setEditAccessLevel(u.accessLevel);
    setEditAccountStatus(u.accountStatus || 'Active');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditPermissions(u.permissions || buildDefaultPermissionsForRole(u.accessLevel, u.positionTitle));
    setTempPassword('');
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
    if (newPos.includes('CEO') || newPos.includes('Chairman')) {
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

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="bank-card p-4 sm:p-6 bg-gradient-to-r from-[#1D3B2A] to-[#13281C] text-white border-0 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-[var(--accent-gold-light)] border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SQLite Security, Role-Based Access Control &amp; cPanel Mail</span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl font-bold text-white">
              Administration, Member Access Privileges &amp; Mail Dispatch
            </h1>
            <p className="text-xs text-white/80 max-w-3xl leading-relaxed">
              Grant custom access rights to each of the 11 members based on their membership tier and committee position, dispatch official treasury emails via your cPanel server, and inspect the SQLite security audit trail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-black/25 border border-white/15 rounded-xl px-3.5 py-2 text-xs">
              <span className="text-[10px] uppercase tracking-wider text-white/60 block">Your Active Position &amp; Tier</span>
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
            <span>1. Member Positions &amp; Access Matrix (11 Members)</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('mail')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'mail' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>2. Official Email Dispatch &amp; Outbox</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('smtp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'smtp' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>3. cPanel Mail / SMTP Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('security')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              subTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white/85 hover:bg-white/20'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>4. My Password &amp; Security Audit Log</span>
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
                      <span>{u.email}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num font-bold text-slate-700">
                          {enabledCount}/15 privileges
                        </span>
                        {canManageAccess && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMemberId(u.memberId);
                            }}
                            title="Preview portal as this member"
                            className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-2.5 h-2.5" />
                            <span>View As</span>
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
                    Share Standing: <strong className="font-mono-num text-slate-800">KES {Number(selectedMemberRecord?.shares || 0).toLocaleString()}</strong> • Status: <strong>{editAccountStatus}</strong>
                  </p>
                </div>
              </div>

              {!canManageAccess && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Read-Only (Super Admin Required to Edit)</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveUserAccess} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Account Security Status
                  </label>
                  <select
                    disabled={!canManageAccess}
                    value={editAccountStatus}
                    onChange={(e) => setEditAccountStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white disabled:bg-slate-100"
                  >
                    <option value="Active">Active (Full Sign-In Enabled)</option>
                    <option value="Estate Read-Only">Estate Read-Only (Beneficiary View)</option>
                    <option value="Suspended">Suspended (Sign-In Blocked)</option>
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

      {/* TAB 2: OFFICIAL EMAIL DISPATCH & OUTBOX */}
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

      {/* TAB 3: CPANEL MAIL / SMTP CONFIGURATION */}
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
        </div>
      )}

      {/* TAB 4: PERSONAL PASSWORD & SQLITE AUDIT TRAIL */}
      {subTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-5 bank-card p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Change My Personal Password</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update the password for <strong>{currentMember?.name} ({currentMember?.id})</strong> stored with bcrypt hashing in SQLite.
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Update My Password
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bank-card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>SQLite Security &amp; Access Audit Log</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Immutable log of logins, role changes, email dispatches, and database mutations
                </p>
              </div>
              <span className="text-xs font-mono-num font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                {securityAuditLogs.length} Events
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {securityAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Audit log entries will appear here automatically from SQLite (`mgr_audit_trail`).
                </div>
              ) : (
                securityAuditLogs.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{item.action_summary}</p>
                      <p className="text-[11px] text-slate-600">
                        Actor: <strong>{item.actor_name}</strong> {item.ip_address ? `• IP: ${item.ip_address}` : ''}
                      </p>
                    </div>
                    <span className="font-mono-num text-[10px] text-slate-400 shrink-0">
                      {item.created_at}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

