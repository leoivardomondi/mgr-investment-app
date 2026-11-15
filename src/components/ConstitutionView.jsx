import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Search, 
  Users
} from 'lucide-react';
import { downloadDocumentPdf } from '../utils/documentDownloader';

const SECTION_DOC_MAP = {
  'ALL': {
    id: 'ALL',
    label: 'All Articles',
    title: 'MGR Club Constitution & LLP Agreement (Complete)',
    pdfUrl: '/documents/MGR_Club_Constitution_LLP_Agreement.pdf',
    filename: 'MGR_Club_Constitution_LLP_Agreement.pdf',
    htmlUrl: '/documents/MGR_Club_Constitution_LLP_Agreement.html',
    size: '507 KB',
    badge: 'Founding Instrument'
  },
  '3.0': {
    id: '3.0',
    label: 'Clause 3.0 (Vision & Objectives)',
    title: 'Investment Policy Statement & SMART Objectives',
    pdfUrl: '/documents/MGR_Investment_Policy_and_Objectives.pdf',
    filename: 'MGR_Investment_Policy_and_Objectives.pdf',
    htmlUrl: '/documents/MGR_Investment_Policy_and_Objectives.html',
    size: '400 KB',
    badge: 'Fiduciary Charter'
  },
  '6.0': {
    id: '6.0',
    label: 'Clause 6.0 (Stability)',
    title: 'Founding Leadership Stability & Continuity Charter',
    pdfUrl: '/documents/MGR_Club_Constitution_LLP_Agreement.pdf',
    filename: 'MGR_Club_Constitution_LLP_Agreement.pdf',
    htmlUrl: '/documents/MGR_Club_Constitution_LLP_Agreement.html',
    size: '507 KB',
    badge: 'Formative Protection'
  },
  '9.0': {
    id: '9.0',
    label: 'Clause 9.0 (Yield Prorating)',
    title: 'Treasury Yield Prorating & Distribution Policy',
    pdfUrl: '/documents/MGR_Treasury_Yield_Prorating_Policy.pdf',
    filename: 'MGR_Treasury_Yield_Prorating_Policy.pdf',
    htmlUrl: '/documents/MGR_Treasury_Yield_Prorating_Policy.html',
    size: '226 KB',
    badge: 'Treasury Policy'
  },
  '10.0': {
    id: '10.0',
    label: 'Clause 10.0 (Loans & Exit)',
    title: 'Member 90% Emergency Credit & Set-Off Guideline',
    pdfUrl: '/documents/MGR_Emergency_Credit_and_SetOff_Policy.pdf',
    filename: 'MGR_Emergency_Credit_and_SetOff_Policy.pdf',
    htmlUrl: '/documents/MGR_Emergency_Credit_and_SetOff_Policy.html',
    size: '258 KB',
    badge: 'Credit Policy'
  }
};

