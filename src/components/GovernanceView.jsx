import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageContextBanner from './PageContextBanner';
import ConstitutionView from './ConstitutionView';
import { 
  Vote, 
  BookOpen, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  PlusCircle, 
  ChevronDown, 
  ChevronUp, 
  Award,
  X,
  Coins,
  ShieldCheck,
  Clock,
  FileText
} from 'lucide-react';

export default function GovernanceView() {
  const { 
    resolutions, 
    castVote, 
    sendEmailReminders, 
    policies, 
    setPolicies,
    currentMember, 
    showToast,
    isCurrentMemberExec,
    triggerExecRestriction,
    pendingFinancialActions,
    setActiveRatificationModalId,
    members
  } = useApp();

  const [activeTab, setActiveTab] = useState('ratifications');
  const [expandedPolicyId, setExpandedPolicyId] = useState(null);
  const [showNewPolicyModal, setShowNewPolicyModal] = useState(false);

  const pendingRatifications = (pendingFinancialActions || []).filter(a => a.status === 'Pending Member Ratification');

  const [newPolicyForm, setNewPolicyForm] = useState({
    title: '',
    category: 'Governance',
    content: ''
  });

  const handleOpenNewPolicy = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Publish Official Club Policy",
        "Authoring or amending official club policies in the Knowledge Base is strictly reserved for the 7 Executive Committee members (Dan Aloo, Josephat Lubanga, Sarah Njoki, Leoivard Omondi, Dr Joash Migosi, Benjamin Madara, John Kennedy Obalah)."
      );
      return;
    }
    setShowNewPolicyModal(true);
  };

  const handleSendEmailReminders = (resId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Dispatch Member Voting Reminders",
        "Sending official club-wide email/SMS notifications to all members is an Executive Committee function."
      );
      return;
    }
    sendEmailReminders(resId);
  };

  const handleAddPolicy = (e) => {
    e.preventDefault();
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Publish Official Club Policy",
        "Authoring or amending official club policies is strictly reserved for the Executive Committee."
      );
      return;
    }
    if (!newPolicyForm.title.trim() || !newPolicyForm.content.trim()) {
      showToast('Please fill in title and content', 'error');
      return;
    }

    const newPolicy = {
      id: `POL-${Date.now().toString().slice(-3)}`,
      title: newPolicyForm.title,
      category: newPolicyForm.category,
      dateEffective: new Date().toISOString().split('T')[0],
      author: `${currentMember.name} (${currentMember.role})`,
      content: newPolicyForm.content,
      active: true
    };

    setPolicies(prev => [newPolicy, ...prev]);
    setShowNewPolicyModal(false);
    setNewPolicyForm({ title: '', category: 'Governance', content: '' });
    showToast(`New policy "${newPolicy.title}" published to Knowledge Base!`);
  };

  const executiveCommittee = [
    { title: "Chairman", name: "Dan Aloo", id: "MGR-004", privileges: "Presides over general meetings, signs executive resolutions, calls emergency votes" },
    { title: "Vice Chairman", name: "Josephat Lubanga", id: "MGR-010", privileges: "Deputizes Chairman, secondary resolution approvals, committee coordination" },
    { title: "Secretary", name: "Sarah Njoki", id: "MGR-003", privileges: "Drafts and maintains policies, manages member register, records minutes & votes" },
    { title: "Treasurer", name: "Leoivard Omondi Ongule", id: "MGR-011", privileges: "Reconciles MMF accounts, records deposits, executes dividend distributions, manages ledger" },
    { title: "Research Officer", name: "Dr Joash Migosi PhD", id: "MGR-009", privileges: "Analyzes MMF and fund yields (Mansa X vs Etica), investment market intelligence" },
    { title: "Compliance Officer", name: "Benjamin Ambrose Alila Madara", id: "MGR-006", privileges: "Enforces constitutional compliance, audits treasury operations, oversees bereavement exit settlements" },
    { title: "CEO", name: "John Kennedy Obalah", id: "MGR-001", privileges: "Full executive operations, strategic asset allocation, legal incorporation 2026" },
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">

      {/* Visual Context Banner with Documentary Photography */}
      <PageContextBanner
        eyebrow="Section VI • Democratic Ballots, Club Governance & Bylaws"
        title="Unanimous Financial Ratifications & Member Resolutions"
        description="Under MGR Investment Club Constitution and bylaws, the Executive Committee prepares resolutions and treasury actions while all 10 active members exercise oversight through binding ratifications, policy votes, and annual audit approvals."
        imageUrl="/images/african_women_leaders_group.jpg"
        imageAlt="African executive committee leaders and investment club officers"
        imageCaption="MGR Investment Club Executive Leadership • Democratic Governance"
        stats={[
          { label: "Executive Committee", value: "7 Authorized Officers" },
          { label: "Treasury Ratification Rule", value: "10 / 10 Active Members (100%)" },
          { label: "Governance Framework", value: "MGR Club Constitution" }
        ]}
      />
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Governance, Resolutions & Knowledge Base
          </h2>
          <p className="text-xs text-slate-500">
            Democratic club decision-making, automated member reminders, and verified constitutional policies
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('ratifications')}
            className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'ratifications' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Financial Ratifications</span>
            {pendingRatifications.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[var(--accent-gold-light)] text-[var(--brand-primary)]">
                {pendingRatifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('voting')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeTab === 'voting' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Voting
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeTab === 'policies' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Policies
          </button>
          <button
            onClick={() => setActiveTab('constitution')}
            className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center space-x-1 ${
              activeTab === 'constitution' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Constitution &amp; LLP</span>
          </button>
          <button
            onClick={() => setActiveTab('committee')}
            className={`px-3 py-1 rounded text-xs font-semibold transition ${
              activeTab === 'committee' ? 'bg-[var(--brand-primary)] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exec Privileges
          </button>
        </div>
      </div>

      {/* VIEW 0: FINANCIAL ACTION RATIFICATIONS (UNANIMOUS 10-MEMBER APPROVAL GATE) */}
      {activeTab === 'ratifications' && (
        <div className="space-y-4">
          <div className="bg-[var(--accent-gold-surface)] border border-[var(--accent-gold-light)] rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
              <h3 className="font-bold text-sm text-slate-900">
                All-Member Financial Ratification Mandate
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with MGR Investment Club rules, any financial action initiated by the Executive Committee (e.g. MMF yield distributions, asset rebalancing, capital reallocations) strictly requires <strong>unanimous approval from all 10 active members</strong> before any funds are debited or credited.
            </p>
          </div>

          <div className="space-y-3">
            {(pendingFinancialActions || []).map((action) => {
              const hasApproved = action.approvals?.includes(currentMember.id);
              const approvalsCount = action.approvals?.length || 0;
              const totalRequired = members.filter(m => m.status === 'Active').length;
              const isFullyRatified = approvalsCount >= totalRequired;

              return (
                <div key={action.id} className="bank-card p-4 sm:p-5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {action.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          Initiated by {action.initiatedBy} • {action.dateInitiated}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isFullyRatified 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-[var(--accent-gold-surface)] text-[var(--accent-gold)] border border-[var(--accent-gold-light)]'
                        }`}>
                          {isFullyRatified ? 'Fully Ratified' : 'Awaiting 100% Member Consensus'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {action.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-[var(--brand-primary)]">
                        KES {Number(action.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {action.description}
                  </p>

                  {/* Approval Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Member Approvals:</span>
                      <span className="font-bold text-[var(--brand-primary)]">{approvalsCount} of {totalRequired} Active Members ({Math.round((approvalsCount / totalRequired) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          isFullyRatified ? 'bg-emerald-600' : 'bg-[var(--brand-primary)]'
                        }`}
                        style={{ width: `${Math.round((approvalsCount / totalRequired) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div>
                      {hasApproved ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>You ({currentMember.name.split(' ')[0]}) have approved this action</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-700 font-bold flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Your sign-off is pending! All 10 members must approve.</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveRatificationModalId(action.id)}
                      className="px-3 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center space-x-1.5 self-start sm:self-center"
                    >
                      <Coins className="w-3.5 h-3.5 text-[var(--accent-gold-light)]" />
                      <span>{hasApproved ? 'View Member Signatures' : 'Review & Cast Approval'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 1: LIVE RESOLUTIONS & VOTING */}
      {activeTab === 'voting' && (
        <div className="space-y-4">
          
          <div className="bank-card p-4 border-l-4 border-l-[var(--brand-primary)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Vote className="w-4 h-4 text-[var(--brand-primary)]" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                  Active Resolutions Awaiting Member Ballots
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Logged in as: {currentMember.name}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Every member has 1 vote per resolution. Reminders can be dispatched to pending members via automated Email & SMS.
            </p>
          </div>

          <div className="space-y-3.5">
            {resolutions.map((res) => {
              const yesCount = res.votes.yes.length;
              const noCount = res.votes.no.length;
              const abstainCount = res.votes.abstain.length;
              const totalVotes = yesCount + noCount + abstainCount;
              const quorumPercent = Math.min(100, Math.round((totalVotes / res.quorumNeeded) * 100));

              const hasVotedYes = res.votes.yes.includes(currentMember.id);
              const hasVotedNo = res.votes.no.includes(currentMember.id);
              const hasVotedAbstain = res.votes.abstain.includes(currentMember.id);
              const userVoted = hasVotedYes || hasVotedNo || hasVotedAbstain;

              return (
                <div
                  key={res.id}
                  className="bank-card p-4 sm:p-5 space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                          {res.id}
                        </span>
                        <span className="text-xs text-slate-400">Proposed by: {res.proposedBy}</span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        {res.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleSendEmailReminders(res.id)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition self-start"
                      title="Send email reminders to members who have not yet voted"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Email Reminders</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {res.description}
                  </p>

                  {/* Quorum Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Quorum Progress ({totalVotes}/{res.quorumNeeded} votes)</span>
                      <span className="text-slate-800 font-bold">{quorumPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div style={{ width: `${(yesCount / res.quorumNeeded) * 100}%` }} className="bg-[var(--accent-emerald)] h-full" />
                      <div style={{ width: `${(noCount / res.quorumNeeded) * 100}%` }} className="bg-rose-700 h-full" />
                      <div style={{ width: `${(abstainCount / res.quorumNeeded) * 100}%` }} className="bg-slate-400 h-full" />
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)]"></span>
                        <span>Yes: {yesCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-rose-700"></span>
                        <span>No: {noCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>Abstain: {abstainCount}</span>
                      </span>
                    </div>
                  </div>

                  {/* Voting Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      {userVoted ? (
                        <span className="text-[var(--accent-emerald)] font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            You voted: {hasVotedYes ? 'YES' : hasVotedNo ? 'NO' : 'ABSTAIN'}
                          </span>
                        </span>
                      ) : (
                        <span className="text-[var(--accent-gold)] font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Your vote is pending</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => castVote(res.id, 'yes')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                          hasVotedYes
                            ? 'bg-[var(--accent-emerald)] text-white shadow-xs'
                            : 'bg-white text-[var(--accent-emerald)] hover:bg-[var(--accent-emerald-surface)] border border-[var(--accent-emerald)]'
                        }`}
                      >
                        Vote YES
                      </button>

                      <button
                        onClick={() => castVote(res.id, 'no')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                          hasVotedNo
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-300'
                        }`}
                      >
                        Vote NO
                      </button>

                      <button
                        onClick={() => castVote(res.id, 'abstain')}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                          hasVotedAbstain
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Abstain
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: GROUP POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Official Constitution, Lending Rules, and Operational Handbooks
            </p>
            <button
              onClick={handleOpenNewPolicy}
              className="px-3 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publish Policy</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {policies.map((pol) => {
              const isExpanded = expandedPolicyId === pol.id;
              return (
                <div
                  key={pol.id}
                  className="bank-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedPolicyId(isExpanded ? null : pol.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50/50 transition"
                  >
                    <div className="space-y-0.5 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {pol.category}
                        </span>
                        <span className="text-[11px] text-slate-400">Effective: {pol.dateEffective}</span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {pol.title}
                      </h4>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 space-y-2">
                      <p className="whitespace-pre-line">{pol.content}</p>
                      <p className="text-[11px] text-slate-400 italic">
                        Author / Sponsor: {pol.author}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: RATIFIED CONSTITUTION & LLP AGREEMENT */}
      {activeTab === 'constitution' && (
        <ConstitutionView />
      )}

      {/* VIEW 4: EXECUTIVE PRIVILEGES MATRIX */}
      {activeTab === 'committee' && (
        <div className="space-y-3.5">
          <div className="bank-card p-4 sm:p-5 space-y-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Award className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Executive Committee Roster & Mandates</span>
              </h3>
              <p className="text-xs text-slate-500">
                Official leadership mandates of MGR Investment Group
              </p>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {executiveCommittee.map((exec) => (
                <div key={exec.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{exec.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                        {exec.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Mandate: <span className="text-slate-700">{exec.privileges}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    ID: {exec.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publish Policy Modal */}
      {showNewPolicyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-2xl p-5 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowNewPolicyModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Publish Group Policy
              </h3>
            </div>

            <form onSubmit={handleAddPolicy} className="space-y-3 pt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Audit & Financial Reporting Policy"
                  value={newPolicyForm.title}
                  onChange={(e) => setNewPolicyForm({ ...newPolicyForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newPolicyForm.category}
                  onChange={(e) => setNewPolicyForm({ ...newPolicyForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                >
                  <option value="Governance">Governance</option>
                  <option value="Investments">Investments</option>
                  <option value="Credit & Lending">Credit & Lending</option>
                  <option value="Membership">Membership</option>
                  <option value="Accounting & Audit">Accounting & Audit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Policy Body & Provisions *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Draft constitutional clause or resolution terms..."
                  value={newPolicyForm.content}
                  onChange={(e) => setNewPolicyForm({ ...newPolicyForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition"
              >
                Publish & Notify All Members
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
