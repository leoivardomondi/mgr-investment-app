import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageContextBanner from './PageContextBanner';
import {
  KENYA_MMF_BENCHMARKS_2025,
  CBK_MACRO_INDICATORS,
  MANSA_X_FACT_SHEET,
  COMMITTEE_TARGET_ALLOCATION,
  CEO_DIVERSIFICATION_DIRECTIVE
} from '../data/benchmarkFinancialData';
import {
  downloadReportHTML,
  downloadReportCSV
} from '../utils/reportGenerator';
import { 
  TrendingUp, 
  UploadCloud, 
  FileCheck2, 
  Coins, 
  ArrowRight, 
  FileText,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Scale,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  X,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Search,
  Download,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

export default function MMFStatementView() {
  const { 
    members, 
    assets, 
    distributeInterest, 
    totalMemberShares, 
    totalAssetsValue,
    setActiveTab, 
    showToast,
    isCurrentMemberExec,
    triggerExecRestriction,
    portfolioAdvisories,
    addPortfolioAdvisory,
    updatePortfolioAdvisory,
    resolvePortfolioAdvisory,
    reopenPortfolioAdvisory,
    deletePortfolioAdvisory
  } = useApp();

  const [selectedMmf, setSelectedMmf] = useState('Mansa X');
  const [mmfSectionTab, setMmfSectionTab] = useState('statements'); // 'statements', 'leagueTable', 'committeeProposal'
  const [mmfSearch, setMmfSearch] = useState('');
  const [reallocationCapital, setReallocationCapital] = useState(totalAssetsValue || 794194);
  const [statementData, setStatementData] = useState({
    institution: 'Mansa X Special Funds',
    period: 'Quarter 3 (Ending 30/09/2026)',
    periodCode: 'Q3-2026',
    openingBalance: 500000.00,
    deposits: 0.00,
    grossInterestEarned: 41587.00,
    withholdingTax: 0.00,
    netInterest: 41587.00,
    closingBalance: 541587.00,
    annualizedYield: '20.0%'
  });

  // Prorating Policy: 'holding-period' (Option A - Chama Standard), 'time-weighted' (Option B), 'unweighted' (Legacy)
  const [proratingPolicy, setProratingPolicy] = useState('holding-period');
  const [reserveRetentionRate, setReserveRetentionRate] = useState(0);
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('Mansa_X_Q3_Official_Statement_30_09_2026.pdf');

  // Dynamic Portfolio Advisories Management State
  const [advisoryFilter, setAdvisoryFilter] = useState('active'); // 'active', 'solved', 'all'
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [editingAdvisoryId, setEditingAdvisoryId] = useState(null);
  const [advisoryFormData, setAdvisoryFormData] = useState({
    category: 'PORTFOLIO REALLOCATION ANALYSIS',
    title: '',
    content: '',
    financialImpact: '',
    actionLabel: 'Resolve Withdrawal Lock',
    actionTarget: 'governance',
    severity: 'warning'
  });

  const [solveModal, setSolveModal] = useState({
    isOpen: false,
    advisoryId: null,
    resolutionNotes: ''
  });

  const handleSelectPreset = (mmfType) => {
    setSelectedMmf(mmfType);
    if (mmfType === 'Mansa X') {
      setStatementData({
        institution: 'Mansa X Special Funds',
        period: 'Q3 Accrual (Ending 30/09/2026)',
        periodCode: 'Q3-2026',
        openingBalance: 500000.00,
        deposits: 0.00,
        grossInterestEarned: 41587.00,
        withholdingTax: 0.00,
        netInterest: 41587.00,
        closingBalance: 541587.00,
        annualizedYield: '20.0%'
      });
      setUploadedFileName('Mansa_X_Q3_Official_Statement_30_09_2026.pdf');
    } else {
      setStatementData({
        institution: 'Etica Capital MMF (EMMF - KES)',
        period: 'October 2026 Statement (Ending 31/10/2026)',
        periodCode: 'Oct-2026',
        openingBalance: 230587.79,
        deposits: 18000.00,
        grossInterestEarned: 1908.18,
        withholdingTax: 286.23,
        netInterest: 1621.95,
        closingBalance: 250209.74,
        annualizedYield: '12.5%'
      });
      setUploadedFileName('EMMF_KES_STATEMENT_34236M_31_10_2026.pdf');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSimulatingUpload(true);
    setUploadedFileName(file.name);

    setTimeout(() => {
      setIsSimulatingUpload(false);
      showToast(`Extracted data successfully from "${file.name}"! Net Interest: KES ${statementData.netInterest.toLocaleString()}`);
    }, 1200);
  };

  // Calculations for Prorated Distribution
  const calculateDistribution = () => {
    const totalDistributable = statementData.netInterest * (1 - (reserveRetentionRate / 100));

    // Active members during Q3 (excluding late joiner Leoivard who deposited Oct 28 & Oct 30)
    return members.map(m => {
      let eligibleShares = m.shares;
      let daysActiveInPeriod = 92; // Full Q3 (July 1 to Sept 30 = 92 days)

      if (m.id === 'MGR-011') { // Leoivard Omondi Ongule
        if (proratingPolicy === 'holding-period') {
          // Option A: Exclude post-quarter capital completely (0 days active in Q3)
          eligibleShares = 0;
          daysActiveInPeriod = 0;
        } else if (proratingPolicy === 'time-weighted') {
          // Option B: Prorated by exact days active in Q3 (0 days)
          eligibleShares = 0;
          daysActiveInPeriod = 0;
        } else {
          // Option C: Unweighted (Legacy - treats full balance as active)
          eligibleShares = m.shares;
          daysActiveInPeriod = 92;
        }
      }

      return {
        ...m,
        eligibleShares,
        daysActiveInPeriod
      };
    });
  };

  const calculatedMembers = calculateDistribution();
  const totalEligibleBase = calculatedMembers.reduce((sum, m) => sum + m.eligibleShares, 0);
  const distributablePool = statementData.netInterest * (1 - (reserveRetentionRate / 100));
  const reservePoolAmount = statementData.netInterest * (reserveRetentionRate / 100);

  const calculatedBreakdown = calculatedMembers.map(m => {
    const proportion = totalEligibleBase > 0 ? (m.eligibleShares / totalEligibleBase) : 0;
    const dividend = distributablePool * proportion;
    const endingBalance = m.shares + dividend;
    return {
      ...m,
      proportion,
      dividend,
      endingBalance
    };
  });

  const handleExecuteDistribution = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Execute Interest Distribution",
        "Distributing MMF interest pro-rata across member accounts and updating club balances is strictly reserved for the 7 Executive Committee members (Dan Aloo, Josephat Lubanga, Sarah Njoki, Leoivard Omondi, Dr Joash Migosi, Benjamin Madara, John Kennedy Obalah)."
      );
      return;
    }

    const success = distributeInterest({
      sourceMmf: selectedMmf,
      totalInterest: statementData.netInterest,
      retainReservePercent: reserveRetentionRate,
      policy: proratingPolicy,
      note: `Statement ${statementData.period} [Policy: ${proratingPolicy === 'holding-period' ? 'Option A: Holding-Period Prorated' : proratingPolicy === 'time-weighted' ? 'Option B: Time-Weighted Days' : 'Option C: Unweighted'}]`
    });

    if (success) {
      showToast(`KES ${statementData.netInterest.toLocaleString()} distribution initiated! All 10 active members must ratify before execution.`);
    }
  };

  // Advisory Management Handlers
  const handleOpenCreate = () => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Create Strategic Portfolio Advisory",
        "Authoring strategic investment bulletins or portfolio reallocation notices is strictly restricted to the 7 Executive Committee members."
      );
      return;
    }
    setEditingAdvisoryId(null);
    setAdvisoryFormData({
      category: 'PORTFOLIO REALLOCATION ANALYSIS',
      title: '',
      content: '',
      financialImpact: '',
      actionLabel: 'Resolve Withdrawal Lock',
      actionTarget: 'governance',
      severity: 'warning'
    });
    setIsAdvisoryModalOpen(true);
  };

  const handleOpenEdit = (adv) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Edit Portfolio Advisory", "Restricted to Executive Committee members.");
      return;
    }
    setEditingAdvisoryId(adv.id);
    setAdvisoryFormData({
      category: adv.category || 'PORTFOLIO REALLOCATION ANALYSIS',
      title: adv.title || '',
      content: adv.content || '',
      financialImpact: adv.financialImpact || '',
      actionLabel: adv.actionLabel || '',
      actionTarget: adv.actionTarget || 'governance',
      severity: adv.severity || 'warning'
    });
    setIsAdvisoryModalOpen(true);
  };

  const handleSaveAdvisory = (e) => {
    e.preventDefault();
    if (!advisoryFormData.title.trim()) {
      showToast('Please enter an advisory title / headline', 'error');
      return;
    }
    if (!advisoryFormData.content.trim()) {
      showToast('Please enter the advisory content details', 'error');
      return;
    }

    if (editingAdvisoryId) {
      updatePortfolioAdvisory(editingAdvisoryId, advisoryFormData);
    } else {
      addPortfolioAdvisory(advisoryFormData);
    }
    setIsAdvisoryModalOpen(false);
  };

  const handleHitAsSolved = (id) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Resolve Advisory", "Only Executive Committee members can mark advisories as solved.");
      return;
    }
    setSolveModal({
      isOpen: true,
      advisoryId: id,
      resolutionNotes: 'Withdrawal restriction terms renegotiated with fund manager; capital reallocation initiated.'
    });
  };

  const confirmSolve = () => {
    if (solveModal.advisoryId) {
      resolvePortfolioAdvisory(solveModal.advisoryId, solveModal.resolutionNotes);
    }
    setSolveModal({ isOpen: false, advisoryId: null, resolutionNotes: '' });
  };

  const handleDeleteAdvisory = (id) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Delete Advisory", "Only Executive Committee members can delete advisory bulletins.");
      return;
    }
    if (window.confirm("Permanently delete this strategic portfolio advisory notice?")) {
      deletePortfolioAdvisory(id);
    }
  };

  const allAdvisories = portfolioAdvisories || [];
  const activeCount = allAdvisories.filter(a => a.status === 'active').length;
  const solvedCount = allAdvisories.filter(a => a.status === 'solved').length;
  const allCount = allAdvisories.length;

  const filteredAdvisories = allAdvisories.filter(a => {
    if (advisoryFilter === 'active') return a.status === 'active';
    if (advisoryFilter === 'solved') return a.status === 'solved';
    return true;
  });

  const filteredMmfBenchmarks = KENYA_MMF_BENCHMARKS_2025.filter(f =>
    f.manager.toLowerCase().includes(mmfSearch.toLowerCase()) ||
    (f.tag && f.tag.toLowerCase().includes(mmfSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">

      {/* Visual Context Banner with Documentary Photography */}
      <PageContextBanner
        eyebrow="Section IV • Money Market Funds, Mansa-X & Yield Intelligence"
        title="Statement Reconciliation, CMA Yield League Table & Reallocation"
        description="Reconcile official statements from Mansa-X Special Fund (SIB) and Etica Capital MMF, compare net returns across CMA-licensed Kenyan Money Market Funds (after 15% withholding tax), and model MGR's Executive Committee reallocation from Etica Capital MMF (~12.5% p.a.) into Mansa-X Special Fund (~20% p.a.)."
        imageUrl="https://images.unsplash.com/photo-1573164574511-73c773193279?auto=format&fit=crop&w=1000&q=80"
        imageAlt="Investment committee group reviewing money market fund yield tables"
        imageCaption="MGR Investment Committee • Net Return After 15% Withholding Tax"
        stats={[
          { label: "Mansa-X Balance", value: `KES ${Number(assets.mansaX.totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (~20% p.a.)` },
          { label: "Etica Capital MMF", value: `KES ${Number(assets.eticaMmf?.statementBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (12.5% p.a.)` },
          { label: "Net Yield Pool", value: `KES ${(Number(assets.mansaX.interestAccrued || 0) + Number(assets.eticaMmf?.octoberNetInterest || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Mansa X + Etica)` }
        ]}
      />

      {/* Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-[var(--border-hairline)] overflow-x-auto no-scrollbar">
          {[
            { id: 'statements', label: '1. Statement OCR & Dividend Engine' },
            { id: 'leagueTable', label: '2. CMA Money Market Yield Table' },
            { id: 'committeeProposal', label: '3. MGR Mansa-X & Etica Reallocation' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMmfSectionTab(tab.id)}
              className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap transition ${
                mmfSectionTab === tab.id
                  ? 'bg-[var(--brand-primary)] text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              downloadReportHTML(
                'mmfProposal',
                { members, assets, loans: [], ledger: [], totalMemberShares },
                { reallocationCapital, printMode: false }
              );
              showToast('Downloaded formatted 32-Fund CMA MMF & Committee Proposal Report (.html)!');
            }}
            className="px-2.5 py-1.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-xs text-xs font-semibold transition flex items-center space-x-1"
            title="Download formatted Investment Committee Proposal & 32-Fund CMA Yield Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Proposal &amp; MMF Report</span>
          </button>
          <button
            onClick={() => {
              downloadReportCSV(
                'mmfProposal',
                { members, assets, loans: [], ledger: [], totalMemberShares },
                { reallocationCapital }
              );
              showToast('Downloaded 32-Fund CMA League Table & Proposal (.csv)!');
            }}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-[var(--border-hairline)] rounded-xs text-xs font-semibold transition flex items-center space-x-1"
            title="Download 32-Fund CMA MMF & Committee Proposal as CSV / Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => {
              downloadReportHTML(
                'mmfProposal',
                { members, assets, loans: [], ledger: [], totalMemberShares },
                { reallocationCapital, printMode: true }
              );
            }}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-[var(--border-hairline)] rounded-xs text-xs font-semibold transition flex items-center space-x-1"
            title="Print / Save PDF of Investment Committee Proposal & 32-Fund CMA League Table"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print PDF</span>
          </button>
          <button
            onClick={() => {
              setMmfSectionTab('statements');
              handleSelectPreset('Mansa X');
            }}
            className={`px-2.5 py-1.5 rounded-xs text-xs font-semibold transition ${
              selectedMmf === 'Mansa X' && mmfSectionTab === 'statements'
                ? 'bg-[var(--brand-primary)] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Mansa X (~20%)
          </button>
          <button
            onClick={() => {
              setMmfSectionTab('statements');
              handleSelectPreset('Etica MMF');
            }}
            className={`px-2.5 py-1.5 rounded-xs text-xs font-semibold transition ${
              selectedMmf === 'Etica MMF' && mmfSectionTab === 'statements'
                ? 'bg-[var(--accent-gold)] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Etica MMF (13.04%)
          </button>
        </div>
      </div>

      {/* =====================================================================
          TAB 2: 32-FUND KENYA MMF YIELD LEAGUE TABLE & CBK MACRO BENCHMARKS
          ===================================================================== */}
      {mmfSectionTab === 'leagueTable' && (
        <div className="space-y-4">
          {/* CBK Macro & T-Bill Benchmark Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="bank-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">91-Day T-Bill (CBK)</span>
              <span className="font-mono-num text-base font-bold text-slate-900 mt-0.5 block">8.44% Gross</span>
              <span className="font-mono-num text-[10px] text-slate-500">7.20% Net (After 15% WHT)</span>
            </div>
            <div className="bank-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">182-Day T-Bill (CBK)</span>
              <span className="font-mono-num text-base font-bold text-slate-900 mt-0.5 block">8.62% Gross</span>
              <span className="font-mono-num text-[10px] text-slate-500">7.30% Net (After 15% WHT)</span>
            </div>
            <div className="bank-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">364-Day T-Bill (CBK)</span>
              <span className="font-mono-num text-base font-bold text-[var(--brand-primary)] mt-0.5 block">10.02% Gross</span>
              <span className="font-mono-num text-[10px] text-slate-500">8.60% Net (After 15% WHT)</span>
            </div>
            <div className="bank-card p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Central Bank Rate (CBR)</span>
              <span className="font-mono-num text-base font-bold text-slate-900 mt-0.5 block">10.00%</span>
              <span className="font-mono-num text-[10px] text-slate-500">April 2025 Benchmark</span>
            </div>
            <div className="bank-card p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Kenya Inflation Rate</span>
              <span className="font-mono-num text-base font-bold text-[var(--accent-gold)] mt-0.5 block">3.60%</span>
              <span className="font-mono-num text-[10px] text-slate-500">Real MMF Spread: +6.07%</span>
            </div>
          </div>

          {/* 32-Fund Table */}
          <div className="bank-card p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <h3 className="font-editorial font-bold text-base sm:text-lg text-slate-900">
                  Money Market Fund Yield for 32 CMA-Licensed Fund Managers
                </h3>
                <p className="text-xs text-slate-500">
                  Published 22nd April 2025 • Net Return is Annualized Return (Net of Management Fees) Less 15% Withholding Tax
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 32 fund managers..."
                  value={mmfSearch}
                  onChange={(e) => setMmfSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xs text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xs border border-[var(--border-hairline)]">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="py-2 px-3">Rank</th>
                    <th className="py-2 px-3">Fund Manager (CMA Licensed)</th>
                    <th className="py-2 px-3">AUM / Portfolio Status</th>
                    <th className="py-2 px-3 text-right">Annual Gross Rate (%)</th>
                    <th className="py-2 px-3 text-right">Net Return After 15% WHT (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredMmfBenchmarks.map((f) => {
                    const isHighlighted = f.tag && (f.tag.includes('MGR') || f.tag.includes('Committee'));
                    return (
                      <tr key={f.rank} className={`hover:bg-slate-50 transition ${isHighlighted ? 'bg-[var(--brand-tint)]/50' : ''}`}>
                        <td className="py-2 px-3 font-mono-num font-bold text-slate-500">#{f.rank}</td>
                        <td className="py-2 px-3 font-sans font-bold text-slate-900">
                          <span>{f.manager}</span>
                          {f.tag && (
                            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-xs bg-[var(--brand-primary)] text-white font-bold">
                              {f.tag}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-sans text-slate-600">{f.aum}</td>
                        <td className="py-2 px-3 font-mono-num font-semibold text-slate-800 text-right">{f.grossRate.toFixed(2)}%</td>
                        <td className="py-2 px-3 font-mono-num font-bold text-[var(--brand-primary)] text-right">{f.netReturn.toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[var(--brand-primary)] text-white font-bold font-mono-num text-xs">
                  <tr>
                    <td colSpan="3" className="py-2.5 px-3 font-sans uppercase">Market Average Across All 32 Fund Managers</td>
                    <td className="py-2.5 px-3 text-right">11.38%</td>
                    <td className="py-2.5 px-3 text-right text-[var(--accent-gold-light)]">9.67%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: MGR EXECUTIVE COMMITTEE REALLOCATION & MANSA-X FACT SHEET
          ===================================================================== */}
      {mmfSectionTab === 'committeeProposal' && (
        <div className="space-y-4">
          <div className="bank-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)] block">
                  MGR Executive Committee Reallocation Plan • Dated {COMMITTEE_TARGET_ALLOCATION.proposalDate}
                </span>
                <h3 className="font-editorial font-bold text-lg sm:text-xl text-slate-900 mt-0.5">
                  MGR Portfolio Reallocation & Mansa-X Yield Maximization
                </h3>
                <p className="text-xs text-slate-600">
                  Authorized by: {COMMITTEE_TARGET_ALLOCATION.signatories.map(s => `${s.name} (${s.role})`).join(' • ')}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xs border border-[var(--border-hairline)] shrink-0">
                <label className="block text-[10px] font-bold uppercase text-slate-500">
                  Simulate MGR Investable Capital Pool (KES)
                </label>
                <input
                  type="number"
                  value={reallocationCapital}
                  onChange={(e) => setReallocationCapital(Math.max(0, Number(e.target.value)))}
                  className="mt-1 w-44 px-2.5 py-1 bg-white border border-slate-300 rounded-xs font-mono-num font-bold text-sm text-slate-900"
                />
                <span className="block text-[9px] text-slate-500 mt-0.5">
                  Current MGR Invested Assets: KES {(assets.mansaX.totalBalance + assets.eticaMmf.statementBalance + assets.bankAccount.balance).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Target Allocation Table */}
            <div className="overflow-x-auto rounded-xs border border-[var(--border-hairline)]">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="py-2 px-3">MGR Asset Account</th>
                    <th className="py-2 px-3 text-right">Target %</th>
                    <th className="py-2 px-3 text-right">Allocated Amount (KES)</th>
                    <th className="py-2 px-3">Account & Instrument Details</th>
                    <th className="py-2 px-3 text-right">Target Net Yield</th>
                    <th className="py-2 px-3 text-right">Est. Annual Return (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {COMMITTEE_TARGET_ALLOCATION.buckets.map((b, i) => {
                    const allocated = (reallocationCapital * b.targetPercent) / 100;
                    const estReturn = (allocated * b.midYield) / 100;
                    return (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{b.assetClass}</td>
                        <td className="py-2.5 px-3 font-mono-num font-bold text-right text-[var(--brand-primary)]">{b.targetPercent}%</td>
                        <td className="py-2.5 px-3 font-mono-num font-bold text-right">{allocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{b.instruments}</td>
                        <td className="py-2.5 px-3 font-mono-num font-semibold text-right text-[var(--accent-gold)]">{b.projectedNetYield}</td>
                        <td className="py-2.5 px-3 font-mono-num font-bold text-right text-[var(--brand-primary)]">
                          + {estReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mansa-X Fact Sheet & Etica Reallocation Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-slate-50 rounded-xs border border-[var(--border-hairline)] space-y-2.5">
                <h4 className="font-editorial font-bold text-sm text-slate-900">
                  {MANSA_X_FACT_SHEET.fundName} ({MANSA_X_FACT_SHEET.fundManager})
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  {MANSA_X_FACT_SHEET.strategy}
                </p>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {MANSA_X_FACT_SHEET.historicalReturns.map((hr, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-xs border border-[var(--border-hairline)] text-center">
                      <span className="block text-[10px] text-slate-500 font-semibold">{hr.year}</span>
                      <span className="font-mono-num font-bold text-xs text-[var(--brand-primary)]">{hr.netReturn}%</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 space-y-1 text-[11px] text-slate-700 font-mono-num">
                  <p>• <strong>MGR Principal Invested (May 2026):</strong> KES {assets.mansaX.principal.toLocaleString()}</p>
                  <p>• <strong>MGR Accrued Q3 Net Return:</strong> + KES {assets.mansaX.interestAccrued.toLocaleString()}</p>
                  <p>• <strong>Current Mansa-X Balance:</strong> KES {assets.mansaX.totalBalance.toLocaleString()}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xs border border-[var(--border-hairline)] space-y-2.5">
                <h4 className="font-editorial font-bold text-sm text-slate-900">
                  MGR Reallocation Mandate (Etica MMF to Mansa-X)
                </h4>
                <p className="text-slate-700 leading-relaxed">
                  Per active Treasury Directive and Resolution <strong>RES-2026-001</strong>, as soon as Etica Capital MMF processes redemption / liquidity access, the Executive Committee is executing a tactical transfer of <span className="font-mono-num font-bold text-emerald-800">KES 200,000.00</span> from Etica Capital MMF (at dynamic ~11.08%–12.50% p.a.) into Mansa-X Special Fund (~18%–20% p.a.) to maximize group returns.
                </p>
                <div className="space-y-1.5 pt-1">
                  {[
                    { name: "1. Mansa-X Special Fund (SIB)", net: "~18.00%–20.00% p.a. (Dynamic)", bal: `KES ${assets.mansaX.totalBalance.toLocaleString()}` },
                    { name: "2. Etica Capital MMF (Statement + Oct Inflows)", net: "11.08%–12.50% p.a. (Dynamic)", bal: `KES ${assets.eticaMmf.statementBalance.toLocaleString()}` },
                    { name: "3. Equity Bank Kenya (Chama Joint Account)", net: "Lowest Ledger Fees", bal: `KES ${assets.bankAccount.balance.toLocaleString()}` },
                    { name: "4. Group Registration & Reserve Pool", net: "11 Members × 1k", bal: `KES ${assets.groupReserveAccount.balance.toLocaleString()}` }
                  ].map((m, idx) => (
                    <div key={idx} className="p-2 bg-white rounded-xs border border-[var(--border-hairline)] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{m.name}</p>
                        <p className="text-[10px] text-slate-500">Live MGR Balance: {m.bal}</p>
                      </div>
                      <span className="font-mono-num font-bold text-xs text-[var(--brand-primary)]">{m.net}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Executive Policy Commentary on Bank, Return on Investment, IPS & Research */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-xs border border-[#DDD9D0] shadow-xs space-y-3.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#DDD9D0]">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1D3B2A] font-mono-num block">
                    Official Executive Policy Commentary • Investment Policy Statement (I.P.S.)
                  </span>
                  <h4 className="font-editorial font-bold text-sm sm:text-base text-slate-900">
                    Banking Operations, Dynamic Yield Oversight &amp; Strategic Research Horizons
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1D3B2A] text-white self-start sm:self-center shrink-0">
                  Ratified Club Directive
                </span>
              </div>

              {/* Grid: Bank & Return on Investment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* 1) Bank */}
                <div className="p-3.5 bg-white rounded-xl border border-[#DDD9D0] space-y-2">
                  <div className="flex items-center space-x-2 text-[#1D3B2A]">
                    <span className="w-5 h-5 rounded-full bg-[#EDF1ED] text-[#1D3B2A] font-bold flex items-center justify-center text-[11px]">1</span>
                    <h5 className="font-bold text-xs">Bank: Equity Bank Kenya (Chama Joint Account)</h5>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    For now we shall maintain <strong>Equity Bank</strong>: it is the only bank flexible enough to open a Chama joint bank account (others insist on an investment club registration certificate first). Furthermore, ledger fees for Equity Bank are the <strong>lowest in the Kenyan banking sector</strong>.
                  </p>
                </div>

                {/* 2) Return on Investment */}
                <div className="p-3.5 bg-white rounded-xl border border-[#DDD9D0] space-y-2">
                  <div className="flex items-center space-x-2 text-[#6E3C1B]">
                    <span className="w-5 h-5 rounded-full bg-[#F6EFEA] text-[#6E3C1B] font-bold flex items-center justify-center text-[11px]">2</span>
                    <h5 className="font-bold text-xs">Return on Investment (ROI Dynamics)</h5>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                    <p>
                      <strong>A) Mansa X:</strong> Returns fluctuate with market conditions. We keep monitoring continuously so that if yields drop, we compare other portfolios and make quick investment decisions.
                    </p>
                    <p>
                      <strong>B) Etica Capital MMF:</strong> The benchmark figure of <strong>11.08% – 12.50%</strong> is also subject to fluctuations based on CBK rates and market liquidity.
                    </p>
                  </div>
                </div>

              </div>

              {/* 3) Investment Policy Statement (I.P.S.) Process & Tactical KES 200,000 Reallocation */}
              <div className="p-3.5 bg-white rounded-xl border border-[#DDD9D0] space-y-2">
                <div className="flex items-center space-x-2 text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[#EDF1ED] text-[#1D3B2A] font-bold flex items-center justify-center text-[11px]">3</span>
                  <h5 className="font-bold text-xs">Investment Policy Statement (I.P.S.) Formulation &amp; Peer Comparison</h5>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  The <strong>Investment Policy Statement (I.P.S.)</strong> shall be based on research from the <strong>Investment Officer / Analyst</strong>, discussed by the <strong>Executive Committee</strong>, and democratically ratified by the <strong>General Membership</strong>. Leadership has identified benchmark peers and market experts with whom notes are compared before floating ideas in MGR Investment Club.
                </p>
                <div className="p-2.5 bg-[#F8F9F8] rounded-lg border border-[#CCD7CD] text-[11px] text-[#1D3B2A] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-semibold">
                  <span>
                    🔄 <strong>Immediate Action:</strong> Once Etica Capital MMF grants liquidity access to funds, we shall transfer <strong>KES 200,000/=</strong> into the Mansa X account (most competitive returns in the market).
                  </span>
                  <span className="shrink-0 text-[10px] font-mono-num font-bold bg-white text-[#1D3B2A] px-2 py-0.5 rounded border border-[#CCD7CD]">
                    KES 200,000 Reallocation
                  </span>
                </div>
              </div>

              {/* 4) Member Research Mandate across the 6 Portfolios */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[var(--brand-tint)] text-[var(--brand-primary)] font-bold flex items-center justify-center text-[11px]">4</span>
                  <h5 className="font-bold text-xs">Mandatory Member Research Mandate (6 Strategic Portfolios)</h5>
                </div>
                <p className="text-slate-600 text-[11px]">
                  All members are formally encouraged to research widely on the following six (6) portfolios to strengthen collective investment acumen:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-0.5">
                  {[
                    { num: "1", name: "FIF (Fixed Income Funds)", desc: "Corporate debt funds, commercial paper & predictable fixed coupon credit." },
                    { num: "2", name: "Derivatives (NEXT)", desc: "NSE Derivatives Market index and equity futures for downside hedging." },
                    { num: "3", name: "REITs (Real Estate Trusts)", desc: "Income & Development Real Estate Investment Trusts (≥80% payout)." },
                    { num: "4", name: "ETFs (Exchange Traded Funds)", desc: "Listed physical commodity trackers (e.g., Absa NewGold ETF on NSE)." },
                    { num: "5", name: "Government Securities & IFs", desc: "T-Bills, Treasury Bonds, and Infrastructure Funds / Bonds (100% tax-free)." },
                    { num: "6", name: "Nairobi Securities Exchange", desc: "Blue-chip equities (Safaricom, Equity, KCB, EABL) for capital growth." }
                  ].map((port) => (
                    <div key={port.num} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono-num font-bold text-xs text-[var(--brand-primary)]">{port.num})</span>
                        <span className="font-bold text-slate-900 text-[11px]">{port.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 leading-snug">{port.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CEO Strategic Principle of Investment Diversification (6 Approved Asset & Institutional Pillars) */}
            <div className="p-4 sm:p-5 bg-slate-50 rounded-xs border-l-4 border-l-[var(--brand-primary)] border border-[var(--border-hairline)] space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-hairline)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-gold)] block">
                    CEO Investment Directive • Principle of Portfolio Diversification (POL-006)
                  </span>
                  <h4 className="font-editorial font-bold text-sm sm:text-base text-slate-900 mt-0.5">
                    Multi-Manager &amp; Multi-Asset Diversification Framework
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-[var(--brand-primary)] text-white self-start sm:self-center">
                  Issued by: {CEO_DIVERSIFICATION_DIRECTIVE.author}
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed italic bg-white p-3 rounded border border-[var(--border-hairline)]">
                &ldquo;One of the principles of investment is diversification: In <strong>Etica Capital MMF</strong> we can do only one portfolio. Others we should do: <strong>SIB (Standard Investment Bank)</strong>, <strong>Nabo Capital</strong>, <strong>Government Securities (Treasury Bills / Bonds)</strong>, <strong>Infrastructure Bonds</strong>, <strong>Derivatives</strong>, <strong>REITs</strong>, and <strong>ETFs</strong>.&rdquo;
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {CEO_DIVERSIFICATION_DIRECTIVE.pillars.map((p, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xs border border-[var(--border-hairline)] flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--brand-tint)] text-[var(--brand-primary)]">
                          {p.code}
                        </span>
                        <span className="font-mono-num text-[10px] font-bold text-[var(--accent-gold)]">
                          {p.yieldBenchmark}
                        </span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 pt-0.5">
                        {p.institution}
                      </h5>
                      <p className="text-[10px] font-semibold text-slate-500">
                        {p.category}
                      </p>
                      <p className="text-[11px] text-slate-600 leading-snug pt-0.5">
                        {p.mandate}
                      </p>
                    </div>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-medium">Portfolio Status:</span>
                      <span className="font-bold text-[var(--brand-primary)]">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Portfolio Advisories & Action Alerts Management Section (Dynamic & Manageable) */}
      <div className={mmfSectionTab === 'statements' ? 'space-y-3' : 'hidden'}>
        
        {/* Section Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-0.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] animate-pulse"></span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Strategic Portfolio Advisories & Action Alerts
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredAdvisories.length} {advisoryFilter === 'active' ? 'Active' : advisoryFilter === 'solved' ? 'Solved' : 'Total'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setAdvisoryFilter('active')}
                className={`h-7 px-2.5 rounded-md text-xs transition flex items-center gap-1 ${
                  advisoryFilter === 'active'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Active</span>
                <span className="text-[10px] bg-[#FAF6EC] text-[#5A4518] border border-[#E8DCB8] px-1.5 py-0.2 rounded-full font-bold">
                  {activeCount}
                </span>
              </button>
              <button
                onClick={() => setAdvisoryFilter('solved')}
                className={`h-7 px-2.5 rounded-md text-xs transition flex items-center gap-1 ${
                  advisoryFilter === 'solved'
                    ? 'bg-white text-[#1D3B2A] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Solved</span>
                <span className="text-[10px] bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD] px-1.5 py-0.2 rounded-full font-bold">
                  {solvedCount}
                </span>
              </button>
              <button
                onClick={() => setAdvisoryFilter('all')}
                className={`h-7 px-2.5 rounded-md text-xs transition ${
                  advisoryFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allCount})
              </button>
            </div>

            {/* Create New Advisory Button */}
            <button
              onClick={handleOpenCreate}
              className="h-8 px-2.5 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 shrink-0 shadow-xs"
              title="Create a new strategic portfolio advisory notice"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">New Advisory</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredAdvisories.length === 0 && (
          <div className="bank-card p-6 text-center border-dashed border-2 border-slate-200 bg-slate-50/60 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-slate-800">
              {advisoryFilter === 'active' ? 'No Active Portfolio Advisories' : 'No Advisories in this View'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
              {advisoryFilter === 'active'
                ? 'All operational withdrawal restrictions and yield opportunity alerts have been successfully resolved.'
                : 'There are no notices matching the selected filter.'}
            </p>
            {isCurrentMemberExec && (
              <button
                onClick={handleOpenCreate}
                className="mt-3 px-3 py-1.5 bg-[var(--brand-primary)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--brand-primary-hover)] transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Advisory Bulletin</span>
              </button>
            )}
          </div>
        )}

        {/* List of Dynamic Manageable Advisories */}
        {filteredAdvisories.map((adv) => {
          const isSolved = adv.status === 'solved';
          return (
            <div
              key={adv.id}
              className={`bank-card p-4 transition ${
                isSolved 
                  ? 'border-l-4 border-l-emerald-600 bg-emerald-50/15'
                  : 'border-l-4 border-l-[var(--accent-gold)] bg-white'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                      {adv.category || 'PORTFOLIO REALLOCATION ANALYSIS'}
                    </span>
                    {isSolved ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#1D3B2A]" />
                        <span>Solved on {adv.resolvedAt || 'Recent'} by {adv.resolvedBy || 'Executive Committee'}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FAF6EC] text-[#5A4518] border border-[#E8DCB8]">
                        Active Alert
                      </span>
                    )}
                  </div>

                  <h3 className={`text-sm sm:text-base font-bold ${isSolved ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                    {adv.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {adv.content}
                  </p>

                  {/* Resolution Notes box if solved */}
                  {isSolved && adv.resolutionNotes && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 mt-2 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Resolution Record:</strong> {adv.resolutionNotes}
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>Published: {adv.createdAt}</span>
                    <span>•</span>
                    <span>Author: {adv.author}</span>
                  </div>
                </div>

                {/* Standardized Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-start md:self-center flex-wrap">
                  
                  {/* Primary Action Button (e.g. Resolve Withdrawal Lock ->) */}
                  {!isSolved && adv.actionLabel && (
                    <button
                      onClick={() => setActiveTab(adv.actionTarget || 'governance')}
                      className="h-8 px-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 shrink-0"
                    >
                      <span>{adv.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Hit as Solved / Reopen Button */}
                  {isSolved ? (
                    <button
                      onClick={() => reopenPortfolioAdvisory(adv.id)}
                      className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center gap-1 shrink-0"
                      title="Reopen as active alert"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                      <span>Reopen</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHitAsSolved(adv.id)}
                      className="h-8 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs transition flex items-center gap-1 shrink-0"
                      title="Hit as Solved"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hit as Solved</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(adv)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
                    title="Edit Advisory Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteAdvisory(adv.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition shrink-0"
                    title="Delete Advisory Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statement Upload & Extraction Box */}
      <div className="bank-card p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>MMF Statement Upload & Parser</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select or drop PDF statements from Etica Capital MMF or Mansa X
            </p>
          </div>

          <label className="cursor-pointer px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg transition inline-flex items-center justify-center space-x-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload PDF Statement</span>
            <input
              type="file"
              accept=".pdf,.csv,.png,.jpg"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Current Extracted Statement Card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 min-w-0 flex-1">
              <FileCheck2 className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />
              <span className="truncate" title={uploadedFileName}>{uploadedFileName}</span>
              {isSimulatingUpload && (
                <span className="text-[10px] text-[var(--accent-gold)] font-bold shrink-0">
                  Parsing...
                </span>
              )}
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded shrink-0">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Fund Name</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">{statementData.institution}</p>
              <p className="text-[10px] text-slate-500 truncate">{statementData.period}</p>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Net Interest Earned</p>
              <p className="font-bold text-[var(--brand-primary)] text-xs mt-0.5 truncate">
                KES {statementData.netInterest.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 truncate">Yield: {statementData.annualizedYield}</p>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Deposits Credited</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                KES {statementData.deposits.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 truncate">Includes Leoivard 18k</p>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Closing Balance</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                KES {statementData.closingBalance.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 truncate">Reconciled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chama Governance & Prorating Policy Selector */}
      <div className="bank-card p-4 space-y-3 bg-[var(--accent-gold-surface)] border border-[var(--accent-gold-light)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-[var(--brand-primary)]" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Chama Fiduciary Prorating & Fairness Policy
              </h3>
              <p className="text-[11px] text-slate-600">
                Standard governance rule for late joiners and post-quarter capital additions
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-gold-light)] text-[var(--brand-primary)] uppercase tracking-wider self-start sm:self-auto">
            Bylaw Clause 4.2
          </span>
        </div>

        {/* Policy Radios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setProratingPolicy('holding-period')}
            className={`p-3 rounded-xl border text-left transition ${
              proratingPolicy === 'holding-period'
                ? 'bg-white border-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--brand-primary)]'
                : 'bg-slate-50/70 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Option A: Holding-Period Prorated</span>
              {proratingPolicy === 'holding-period' && (
                <span className="text-[10px] font-bold text-[var(--brand-primary)] bg-[var(--accent-gold-light)] px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Excludes capital deposited after quarter close (30/09/2026). Leoivard receives <strong>KES 0.00</strong>; full KES 17,000 member deposit qualifies for Q4 (KES 1k reg fee deducted).
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProratingPolicy('time-weighted')}
            className={`p-3 rounded-xl border text-left transition ${
              proratingPolicy === 'time-weighted'
                ? 'bg-white border-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--brand-primary)]'
                : 'bg-slate-50/70 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Option B: Time-Weighted Days</span>
              <span className="text-[10px] text-slate-500 font-semibold">Exact Days</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              0 days active in Q3 yields <strong>KES 0.00</strong> dividend. Mathematically confirms Option A while logging exact holding days.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProratingPolicy('unweighted')}
            className={`p-3 rounded-xl border text-left transition ${
              proratingPolicy === 'unweighted'
                ? 'bg-white border-amber-600 shadow-sm ring-1 ring-amber-600'
                : 'bg-slate-50/70 border-slate-200 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Option C: Unweighted (Legacy)</span>
              <span className="text-[10px] text-[#5A4518] font-bold bg-[#FAF6EC] border border-[#E8DCB8] px-1.5 py-0.5 rounded">
                Dilutes Q3
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Allocates across total KES 710,675.00. Unfairly awards Leoivard KES 993.88 from past quarterly earnings.
            </p>
          </button>
        </div>

        {/* Fiduciary Explanatory Callout Banner */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">
              Audit Transparency Note for Leoivard Omondi Ongule (Member 011):
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Deposited KES 1,000/= on 13/10/2026 (Ref: <strong>UJDGFAA8WB</strong>) and KES 17,000/= on 28/10/2026 (Ref: <strong>UJSGF05XHV</strong>) into ETICA CAPITAL LTD (Paybill Bus No: <strong>4096483</strong>, Account/Client Code: <strong>34236M</strong>) in Quarter 4. 
              The KES 1,000/= registration fee is deducted to the Non-Refundable Group Reserve Pool and is not part of member deposit. 
              Because the Mansa X interest of <strong>KES 41,587.00</strong> was accrued up to <strong>30/09/2026 (Quarter 3)</strong>, 
              Leoivard&apos;s capital was active for <strong>0 days</strong> in Q3. 
              Under Chama governance, his starting balance of <strong>KES 17,000.00</strong> is preserved intact and will begin earning pro-rata dividends in <strong>Quarter 4 (Oct–Dec 2026)</strong>. 
              The Q3 qualifying capital base is <strong>KES {totalEligibleBase.toLocaleString()}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Pro-Rata Dividend Distribution Table */}
      <div className="bank-card p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Coins className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>Pro-Rata Dividend Distribution Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500">
              Allocates KES {statementData.netInterest.toLocaleString()} directly to member shares for continuous compound interest
            </p>
          </div>

          {/* Retention Slider */}
          <div className="flex items-center space-x-2.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600 font-semibold">Retain in Group Reserve:</span>
            <input
              type="range"
              min="0"
              max="20"
              step="5"
              value={reserveRetentionRate}
              onChange={(e) => setReserveRetentionRate(Number(e.target.value))}
              className="w-20 accent-[var(--brand-primary)] cursor-pointer"
            />
            <span className="font-bold text-slate-900 min-w-[28px] text-right">
              {reserveRetentionRate}%
            </span>
          </div>
        </div>

        {/* Distribution Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Distributable Pool</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              KES {distributablePool.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500">Compounding to members</p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Q3 Qualifying Base</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              KES {totalEligibleBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500">
              {proratingPolicy === 'unweighted' ? 'Total Shares' : 'Excludes Oct capital'}
            </p>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Group Reserve Retained</p>
            <p className="text-base font-bold text-slate-900 mt-0.5">
              KES {reservePoolAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500">For registration & ops</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex flex-col justify-center text-center">
            <span className="text-[10px] font-bold text-amber-900 uppercase">Interest Retained at Group Level</span>
            <p className="text-xs font-bold text-amber-800 mt-0.5">Undistributed Chama Surplus</p>
            <p className="text-[10px] text-amber-700">Not assigned to member accounts yet</p>
          </div>
        </div>

        {/* Member Pro-Rata Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Member &amp; Classification</th>
                <th className="py-2.5 px-3 text-right">Net Principal Capital (KES)</th>
                <th className="py-2.5 px-3 text-right">Reg Fee (KES)</th>
                <th className="py-2.5 px-3 text-center">Active Days</th>
                <th className="py-2.5 px-3 text-right">Share %</th>
                <th className="py-2.5 px-3 text-right text-slate-400">Assigned Interest (KES)</th>
                <th className="py-2.5 px-3 text-right font-bold text-[var(--brand-primary)]">Member Balance C/F (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-mono-num">
              {calculatedBreakdown.map((member) => {
                const isLeoivard = member.id === 'MGR-011';
                const isDeceased = member.status === 'Deceased' || member.id === 'MGR-007';

                return (
                  <tr 
                    key={member.id} 
                    className={`transition ${
                      isLeoivard 
                        ? 'bg-amber-50/50 hover:bg-amber-50' 
                        : isDeceased 
                          ? 'bg-slate-50/60 hover:bg-slate-50' 
                          : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      <div>
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <p className="truncate font-semibold">{member.name}</p>
                          {isLeoivard && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FAF6EC] text-[#5A4518] border border-[#E8DCB8]">
                              Starts Q4
                            </span>
                          )}
                          {isDeceased && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                              Beneficiary Escrow
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {member.role} {member.note ? `• ${member.note}` : ''}
                        </p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {isCurrentMemberExec || member.id === currentMember?.id
                        ? `KES ${member.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'KES ••••••'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {isCurrentMemberExec || member.id === currentMember?.id ? '1,000.00' : '••••••'}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500 font-sans">
                      {member.daysActiveInPeriod} Days
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                      {isCurrentMemberExec || member.id === currentMember?.id
                        ? `${(member.proportion * 100).toFixed(2)}%`
                        : '••••%'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-normal">
                      {isCurrentMemberExec || member.id === currentMember?.id ? '0.00' : '••••••'} <span className="text-[9px] text-slate-400">(Undistributed)</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[var(--brand-primary)]">
                      {isCurrentMemberExec || member.id === currentMember?.id
                        ? `KES ${member.shares.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'KES ••••••'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 text-xs font-bold text-slate-900 border-t-2 border-slate-200">
              <tr>
                <td className="py-2.5 px-3">Total Reconciled ({members.length} Members)</td>
                <td className="py-2.5 px-3 text-right">
                  KES {members.reduce((sum, m) => sum + m.shares, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">
                  KES {(members.length * 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 px-3 text-center">-</td>
                <td className="py-2.5 px-3 text-right">100.00%</td>
                <td className="py-2.5 px-3 text-right text-slate-400 font-normal">
                  KES 0.00 <span className="text-[9px] text-slate-400 block">(Undistributed Group Surplus)</span>
                </td>
                <td className="py-2.5 px-3 text-right text-[var(--brand-primary)]">
                  KES {members.reduce((sum, m) => sum + m.shares, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Advisory Create / Edit Modal */}
      {isAdvisoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-[var(--brand-primary)] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-gold-light)]" />
                <h3 className="font-bold text-base">
                  {editingAdvisoryId ? 'Edit Portfolio Advisory Notice' : 'New Portfolio Advisory Bulletin'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAdvisoryModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvisory} className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Advisory Category
                </label>
                <select
                  value={advisoryFormData.category}
                  onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, category: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden font-medium"
                >
                  <option value="PORTFOLIO REALLOCATION ANALYSIS">PORTFOLIO REALLOCATION ANALYSIS</option>
                  <option value="YIELD MAXIMIZATION OPPORTUNITY">YIELD MAXIMIZATION OPPORTUNITY</option>
                  <option value="MMF WITHDRAWAL RESTRICTION">MMF WITHDRAWAL RESTRICTION</option>
                  <option value="LIQUIDITY & OPS CALL">LIQUIDITY & OPS CALL</option>
                  <option value="REGULATORY & AUDIT NOTICE">REGULATORY & AUDIT NOTICE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Opportunity Loss: KES 17,294/="
                  value={advisoryFormData.title}
                  onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Advisory Narrative / Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the opportunity cost, asset return comparison, or operational hurdle..."
                  value={advisoryFormData.content}
                  onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Action Button Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Resolve Withdrawal Lock"
                    value={advisoryFormData.actionLabel}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, actionLabel: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Target View Link
                  </label>
                  <select
                    value={advisoryFormData.actionTarget}
                    onChange={(e) => setAdvisoryFormData({ ...advisoryFormData, actionTarget: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--brand-primary)] focus:outline-hidden"
                  >
                    <option value="governance">Voting & Policy (Governance)</option>
                    <option value="members">Members Share Registry</option>
                    <option value="loans">Loan Facility (80%)</option>
                    <option value="ledger">Ledger & P&L</option>
                    <option value="dashboard">Dashboard Overview</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdvisoryModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-[var(--brand-primary-hover)] font-bold text-xs shadow-xs"
                >
                  {editingAdvisoryId ? 'Save Changes' : 'Publish Advisory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hit as Solved Confirmation Modal */}
      {solveModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="mgr-glass-header text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[var(--accent-gold-light)]" />
                <h3 className="font-bold text-base">Hit as Solved</h3>
              </div>
              <button 
                onClick={() => setSolveModal({ isOpen: false, advisoryId: null, resolutionNotes: '' })}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <p className="text-slate-600 leading-relaxed">
                You are marking this strategic advisory as <strong>Solved</strong>. It will be archived under the <em>Solved</em> filter tab with your name and timestamp, and can be reopened at any time.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Resolution Record / Note
                </label>
                <textarea
                  rows={3}
                  value={solveModal.resolutionNotes}
                  onChange={(e) => setSolveModal({ ...solveModal, resolutionNotes: e.target.value })}
                  placeholder="e.g. Terms agreed with fund manager, withdrawal permitted, or capital moved."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-700 focus:outline-hidden text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSolveModal({ isOpen: false, advisoryId: null, resolutionNotes: '' })}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSolve}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-bold text-xs shadow-xs"
                >
                  Confirm as Solved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