export default function ConstitutionView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('ALL');

  const articles = [
    {
      id: '1.0',
      title: '1.0 Name of the Club',
      tag: 'Identity',
      content: [
        {
          clause: '1.1',
          text: 'The name of the Club shall be MGR CLUB (hereinafter alternatively designated as "the Club" or "the Partnership").'
        }
      ]
    },
    {
      id: '2.0',
      title: '2.0 Legal Status',
      tag: 'Corporate Powers',
      content: [
        {
          clause: '2.1',
          text: 'MGR CLUB shall operate as an investment club and may be registered as a Limited Liability Partnership (LLP) in accordance with applicable laws of Kenya (including the Limited Liability Partnerships Act, Cap 30A of the Laws of Kenya).'
        },
        {
          clause: '2.2',
          text: 'The Club shall possess all corporate legal powers necessary to pursue its objectives, acquire, lease, hold, and dispose of movable and immovable property, enter into binding contracts, open and operate banking and custodian accounts, sue and be sued in its registered name.'
        }
      ]
    },
    {
      id: '3.0',
      title: '3.0 Vision, Mission and Objectives',
      tag: 'Strategic Mandate',
      content: [
        {
          clause: '3.1',
          subtitle: 'Vision Statement',
          text: 'Financial strength, sustainable growth, and enduring prosperity for current and future generations.'
        },
        {
          clause: '3.2',
          subtitle: 'Mission Statement',
          text: 'Creating and preserving wealth through disciplined investment management, informed decision-making, prudent risk oversight, and unwavering commitment to integrity, transparency, and accountability.'
        },
        {
          clause: '3.3',
          subtitle: 'Strategic Objectives',
          items: [
            'a) Grow and preserve Members\' capital through prudent investment practices;',
            'b) Promote regular savings and disciplined financial management among Members;',
            'c) Build a diversified and resilient investment portfolio across CMA-regulated and multi-asset classes;',
            'd) Ensure transparency, accountability, and sound governance;',
            'e) Enhance Members\' financial literacy and investment knowledge across six priority portfolios (FIFs, Derivatives, REITs, ETFs, Government Securities & IFBs, and NSE Equities); and',
            'f) Create long-term value for current and future generations.'
          ]
        }
      ]
    },
    {
      id: '4.0',
      title: '4.0 Membership',
      tag: 'Membership Rights',
      content: [
        {
          clause: '4.1',
          subtitle: 'Eligibility for Membership',
          text: 'Membership is open to individuals who subscribe to the Vision, Mission, and Objectives of MGR CLUB, are of sound mind, have attained the age of eighteen (18) years, and are approved by the Executive Committee and general membership.'
        },
        {
          clause: '4.2',
          subtitle: 'Admission Procedures',
          text: 'Applicants shall submit a formal membership application, agree in writing to abide by this Constitution and all club resolutions, pay the mandatory non-refundable registration fee of KES 1,000, and be vetted and admitted upon unanimous consensus of the Executive Committee.'
        },
        {
          clause: '4.3',
          subtitle: 'Rights and Obligations of Members',
          text: 'Every Member in good standing shall have the right to inspect audited financial statements, participate in general meetings, cast votes, apply for emergency credit under Clause 10.5, and receive pro-rata investment yields. Each Member is obligated to make punctual capital contributions, maintain confidentiality, uphold fiduciary integrity, and abide by all ratified policies.'
        },
        {
          clause: '4.4',
          subtitle: 'Membership Contributions and Savings',
          text: 'Each Member shall contribute regular monthly share capital deposits into the designated Club institutional treasury accounts. Capital contributions are registered net of the non-refundable registration fee and remain subject to the Club\'s capital preservation holding guidelines.'
        },
        {
          clause: '4.5',
          subtitle: 'Suspension and Expulsion of Members',
          text: 'A Member may be suspended or expelled for conduct prejudicial to the interests or financial stability of the Club, failure to meet financial obligations after due warning, gross breach of fiduciary duty, or conviction of a criminal offence involving fraud or dishonesty. Expulsion shall require a resolution supported by not less than two-thirds (2/3) of all Members, subject to fair hearing and the exit settlement rules under Clause 10.0.'
        }
      ]
    },
    {
      id: '5.0',
      title: '5.0 Executive Committee',
      tag: 'Executive Governance',
      content: [
        {
          clause: '5.1',
          subtitle: 'Composition of the Executive Committee',
          items: [
            'a) Chairperson: Presides over general meetings, signs executive resolutions, calls emergency votes;',
            'b) Vice Chairperson: Deputizes Chairperson, secondary resolution approvals, committee coordination;',
            'c) Secretary: Drafts and maintains policies, manages member register, records minutes & votes;',
            'd) Treasurer: Reconciles MMF accounts, records deposits, executes dividend distributions, manages ledger;',
            'e) Research Officer: Analyzes MMF and fund yields (Mansa X vs Etica), investment market intelligence, conducts peer benchmarking, and originates IPS proposals;',
            'f) Compliance Officer: Enforces constitutional compliance, audits treasury operations, oversees bereavement exit settlements; and',
            'g) Chief Executive Officer (CEO): Full executive operations, strategic asset allocation, legal incorporation 2026.'
          ]
        },
        {
          clause: '5.2',
          subtitle: 'Election and Appointment of Office Bearers',
          text: 'Subject to the leadership stability provisions in Clause 6.0, Executive Committee members shall be appointed or elected from amongst Members in good standing by democratic resolution.'
        },
        {
          clause: '5.3',
          subtitle: 'Functions and Responsibilities of the Executive Committee',
          text: 'The Executive Committee shall be responsible for general executive administration, executing investment allocations within approved thresholds, preparing periodic accounting statements, convening general meetings, enforcing constitutional bylaws, and liaising with statutory authorities and financial intermediaries.'
        },
        {
          clause: '5.4',
          subtitle: 'Meetings of the Executive Committee',
          text: 'The Executive Committee shall meet at least quarterly, or as often as necessary to transact the business of the Club, physically or via secure digital conferencing.'
        },
        {
          clause: '5.5',
          subtitle: 'Quorum and Decision-Making',
          text: 'A quorum for Executive Committee meetings shall be not less than four (4) Executive Committee members. Decisions shall be reached by consensus, or failing consensus, by a simple majority vote of members present. In the case of an equality of votes, the Chairperson shall have a casting vote.'
        },
        {
          clause: '5.6',
          subtitle: 'Removal from Office',
          text: 'An Executive Committee member may be removed from office for gross misconduct, physical or mental incapacity, persistent failure to discharge duties, or bankruptcy, pursuant to a resolution passed by not less than two-thirds (2/3) of all Members of the Club at a duly convened meeting.'
        }
      ]
    },
    {
      id: '6.0',
      title: '6.0 Executive Committee Stability and Continuity of Leadership',
      tag: 'Formative Stage Protection',
      highlight: true,
      content: [
        {
          clause: '6.1',
          subtitle: 'Tenure of the Initial Executive Committee',
          text: 'In recognition of the critical role played by the founding leadership during the establishment and implementation phases of MGR CLUB, members of the initial Executive Committee shall be expected to serve throughout the early formative and performance (execution) stages of the Club.'
        },
        {
          clause: '6.2',
          subtitle: 'Restriction on Voluntary Exit from Office',
          text: 'No member of the initial Executive Committee shall voluntarily resign or relinquish his or her office during the early formative and performance stages of MGR CLUB, except where: a) the Executive Committee member is unable to continue serving due to ill health, permanent incapacity, relocation, or other compelling circumstances deemed reasonable by the Members; or b) the resignation is approved by a resolution passed by not less than two-thirds (2/3) of all Members of MGR CLUB at a duly convened meeting.'
        },
        {
          clause: '6.3',
          subtitle: 'Continuity of Operations',
          text: 'The purpose of this provision is to ensure leadership stability, preserve institutional memory, and facilitate the effective implementation of the Club\'s strategic objectives during its developmental stages.'
        },
        {
          clause: '6.4',
          subtitle: 'Filling of Vacancies',
          text: 'Where a vacancy arises in accordance with this Clause, the Members shall appoint a replacement in accordance with the Club\'s governing documents. The replacement Executive Committee member shall serve for the remainder of the unexpired term of office.'
        },
        {
          clause: '6.5',
          subtitle: 'Duration of the Restriction',
          text: 'For purposes of this Clause, the early formative and performance (execution) stages shall mean the period commencing from the date of establishment of MGR CLUB and ending upon the earlier of: a) the completion of the Club\'s first three (3) financial years of operation; or b) such other date as may be determined by a resolution supported by not less than two-thirds (2/3) of all Members of the Club.'
        },
        {
          clause: '6.6',
          subtitle: 'General Effect',
          text: 'This Clause balances the need for leadership continuity during the Club\'s formative years with the recognition that exceptional circumstances may necessitate an Executive Committee member\'s departure. It also seeks to prevent abrupt leadership changes that could disrupt the execution of the Club\'s investment strategy and governance framework.'
        }
      ]
    },
    {
      id: '7.0',
      title: '7.0 Meetings of Members',
      tag: 'Member Assembly',
      content: [
        {
          clause: '7.1',
          subtitle: 'Annual General Meetings',
          text: 'An Annual General Meeting (AGM) shall be held once in every calendar year, not later than four (4) months following the close of the financial year, to receive audited financial statements, review portfolio allocations, and deliberate club business.'
        },
        {
          clause: '7.2',
          subtitle: 'Special Meetings',
          text: 'Special General Meetings may be convened by the Chairperson, Executive Committee, or upon written requisition signed by not less than one-third (1/3) of all Members in good standing.'
        },
        {
          clause: '7.3',
          subtitle: 'Notice of Meetings',
          text: 'Not less than fourteen (14) days\' written notice of an AGM and seven (7) days\' notice of a Special Meeting shall be circulated via official digital channels.'
        },
        {
          clause: '7.4',
          subtitle: 'Quorum Requirements',
          text: 'The quorum for general meetings of Members shall be not less than two-thirds (2/3) of all fully paid-up Members.'
        },
        {
          clause: '7.5',
          subtitle: 'Voting Procedures and Resolutions',
          text: 'Each Member in good standing possesses one vote. Ordinary decisions pass by simple majority; constitutional amendments by two-thirds (2/3) majority; and treasury distributions by unanimous 100% active member ratification.'
        }
      ]
    },
    {
      id: '8.0',
      title: '8.0 Financial Management',
      tag: 'Treasury & Audit',
      content: [
        {
          clause: '8.1',
          subtitle: 'Financial Year',
          text: 'The Financial Year commences on 1st January and concludes on 31st December, with quarterly accounting closures on 31st March (Q1), 30th June (Q2), 30th September (Q3), and 31st December (Q4).'
        },
        {
          clause: '8.2',
          subtitle: 'Bank Accounts and Signatories',
          text: 'All monies shall be deposited into institutional accounts in the Club\'s name with Equity Bank Kenya (Operational/Chama Joint Clearing Account — maintained for its unique flexibility in operating Chama joint accounts without pre-registration hurdles, and offering the lowest ledger and maintenance fees in the Kenyan commercial banking sector), Mansa-X Special Fund (Standard Investment Bank), and Etica Capital Money Market Fund. Dual/triple authorized signatures are mandatory.'
        },
        {
          clause: '8.3',
          subtitle: 'Accounting Records and Financial Statements',
          text: 'The Treasurer and Committee shall maintain full double-entry ledgers in conformity with International Financial Reporting Standards (IFRS).'
        },
        {
          clause: '8.4',
          subtitle: 'Audits and Financial Reviews',
          text: 'Accounts shall be audited annually by an independent auditor or Audit Committee before presentation at the AGM.'
        },
        {
          clause: '8.5',
          subtitle: 'Investment Policies, IPS Protocol & Asset Research Horizons',
          text: 'Allocations adhere to approved strategic risk thresholds (70% Mansa-X Special Fund, 28% Etica Capital MMF, 2% Equity Bank liquidity reserve). All investment policies and capital movements adhere to the Three-Tier Governance Protocol: Origination by the Investment Research Officer (with peer note comparisons), Executive Committee deliberation, and General Membership democratic ratification. Yields are continuously monitored against dynamic market fluctuations, empowering the Club to execute swift portfolio transfers (including the active tactical reallocation of KES 200,000 from Etica MMF to Mansa-X upon redemption). All members are formally mandated to research six strategic asset classes: Fixed Income Funds (FIFs), Derivatives (NEXT), REITs, ETFs, Government Securities & Infrastructure Bonds (IFBs), and Nairobi Securities Exchange (NSE) equities.'
        }
      ]
    },
    {
      id: '9.0',
      title: '9.0 Profits, Losses and Distributions',
      tag: 'Yield Allocation',
      content: [
        {
          clause: '9.1',
          subtitle: 'Allocation of Profits',
          text: 'Net profits and investment yields shall be credited to the retained surplus account and attributed pro-rata based on eligible member capital and active holding periods.'
        },
        {
          clause: '9.2',
          subtitle: 'Treatment of Losses',
          text: 'Systemic capital losses shall be apportioned among Members pro-rata to their capital contributions, subject to prior absorption by capital reserves.'
        },
        {
          clause: '9.3',
          subtitle: 'Retained Earnings',
          text: 'The Club may retain 10% to 20% of periodic investment interest in a designated Group Reserve Account for operational and contingency buffers.'
        },
        {
          clause: '9.4',
          subtitle: 'Distribution Policies',
          text: 'Distributions require holding-period prorating compliance, post-period capital exclusion, and unanimous member ratification.'
        }
      ]
    },
    {
      id: '10.0',
      title: '10.0 Exit of Members and Settlement of Borrowings',
      tag: 'Exit & Lending Protocol',
      highlight: true,
      content: [
        {
          clause: '10.1',
          subtitle: 'Voluntary Exit',
          text: 'A Member wishing to withdraw from MGR CLUB shall give not less than ninety (90) days\' written notice to the Coordinator or Secretary.'
        },
        {
          clause: '10.2',
          subtitle: 'Valuation of the Exiting Member\'s Interest',
          text: 'Valuation is determined using the most recent approved financial statements, taking into account: a) capital contributions made by the Member; b) additional savings or deposits; c) undistributed profits and retained earnings; d) losses attributable; and e) any outstanding obligations owed.'
        },
        {
          clause: '10.3',
          subtitle: 'Outstanding Loans and Set-Off',
          text: 'Where a Member seeking to exit has an outstanding emergency loan or debt: a) the Club shall deduct the outstanding principal together with accrued interest from the Member\'s capital account before settlement; b) Member shares and savings constitute security; c) the Club holds right of set-off; and d) any deficiency remains a debt recoverable.'
        },
        {
          clause: '10.4',
          subtitle: 'Settlement of Exit Benefits',
          text: 'Subject to Clause 10.3, net dues shall be paid within 90 to 180 days after valuation completion, either as a lump-sum or in instalments to safeguard club liquidity.'
        },
        {
          clause: '10.5',
          subtitle: 'Emergency Borrowing by Members (10.5.1 – 10.5.7)',
          items: [
            '10.5.1 Purpose: Extension of short-term emergency loans subject to availability of funds;',
            '10.5.2 Eligibility: Good standing, sufficient shares/savings security, and full regulatory compliance;',
            '10.5.3 Loan Limit: Amount not exceeding ninety per cent (90%) of shares, savings, or capital contributions standing to member credit;',
            '10.5.4 Security: Member shares, savings, and capital contributions serve as security with right of set-off under 10.3;',
            '10.5.5 Interest Rate: Exactly ten per cent (10%) per month on the principal amount advanced;',
            '10.5.6 Repayment Period: Repayable in full within thirty (30) calendar days from disbursement; and',
            '10.5.7 Default: Outstanding principal and interest immediately due; recovery from shares/savings without notice; denial of further credit; legal recovery where necessary.'
          ]
        },
        {
          clause: '10.6',
          subtitle: 'Exit During the Currency of a Loan',
          text: 'No Member may withdraw while carrying an active loan unless the balance is repaid in full or offset against shares and entitlements.'
        },
        {
          clause: '10.7',
          subtitle: 'Death or Incapacity of a Borrowing Member',
          text: 'In the event of demise or permanent incapacity, MGR CLUB shall first recover loan obligations from shares, and remit any surplus to the legal beneficiary pursuant to the Bereavement Protocol.'
        },
        {
          clause: '10.8',
          subtitle: 'Restriction on Withdrawal of Secured Shares',
          text: 'Shares pledged as security for an emergency loan shall not be withdrawn or transferred until the loan is fully discharged.'
        },
        {
          clause: '10.9',
          subtitle: 'Interpretation and Effect',
          text: 'Ensures borrowings are fully secured, loans automatically deducted upon exit, and club liquidity and financial stability protected.'
        }
      ]
    },
    {
      id: '11.0',
      title: '11.0 Amendment of this Constitution / LLP Agreement',
      tag: 'Constitutional Revision',
      content: [
        {
          clause: '11.1',
          text: 'This Constitution may be amended by a resolution supported by not less than two-thirds (2/3) of all Members present and voting at a duly convened meeting, provided that notice of the proposed amendment has been circulated in advance.'
        }
      ]
    },
    {
      id: '12.0',
      title: '12.0 Dissolution and Winding Up',
      tag: 'Dissolution Protocol',
      content: [
        {
          clause: '12.1',
          text: 'MGR CLUB may be dissolved in accordance with applicable law and a resolution passed by not less than three-quarters (3/4) of all Members.'
        },
        {
          clause: '12.2',
          text: 'Upon dissolution, all liabilities shall first be discharged before remaining assets and reserves are distributed pro-rata to members\' capital accounts.'
        }
      ]
    }
  ];

  const foundingMembers = [
    { no: '001', name: 'John Kennedy Obalah', role: 'CEO / Executive Committee', shares: '408,737.00', status: 'Active' },
    { no: '002', name: 'Alice Tuei', role: 'Member', shares: '10,800.00', status: 'Active' },
    { no: '003', name: 'Sarah Njoki', role: 'Secretary / Executive Committee', shares: '817.00', status: 'Active' },
    { no: '004', name: 'Dan Aloo', role: 'Chairman / Executive Committee', shares: '160,076.00', status: 'Active' },
    { no: '005', name: 'Moses Okwayo', role: 'Member', shares: '43,162.00', status: 'Active' },
    { no: '006', name: 'Benjamin Ambrose Alila Madara', role: 'Compliance Officer / Exec.', shares: '10,683.00', status: 'Active' },
    { no: '007', name: 'Frederick Ongule Seunda (Late)', role: 'Beneficiary / Estate Escrow', shares: '13,019.00', status: 'Estate Settlement' },
    { no: '008', name: 'Richard Ruto', role: 'Member', shares: '2,540.00', status: 'Active' },
    { no: '009', name: 'Dr Joash Migosi PhD', role: 'Research Officer / Exec.', shares: '4,841.00', status: 'Active' },
    { no: '010', name: 'Josephat Lubanga', role: 'Vice Chairman / Exec.', shares: '39,000.00', status: 'Active' },
    { no: '011', name: 'Leoivard Omondi Ongule', role: 'Treasurer / Executive Committee', shares: '17,000.00', status: 'Active' }
  ];

  const filteredArticles = articles.filter(art => {
    if (activeSection !== 'ALL' && art.id !== activeSection) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchTitle = art.title.toLowerCase().includes(term);
    const matchContent = art.content.some(c => 
      (c.text && c.text.toLowerCase().includes(term)) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(term)) ||
      (c.items && c.items.some(it => it.toLowerCase().includes(term)))
    );
    return matchTitle || matchContent;
  });

  const currentDoc = SECTION_DOC_MAP[activeSection] || SECTION_DOC_MAP['ALL'];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Action & Document Header Card */}
      <div className="bank-card p-5 border-l-4 border-l-[var(--brand-primary)] bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono-num font-black tracking-widest px-2 py-0.5 rounded bg-[var(--brand-tint)] text-[var(--brand-primary)] border border-[var(--brand-tint-border)]">
                {currentDoc.badge}
              </span>
              <span className="text-xs text-slate-500 font-mono-num">
                Ref: {activeSection === '10.0' ? 'MGR/POL/CREDIT-01' : activeSection === '9.0' ? 'MGR/POL/MMF-DIST-01' : activeSection === '3.0' ? 'MGR/IPS/2026/V1' : 'MGR/CONST/2026/V1'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-editorial font-bold text-slate-900 tracking-tight">
              {currentDoc.title}
            </h2>
            <p className="text-xs text-slate-600">
              {activeSection === 'ALL'
                ? 'Limited Liability Partnership Agreement, Member Rights, Emergency Credit Rules (10.5), and Founding Executive Continuity Mandate (6.0)'
                : `Official ratified instrument governing ${currentDoc.label} of MGR Investment Club.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => downloadDocumentPdf(currentDoc.pdfUrl, currentDoc.filename)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white font-bold text-xs shadow-xs transition cursor-pointer"
              title={`Download official PDF: ${currentDoc.title}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF ({currentDoc.size})</span>
            </button>
            <a
              href={currentDoc.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              title={`Open printable HTML view for ${currentDoc.title}`}
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Printable View</span>
            </a>
          </div>
        </div>

        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase text-slate-500 font-mono-num block">Executive Officers</span>
            <span className="font-bold text-slate-900 font-editorial text-sm">7 Key Offices</span>
            <span className="text-[10px] text-slate-500 block">Clause 5.1 &amp; Sched 2</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase text-slate-500 font-mono-num block">Leadership Stability</span>
            <span className="font-bold text-emerald-800 font-editorial text-sm">3 Financial Years</span>
            <span className="text-[10px] text-slate-500 block">Clause 6.1 – 6.6</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase text-slate-500 font-mono-num block">Emergency Loans</span>
            <span className="font-bold text-[var(--accent-gold)] font-editorial text-sm">Up to 90% Shares</span>
            <span className="text-[10px] text-slate-500 block">10%/Mo • 30 Days (10.5)</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase text-slate-500 font-mono-num block">Registered Capital</span>
            <span className="font-bold text-slate-900 font-editorial text-sm">KES 710,675.00</span>
            <span className="text-[10px] text-slate-500 block">11 Founding Members</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clauses (e.g. 90%, loan, emergency, set-off, stability, quorum)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveSection('ALL')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                activeSection === 'ALL' ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => setActiveSection('3.0')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                activeSection === '3.0' ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Clause 3.0 (Vision &amp; Objectives)
            </button>
            <button
              onClick={() => setActiveSection('6.0')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                activeSection === '6.0' ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Clause 6.0 (Stability)
            </button>
            <button
              onClick={() => setActiveSection('9.0')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                activeSection === '9.0' ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Clause 9.0 (Yield Prorating)
            </button>
            <button
              onClick={() => setActiveSection('10.0')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                activeSection === '10.0' ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Clause 10.0 (Loans &amp; Exit)
            </button>
          </div>
        </div>
      </div>

      {/* Articles Reader Stream */}
      <div className="space-y-3.5">
        {filteredArticles.map((art) => (
          <div 
            key={art.id} 
            className={`bank-card p-4 sm:p-5 transition ${
              art.highlight ? 'border-2 border-[var(--accent-gold)] bg-[var(--accent-gold-surface)]' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="font-mono-num font-bold text-xs text-[var(--accent-gold)]">{art.id}</span>
                <h3 className="font-editorial font-bold text-base text-slate-900">{art.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {SECTION_DOC_MAP[art.id] && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadDocumentPdf(SECTION_DOC_MAP[art.id].pdfUrl, SECTION_DOC_MAP[art.id].filename);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] hover:underline bg-[var(--brand-tint)] px-2 py-0.5 rounded border border-[var(--brand-tint-border)] transition cursor-pointer"
                    title={`Download dedicated PDF for Clause ${art.id}`}
                  >
                    <Download className="w-3 h-3" />
                    <span>Download PDF ({SECTION_DOC_MAP[art.id].size})</span>
                  </button>
                )}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                  {art.tag}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              {art.content.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  {item.subtitle && (
                    <h4 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                      <span className="font-mono-num text-[var(--brand-primary)]">{item.clause}</span>
                      <span>{item.subtitle}</span>
                    </h4>
                  )}
                  {item.text && (
                    <p className="text-slate-700">
                      {!item.subtitle && <span className="font-mono-num font-bold text-[var(--brand-primary)] mr-1">{item.clause}</span>}
                      {item.text}
                    </p>
                  )}
                  {item.items && (
                    <ul className="space-y-1 pl-3 border-l-2 border-slate-200 text-slate-700 my-1.5">
                      {item.items.map((it, iIdx) => (
                        <li key={iIdx} className="leading-snug">{it}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Founding Members Schedule 1 Card */}
      <div className="bank-card p-5 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[var(--brand-primary)]" />
            <h3 className="font-editorial font-bold text-base text-slate-900">
              SCHEDULE 1: Official Register of Founding Members &amp; Capital
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadDocumentPdf('/documents/MGR_Club_Constitution_LLP_Agreement.pdf', 'MGR_Club_Constitution_LLP_Agreement.pdf')}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] hover:underline bg-[var(--brand-tint)] px-2 py-0.5 rounded border border-[var(--brand-tint-border)] transition cursor-pointer"
              title="Download official Founding Members Register & Constitution PDF"
            >
              <Download className="w-3 h-3" />
              <span>Download Register PDF (507 KB)</span>
            </button>
            <span className="text-[10px] font-mono-num bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              001 – 011 Register
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <th className="py-2 px-2">No.</th>
                <th className="py-2 px-3">Member Name</th>
                <th className="py-2 px-3">Official Role</th>
                <th className="py-2 px-3 text-right">Net Deposit (KES)</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono-num">
              {foundingMembers.map((m) => (
                <tr key={m.no} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-bold text-[var(--brand-primary)]">{m.no}</td>
                  <td className="py-2 px-3 font-sans font-bold text-slate-900">{m.name}</td>
                  <td className="py-2 px-3 font-sans text-slate-600">{m.role}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">{m.shares}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      m.status === 'Active' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-bold bg-slate-50 text-xs">
                <td colSpan="3" className="py-2 px-3 text-right font-sans">Total Registered Capital:</td>
                <td className="py-2 px-3 text-right text-[var(--brand-primary)]">KES 710,675.00</td>
                <td className="py-2 px-3 text-center font-mono-num">11 Members</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
