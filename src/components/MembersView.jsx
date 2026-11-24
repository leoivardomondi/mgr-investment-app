import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageContextBanner from './PageContextBanner';
import MemberAvatarIcon from './MemberAvatarIcon';
import MemberKycModal from './MemberKycModal';
import {
  downloadReportHTML,
  downloadReportCSV
} from '../utils/reportGenerator';
import { 
  Users, 
  Search, 
  UserPlus, 
  ArrowUpRight, 
  HandCoins, 
  ShieldCheck, 
  AlertTriangle,
  CheckCircle2, 
  ChevronRight,
  X,
  Clock,
  UserCheck,
  Edit3,
  Award,
  Target,
  Phone,
  ArrowRight,
  TrendingUp,
  Landmark,
  Calendar,
  FileText,
  Filter,
  Copy,
  Scale,
  Coins,
  RotateCcw,
  ShieldAlert,
  Download,
  FileSpreadsheet,
  Hash,
  Lock,
  Share2,
  MessageCircle,
  Check
} from 'lucide-react';

export default function MembersView({ onOpenDepositModal, onOpenDataEditor }) {
  const { 
    members, 
    setMembers,
    assets,
    loans,
    ledger,
    totalMemberShares, 
    setActiveTab, 
    showToast,
    recordDeposit,
    approvePendingMember,
    updateMemberJoiningDate,
    updateMemberNumber,
    updateUserProfile,
    getQuarterForDate,
    markMemberAsDeceased,
    revertMemberDeceasedStatus,
    addMemberDepositRecord,
    updateMemberDepositRecord,
    deleteMemberDepositRecord,
    reconcileMemberDepositsToShares,
    prospects,
    addProspect,
    convertProspectToMember,
    currentMember,
    isCurrentMemberExec,
    isSuperAdmin,
    isRealSuperAdmin,
    triggerExecRestriction,
    setRbacUsers,
    buildDefaultPermissionsForRole
  } = useApp();

  const [subTab, setSubTab] = useState('registry'); // 'registry', 'audits', or 'recruitment'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL'); // ALL, EXEC, MEMBER, DECEASED, PENDING
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);
  const [kycModalMember, setKycModalMember] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [approvingMember, setApprovingMember] = useState(null);
  const [convertingProspect, setConvertingProspect] = useState(null);
  const [copiedMyReferral, setCopiedMyReferral] = useState(false);

  const myReferralCode = currentMember?.id || 'MGR-001';
  const myReferralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(myReferralCode)}`
    : `https://mgrinvest.co.ke/?ref=${encodeURIComponent(myReferralCode)}`;

  const myRecruitedMembers = (members || []).filter(m =>
    m.recruitedBy &&
    currentMember?.name &&
    (m.recruitedBy.toLowerCase() === currentMember.name.toLowerCase() ||
      m.recruitedBy.toUpperCase() === myReferralCode.toUpperCase())
  );

  const myWhatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Hello! I am inviting you to join MGR Investment Group, our private investment club. Register directly using my official member referral link:\n${myReferralUrl}`
  )}`;

  // Mark Member as Deceased State
  const [deceasedModal, setDeceasedModal] = useState({
    isOpen: false,
    memberId: '',
    memberName: '',
    deceasedDate: '2026-09-11',
    beneficiaryName: '',
    beneficiaryContact: '',
    notes: '',
    publishAnnouncement: true,
    isEditing: false
  });

  const handleOpenMarkDeceased = (member) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Record Member Demise",
        "Formally marking a member as deceased and transferring shares to estate escrow is strictly reserved for the 7 Executive Committee members."
      );
      return;
    }

    const isAlreadyDeceased = member.status === 'Deceased';
    setDeceasedModal({
      isOpen: true,
      memberId: member.id,
      memberName: member.name,
      deceasedDate: member.deceasedDate || (member.id === 'MGR-007' ? '2026-09-11' : new Date().toISOString().split('T')[0]),
      beneficiaryName: member.beneficiaryName || `Beneficiary of Late ${member.name}`,
      beneficiaryContact: member.beneficiaryContact || member.phone || '',
      notes: member.notes || (member.id === 'MGR-007' ? 'Passed away on 11th September 2026. Exit clause settlement.' : ''),
      publishAnnouncement: true,
      isEditing: isAlreadyDeceased
    });
  };

  const handleSubmitDeceased = (e) => {
    e.preventDefault();
    if (!deceasedModal.deceasedDate) {
      showToast("Please select the date of demise", "error");
      return;
    }
    const success = markMemberAsDeceased({
      memberId: deceasedModal.memberId,
      deceasedDate: deceasedModal.deceasedDate,
      beneficiaryName: deceasedModal.beneficiaryName,
      beneficiaryContact: deceasedModal.beneficiaryContact,
      notes: deceasedModal.notes,
      publishAnnouncement: deceasedModal.publishAnnouncement
    });

    if (success) {
      setDeceasedModal({ ...deceasedModal, isOpen: false });
      if (selectedMemberModal && selectedMemberModal.id === deceasedModal.memberId) {
        setSelectedMemberModal(prev => ({
          ...prev,
          status: 'Deceased',
          deceasedDate: deceasedModal.deceasedDate,
          beneficiaryName: deceasedModal.beneficiaryName,
          beneficiaryContact: deceasedModal.beneficiaryContact
        }));
      }
    }
  };

  const handleRevertDeceased = (memberId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Revert Deceased Status", "Restricted to Executive Committee.");
      return;
    }
    if (window.confirm("Revert this member's status back to Active? This restores active rights and removes their estate escrow allocation.")) {
      const success = revertMemberDeceasedStatus(memberId);
      if (success && selectedMemberModal && selectedMemberModal.id === memberId) {
        setSelectedMemberModal(prev => ({
          ...prev,
          status: 'Active',
          deceasedDate: null
        }));
      }
    }
  };

  // Joining Date & Member ID & Phone Editing State in Modal
  const [editingJoinedDate, setEditingJoinedDate] = useState('');
  const [editingMemberIdVal, setEditingMemberIdVal] = useState('');
  const [editingPhoneVal, setEditingPhoneVal] = useState('');

  // Historical Deposit Message Editing / Adding State inside Member Modal
  const [editingDepositId, setEditingDepositId] = useState(null);
  const [showAddOldDepositForm, setShowAddOldDepositForm] = useState(false);
  const [syncSharesWithDeposits, setSyncSharesWithDeposits] = useState(true);
  const [depositRecordForm, setDepositRecordForm] = useState({
    date: '2026-05-01',
    amount: '',
    destination: 'Mansa X Special Funds',
    type: 'Share Capital',
    transactionRef: '',
    transactionMessage: '',
    attributedQuarter: 'Q2-2026'
  });

  // Always resolve the live member object from `members` so edits to depositHistory reflect immediately
  const activeModalMember = selectedMemberModal
    ? (members.find(m => m.id === selectedMemberModal.id) || selectedMemberModal)
    : null;

  // Audits Subtab Filter States
  const [auditMemberFilter, setAuditMemberFilter] = useState('ALL');
  const [auditQuarterFilter, setAuditQuarterFilter] = useState('ALL');
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [copiedTxId, setCopiedTxId] = useState(null);

  // New Prospect State
  const [showAddProspectModal, setShowAddProspectModal] = useState(false);
  const [prospectForm, setProspectForm] = useState({
    name: '',
    phone: '',
    status: 'Promised Next Week',
    notes: '',
    expectedDepositChannel: 'Etica Capital MMF'
  });

  // Approval Form State (Mandatory Date & Transaction Message Attached)
  const [approvalTargetFund, setApprovalTargetFund] = useState('Etica MMF');
  const [approvalDepositDate, setApprovalDepositDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [approvalTransactionRef, setApprovalTransactionRef] = useState('');
  const [approvalTransactionMessage, setApprovalTransactionMessage] = useState('');
  const [approvalAdditionalShares, setApprovalAdditionalShares] = useState('');
  const [approvalAdditionalTxRef, setApprovalAdditionalTxRef] = useState('');
  const [approvalAdditionalTxMessage, setApprovalAdditionalTxMessage] = useState('');

  // New Member Form State
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    role: 'Member',
    committeeRole: 'General Member',
    initialShares: '',
    phone: '',
    email: '',
    destination: 'Etica MMF',
    depositDate: new Date().toISOString().split('T')[0],
    transactionRef: '',
    transactionMessage: '',
    deposit1000Now: true,
    recruitedBy: 'John Kennedy Obalah'
  });

  const pendingMembers = members.filter(m => m.status === 'Pending Approval');

  // Recruiter breakdown
  const johnRecruits = members.filter(m => m.recruitedBy === 'John Kennedy Obalah');
  const johnCapitalMobilized = johnRecruits.reduce((sum, m) => sum + parseFloat(m.shares || 0), 0);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.role.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterRole === 'EXEC') {
      return matchesSearch && m.committeeRole === 'Executive Committee';
    }
    if (filterRole === 'MEMBER') {
      return matchesSearch && m.committeeRole === 'General Member' && m.status !== 'Deceased';
    }
    if (filterRole === 'DECEASED') {
      return matchesSearch && m.status === 'Deceased';
    }
    if (filterRole === 'PENDING') {
      return matchesSearch && m.status === 'Pending Approval';
    }
    return matchesSearch;
  });

  // Flatten all member deposit records for the Committee Audit Trail
  const allDeposits = members.flatMap(m => 
    (m.depositHistory || []).map(dep => ({
      ...dep,
      memberName: m.name,
      memberId: m.id,
      memberAvatar: m.avatar,
      memberRole: m.role
    }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const displayedDeposits = allDeposits.filter(d => {
    const matchesMember = auditMemberFilter === 'ALL' || d.memberId === auditMemberFilter;
    const matchesQuarter = auditQuarterFilter === 'ALL' || d.attributedQuarter === auditQuarterFilter;
    const matchesSearch = !auditSearchTerm || 
      d.memberName.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      d.transactionRef.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      d.transactionMessage.toLowerCase().includes(auditSearchTerm.toLowerCase());
    return matchesMember && matchesQuarter && matchesSearch;
  });

  const handleOpenMemberModal = (member) => {
    setSelectedMemberModal(member);
    setEditingJoinedDate(member.joinedDate || '');
    setEditingMemberIdVal(member.id || '');
    setEditingPhoneVal(member.phone || '');
  };

  const handleAddNewMember = (e) => {
    e.preventDefault();
    if (!newMemberForm.name.trim()) {
      showToast('Please enter member name', 'error');
      return;
    }

    const sharesAmount = parseFloat(newMemberForm.initialShares) || 0;
    const numericIds = members.map(m => {
      const match = m.id && m.id.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(n => !isNaN(n));
    const maxNum = numericIds.length > 0 ? Math.max(...numericIds, 11) : 11;
    const newId = `MGR-${String(maxNum + 1).padStart(3, '0')}`;
    const cleanDate = newMemberForm.depositDate || new Date().toISOString().split('T')[0];

    const accessLevel = newMemberForm.committeeRole === 'Executive Committee' ? 'executive_officer' : 'general_member';
    const newRbacUser = {
      memberId: newId,
      name: newMemberForm.name.trim(),
      email: newMemberForm.email ? newMemberForm.email.trim().toLowerCase() : '',
      phone: newMemberForm.phone ? newMemberForm.phone.trim() : '',
      positionTitle: newMemberForm.role || 'Member',
      membershipTier: newMemberForm.committeeRole || 'General Member',
      accessLevel,
      permissions: buildDefaultPermissionsForRole(accessLevel, newMemberForm.role || 'Member'),
      accountStatus: newMemberForm.deposit1000Now ? 'Active' : 'Active',
      mustChangePassword: false,
      lastLogin: null,
      accountPin: '1234',
      kycDocuments: [],
      createdAt: new Date().toISOString()
    };
    setRbacUsers(prev => [...prev.filter(u => u.memberId !== newId), newRbacUser]);

    if (newMemberForm.deposit1000Now) {
      const newMember = {
        id: newId,
        name: newMemberForm.name,
        role: newMemberForm.role,
        committeeRole: newMemberForm.committeeRole,
        shares: 0,
        regFeePaid: true,
        status: 'Active',
        phone: newMemberForm.phone || '',
        email: newMemberForm.email || '',
        avatar: newMemberForm.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        joinedDate: cleanDate,
        recruitedBy: newMemberForm.recruitedBy,
        depositHistory: [],
        notes: `Recruited by ${newMemberForm.recruitedBy}. Approved on ${cleanDate} after depositing mandatory KES 1,000/= registration fee.`
      };

      setMembers(prev => [...prev, newMember]);

      recordDeposit({
        memberId: newId,
        memberName: newMember.name,
        amount: sharesAmount + 1000.00,
        destination: newMemberForm.destination,
        depositDate: cleanDate,
        transactionRef: newMemberForm.transactionRef || `REG-${Date.now().toString().slice(-6)}`,
        transactionMessage: newMemberForm.transactionMessage || `Onboarding deposit of KES ${sharesAmount + 1000} on ${cleanDate}`,
        includeRegFee: true,
        notes: `Initial onboarding contribution for ${newMember.name} (KES 1,000 Reg Fee + KES ${sharesAmount} Shares)`
      });

      showToast(`Member ${newMember.name} approved after KES 1,000 deposit!`);
    } else {
      const pendingMember = {
        id: newId,
        name: newMemberForm.name,
        role: newMemberForm.role,
        committeeRole: newMemberForm.committeeRole,
        shares: 0.00,
        regFeePaid: false,
        status: 'Pending Approval',
        phone: newMemberForm.phone || '',
        email: newMemberForm.email || '',
        avatar: newMemberForm.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        joinedDate: cleanDate,
        recruitedBy: newMemberForm.recruitedBy,
        depositHistory: [],
        notes: `New applicant recruited by ${newMemberForm.recruitedBy}. Membership approval pending mandatory KES 1,000/= deposit.`
      };

      setMembers(prev => [...prev, pendingMember]);
      showToast(`Application registered for ${pendingMember.name}. Approval pending KES 1,000 deposit.`);
    }

    setShowAddMemberModal(false);
    setNewMemberForm({
      name: '',
      role: 'Member',
      committeeRole: 'General Member',
      initialShares: '',
      phone: '',
      email: '',
      destination: 'Etica MMF',
      depositDate: new Date().toISOString().split('T')[0],
      transactionRef: '',
      transactionMessage: '',
      deposit1000Now: true,
      recruitedBy: 'John Kennedy Obalah'
    });
  };

  const handleConfirmApproval = (e) => {
    e.preventDefault();
    if (!approvingMember) return;

    if (!approvalDepositDate) {
      showToast('Please select deposit date', 'error');
      return;
    }

    if (!approvalTransactionRef.trim() || !approvalTransactionMessage.trim()) {
      showToast('Deposit reference code and transaction SMS must be attached before approval!', 'error');
      return;
    }

    const success = approvePendingMember({
      memberId: approvingMember.id,
      destination: approvalTargetFund,
      depositDate: approvalDepositDate,
      transactionRef: approvalTransactionRef.trim(),
      transactionMessage: approvalTransactionMessage.trim(),
      additionalShares: parseFloat(approvalAdditionalShares) || 0,
      additionalTxRef: approvalAdditionalTxRef.trim(),
      additionalTxMessage: approvalAdditionalTxMessage.trim()
    });

    if (success) {
      setApprovingMember(null);
      setApprovalAdditionalShares('');
      setApprovalTransactionRef('');
      setApprovalTransactionMessage('');
      setApprovalAdditionalTxRef('');
      setApprovalAdditionalTxMessage('');
      if (selectedMemberModal && selectedMemberModal.id === approvingMember.id) {
        setSelectedMemberModal(null);
      }
    }
  };

  const handleAddProspectSubmit = (e) => {
    e.preventDefault();
    if (!prospectForm.name.trim()) return;

    addProspect({
      ...prospectForm,
      recruiter: currentMember.name,
      recruiterId: currentMember.id
    });

    setShowAddProspectModal(false);
    setProspectForm({
      name: '',
      phone: '',
      status: 'Promised Next Week',
      notes: '',
      expectedDepositChannel: 'Etica Capital MMF'
    });
  };

  const handleConvertProspect = (e) => {
    e.preventDefault();
    if (!convertingProspect) return;

    convertProspectToMember({
      prospectId: convertingProspect.id,
      destination: approvalTargetFund,
      additionalShares: parseFloat(approvalAdditionalShares) || 0
    });

    setConvertingProspect(null);
    setApprovalAdditionalShares('');
  };

  const handleOpenAddMemberModal = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Register New Member Applicant",
        "Adding and admitting members to the official registry is reserved for Executive Committee members (Dan Aloo, Josephat Lubanga, Sarah Njoki, Leoivard Omondi, Dr Joash Migosi, Benjamin Madara, John Kennedy Obalah)."
      );
      return;
    }
    setShowAddMemberModal(true);
  };

  const handleOpenDataEditor = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Update Member Share Records",
        "Modifying member shares or opening the data editor is reserved for the 7 Executive Committee members."
      );
      return;
    }
    onOpenDataEditor();
  };

  const handleOpenApprovePending = (member) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Approve New Member Application",
        "Approving new members and verifying their KES 1,000/= deposit can only be performed by the Executive Committee."
      );
      return;
    }
    setApprovingMember(member);
  };

  const handleOpenConvertProspect = (prospect) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Admit Prospect to Official Registry",
        "Converting prospects into official members upon deposit verification is strictly reserved for the Executive Committee."
      );
      return;
    }
    setConvertingProspect(prospect);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">

      {/* Visual Context Banner with Documentary Photography */}
      <PageContextBanner
        eyebrow="Section II • Shareholder Registry, Recruitment & Capital Audit"
        title="Official Register of Members & Share Contributions"
        description="Inspect each member's verified deposits carried forward (C/F), KES 1,000 non-refundable registration fee, joining quarter, and transaction proof codes. Under Note [12] of the audited cooperative standard, the General Ledger control balance is continuously reconciled against individual member passbooks."
        imageUrl="/images/kenya_community_group.jpg"
        imageAlt="Kenyan community and cooperative members gathered together"
        imageCaption="Kenyan Cooperative Community • Verified Passbooks & Recruitment Pipeline"
        stats={[
          { label: "Registered Accounts", value: `${members.length} (10 Active • 1 Estate)` },
          { label: "Total Share Capital C/F", value: `KES ${totalMemberShares.toLocaleString()}` },
          { label: "Unreconciled Variance", value: "KES 0.00 (100% Matched)" }
        ]}
      />
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Members Share Registry & Capital Audit Portal
          </h2>
          <p className="text-xs text-slate-500">
            Audit member deposit dates, transaction proofs, quarterly principal attribution, and recruitment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              downloadReportHTML(
                'equity',
                { members, assets, loans, ledger, totalMemberShares },
                { printMode: false }
              );
              showToast('Downloaded formatted Schedule of Members Share Capital C/F (.html)!');
            }}
            className="px-2.5 py-1.5 bg-[var(--accent-gold)] hover:opacity-95 text-white font-semibold text-xs rounded-xs shadow-xs transition flex items-center justify-center space-x-1"
            title="Download Note [12] Schedule of Members Share Capital & Equity C/F"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Share Schedule HTML</span>
          </button>
          <button
            onClick={() => {
              downloadReportCSV('equity', { members, assets, loans, ledger, totalMemberShares });
              showToast('Downloaded Member Share Register C/F (.csv)!');
            }}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xs border border-slate-300 shadow-xs transition flex items-center justify-center space-x-1"
            title="Download Member Share Register as CSV / Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>CSV</span>
          </button>
          {onOpenDataEditor && (
            <button
              onClick={handleOpenDataEditor}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xs border border-slate-300 shadow-xs transition flex items-center justify-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>Update Records</span>
            </button>
          )}
          <button
            onClick={handleOpenAddMemberModal}
            className="px-2.5 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded-xs shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
          <button
            onClick={onOpenDepositModal}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xs border border-slate-300 shadow-xs transition flex items-center justify-center space-x-1.5"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Record Deposit</span>
          </button>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setSubTab('registry')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition ${
            subTab === 'registry' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Share Registry ({members.length})
        </button>
        <button
          onClick={() => setSubTab('audits')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
            subTab === 'audits' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span>Quarterly Capital & Deposit Audits</span>
        </button>
        <button
          onClick={() => setSubTab('recruitment')}
          className={`flex-1 py-1.5 rounded text-xs font-semibold transition flex items-center justify-center space-x-1.5 ${
            subTab === 'recruitment' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Recruitment Leaderboard</span>
        </button>
      </div>

      {/* VIEW 1: RECRUITMENT CAMPAIGN & PROSPECTS PIPELINE */}
      {subTab === 'recruitment' && (
        <div className="space-y-4">
          
          {/* Main Campaign Challenge Card */}
          <div className="equity-account-header rounded-2xl p-5 border border-[var(--brand-primary-hover)] relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/20 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold-light)]">
                  Official MGR Growth Directive
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  "If Everyone Recruits 3 Members @, Our Population Will Grow!"
                </h3>
                <p className="text-xs text-white/80 leading-relaxed mt-0.5 max-w-xl">
                  Call to action initiated by CEO John Kennedy Obalah. With 9 active members recruiting 3 prospects each, MGR will expand by <strong>27 new members</strong> and generate <strong>KES 27,000/= in non-refundable registration capital</strong>.
                </p>
              </div>

              <button
                onClick={() => setShowAddProspectModal(true)}
                className="px-3.5 py-2 bg-[var(--accent-gold-light)] text-[var(--brand-primary)] hover:bg-white font-bold text-xs rounded-lg transition shrink-0 flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Log New Prospect</span>
              </button>
            </div>

            {/* Campaign Progress Gauge */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Total Target Recruits</span>
                <span className="text-lg font-bold text-white mt-0.5 block">27 Members</span>
                <span className="text-[10px] text-[var(--accent-gold-light)]">3 per active member</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-white/70 block uppercase font-bold">John Kennedy Recruits</span>
                <span className="text-lg font-bold text-[var(--accent-gold-light)] mt-0.5 block">5 Verified</span>
                <span className="text-[10px] text-white/80">Moses, Ben, Ruto, Joash, Josephat</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Capital Mobilized by John</span>
                <span className="text-lg font-bold text-white mt-0.5 block">KES {johnCapitalMobilized.toLocaleString()}</span>
                <span className="text-[10px] text-[var(--accent-gold-light)] font-bold">14.8% of Club Total</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] text-white/70 block uppercase font-bold">Pipeline Prospects</span>
                <span className="text-lg font-bold text-white mt-0.5 block">{prospects.length} Prospect{prospects.length > 1 ? 's' : ''}</span>
                <span className="text-[10px] text-[var(--accent-gold-light)] font-semibold">1 Promised Next Week</span>
              </div>
            </div>
          </div>

          {/* Personal Member Referral Link & Recruits Card */}
          <div className="bank-card p-4 space-y-3 border-l-4 border-l-[#1D3B2A]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#1D3B2A]" />
                  <span>Your Personal Referral Link ({myReferralCode})</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Send this invite link directly to prospects. New registrations through this URL are automatically credited to <strong>{currentMember?.name}</strong>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <div className="px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D8D2C4] font-mono text-[11px] text-slate-700 truncate max-w-full sm:max-w-[260px] select-all" title={myReferralUrl}>
                  {myReferralUrl}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) navigator.clipboard.writeText(myReferralUrl);
                      setCopiedMyReferral(true);
                      setTimeout(() => setCopiedMyReferral(false), 2500);
                      showToast('Your personal referral link has been copied!');
                    }}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-[#1D3B2A] hover:opacity-95 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedMyReferral ? <Check className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" /> : <Copy className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />}
                    <span>{copiedMyReferral ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={myWhatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {myRecruitedMembers.length > 0 ? (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Members Joined via Your Referral ({myRecruitedMembers.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {myRecruitedMembers.map((rec) => (
                    <span
                      key={rec.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-950"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{rec.name}</span>
                      <span className="text-[10px] font-mono text-emerald-700">({rec.id})</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                You have not yet registered any new members via your referral link. Share your link above to track your recruits here.
              </p>
            )}
          </div>

          {/* Prospects Pipeline List */}
          <div className="bank-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Prospective Member Recruitment Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Track prospects promised to join and channel deposits to Etica MMF
                </p>
              </div>

              <button
                onClick={() => setShowAddProspectModal(true)}
                className="px-3 py-1.5 bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] font-semibold text-xs rounded-lg transition flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Prospect</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {prospects.map(p => (
                <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{p.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{p.phone}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-gold-surface)] text-[var(--accent-gold)] border border-[var(--accent-gold-light)]">
                        {p.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed">
                      "{p.notes}"
                    </p>

                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Recruiter: <strong className="text-slate-700">{p.recruiter}</strong></span>
                      <span>Target: <strong className="text-[var(--brand-primary)]">{p.expectedDepositChannel}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Added: {p.dateAdded}</span>
                    <button
                      onClick={() => handleOpenConvertProspect(p)}
                      className="px-2.5 py-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-md shadow-xs transition flex items-center space-x-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>Admit as Member (KES 1k)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* John Kennedy's Recruitment Breakdown */}
          <div className="bank-card p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Award className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Executive Recruiter Hall of Fame: John Kennedy Obalah</span>
            </h3>
            <p className="text-xs text-slate-500">
              John Kennedy single-handedly recruited 5 out of our 11 current members:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {johnRecruits.map(m => (
                <div key={m.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-slate-500">{m.role} • Joined {m.joinedDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--brand-primary)]">
                      {isCurrentMemberExec || m.id === currentMember?.id ? `KES ${m.shares.toLocaleString()}` : 'KES ••••••'}
                    </p>
                    <p className="text-[9px] text-slate-400">Shares</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: SHARE REGISTRY */}
      {subTab === 'registry' && (
        <div className="space-y-4">
          
          {/* NEW MEMBER APPROVAL PROTOCOL BANNER */}
          {pendingMembers.length > 0 && (
            <div className="bank-card p-4 border-l-4 border-l-[var(--accent-gold)] bg-[var(--accent-gold-surface)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-[var(--accent-gold-surface)] text-[var(--accent-gold)] rounded-lg shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                        Approval Queue
                      </span>
                      <span className="text-xs text-slate-500">
                        {pendingMembers.length} Applicant{pendingMembers.length > 1 ? 's' : ''} Awaiting Deposit
                      </span>
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                      New Member Approval: Mandatory KES 1,000/= Non-Refundable Deposit
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                      Applicants are only approved after depositing KES 1,000 to the Group Account (Group Reserve pool for 2026 formal legal entity registration).
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  {pendingMembers.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => handleOpenApprovePending(pm)}
                      className="px-3 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Verify KES 1k & Approve ({pm.name.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search member by name, ID, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'EXEC', label: 'Executive Committee' },
                { key: 'MEMBER', label: 'General' },
                { key: 'DECEASED', label: 'Deceased' },
                { key: 'PENDING', label: 'Pending Deposit' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterRole(f.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                    filterRole === f.key
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Member Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredMembers.map((member) => {
              const equityPct = totalMemberShares > 0 ? ((member.shares / totalMemberShares) * 100).toFixed(2) : 0;
              const isDeceased = member.status === 'Deceased';
              const isPending = member.status === 'Pending Approval';
              const isNewTreasurer = member.id === 'MGR-011';

              const depHist = member.depositHistory || [];
              const creditedYieldDeps = depHist
                .filter(d => d.type && (d.type.toLowerCase().includes('yield') || d.type.toLowerCase().includes('dividend')))
                .reduce((s, d) => s + Number(d.amount || 0), 0);
              const q3BaseTotal = members
                .filter(item => item.id !== 'MGR-011' && (item.status === 'Active' || item.id === 'MGR-007'))
                .reduce((s, item) => s + Number(item.shares || 0), 0);
              const totalQ3Yield = Number(assets.mansaX?.interestAccrued || 41587) + 21309;
              const accruedMemberYield = (!isNewTreasurer && !isPending && q3BaseTotal > 0)
                ? (Number(member.shares || 0) / q3BaseTotal) * totalQ3Yield
                : 0;

              return (
                <div
                  key={member.id}
                  onClick={() => handleOpenMemberModal(member)}
                  className={`cursor-pointer bank-card bank-card-interactive p-4 relative ${
                    isDeceased
                      ? 'border-l-4 border-l-rose-700'
                      : isPending
                      ? 'border-l-4 border-l-[var(--accent-gold)] bg-[var(--accent-gold-surface)]'
                      : isNewTreasurer
                      ? 'border-l-4 border-l-[var(--brand-primary)]'
                      : ''
                  }`}
                >
                  {isNewTreasurer && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--accent-gold-light)] text-[var(--brand-primary)] uppercase">
                      New Treasurer (Joined 28/10)
                    </span>
                  )}
                  {isDeceased && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase">
                      Deceased • Exit Policy
                    </span>
                  )}

                  {/* Header info */}
                  <div className="flex items-center space-x-3">
                    <MemberAvatarIcon
                      member={member}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {member.name}
                        </h4>
                        {member.committeeRole === 'Executive Committee' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" title="Executive Committee Member" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        ID: {member.id} • {member.committeeRole}
                      </p>
                      {member.recruitedBy && (
                        <p className="text-[9px] text-[var(--accent-gold)] font-semibold truncate mt-0.5">
                          Recruited by: {member.recruitedBy}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown: Member Deposits & Yield Deposits */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Member Deposits</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 font-mono-num">
                        {isCurrentMemberExec || member.id === currentMember?.id
                          ? `KES ${member.shares.toLocaleString()}`
                          : 'KES ••••••'}
                      </p>
                      <p className="text-[10px] text-slate-600 font-medium font-mono-num">
                        {isCurrentMemberExec || member.id === currentMember?.id
                          ? `${equityPct}% equity`
                          : 'Confidential'}
                      </p>
                    </div>

                    <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <p className="text-[10px] text-emerald-800 uppercase font-semibold">Yield Deposits</p>
                      <p className="text-xs sm:text-sm font-bold text-emerald-900 mt-0.5 font-mono-num">
                        {isCurrentMemberExec || member.id === currentMember?.id
                          ? `+ KES ${(creditedYieldDeps + accruedMemberYield).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '+ KES ••••••'}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium truncate">
                        {isCurrentMemberExec || member.id === currentMember?.id
                          ? (isNewTreasurer ? 'Starts Q4 (Oct)' : creditedYieldDeps > 0 ? `Credited + Accrued` : `Q3 Accrued Yield`)
                          : 'Executive Only'}
                      </p>
                    </div>
                  </div>

                  {/* Status footer */}
                  <div className="mt-3 flex items-center justify-between text-xs pt-1">
                    {isPending ? (
                      <div className="flex items-center space-x-1 text-[11px] text-[var(--accent-gold)] font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting KES 1,000 Deposit</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-[11px] text-[var(--accent-emerald)] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>KES 1,000 Reg Fee Paid</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setKycModalMember(member);
                        }}
                        className="py-1 px-2 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="View or upload confidential KYC & legal documents (PIN protected)"
                      >
                        <Lock className="w-2.5 h-2.5 text-amber-700" />
                        <span>KYC Vault</span>
                      </button>
                      <div className="text-[var(--brand-primary)] font-bold text-xs flex items-center space-x-0.5 hover:underline">
                        <span>{isPending ? 'Approve' : 'Details'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 3: QUARTERLY CAPITAL & DEPOSIT AUDITS */}
      {subTab === 'audits' && (
        <div className="space-y-4">
          
          {/* Header Card / MMF Inception Tracker */}
          <div className="bank-card p-4 border-l-4 border-l-[var(--brand-primary)] bg-[var(--accent-gold-surface)] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                  MMF Capital Movement & Deposit Audit Trail
                </span>
                <h3 className="font-bold text-base text-slate-900 mt-0.5">
                  Quarterly Principal Allocation & Holding-Period Attribution
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-gold-light)] text-[var(--brand-primary)] uppercase tracking-wider self-start sm:self-auto">
                Audited Fiduciary Engine
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Every deposit made by members is cryptographically logged with its exact payment date and verified transaction SMS confirmation. 
              This determines exactly which quarter's MMF principal (e.g. May 2026 Mansa X KES 500k transfer vs October 2026 inflows) member capital belongs to, 
              ensuring only capital active in that period receives that quarter's yield.
            </p>

            {/* Quarter Attribution Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Q2-2026 Mansa X Inception</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">KES 500,000.00</p>
                <p className="text-[10px] text-slate-500">Funded in May 2026 (~20% p.a.)</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Q3-2026 Qualifying Base</p>
                <p className="font-bold text-[var(--brand-primary)] text-sm mt-0.5">KES 693,675.00</p>
                <p className="text-[10px] text-slate-500">Accrued Yield: KES 41,587.00 (Retained / Undistributed)</p>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Q4-2026 Inflows (Oct 28/30)</p>
                <p className="font-bold text-amber-700 text-sm mt-0.5">KES 17,000.00 Shares</p>
                <p className="text-[10px] text-slate-500">Leoivard 17k (KES 1k Reg Fee Deducted)</p>
              </div>
            </div>
          </div>

          {/* Quarterly Capital & Yield Deposits Matrix per Member */}
          <div className="bank-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Each Member's Principal Deposits &amp; Account Standing Schedule</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Verified official MGR member accounts. Pursuant to Chama resolution, all interest is held collectively in Retained Surplus and not assigned or distributed yet.
                </p>
              </div>
              {isCurrentMemberExec && (
                <button
                  type="button"
                  onClick={() => onOpenDataEditor && onOpenDataEditor()}
                  className="px-3 py-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded text-xs font-bold self-start sm:self-center"
                >
                  Edit Member Records
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3 text-right">Non-Refundable Reg Fee (KES)</th>
                    <th className="py-2.5 px-3 text-right">Net Principal Share Deposits (KES)</th>
                    <th className="py-2.5 px-3 text-right text-slate-400">Assigned Interest (KES)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">Current Standing C/F (KES)</th>
                    <th className="py-2.5 px-3 text-right font-bold text-[var(--brand-primary)]">Capital Share %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-mono-num">
                  {(() => {
                    return members.map(m => {
                      const deposits = m.depositHistory || [];
                      const regDeposits = deposits
                        .filter(d => d.type && d.type.toLowerCase().includes('registration'))
                        .reduce((s, d) => s + Number(d.amount || 0), 0) || 1000.00;
                      const principalDeposits = Number(m.shares || 0);
                      const sharePct = totalMemberShares > 0 ? (Number(m.shares || 0) / totalMemberShares) * 100 : 0;

                      return (
                        <tr
                          key={m.id}
                          onClick={() => handleOpenMemberModal(m)}
                          className="hover:bg-slate-50/80 transition cursor-pointer"
                        >
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <MemberAvatarIcon member={m} size="md" />
                              <div>
                                <p className="font-bold text-slate-900">{m.name}</p>
                                <p className="text-[10px] text-slate-500">{m.id} • {m.role} • Joined {m.joinedDate}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">
                            {isCurrentMemberExec || m.id === currentMember?.id
                              ? `KES ${regDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : 'KES ••••••'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            {isCurrentMemberExec || m.id === currentMember?.id
                              ? `KES ${principalDeposits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : 'KES ••••••'}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-normal">
                            {isCurrentMemberExec || m.id === currentMember?.id ? '0.00' : '••••••'} <span className="text-[9px] text-slate-400">(Undistributed)</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {isCurrentMemberExec || m.id === currentMember?.id
                              ? `KES ${Number(m.shares || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : 'KES ••••••'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[var(--brand-primary)]">
                            {isCurrentMemberExec || m.id === currentMember?.id
                              ? `${sharePct.toFixed(2)}%`
                              : '••••%'}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Deposit Log with Attached Transaction SMS Proofs */}
          <div className="bank-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Verified Deposit Transaction Audit Log ({allDeposits.length} Records)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Every deposit verified with date, M-Pesa / Bank SMS, and attributed quarter
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <select
                  value={auditMemberFilter}
                  onChange={(e) => setAuditMemberFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Members</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                <select
                  value={auditQuarterFilter}
                  onChange={(e) => setAuditQuarterFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">All Quarters</option>
                  <option value="Q2-2026">Q2-2026 (May Mansa X)</option>
                  <option value="Q3-2026">Q3-2026 (Sept Accrual)</option>
                  <option value="Q4-2026">Q4-2026 (Current Inflows)</option>
                  <option value="Q1-2024">Q1-2024 / Historic</option>
                </select>
              </div>
            </div>

            {/* Deposit Cards / Rows */}
            <div className="space-y-2.5 pt-1">
              {displayedDeposits.map(d => (
                <div key={d.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 hover:bg-white transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <MemberAvatarIcon
                        memberId={d.memberId}
                        name={d.memberName}
                        size="md"
                      />
                      <div>
                        <span className="font-bold text-slate-900">{d.memberName}</span>
                        <span className="text-[11px] text-slate-500 ml-1.5">({d.memberRole})</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-gold-light)] text-[var(--brand-primary)]">
                        {d.attributedQuarter} Principal
                      </span>
                      <span className="text-sm font-bold text-[var(--brand-primary)]">
                        KES {d.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deposit Date</span>
                      <span className="font-semibold text-slate-800">{d.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Destination</span>
                      <span className="font-semibold text-slate-800">{d.destination}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Transaction Ref</span>
                      <span className="font-mono font-bold text-slate-900">{d.transactionRef}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Verified By</span>
                      <span className="font-semibold text-[var(--accent-emerald)]">{d.approvedBy || 'Executive Committee'}</span>
                    </div>
                  </div>

                  {d.transactionMessage && (
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700 font-mono leading-relaxed flex items-start justify-between gap-2">
                      <div className="italic">
                        "{d.transactionMessage}"
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(d.transactionMessage);
                          }
                          setCopiedTxId(d.id);
                          setTimeout(() => setCopiedTxId(null), 1500);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded transition shrink-0"
                        title="Copy transaction confirmation SMS"
                      >
                        {copiedTxId === d.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Convert Prospect Modal */}
      {convertingProspect && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setConvertingProspect(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Admit Prospect as Official Member
                </h3>
                <p className="text-xs text-slate-500">
                  Verify KES 1,000/= deposit for {convertingProspect.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConvertProspect} className="space-y-3 pt-3">
              <div className="p-3 bg-[var(--accent-gold-surface)] rounded-xl border border-[var(--accent-gold-light)] text-xs text-slate-800 space-y-1">
                <p className="font-bold text-[var(--accent-gold)]">Recruiter Credit: {convertingProspect.recruiter}</p>
                <p className="text-[11px] text-slate-600">
                  KES 1,000/= registration fee is credited directly to the Group Reserve Account, and {convertingProspect.name} is issued their official Membership ID.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Deposit Account *
                </label>
                <select
                  value={approvalTargetFund}
                  onChange={(e) => setApprovalTargetFund(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
                >
                  <option value="Etica MMF">Etica Capital MMF</option>
                  <option value="Bank">Cash in Bank (Stanbic Operations)</option>
                  <option value="Mansa X">Mansa X Special Funds (~20%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Share Capital Deposit (KES) — Optional
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 17000"
                  value={approvalAdditionalShares}
                  onChange={(e) => setApprovalAdditionalShares(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Verify Deposit & Complete Membership Admission
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add New Prospect Modal */}
      {showAddProspectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowAddProspectModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-[var(--brand-primary)]" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Log New Prospective Member
              </h3>
            </div>

            <form onSubmit={handleAddProspectSubmit} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prospect Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First and Last Name"
                  value={prospectForm.name}
                  onChange={(e) => setProspectForm({ ...prospectForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+254 7XX XXX XXX"
                  value={prospectForm.phone}
                  onChange={(e) => setProspectForm({ ...prospectForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Engagement Status</label>
                <select
                  value={prospectForm.status}
                  onChange={(e) => setProspectForm({ ...prospectForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                >
                  <option value="Promised Next Week">Promised to Join Next Week</option>
                  <option value="Reviewing Rules">Reviewing Rules / Deciding</option>
                  <option value="Contacted">Initial Contact Made</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Commitment Details</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Confirmed ready to deposit KES 1,000 fee next week"
                  value={prospectForm.notes}
                  onChange={(e) => setProspectForm({ ...prospectForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Log Prospect to Pipeline
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMemberModal && (() => {
        const liveMember = activeModalMember || selectedMemberModal;
        const isSelfOrExec = isCurrentMemberExec || isSuperAdmin || isRealSuperAdmin || liveMember.id === currentMember?.id;
        return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMemberModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <MemberAvatarIcon
                member={selectedMemberModal}
                size="xl"
              />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedMemberModal.name}
                </h3>
                <p className="text-xs text-[var(--brand-primary)] font-semibold">
                  {selectedMemberModal.role} • {selectedMemberModal.committeeRole}
                </p>
                <p className="text-[11px] text-slate-400">Member ID: {selectedMemberModal.id}</p>
                {selectedMemberModal.recruitedBy && (
                  <p className="text-[10px] text-[var(--accent-gold)] font-semibold mt-0.5">
                    Recruited into MGR by: {selectedMemberModal.recruitedBy}
                  </p>
                )}
              </div>
            </div>

            {/* If Pending Approval Banner */}
            {selectedMemberModal.status === 'Pending Approval' && (
              <div className="my-3 p-3 bg-[var(--accent-gold-surface)] border border-[var(--accent-gold-light)] rounded-xl text-xs text-slate-800 space-y-2">
                <p className="font-bold flex items-center space-x-1.5 text-[var(--accent-gold)]">
                  <Clock className="w-4 h-4" />
                  <span>Pending Approval — KES 1,000/= Deposit Required</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {selectedMemberModal.notes} Membership voting rights and borrowing access are activated immediately once the KES 1,000 non-refundable fee is verified.
                </p>
                <button
                  onClick={() => {
                    setApprovingMember(selectedMemberModal);
                  }}
                  className="px-3 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold rounded-lg text-xs flex items-center space-x-1 shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Verify KES 1,000 Deposit & Approve</span>
                </button>
              </div>
            )}

            {/* If deceased notice */}
            {selectedMemberModal.status === 'Deceased' && (
              <div className="my-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold flex items-center space-x-1.5 text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Bereavement & Exit Clause Protocol Active</span>
                  </p>
                  <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.5 rounded">
                    Estate Escrow
                  </span>
                </div>
                <div className="text-[11px] space-y-1 text-slate-700 bg-white/70 p-2 rounded-lg border border-rose-100">
                  <p><strong>Date of Demise:</strong> {selectedMemberModal.deceasedDate || '11th September 2026'}</p>
                  <p><strong>Designated Beneficiary:</strong> {selectedMemberModal.beneficiaryName || 'Estate Administrator / Next of Kin'}</p>
                  {selectedMemberModal.beneficiaryContact && (
                    <p><strong>Beneficiary Contact:</strong> {selectedMemberModal.beneficiaryContact}</p>
                  )}
                  <p><strong>Net Dues Payable:</strong> KES {selectedMemberModal.shares.toLocaleString()} (Shares at Par Value)</p>
                </div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedMemberModal(null);
                      setActiveTab('marketplace');
                    }}
                    className="h-7 px-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
                  >
                    <span>Estate Buyout Window</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  {isCurrentMemberExec && (
                    <>
                      <button
                        onClick={() => handleOpenMarkDeceased(selectedMemberModal)}
                        className="h-7 px-2.5 bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 font-semibold rounded-lg text-xs transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Demise Record</span>
                      </button>
                      <button
                        onClick={() => handleRevertDeceased(selectedMemberModal.id)}
                        className="h-7 px-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-xs transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert to Active</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}


              {/* Official Member Phone Number (M-Pesa / Safaricom) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>Official Mobile Phone Number:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {liveMember?.phone || selectedMemberModal.phone || 'Not added yet'}
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">Update verified phone:</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="tel"
                      value={editingPhoneVal}
                      onChange={(e) => setEditingPhoneVal(e.target.value)}
                      placeholder="e.g. 0712 345 678"
                      className="w-36 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!editingPhoneVal) return;
                        await updateUserProfile({
                          memberId: selectedMemberModal.id,
                          phone: editingPhoneVal
                        });
                        setSelectedMemberModal(prev => ({ ...prev, phone: editingPhoneVal }));
                      }}
                      className="px-2.5 py-1 bg-[var(--brand-primary)] hover:opacity-95 text-white font-semibold text-xs rounded transition cursor-pointer"
                    >
                      Save Phone
                    </button>
                  </div>
                </div>
              </div>

            {!isSelfOrExec ? (
              <div className="p-5 my-4 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl text-center space-y-2.5">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#1D3B2A]/10 text-[#1D3B2A] flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#1D3B2A]" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Member Financial Records Confidential</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Under MGR Investment Group rules and Cap 30A financial confidentiality regulations, individual member deposit records, share balances, and yield distributions are confidential to each shareholder and restricted to the Executive Committee.
                </p>
              </div>
            ) : (
              <>
            {/* Financial Ledger Breakdown: Member Deposits vs. Yield Deposits */}
            <div className="space-y-3 py-3">
              {(() => {
                const liveM = activeModalMember || selectedMemberModal;
                const dList = liveM.depositHistory || [];
                const credYield = dList
                  .filter(d => d.type && (d.type.toLowerCase().includes('yield') || d.type.toLowerCase().includes('dividend')))
                  .reduce((s, d) => s + Number(d.amount || 0), 0);
                const directDeps = dList
                  .filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('yield') && !d.type.toLowerCase().includes('dividend')))
                  .reduce((s, d) => s + Number(d.amount || 0), 0);
                const q3Base = members
                  .filter(item => item.id !== 'MGR-011' && (item.status === 'Active' || item.id === 'MGR-007'))
                  .reduce((s, item) => s + Number(item.shares || 0), 0);
                const totalQ3Pool = Number(assets.mansaX?.interestAccrued || 41587) + 21309;
                const accruedYld = (liveM.id !== 'MGR-011' && liveM.status !== 'Pending Approval' && q3Base > 0)
                  ? (Number(liveM.shares || 0) / q3Base) * totalQ3Pool
                  : 0;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Principal Share Deposits</p>
                      <p className="text-base font-bold text-slate-900 mt-0.5 font-mono-num">
                        KES {directDeps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono-num">
                        {((liveM.shares / (totalMemberShares || 1)) * 100).toFixed(2)}% Club Stake
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                      <p className="text-[10px] text-emerald-800 font-bold uppercase">Yield Deposits (Credited &amp; Accrued)</p>
                      <p className="text-base font-bold text-emerald-900 mt-0.5 font-mono-num">
                        + KES {(credYield + accruedYld).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-mono-num">
                        Credited: KES {credYield.toLocaleString()} • Accrued: KES {accruedYld.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="p-3 bg-[var(--accent-gold-surface)] rounded-xl border border-[var(--accent-gold-light)]">
                      <p className="text-[10px] text-[var(--accent-gold)] font-bold uppercase">Compounded Value (Deps + Yields)</p>
                      <p className="text-base font-bold text-[var(--brand-primary)] mt-0.5 font-mono-num">
                        KES {(Number(liveM.shares || 0) + accruedYld).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Standing C/F: KES {Number(liveM.shares || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Registration fee notice */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600 font-medium">Non-refundable Registration Fee (2026):</span>
                {selectedMemberModal.regFeePaid ? (
                  <span className="font-bold text-[var(--accent-emerald)] bg-[var(--accent-emerald-surface)] px-2 py-0.5 rounded">
                    Paid &amp; Deducted (KES 1,000/= Non-Refundable Pool)
                  </span>
                ) : (
                  <span className="font-bold text-[var(--accent-gold)] bg-[var(--accent-gold-surface)] px-2 py-0.5 rounded">
                    Pending KES 1,000/= Deposit
                  </span>
                )}
              </div>

              {/* Official Member Number / ID & Registry Update */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Hash className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>Official Member Registry Number / ID:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedMemberModal.id}
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">Edit member identifier:</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      value={editingMemberIdVal}
                      onChange={(e) => setEditingMemberIdVal(e.target.value.trim())}
                      placeholder="e.g. MGR-001 or 011"
                      className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!editingMemberIdVal || editingMemberIdVal === selectedMemberModal.id) return;
                        const res = await updateMemberNumber({
                          oldMemberId: selectedMemberModal.id,
                          newMemberId: editingMemberIdVal
                        });
                        if (res && res.ok) {
                          setSelectedMemberModal(prev => ({ ...prev, id: editingMemberIdVal }));
                        }
                      }}
                      disabled={!editingMemberIdVal || editingMemberIdVal === selectedMemberModal.id}
                      className="px-2.5 py-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs rounded transition cursor-pointer"
                    >
                      Save ID
                    </button>
                  </div>
                </div>
              </div>

              {/* Official Joining Date & Registry Update */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>Official Member Joining Date:</span>
                  </div>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {selectedMemberModal.joinedDate}
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">Update official registry date:</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="date"
                      value={editingJoinedDate}
                      onChange={(e) => setEditingJoinedDate(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        updateMemberJoiningDate({ memberId: selectedMemberModal.id, newJoiningDate: editingJoinedDate });
                        setSelectedMemberModal(prev => ({ ...prev, joinedDate: editingJoinedDate }));
                      }}
                      className="px-2.5 py-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded transition cursor-pointer"
                    >
                      Save Date
                    </button>
                  </div>
                </div>
              </div>

              {/* Confidential Legal Documents Vault & Kenya Constitution Article 31 PIN Gate */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-emerald-50/70 rounded-xl border border-amber-200/90 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Confidential KYC &amp; Legal Documents Vault</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-white text-slate-700 border border-slate-200">
                      {(activeModalMember?.kycDocuments?.length || selectedMemberModal.kycDocuments?.length || 0)} Files
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    National ID, Passport Photo, KRA PIN &amp; Club Sign-Up Forms. Protected under Kenya Constitution Art. 31 &amp; DPA 2019 (Member PIN Required).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setKycModalMember(activeModalMember || selectedMemberModal)}
                  className="py-1.5 px-3 bg-[var(--brand-primary)] hover:opacity-95 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Lock className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
                  <span>Open Legal Vault &amp; PIN Gate</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Deposit History & Transaction Proofs (Editable & Reconcilable to Match Current Standings) */}
              {(() => {
                const liveMember = activeModalMember || selectedMemberModal;
                const depList = liveMember.depositHistory || [];
                const sumShareDeposits = depList
                  .filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee')))
                  .reduce((s, d) => s + Number(d.amount || 0), 0);
                const variance = Number(liveMember.shares || 0) - sumShareDeposits;
                const isMatched = Math.abs(variance) < 0.01;

                return (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-slate-900">
                      <span className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                        <span>Deposit Messages & Transaction Proofs ({depList.length})</span>
                      </span>

                      {isCurrentMemberExec && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isMatched && (
                            <button
                              type="button"
                              onClick={() => reconcileMemberDepositsToShares(liveMember.id)}
                              className="px-2 py-1 bg-[var(--accent-gold)] text-white rounded text-[10px] font-bold hover:opacity-95 transition"
                              title="Automatically reconcile deposit messages to match current share standing"
                            >
                              Match to Standings ({variance > 0 ? `+KES ${variance.toLocaleString()}` : `Sync KES ${sumShareDeposits.toLocaleString()}`})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDepositId(null);
                              setDepositRecordForm({
                                date: liveMember.joinedDate || '2026-05-01',
                                amount: variance > 0 ? variance.toString() : '',
                                destination: 'Mansa X Special Funds',
                                type: 'Share Capital',
                                transactionRef: '',
                                transactionMessage: '',
                                attributedQuarter: getQuarterForDate(liveMember.joinedDate || '2026-05-01')
                              });
                              setShowAddOldDepositForm(prev => !prev);
                            }}
                            className="px-2 py-1 bg-[var(--brand-tint)] text-[var(--brand-primary)] border border-[var(--brand-tint-border)] rounded text-[10px] font-bold hover:bg-slate-100 transition"
                          >
                            {showAddOldDepositForm ? 'Cancel' : '+ Add Old Deposit Message'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Standing Reconciliation Banner */}
                    <div className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                      isMatched
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div>
                        <span className="font-semibold">Recorded Share Messages Sum:</span>{' '}
                        <strong className="font-mono-num">KES {sumShareDeposits.toLocaleString()}</strong>{' '}
                        <span className="text-slate-500">vs Current Standing:</span>{' '}
                        <strong className="font-mono-num">KES {Number(liveMember.shares).toLocaleString()}</strong>
                      </div>
                      <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-white border border-current/20">
                        {isMatched ? '100% Matched' : `Diff: KES ${variance.toLocaleString()}`}
                      </span>
                    </div>

                    {/* Add or Edit Historical Deposit Message Form */}
                    {isCurrentMemberExec && (showAddOldDepositForm || editingDepositId) && (
                      <div className="p-3 bg-white rounded-xl border-2 border-[var(--brand-primary)] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-[var(--brand-primary)]">
                            {editingDepositId ? 'Edit Historical Deposit & SMS Message' : 'Backfill Old Deposit Record & SMS Proof'}
                          </span>
                          <label className="flex items-center space-x-1 text-[10px] text-slate-600 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={syncSharesWithDeposits}
                              onChange={(e) => setSyncSharesWithDeposits(e.target.checked)}
                              className="rounded border-slate-300"
                            />
                            <span>Auto-match member share standing</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Deposit Date</label>
                            <input
                              type="date"
                              value={depositRecordForm.date}
                              onChange={(e) => setDepositRecordForm({
                                ...depositRecordForm,
                                date: e.target.value,
                                attributedQuarter: getQuarterForDate(e.target.value)
                              })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Amount (KES)</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 11800"
                              value={depositRecordForm.amount}
                              onChange={(e) => setDepositRecordForm({ ...depositRecordForm, amount: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Record Type</label>
                            <select
                              value={depositRecordForm.type}
                              onChange={(e) => setDepositRecordForm({ ...depositRecordForm, type: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                            >
                              <option value="Share Capital">Direct Member Share Deposit</option>
                              <option value="Yield / Dividend Deposit">Yield / Dividend Deposit (Reinvested)</option>
                              <option value="Registration Fee">Registration Fee (KES 1,000)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Destination Fund</label>
                            <select
                              value={depositRecordForm.destination}
                              onChange={(e) => setDepositRecordForm({ ...depositRecordForm, destination: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs"
                            >
                              <option value="Mansa X Special Funds">Mansa X Special Funds</option>
                              <option value="Etica Capital MMF">Etica Capital MMF</option>
                              <option value="Cash in Bank">Cash in Bank (Stanbic)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">M-Pesa / Bank Ref</label>
                            <input
                              type="text"
                              placeholder="e.g. QKA82910LK"
                              value={depositRecordForm.transactionRef}
                              onChange={(e) => setDepositRecordForm({ ...depositRecordForm, transactionRef: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Quarter Attribution</label>
                            <select
                              value={depositRecordForm.attributedQuarter}
                              onChange={(e) => setDepositRecordForm({ ...depositRecordForm, attributedQuarter: e.target.value })}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                            >
                              <option value="Q1-2024">Q1-2024 (Inception)</option>
                              <option value="Q2-2024">Q2-2024</option>
                              <option value="Q1-2025">Q1-2025</option>
                              <option value="Q2-2026">Q2-2026 (May 500k Mansa-X)</option>
                              <option value="Q3-2026">Q3-2026 (Sept Statement)</option>
                              <option value="Q4-2026">Q4-2026 (Oct Inflows)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                            Exact M-Pesa / Stanbic Confirmation SMS Message
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Paste old M-Pesa or bank confirmation SMS message here..."
                            value={depositRecordForm.transactionMessage}
                            onChange={(e) => setDepositRecordForm({ ...depositRecordForm, transactionMessage: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDepositId(null);
                              setShowAddOldDepositForm(false);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (editingDepositId) {
                                updateMemberDepositRecord(liveMember.id, editingDepositId, depositRecordForm, syncSharesWithDeposits);
                                setEditingDepositId(null);
                              } else {
                                addMemberDepositRecord(liveMember.id, depositRecordForm, syncSharesWithDeposits);
                                setShowAddOldDepositForm(false);
                              }
                            }}
                            className="px-3 py-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded text-xs font-bold"
                          >
                            {editingDepositId ? 'Save Deposit Changes' : 'Save Historical Deposit'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {depList.length > 0 ? (
                        depList.map(dep => (
                          <div key={dep.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-slate-900">{dep.date} • {dep.destination}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--brand-primary)] font-bold font-mono-num">KES {Number(dep.amount).toLocaleString()}</span>
                                {isCurrentMemberExec && (
                                  <div className="flex items-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowAddOldDepositForm(false);
                                        setEditingDepositId(dep.id);
                                        setDepositRecordForm({
                                          date: dep.date || '2026-05-01',
                                          amount: dep.amount,
                                          destination: dep.destination || 'Mansa X Special Funds',
                                          type: dep.type || 'Share Capital',
                                          transactionRef: dep.transactionRef || '',
                                          transactionMessage: dep.transactionMessage || '',
                                          attributedQuarter: dep.attributedQuarter || 'Q2-2026'
                                        });
                                      }}
                                      className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-[var(--brand-primary)] hover:bg-slate-100 font-semibold"
                                      title="Edit old deposit message or amount"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`Delete deposit record ${dep.transactionRef}?`)) {
                                          deleteMemberDepositRecord(liveMember.id, dep.id, syncSharesWithDeposits);
                                        }
                                      }}
                                      className="px-1.5 py-0.5 bg-white border border-rose-200 rounded text-[10px] text-rose-600 hover:bg-rose-50 font-semibold"
                                      title="Delete deposit record"
                                    >
                                      Del
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span className="px-1.5 py-0.2 rounded bg-[var(--accent-gold-light)] text-[var(--brand-primary)] font-bold text-[10px]">
                                {dep.attributedQuarter} • {dep.type || 'Share Capital'}
                              </span>
                              <span className="font-mono">Ref: {dep.transactionRef}</span>
                            </div>
                            {dep.transactionMessage && (
                              <p className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-200 italic font-mono leading-tight">
                                "{dep.transactionMessage}"
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 italic">
                          No deposit transaction proof attached yet.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            </>
            )}

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
              {isSelfOrExec ? (
                <>
                  <button
                    type="button"
                    onClick={() => setKycModalMember(activeModalMember || selectedMemberModal)}
                    className="py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="View or upload confidential KYC & legal documents under member PIN"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>KYC Vault</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMemberModal(null);
                      onOpenDepositModal();
                    }}
                    className="flex-1 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded-lg shadow-xs transition cursor-pointer"
                  >
                    Deposit Shares
                  </button>
                  {isCurrentMemberExec && selectedMemberModal.status !== 'Deceased' && (
                    <button
                      type="button"
                      onClick={() => handleOpenMarkDeceased(selectedMemberModal)}
                      className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold text-xs rounded-lg transition flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                      title="Record member demise and transfer capital to estate escrow"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Mark Deceased</span>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedMemberModal(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition cursor-pointer"
                >
                  Close Member Record
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Mark Member as Deceased & Estate Transition Modal */}
      {deceasedModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[var(--brand-primary)] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-[var(--accent-gold-light)]" />
                <h3 className="font-bold text-base">
                  {deceasedModal.isEditing ? 'Edit Member Demise & Estate Record' : 'Record Member Demise & Estate Transition'}
                </h3>
              </div>
              <button 
                onClick={() => setDeceasedModal({ ...deceasedModal, isOpen: false })}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeceased} className="p-4 space-y-3.5 text-xs">
              <div className="bg-[var(--brand-tint)] p-3 rounded-xl border border-rose-200 text-rose-900 leading-snug">
                <p className="font-bold text-xs flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Bereavement Protocol & Bylaw Clause 4.2</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Recording demise transitions the member's share capital to <strong>Estate Escrow</strong>. Terminal dues will be disbursed to the declared beneficiary at FY close, or made available for internal buyout by active members.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Member
                </label>
                <div className="p-2.5 bg-slate-100 rounded-lg font-bold text-slate-900 text-xs">
                  {deceasedModal.memberName} ({deceasedModal.memberId})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Date of Demise <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={deceasedModal.deceasedDate}
                  onChange={(e) => setDeceasedModal({ ...deceasedModal, deceasedDate: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Confirmed: 11th September 2026 for Late Frederick Ongule Seunda
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Designated Beneficiary / Estate Administrator <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Declared Estate Beneficiary / Next of Kin"
                  value={deceasedModal.beneficiaryName}
                  onChange={(e) => setDeceasedModal({ ...deceasedModal, beneficiaryName: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Beneficiary Phone / Contact
                </label>
                <input
                  type="text"
                  placeholder="e.g. +254 7XX XXX XXX (Next of Kin)"
                  value={deceasedModal.beneficiaryContact}
                  onChange={(e) => setDeceasedModal({ ...deceasedModal, beneficiaryContact: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Demise Notes / Burial & Death Certificate Reference
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Passed away on 11th September 2026. Succession documents received."
                  value={deceasedModal.notes}
                  onChange={(e) => setDeceasedModal({ ...deceasedModal, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="publishAnnCheck"
                  checked={deceasedModal.publishAnnouncement}
                  onChange={(e) => setDeceasedModal({ ...deceasedModal, publishAnnouncement: e.target.checked })}
                  className="w-4 h-4 accent-[var(--brand-primary)] rounded cursor-pointer"
                />
                <label htmlFor="publishAnnCheck" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Publish official Bereavement Announcement to Club News Feed
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setDeceasedModal({ ...deceasedModal, isOpen: false })}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold rounded-lg text-xs shadow-xs"
                >
                  {deceasedModal.isEditing ? 'Save Changes' : 'Confirm & Record Demise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-[var(--brand-primary)]" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Enroll New Member Applicant
              </h3>
            </div>

            <form onSubmit={handleAddNewMember} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First and Last Name"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role in Group</label>
                  <input
                    type="text"
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Committee Status</label>
                  <select
                    value={newMemberForm.committeeRole}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, committeeRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
                  >
                    <option value="General Member">General Member</option>
                    <option value="Executive Committee">Executive Committee</option>
                  </select>
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone (M-Pesa)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. member@gmail.com"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={newMemberForm.depositDate}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, depositDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recruited By</label>
                  <select
                    value={newMemberForm.recruitedBy}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, recruitedBy: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Share Capital (KES) — Optional
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 17000"
                  value={newMemberForm.initialShares}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, initialShares: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              {/* Immediate Registration fee checkbox */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMemberForm.deposit1000Now}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, deposit1000Now: e.target.checked })}
                    className="mt-0.5 rounded text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Verify & Deposit KES 1,000 Registration Fee Now
                    </span>
                    <span className="text-[11px] text-slate-500">
                      If checked, member is approved immediately. If unchecked, applicant remains in "Pending Approval" queue.
                    </span>
                  </div>
                </label>

                {newMemberForm.deposit1000Now && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Target Account
                      </label>
                      <select
                        value={newMemberForm.destination}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, destination: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 font-semibold"
                      >
                        <option value="Etica MMF">Etica Capital MMF</option>
                        <option value="Bank">Cash in Bank (Stanbic Operations)</option>
                        <option value="Mansa X">Mansa X Special Funds (~20%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Transaction Ref Code *
                      </label>
                      <input
                        type="text"
                        placeholder="M-Pesa / Bank Ref Code (e.g. QK891280LM)"
                        value={newMemberForm.transactionRef}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, transactionRef: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                        Transaction SMS Proof *
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Paste full confirmation SMS..."
                        value={newMemberForm.transactionMessage}
                        onChange={(e) => setNewMemberForm({ ...newMemberForm, transactionMessage: e.target.value })}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                {newMemberForm.deposit1000Now ? 'Register & Approve (KES 1,000 Deposit)' : 'Submit Application (Pending Approval)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Approve Pending Member Modal */}
      {approvingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setApprovingMember(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="p-2 bg-[var(--brand-tint)] text-[var(--brand-primary)] rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Approve Member Application
                </h3>
                <p className="text-xs text-slate-500">
                  Verify KES 1,000/= deposit for {approvingMember.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmApproval} className="space-y-3 pt-3 text-xs">
              <div className="p-3 bg-[var(--accent-gold-surface)] rounded-xl border border-[var(--accent-gold-light)] text-xs text-slate-800 space-y-1">
                <p className="font-bold flex items-center space-x-1.5 text-[var(--accent-gold)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent-emerald)]" />
                  <span>Approval Rule: Mandatory KES 1,000/= Deposit</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Upon verification, KES 1,000/= is credited directly to the Group Reserve Account (for formal 2026 registration), and {approvingMember.name} is activated with full membership rights.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Date *
                </label>
                <input
                  type="date"
                  required
                  value={approvalDepositDate}
                  onChange={(e) => setApprovalDepositDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Channel / Target Account *
                </label>
                <select
                  value={approvalTargetFund}
                  onChange={(e) => setApprovalTargetFund(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
                >
                  <option value="Etica MMF">Etica Capital MMF</option>
                  <option value="Bank">Cash in Bank (Stanbic Operations)</option>
                  <option value="Mansa X">Mansa X Special Funds (~20%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Ref Code (M-Pesa / Bank) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QK891280LM"
                  value={approvalTransactionRef}
                  onChange={(e) => setApprovalTransactionRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Confirmation SMS *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Paste full M-Pesa or Bank confirmation message..."
                  value={approvalTransactionMessage}
                  onChange={(e) => setApprovalTransactionMessage(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Initial Shares Deposit (KES) — Optional
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="e.g. 17000"
                  value={approvalAdditionalShares}
                  onChange={(e) => setApprovalAdditionalShares(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
                />
              </div>

              {approvalAdditionalShares > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Additional Shares Transaction SMS
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Paste transaction SMS for additional shares..."
                    value={approvalAdditionalTxMessage}
                    onChange={(e) => setApprovalAdditionalTxMessage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Verify KES 1,000 Deposit & Activate Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Member KYC & Confidential Legal Documents Modal */}
      {kycModalMember && (
        <MemberKycModal
          isOpen={Boolean(kycModalMember)}
          member={members.find(m => m.id === kycModalMember.id) || kycModalMember}
          onClose={() => setKycModalMember(null)}
        />
      )}

    </div>
  );
}