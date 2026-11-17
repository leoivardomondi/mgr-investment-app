import React, { useState } from 'react';
import PageContextBanner from './PageContextBanner';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  ShieldCheck, 
  Scale, 
  BookOpen, 
  Award, 
  Users, 
  ChevronRight,
  TrendingUp,
  HeartHandshake,
  Landmark,
  Coins,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Smartphone
} from 'lucide-react';
import { downloadDocumentPdf } from '../utils/documentDownloader';

export default function OfficialDocumentsView() {
  const [selectedDocId, setSelectedDocId] = useState('constitution');
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: 'constitution',
      title: 'MGR Club Constitution / LLP Agreement',
      shortTitle: 'Constitution PDF',
      ref: 'MGR/CONST/2026/V1',
      date: 'Ratified 30th October 2026',
      legalBasis: 'Limited Liability Partnerships Act, Cap 30A Laws of Kenya',
      badge: 'Founding Instrument',
      badgeColor: 'emerald',
      icon: Scale,
      pdfUrl: '/documents/MGR_Club_Constitution_LLP_Agreement.pdf',
      htmlUrl: '/documents/MGR_Club_Constitution_LLP_Agreement.html',
      filename: 'MGR_Club_Constitution_LLP_Agreement.pdf',
      pdfSize: '507 KB',
      pages: '5 Pages',
      summary: 'Primary governing instrument comprising 12 Articles, founding leadership stability mandate (6.0), member rights and 90% emergency loan limits (10.5), Schedules 1–3, and 001–011 Member Register.'
    },
    {
      id: 'ips',
      title: 'Investment Policy Statement & SMART Objectives',
      shortTitle: 'Investment Policy PDF',
      ref: 'MGR/IPS/2026/V1',
      date: 'Adopted 30th October 2026',
      legalBasis: 'Capital Markets Authority (CMA) Collective Investment Regulations',
      badge: 'Fiduciary Charter',
      badgeColor: 'gold',
      icon: TrendingUp,
      pdfUrl: '/documents/MGR_Investment_Policy_and_Objectives.pdf',
      htmlUrl: '/documents/MGR_Investment_Policy_and_Objectives.html',
      filename: 'MGR_Investment_Policy_and_Objectives.pdf',
      pdfSize: '400 KB',
      pages: '3 Pages',
      summary: 'Vision 3.1, Mission 3.2, 10 Strategic Objectives (4.1–4.10), 6 SMART Targets, 3-Tier IPS Governance & Peer Benchmarking Protocol, Tactical KES 200,000 Reallocation from Etica MMF to Mansa-X, Equity Bank Chama Joint Account, and 6 Strategic Member Research Horizons (FIFs, Derivatives, REITs, ETFs, Gov Securities / IFBs, NSE Equities).'
    },
    {
      id: 'emergency_loans',
      title: 'Member 90% Emergency Credit & Set-Off Guideline',
      shortTitle: 'Credit Policy PDF',
      ref: 'MGR/POL/CREDIT-01',
      date: 'Effective 1st September 2026',
      legalBasis: 'Constitution Clause 10.5 & Mutual Credit Cooperative Principles',
      badge: 'Credit Policy',
      badgeColor: 'blue',
      icon: Coins,
      pdfUrl: '/documents/MGR_Emergency_Credit_and_SetOff_Policy.pdf',
      htmlUrl: '/documents/MGR_Emergency_Credit_and_SetOff_Policy.html',
      filename: 'MGR_Emergency_Credit_and_SetOff_Policy.pdf',
      pdfSize: '258 KB',
      pages: '1 Page',
      summary: 'Guaranteed 90% borrowing limit against member deposits, 10% monthly interest rate, 30-day repayment cycle, mandatory right of set-off against member deposit balances, and default remedies.'
    },
    {
      id: 'bereavement',
      title: 'Bereavement Succession & Estate Exit Protocol',
      shortTitle: 'Bereavement PDF',
      ref: 'MGR/POL/BEREAVEMENT-01',
      date: 'Ratified 11th September 2026',
      legalBasis: 'Constitution Clause 10.7 & Law of Succession Act',
      badge: 'Succession Protocol',
      badgeColor: 'crimson',
      icon: HeartHandshake,
      pdfUrl: '/documents/MGR_Bereavement_Succession_Exit_Protocol.pdf',
      htmlUrl: '/documents/MGR_Bereavement_Succession_Exit_Protocol.html',
      filename: 'MGR_Bereavement_Succession_Exit_Protocol.pdf',
      pdfSize: '264 KB',
      pages: '1 Page',
      summary: 'Bereavement exit settlement ensuring 1:1 par value internal buyout for deceased member shares, 100% release of terminal dues to the family beneficiary, and zero disruption of 6-month MMF lock-ins.'
    },
    {
      id: 'mmf_prorating',
      title: 'Treasury Holding-Period Yield Prorating Policy',
      shortTitle: 'Prorating Policy PDF',
      ref: 'MGR/POL/MMF-DIST-01',
      date: 'Effective 30th September 2026',
      legalBasis: 'Constitution Clause 9.4 & Ratified Q3/Q4 Treasury Resolutions',
      badge: 'Treasury Policy',
      badgeColor: 'emerald',
      icon: Landmark,
      pdfUrl: '/documents/MGR_Treasury_Yield_Prorating_Policy.pdf',
      htmlUrl: '/documents/MGR_Treasury_Yield_Prorating_Policy.html',
      filename: 'MGR_Treasury_Yield_Prorating_Policy.pdf',
      pdfSize: '226 KB',
      pages: '1 Page',
      summary: 'Holding-period weighted distribution rules, exclusion of post-period capital, full preservation of new member deposits, and mandatory 100% unanimous active member ratification gate.'
    },
    {
      id: 'member_orientation_guide',
      title: 'Member Web App Orientation Manual & Consultative Guide',
      shortTitle: 'App User Manual PDF',
      ref: 'MGR/CIR/2026/APP-01',
      date: 'Circulated FY 2026 (Draft for Feedback)',
      legalBasis: 'Cap 30A, Kenya Data Protection Act 2019 & Societies Act',
      badge: 'Consultative Guide',
      badgeColor: 'amber',
      icon: Smartphone,
      pdfUrl: '/documents/MGR_Member_App_Guide_and_Orientation_Circular.pdf',
      htmlUrl: '/documents/MGR_Member_App_Guide_and_Orientation_Circular.html',
      filename: 'MGR_Member_App_Guide_and_Orientation_Circular.pdf',
      pdfSize: '390 KB',
      pages: '4 Pages',
      summary: 'Operational manual detailing web app modules, mobile PWA home screen installation, 24-hour expiring KYC PIN vault, double-entry ledger, and member feedback checklist.'
    }
  ];

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Guaranteed direct programmatic download function with Blob cache-busting
  const handleDownload = (docToDownload, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const target = docToDownload || activeDoc;
    const filename = target.filename || target.pdfUrl.split('/').pop().split('?')[0];
    downloadDocumentPdf(target.pdfUrl, filename);
  };

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-200">
      {/* Context Banner with Documentary Photography */}
      <PageContextBanner
        eyebrow="Section VII • Official Legal Charters, Constitutional Instruments & Policy Repository"
        title="Official Club Documents, Charters & Statutory Agreements"
        description="Every foundational instrument, Limited Liability Partnership agreement, Investment Policy Statement, SMART target framework, and member lending protocol governing MGR CLUB. All instruments are verifiable online in full HTML and downloadable as publication-grade formatted PDFs."
        imageUrl="/images/african_women_leaders_group.jpg"
        imageAlt="African investment club leadership reviewing official constitutional charters"
        imageCaption="MGR CLUB Fiduciary Repository • Constitutional &amp; Policy Instruments"
        stats={[
          { label: "Governing Law", value: "LLP Act Cap 30A" },
          { label: "Ratification Status", value: "100% Unanimous" },
          { label: "Official Instruments", value: "5 Active Charters" }
        ]}
      />

      {/* Main Grid: Left Selector List, Right Document Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Document Selection Shelf */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 font-mono-num">
              Official Instruments ({documents.length})
            </h3>
            <span className="text-[10px] text-[var(--brand-primary)] font-semibold font-mono-num">
              Select to Read &amp; Download
            </span>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => {
              const Icon = doc.icon;
              const isSelected = doc.id === selectedDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => { setSelectedDocId(doc.id); setSearchTerm(''); }}
                  className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer relative group ${
                    isSelected 
                      ? 'bg-white border-2 border-[var(--brand-primary)] shadow-sm' 
                      : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[var(--brand-tint)] text-[var(--brand-primary)]' : 'bg-white text-slate-500 border border-slate-200'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono-num font-bold text-slate-500">
                        {doc.ref}
                      </span>
                    </div>
                    <span className={`text-[9px] font-mono-num font-bold px-1.5 py-0.5 rounded ${
                      doc.badgeColor === 'emerald' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      doc.badgeColor === 'gold' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                      doc.badgeColor === 'crimson' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {doc.badge}
                    </span>
                  </div>

                  <h4 className="font-editorial font-bold text-sm text-slate-900 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {doc.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100 font-mono-num">
                    <span>{doc.pages}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(doc, e)}
                        className="inline-flex items-center gap-1 font-bold text-[var(--brand-primary)] hover:underline px-1.5 py-0.5 rounded bg-[var(--brand-tint)] hover:bg-[var(--brand-tint-border)] transition"
                        title={`Direct Download ${doc.shortTitle}`}
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF ({doc.pdfSize})</span>
                      </button>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Document Viewer & PDF Controls */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Top Document Header & Dedicated Download Ribbon */}
          <div className="bank-card p-4 sm:p-5 bg-white border-l-4 border-l-[var(--brand-primary)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-mono-num font-bold px-2 py-0.5 rounded bg-[var(--brand-tint)] text-[var(--brand-primary)] border border-[var(--brand-tint-border)]">
                    {activeDoc.ref}
                  </span>
                  <span className="text-xs text-slate-500 font-mono-num">{activeDoc.date}</span>
                </div>
                <h3 className="font-editorial font-bold text-lg sm:text-xl text-slate-900">
                  {activeDoc.title}
                </h3>
                <p className="text-xs text-slate-600">
                  Legal Basis: <span className="font-semibold text-slate-800">{activeDoc.legalBasis}</span>
                </p>
              </div>

              {/* Action Buttons: Explicitly wired to activeDoc */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleDownload(activeDoc, e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  title={`Download official PDF for ${activeDoc.title}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF ({activeDoc.pdfSize})</span>
                </button>
                <a
                  href={activeDoc.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
                  title="Open standalone print-ready HTML view"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print View</span>
                </a>
              </div>
            </div>

            {/* Keyword Search within Active Document */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search keywords in ${activeDoc.shortTitle}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          {/* DYNAMIC DOCUMENT CONTENT VIEWERS FOR EACH DISTINCT DOCUMENT */}
          
          {/* 1. IPS & SMART OBJECTIVES CHARTER */}
          {selectedDocId === 'ips' && (
            <div className="space-y-4">
              <div className="bank-card p-5 bg-[var(--accent-gold-surface)] border-2 border-[var(--accent-gold-light)] space-y-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[var(--accent-gold)]" />
                  <h4 className="font-editorial font-bold text-sm text-slate-900">
                    3.0 Vision, Mission and Strategic Mandate
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white/90 rounded-lg border border-[var(--accent-gold-light)]">
                    <span className="font-bold text-[var(--accent-gold)] uppercase text-[10px] tracking-wider block mb-1">
                      3.1 Vision Statement
                    </span>
                    <p className="font-editorial text-sm font-bold text-slate-900 italic">
                      "Financial strength, sustainable growth, and enduring prosperity for current and future generations."
                    </p>
                  </div>
                  <div className="p-3 bg-white/90 rounded-lg border border-[var(--accent-gold-light)]">
                    <span className="font-bold text-[var(--brand-primary)] uppercase text-[10px] tracking-wider block mb-1">
                      3.2 Mission Statement
                    </span>
                    <p className="font-editorial text-xs font-semibold text-slate-800">
                      "Creating and preserving wealth through disciplined investment management, informed decision-making, prudent risk oversight, and an unwavering commitment to integrity, transparency, and accountability."
                    </p>
                  </div>
                </div>
              </div>

              {/* 4.0 Strategic Objectives (4.1 to 4.10) */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-[var(--brand-primary)]" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      4.0 Strategic Objectives (4.1 – 4.10)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Investment_Policy_and_Objectives.pdf', 'MGR_Investment_Policy_and_Objectives.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] bg-[var(--brand-tint)] hover:bg-[var(--brand-tint-border)] border border-[var(--brand-tint-border)] px-2.5 py-1 rounded-md transition cursor-pointer"
                      title="Download Strategic Objectives (4.1 – 4.10) PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF (400 KB)</span>
                    </button>
                    <span className="text-[10px] font-mono-num bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      10 Strategic Pillars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.1</span>
                    <strong>Grow and Preserve Capital:</strong> Achieve sustainable growth while safeguarding capital against undue risk and market volatility.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.2</span>
                    <strong>Maintain a Diversified Portfolio:</strong> Invest across broad asset classes, sectors, and geographies to reduce concentration risk.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.3</span>
                    <strong>Competitive Risk-Adjusted Returns:</strong> Consistently outperform market benchmarks through disciplined selection.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.4</span>
                    <strong>Rigorous Investment Research:</strong> Ensure all decisions are backed by financial analysis, intelligence, and due diligence.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.5</span>
                    <strong>Effective Risk Management:</strong> Identify, assess, monitor, and mitigate investment risks for long-term sustainability.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.6</span>
                    <strong>Ensure Liquidity &amp; Stability:</strong> Maintain adequate liquidity to meet commitments and unforeseen obligations.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.7</span>
                    <strong>Ethical &amp; Responsible Investing:</strong> Uphold integrity, transparency, accountability, and regulatory compliance.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.8</span>
                    <strong>Continuous Review:</strong> Regularly evaluate performance and adjust strategies to changing market opportunities.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.9</span>
                    <strong>Preserve Wealth for Future Generations:</strong> Build and sustain a generational legacy through prudent stewardship.
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                    <span className="font-bold font-mono-num text-[var(--brand-primary)] mr-1">4.10</span>
                    <strong>Strengthen Governance &amp; Compliance:</strong> Ensure full alignment with applicable laws, LLP agreements, and policies.
                  </div>
                </div>
              </div>

              {/* 5.0 SMART Objectives (5.1 to 5.6) */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      5.0 SMART Objectives &amp; Measurable Benchmarks
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Investment_Policy_and_Objectives.pdf', 'MGR_Investment_Policy_and_Objectives.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition cursor-pointer"
                      title="Download SMART Objectives (5.1 – 5.6) PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download PDF (400 KB)</span>
                    </button>
                    <span className="text-[10px] font-mono-num bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                      6 Measurable Targets
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">5.1 Portfolio Growth</span>
                      <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">&ge; 10% p.a.</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Achieve average annual return of <strong>not less than 10%</strong> over rolling 5-year periods.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">5.2 Diversification</span>
                      <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">&le; 20% Cap</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      No single investment to exceed <strong>20% of total portfolio</strong> value unless explicitly approved by Members.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">5.3 Due Diligence</span>
                      <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">100% Review</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Conduct and document formal due diligence for <strong>100% of proposed investments</strong> prior to capital allocation.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">5.4 Risk Monitoring</span>
                      <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">Quarterly</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Undertake formal portfolio performance and risk exposure reviews <strong>quarterly</strong> and report to Members.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">5.5 Liquidity Buffer</span>
                      <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">&ge; 6 Months</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Maintain minimum liquidity reserve equivalent to at least <strong>six (6) months</strong> of projected operational commitments.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">5.6 Compliance</span>
                      <span className="font-mono-num font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">100% Audit</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Full regulatory and statutory compliance, with completed annual compliance audits prior to each AGM.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6.0 IPS Governance & 3-Tier Ratification */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-[var(--brand-primary)]" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      6.0 IPS Formulation, Peer Benchmarking &amp; Three-Tier Ratification
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono-num bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    Mandatory Governance Protocol
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-[var(--accent-gold)] uppercase text-[10px] block font-mono-num">
                      Tier 1 • Research &amp; Peer Notes
                    </span>
                    <strong className="text-slate-900 block">Investment Research Officer</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Rigorous market analysis by Dr. Joash Migosi PhD, benchmarking against peer Chama leadership and capital market practitioners before floating any proposal.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-[var(--brand-primary)] uppercase text-[10px] block font-mono-num">
                      Tier 2 • Executive Committee
                    </span>
                    <strong className="text-slate-900 block">Review &amp; Structuring</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Deliberated, stress-tested, and drafted into binding resolutions by the 7 Executive Committee members against risk, liquidity, and capital preservation metrics.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-800 uppercase text-[10px] block font-mono-num">
                      Tier 3 • General Assembly
                    </span>
                    <strong className="text-slate-900 block">Democratic Ratification</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Tabled before the General Membership and ratified by active members before strategic execution or capital movement takes effect.
                    </p>
                  </div>
                </div>
              </div>

              {/* 7.0 Tactical Reallocation & Operating Bank Operations */}
              <div className="bank-card p-5 bg-[var(--paper)] border-2 border-[var(--accent-gold-light)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--accent-gold-light)] pb-2">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-4 h-4 text-[var(--accent-gold)]" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      7.0 Tactical Asset Allocation, Yield Dynamics &amp; Equity Bank Operations
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono-num bg-[var(--accent-gold-surface)] text-[var(--accent-gold)] font-bold px-2 py-0.5 rounded border border-[var(--accent-gold-light)]">
                    Active Treasury Directives
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-editorial text-sm">Dynamic Yield Monitoring</strong>
                      <span className="font-mono-num text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800">Agile Switching</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Mansa-X Special Fund:</strong> Yields fluctuate based on multi-asset market conditions. While currently the market leader (~18%–20% p.a.), the Executive Committee maintains continuous quarterly monitoring to compare alternative portfolios and execute quick investment switches if yields drop.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Etica Capital MMF:</strong> The 11.08% – 12.50% p.a. benchmark is dynamic and subject to CBK policy changes and liquidity conditions.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-editorial text-sm">KES 200,000/= Tactical Transfer</strong>
                      <span className="font-mono-num text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">Pending Redemption</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      As soon as Etica Capital MMF processes liquidity access / redemption approvals, MGR CLUB shall execute a tactical capital transfer of <strong>KES 200,000.00</strong> into the <strong>Mansa-X Special Fund</strong> account to capture higher market-leading returns.
                    </p>
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Destination Account:</span>
                      <span className="font-mono-num font-bold text-[var(--brand-primary)]">Mansa-X (SIB) Special Fund</span>
                    </div>
                  </div>
                </div>

                {/* Primary Bank Notice: Equity Bank Kenya */}
                <div className="p-3 bg-white rounded-lg border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-900 block font-editorial text-sm">
                      Primary Commercial Bank: Equity Bank Kenya (Chama Joint Account)
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Maintained with Equity Bank Kenya for its institutional flexibility in operating Chama joint accounts without pre-registration hurdles, and offering the lowest ledger and account maintenance fees in the Kenyan commercial banking sector.
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono-num font-bold bg-emerald-50 text-emerald-800 px-2 py-1 rounded border border-emerald-200">
                    Lowest Ledger Fees
                  </span>
                </div>
              </div>

              {/* 8.0 Strategic Member Research Horizons (Six Portfolios) */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-[var(--brand-primary)]" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      8.0 Strategic Member Research Horizons (Six Priority Portfolios)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono-num bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    All Members Study Mandate
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All Members of MGR CLUB are formally encouraged to conduct wide research and comparative intelligence on the following six asset classes to prepare the Club for future strategic capital allocation:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">1. Fixed Income Funds (FIFs)</strong>
                      <span className="font-mono-num text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">Credit</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Institutional corporate debt funds, secured commercial paper, and high-yield private credit funds delivering stable coupon flows above savings rates.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">2. Derivatives (NEXT Market)</strong>
                      <span className="font-mono-num text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900">Hedging</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      NSE Derivatives Market (NEXT) equity index futures, single-stock futures, and interest rate hedging to protect capital against market downturns.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">3. REITs (Real Estate Trusts)</strong>
                      <span className="font-mono-num text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">Property</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      CMA-regulated Income REITs (ILAM Fahari) and Development REITs (Acorn Student Accommodation) with mandatory &ge;80% net earnings distribution.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">4. ETFs (Exchange Traded)</strong>
                      <span className="font-mono-num text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">Gold Hedge</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Listed commodity-backed funds (e.g. Absa NewGold ETF on the NSE), providing a liquid physical bullion hedge against inflation and currency depreciation.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">5. Treasury Securities &amp; IFBs</strong>
                      <span className="font-mono-num text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">Tax-Free</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      CBK Treasury Bills (91/182/364-day) and Treasury Bonds, especially <strong>Infrastructure Bonds (IFBs)</strong> offering 100% tax-free coupon yields and sovereign backing.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">6. Nairobi Securities Exchange</strong>
                      <span className="font-mono-num text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">Equities</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Blue-chip dividend aristocrats (Safaricom, Equity Group, KCB Group, EABL, StanChart) for long-term equity compounding and franked dividends.
                    </p>
                  </div>
                </div>
              </div>

              {/* Schedule A Table */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[var(--accent-gold)]" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      SCHEDULE A: Approved Strategic Asset Allocation Thresholds
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono-num bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    Fiduciary Benchmark
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                        <th className="py-2 px-3">Asset Class &amp; Counterparty</th>
                        <th className="py-2 px-3 text-center">Target %</th>
                        <th className="py-2 px-3">Benchmark Yield</th>
                        <th className="py-2 px-3">Regulatory &amp; Custody Basis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">Mansa-X Special Fund (Standard Investment Bank)</td>
                        <td className="py-2.5 px-3 text-center font-mono-num font-bold text-[var(--brand-primary)]">70%</td>
                        <td className="py-2.5 px-3 font-mono-num">18.0% – 20.0% p.a. (Dynamic)</td>
                        <td className="py-2.5 px-3 text-slate-600">CMA-regulated Flagship Multi-Asset Special Fund</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">Etica Capital Money Market Fund</td>
                        <td className="py-2.5 px-3 text-center font-mono-num font-bold text-[var(--brand-primary)]">28%</td>
                        <td className="py-2.5 px-3 font-mono-num">11.08% – 12.50% p.a. (Dynamic)</td>
                        <td className="py-2.5 px-3 text-slate-600">CMA-regulated Liquid Capital Preservation Reserve</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">Equity Bank Kenya Operational Clearing Account</td>
                        <td className="py-2.5 px-3 text-center font-mono-num font-bold text-[var(--brand-primary)]">2%</td>
                        <td className="py-2.5 px-3 font-mono-num">Lowest Ledger Fees</td>
                        <td className="py-2.5 px-3 text-slate-600">CBK-licensed Chama Joint Account Clearing Pool</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. EMERGENCY CREDIT & SET-OFF POLICY */}
          {selectedDocId === 'emergency_loans' && (
            <div className="space-y-4">
              <div className="bank-card p-5 bg-[var(--accent-crimson-surface)] border-2 border-rose-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-rose-800" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      Constitutional Emergency Borrowing Regulations (Clause 10.5)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf('/documents/MGR_Emergency_Credit_and_SetOff_Policy.pdf', 'MGR_Emergency_Credit_and_SetOff_Policy.pdf')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-white hover:bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer"
                    title="Download Member 90% Emergency Credit & Set-Off Guideline PDF"
                  >
                    <Download className="w-3 h-3 text-rose-800" />
                    <span>Download Policy (258 KB)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Under MGR Club Constitution Clause 10.5, active members in good standing have guaranteed access to short-term emergency financial assistance secured directly against their qualifying capital contributions.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Loan Limit</span>
                    <span className="font-bold text-rose-800 text-sm">Up to 90%</span>
                    <span className="text-[10px] text-slate-500 block">Of Member Shares</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Monthly Rate</span>
                    <span className="font-bold text-slate-900 text-sm">10% / Month</span>
                    <span className="text-[10px] text-slate-500 block">Flat on Principal</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Repayment Term</span>
                    <span className="font-bold text-slate-900 text-sm">30 Calendar Days</span>
                    <span className="text-[10px] text-slate-500 block">From Disbursement</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-rose-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Security</span>
                    <span className="font-bold text-emerald-800 text-sm">100% Pledged</span>
                    <span className="text-[10px] text-slate-500 block">With Right of Set-Off</span>
                  </div>
                </div>
              </div>

              {/* Set-Off Terms */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h4 className="font-editorial font-bold text-sm text-slate-900">
                    Mandatory Right of Set-Off &amp; Default Recovery (Clause 10.3)
                  </h4>
                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf('/documents/MGR_Emergency_Credit_and_SetOff_Policy.pdf', 'MGR_Emergency_Credit_and_SetOff_Policy.pdf')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                    title="Download Credit & Set-Off Guideline PDF"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Download PDF (258 KB)</span>
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>1. Immediate Call on Default:</strong> Where a Member fails to repay within thirty (30) calendar days, the loan balance together with accrued 10% interest immediately becomes due and payable.
                  </p>
                  <p>
                    <strong>2. Automatic Share Recovery:</strong> MGR CLUB possesses the absolute legal power to debit the outstanding obligation directly from the Member's capital contributions without requiring further consent or notice.
                  </p>
                  <p>
                    <strong>3. Exit During Loan:</strong> No Member may withdraw from MGR CLUB while carrying an unpaid loan balance unless the debt is first settled in full or completely offset against shares under Clause 10.6.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. BEREAVEMENT SUCCESSION PROTOCOL */}
          {selectedDocId === 'bereavement' && (
            <div className="space-y-4">
              <div className="bank-card p-5 bg-[var(--paper)] border-2 border-[var(--border-hairline)] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <HeartHandshake className="w-5 h-5 text-rose-800" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      Bereavement Succession &amp; Beneficiary Terminal Settlement Protocol
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf('/documents/MGR_Bereavement_Succession_Exit_Protocol.pdf', 'MGR_Bereavement_Succession_Exit_Protocol.pdf')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-white hover:bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer"
                    title="Download Bereavement Succession & Beneficiary Settlement PDF"
                  >
                    <Download className="w-3 h-3 text-rose-800" />
                    <span>Download Protocol (264 KB)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Pursuant to Clause 10.7 of the Constitution and Kenyan succession law, this protocol establishes a dignified, 1:1 par value settlement procedure that releases 100% of terminal dues to the deceased member's family without breaching our 6-month institutional MMF and Mansa-X lock-in requirements.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Valuation Standard</span>
                    <span className="font-bold text-slate-900 text-sm">1:1 Par Value</span>
                    <span className="text-[10px] text-slate-500 block">KES 1.00 per share</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Family Payout</span>
                    <span className="font-bold text-emerald-800 text-sm">100% Cash Settlement</span>
                    <span className="text-[10px] text-slate-500 block">To designated beneficiary</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-mono-num">Institutional Lock-In</span>
                    <span className="font-bold text-blue-800 text-sm">Zero Breakage</span>
                    <span className="text-[10px] text-slate-500 block">MMF holdings preserved</span>
                  </div>
                </div>
              </div>

              {/* Precedent Frederick Ongule */}
              <div className="bank-card p-5 bg-white space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h4 className="font-editorial font-bold text-sm text-slate-900">
                    Case Precedent: Late Frederick Ongule Seunda (007)
                  </h4>
                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf('/documents/MGR_Bereavement_Succession_Exit_Protocol.pdf', 'MGR_Bereavement_Succession_Exit_Protocol.pdf')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                    title="Download Bereavement Succession Protocol PDF"
                  >
                    <Download className="w-3 h-3 text-slate-500" />
                    <span>Download PDF (264 KB)</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Net Member Share Capital:</span>
                    <span className="font-mono-num font-bold text-slate-900">KES 13,019.00</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Accrued Q3 Pro-Rata Yield:</span>
                    <span className="font-mono-num font-bold text-slate-900">KES 1,145.00</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 font-bold text-emerald-800">
                    <span>Total Protected Beneficiary Escrow:</span>
                    <span className="font-mono-num text-sm">KES 14,164.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. TREASURY YIELD PRORATING POLICY */}
          {selectedDocId === 'mmf_prorating' && (
            <div className="space-y-4">
              <div className="bank-card p-5 bg-[var(--brand-tint)] border-2 border-[var(--brand-tint-border)] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Landmark className="w-5 h-5 text-[var(--brand-primary)]" />
                    <h4 className="font-editorial font-bold text-base text-slate-900">
                      Holding-Period Weighted Distribution &amp; Unanimous Ratification Mandate
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf('/documents/MGR_Treasury_Yield_Prorating_Policy.pdf', 'MGR_Treasury_Yield_Prorating_Policy.pdf')}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] bg-white hover:bg-[var(--brand-tint)] border border-[var(--brand-tint-border)] px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer"
                    title="Download Treasury Holding-Period Yield Prorating Policy PDF"
                  >
                    <Download className="w-3 h-3 text-[var(--brand-primary)]" />
                    <span>Download Policy (226 KB)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Under Clause 9.4, treasury earnings generated from Mansa-X Special Fund and Etica Capital MMF are attributed pro-rata based on qualifying active holding periods. No interest is distributed without <strong>100% unanimous active member approval</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <strong className="text-[var(--brand-primary)]">Post-Period Capital Protection:</strong>
                    <p className="text-slate-600">
                      Capital received after the close of an accounting quarter (e.g. Leoivard Omondi Ongule <code>MGR-011</code> in late October 2026) receives KES 0.00 dividend for that past period, preserving 100% of his KES 17,000 net deposit for future quarters.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <strong className="text-[var(--brand-primary)]">Estate Escrow Accrual:</strong>
                    <p className="text-slate-600">
                      Funds of deceased members that remained active throughout the period (e.g. Late Frederick Ongule Seunda <code>MGR-007</code>) accrue their full pro-rata share into the estate escrow account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. CONSTITUTION / LLP AGREEMENT */}
          {selectedDocId === 'constitution' && (
            <div className="space-y-4">
              <div className="bank-card p-5 bg-[var(--paper)] border border-[var(--border-hairline)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
                  <span className="font-mono-num text-[10px] uppercase font-bold text-[var(--accent-gold)] tracking-widest">
                    Preamble &amp; Statutory Authority
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Club_Constitution_LLP_Agreement.pdf', 'MGR_Club_Constitution_LLP_Agreement.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] bg-white hover:bg-slate-50 border border-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                      title="Download Complete Constitution PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Constitution (507 KB)</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono-num">11 Founding Signatories</span>
                  </div>
                </div>
                <p className="font-editorial text-sm italic text-slate-800 leading-relaxed">
                  "We, the founding members of MGR CLUB, united in our collective ambition to build generational wealth, foster prudent capital stewardship, and enforce unwavering transparency, mutual accountability, and democratic investment leadership, hereby solemnly adopt, enact, and bind ourselves to this Constitution and Limited Liability Partnership Agreement."
                </p>
              </div>

              <div className="space-y-3">
                <div className="bank-card p-4 sm:p-5 bg-white space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num font-bold text-xs text-[var(--accent-gold)]">1.0 &amp; 2.0</span>
                      <h4 className="font-editorial font-bold text-base text-slate-900">Name &amp; Legal Status</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Club_Constitution_LLP_Agreement.pdf', 'MGR_Club_Constitution_LLP_Agreement.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded transition cursor-pointer"
                      title="Download Constitution PDF"
                    >
                      <Download className="w-3 h-3 text-slate-500" />
                      <span>Download Part PDF</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    The name of the Club shall be <strong>MGR CLUB</strong>. The Club operates as an investment club and may be registered as a <strong>Limited Liability Partnership (LLP)</strong> under Cap 30A of the Laws of Kenya, possessing full legal capacity to acquire property, enter contracts, open accounts, sue and be sued.
                  </p>
                </div>

                <div className="bank-card p-4 sm:p-5 bg-[var(--accent-gold-surface)] border-2 border-[var(--accent-gold-light)] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num font-bold text-xs text-[var(--accent-gold)]">6.0</span>
                      <h4 className="font-editorial font-bold text-base text-slate-900">Executive Committee Stability &amp; Continuity of Leadership</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Club_Constitution_LLP_Agreement.pdf', 'MGR_Club_Constitution_LLP_Agreement.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-white hover:bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer"
                      title="Download Founding Executive Continuity Mandate PDF"
                    >
                      <Download className="w-3 h-3 text-[var(--accent-gold)]" />
                      <span>Download Stability Charter (507 KB)</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    In recognition of the critical role played by founding leadership during formative and execution stages, no member of the initial Executive Committee shall voluntarily resign or relinquish office during the <strong>first three (3) financial years of operation</strong>, except in cases of incapacity, relocation, or by a resolution supported by not less than two-thirds (2/3) of all Members.
                  </p>
                </div>

                {/* 8.0 FINANCIAL MANAGEMENT & BANKING OPERATIONS */}
                <div className="bank-card p-4 sm:p-5 bg-white border border-[#D6D0C2] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num font-bold text-xs text-[#1D3B2A]">8.0</span>
                      <h4 className="font-editorial font-bold text-base text-slate-900">Financial Management &amp; Investment Governance</h4>
                    </div>
                    <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-[#EDF1ED] text-[#1D3B2A] border border-[#CCD7CD]">
                      Permanent Statutory Powers
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                    {/* 8.2 Bank Accounts & Signatories */}
                    <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#D0DCD1] space-y-1.5">
                      <span className="font-bold text-[#1D3B2A] font-editorial text-sm block">
                        8.2 Bank Accounts and Dual-Signatory Mandate
                      </span>
                      <p className="text-[11px] text-[#2C3824] leading-relaxed">
                        All Club funds shall be held in designated operational and investment accounts opened in the Club's registered name with Central Bank of Kenya (CBK)-licensed commercial banks and Capital Markets Authority (CMA)-regulated institutions. All banking instructions and disbursements strictly require dual or triple authorized signatures of designated Executive Committee signatories (Chairperson, CEO, and Treasurer).
                      </p>
                    </div>

                    {/* 8.5 Three-Tier IPS Governance Protocol */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 font-editorial text-sm block">
                          8.5 Investment Policy Statement (I.P.S.) Mandate
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                          3-Tier Governance
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        All investments and capital allocations must be governed by an approved <strong>Investment Policy Statement (IPS)</strong> adhering to the mandatory three-tier ratification protocol:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                        <li><strong>Tier 1 — Research &amp; Origination:</strong> Formulated by the Investment Officer / Analyst with external market benchmarking.</li>
                        <li><strong>Tier 2 — Executive Committee Review:</strong> Evaluated and stress-tested against risk and liquidity parameters.</li>
                        <li><strong>Tier 3 — General Membership Ratification:</strong> Democratically ratified by the Members prior to implementation.</li>
                      </ul>
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 italic">
                          Tactical allocations, designated operating banks, and portfolio research guidelines are set out in the living IPS Charter.
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedDocId('ips')}
                          className="text-[11px] font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Investment Policy Statement</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bank-card p-4 sm:p-5 bg-[var(--accent-crimson-surface)] border-2 border-rose-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num font-bold text-xs text-rose-800">10.5</span>
                      <h4 className="font-editorial font-bold text-base text-slate-900">Emergency Borrowing by Members &amp; Right of Set-Off</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Emergency_Credit_and_SetOff_Policy.pdf', 'MGR_Emergency_Credit_and_SetOff_Policy.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-white hover:bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-md shadow-2xs transition cursor-pointer"
                      title="Download Member 90% Emergency Credit & Set-Off Guideline PDF"
                    >
                      <Download className="w-3 h-3 text-rose-800" />
                      <span>Download Credit Policy (258 KB)</span>
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    <p>
                      Members in good standing may borrow an amount <strong>not exceeding ninety per cent (90%)</strong> of their shares, savings, or capital contributions standing to their credit.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      <li><strong>Interest Rate:</strong> Exactly ten per cent (10%) per month on principal advanced.</li>
                      <li><strong>Repayment Term:</strong> Repayable in full within thirty (30) calendar days from disbursement.</li>
                      <li><strong>Security &amp; Set-Off:</strong> Member shares constitute security; the Club reserves absolute right of set-off against member capital balances upon default or withdrawal.</li>
                    </ul>
                  </div>
                </div>

                <div className="bank-card p-4 sm:p-5 bg-white space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono-num font-bold text-xs text-[var(--accent-gold)]">Sched 1</span>
                      <h4 className="font-editorial font-bold text-base text-slate-900">Founding Members Register &amp; Capital Pool</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDocumentPdf('/documents/MGR_Club_Constitution_LLP_Agreement.pdf', 'MGR_Club_Constitution_LLP_Agreement.pdf')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] bg-[var(--brand-tint)] hover:bg-[var(--brand-tint-border)] border border-[var(--brand-tint-border)] px-2.5 py-1 rounded-md transition cursor-pointer"
                      title="Download Founding 11 Member Register PDF"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Register (507 KB)</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    The official 11 founding member register (001 John, 002 Alice, 003 Sarah, 004 Dan Aloo, 005 Moses, 006 Benjamin, 007 Frederick, 008 Richard, 009 Joash, 010 Josphat, 011 Leoivard) holding <strong>KES 710,675.00</strong> net member capital is enacted as Schedule 1.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. MEMBER WEB APP ORIENTATION MANUAL & CONSULTATIVE GUIDE */}
          {selectedDocId === 'member_orientation_guide' && (
            <div className="space-y-4">
              {/* Consultative Notice Banner */}
              <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-xl border border-[#D8D2C4] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2DDD3] pb-2.5">
                  <div>
                    <span className="font-mono-num text-[10px] uppercase font-bold text-[#6E3C1B] tracking-wider block">
                      Consultative Circular • REF: MGR/CIR/2026/APP-01
                    </span>
                    <h4 className="font-editorial font-bold text-base text-slate-900 mt-0.5">
                      Member Web App Orientation Manual &amp; Consultative Guide
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDocumentPdf('/documents/MGR_Member_App_Guide_and_Orientation_Circular.pdf', 'MGR_Member_App_Guide_and_Orientation_Circular.pdf')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1D3B2A] hover:opacity-95 px-3 py-1.5 rounded-lg transition shadow-xs cursor-pointer shrink-0"
                    title="Download Official Member Orientation PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF (390 KB)</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  This document serves as the official operational guide for the newly deployed <strong>MGR Investment Group Web Application</strong>. It breaks down every module, explains the security safeguards protecting your identity files, details the step-by-step mobile installation process, and invites feedback from all 11 General Members prior to formal permanent adoption.
                </p>
              </div>

              {/* Grid: 4 Key Mutual Advantages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bank-card p-4 bg-white space-y-1.5">
                  <h5 className="font-bold text-xs text-[#1D3B2A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1D3B2A] shrink-0" />
                    <span>1. Real-Time Equity &amp; Yield Tracking</span>
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Check your exact equity stake (e.g. 9.09%), cumulative monthly contributions, and accrued compound yield directly without waiting for annual AGM books.
                  </p>
                </div>

                <div className="bank-card p-4 bg-white space-y-1.5">
                  <h5 className="font-bold text-xs text-[#1D3B2A] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1D3B2A] shrink-0" />
                    <span>2. 24-Hour Secret PIN Vault (DPA 2019)</span>
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Uploaded National ID, KRA PIN, and Passport photos remain permanently locked. Executives can only inspect files when you provide a single-use 24-hour expiring PIN.
                  </p>
                </div>

                <div className="bank-card p-4 bg-white space-y-1.5">
                  <h5 className="font-bold text-xs text-[#1D3B2A] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#1D3B2A] shrink-0" />
                    <span>3. Democratic Ratification (10-Member Veto)</span>
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Major capital movements (such as moving KES 200,000 from Etica MMF to Mansa X) require democratic ratification by the general membership before execution.
                  </p>
                </div>

                <div className="bank-card p-4 bg-white space-y-1.5">
                  <h5 className="font-bold text-xs text-[#1D3B2A] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#1D3B2A] shrink-0" />
                    <span>4. One-Tap Home Screen Mobile PWA</span>
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Installs natively on Android (Chrome) and iPhone (Safari Add to Home Screen) as a full-screen application with zero app store download required.
                  </p>
                </div>
              </div>

              {/* Administrative Demarcation Notice */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#D8D2C4] space-y-1.5 text-xs">
                <span className="font-bold text-[#1D3B2A] block">
                  ⚙️ Administrative Demarcation: Zero Technical Overhead for Members
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  General members and executive officers do not need to manage servers, scripts, or databases. The <strong>System Administrator</strong> manages all cPanel web hosting, SMTP mail routing, SSL encryption, and SQLite/MySQL database synchronization automatically.
                </p>
              </div>

              {/* Consultative Feedback Checklist */}
              <div className="bank-card p-4 sm:p-5 bg-white border border-[#D6D0C2] space-y-3">
                <h5 className="font-editorial font-bold text-sm text-slate-900">
                  Members' Consultative Feedback Questionnaire
                </h5>
                <p className="text-xs text-slate-600">
                  Members are invited to review the application and share feedback with the Executive Committee:
                </p>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <strong>1. KYC Document PIN:</strong> Is the 24-hour expiration window practical for sharing your documents with executives?
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <strong>2. Deposit Logging:</strong> Are the M-Pesa transaction reference and destination fields simple and intuitive?
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <strong>3. Personal Statements:</strong> Does the statement display your share percentage, monthly deposits, and accrued interest clearly?
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <strong>4. Notifications:</strong> Would you like SMS notifications integrated alongside the current cPanel Email OTP dispatch?
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
