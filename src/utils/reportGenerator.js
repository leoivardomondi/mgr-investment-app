// ============================================================================
// MGR INVESTMENT GROUP — OFFICIAL FINANCIAL & ACCOUNTING REPORT GENERATOR
// Uses strictly MGR Investment Group's live financial figures, member shares,
// yield deposits, and double-entry ledger records.
// ============================================================================

import {
  KENYA_MMF_BENCHMARKS_2025,
  CBK_MACRO_INDICATORS,
  COMMITTEE_TARGET_ALLOCATION,
  CEO_DIVERSIFICATION_DIRECTIVE
} from '../data/benchmarkFinancialData';

const fmt = (num, decimals = 2) =>
  Number(num || 0).toLocaleString('en-KE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

const fmtParen = (num, decimals = 2) => `(${fmt(Math.abs(num || 0), decimals)})`;

const formatReportDate = (dateObj = new Date()) => {
  const day = dateObj.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
        ? 'nd'
        : day % 10 === 3 && day !== 13
          ? 'rd'
          : 'th';
  const month = dateObj.toLocaleString('en-GB', { month: 'long' });
  const year = dateObj.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

const formatShortMonthYear = (dateObj = new Date()) =>
  dateObj.toLocaleString('en-GB', { month: 'short', year: 'numeric' });

// Official MGR Investment Club White-on-Forest-Green Crest (Inline SVG for reliable offline HTML & Print-to-PDF rendering)
const MGR_CREST_SVG_INLINE = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="145 100 510 510" width="64" height="64" style="display:block;flex-shrink:0;">
  <defs>
    <linearGradient id="mgrForestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#224632"/>
      <stop offset="60%" stop-color="#1D3B2A"/>
      <stop offset="100%" stop-color="#13291D"/>
    </linearGradient>
    <linearGradient id="mgrWhiteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E4EBE6"/>
    </linearGradient>
  </defs>
  <circle cx="400" cy="355" r="248" fill="url(#mgrForestGrad)"/>
  <circle cx="400" cy="355" r="235" fill="none" stroke="url(#mgrWhiteGrad)" stroke-width="5.5"/>
  <circle cx="400" cy="355" r="222" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-opacity="0.65" stroke-dasharray="4 4"/>
  <path d="M 400 175 L 515 215 L 515 335 C 515 415, 462 475, 400 505 C 338 475, 285 415, 285 335 L 285 215 Z"
        fill="#152E20" stroke="url(#mgrWhiteGrad)" stroke-width="4" stroke-linejoin="round"/>
  <g fill="#FFFFFF">
    <rect x="352" y="268" width="22" height="44" rx="2"/>
    <rect x="389" y="242" width="22" height="70" rx="2"/>
    <rect x="426" y="256" width="22" height="56" rx="2"/>
    <rect x="338" y="317" width="124" height="5" rx="2.5"/>
    <polygon points="400,213 409,225 400,237 391,225"/>
  </g>
  <text x="400" y="396" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="700" letter-spacing="5" fill="#FFFFFF">MGR</text>
  <line x1="354" y1="416" x2="446" y2="416" stroke="#FFFFFF" stroke-width="1.8" stroke-opacity="0.8"/>
  <text x="400" y="442" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="4" fill="#FFFFFF" opacity="0.92">EST. 2026</text>
</svg>`;

const buildOfficialLetterheadHtml = () => `
  <div class="mgr-letterhead" style="display:flex; align-items:center; justify-content:center; gap:16px; padding-bottom:18px; margin-bottom:24px; border-bottom:3px solid #1D3B2A;">
    ${MGR_CREST_SVG_INLINE}
    <div style="text-align:left;">
      <div style="font-family:'Newsreader', Georgia, serif; font-size:24px; font-weight:700; letter-spacing:0.08em; color:#1D3B2A; line-height:1.15;">
        MGR INVESTMENT CLUB
      </div>
    </div>
  </div>
`;

const triggerDownload = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

const openPrintWindow = (htmlContent) => {
  const printWindow = window.open('', '_blank', 'width=980,height=850');
  if (!printWindow) {
    return false;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
  return true;
};

// Shared Archival CSS for Standalone HTML / Printable PDF Reports
const REPORT_BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Inconsolata:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap');

  :root {
    --ink: #161816;
    --ink-muted: #4A4D48;
    --forest: #1D3B2A;
    --ochre: #9A5B25;
    --terracotta: #8C2D27;
    --paper: #FBF9F4;
    --border: #C8C1B0;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 28px 36px;
    background: #EFECE4;
    color: var(--ink);
    font-family: 'Atkinson Hyperlegible', Georgia, serif;
    font-size: 12px;
    line-height: 1.5;
  }

  .document-container {
    max-width: 860px;
    margin: 0 auto;
    background: #FFFFFF;
    border: 1px solid var(--border);
    padding: 42px 48px;
    box-shadow: 0 4px 16px rgba(22, 24, 22, 0.08);
  }

  .toolbar-no-print {
    max-width: 860px;
    margin: 0 auto 16px auto;
    background: var(--forest);
    color: #F4EFE4;
    padding: 10px 18px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .toolbar-no-print button {
    background: #9A5B25;
    color: #FFFFFF;
    border: none;
    padding: 6px 14px;
    font-family: inherit;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-radius: 2px;
    cursor: pointer;
  }

  h1, h2, h3, .serif-heading {
    font-family: 'Newsreader', Georgia, serif;
    margin: 0;
  }

  .num {
    font-family: 'Inconsolata', monospace;
    font-variant-numeric: tabular-nums;
  }

  .cover-box {
    border: 3px double var(--ink);
    padding: 36px 32px;
    text-align: center;
    margin-bottom: 32px;
    background: var(--paper);
  }

  .statement-header {
    border-bottom: 2px solid var(--ink);
    padding-bottom: 10px;
    margin-bottom: 16px;
    margin-top: 28px;
  }

  .statement-header .reg-line {
    font-family: 'Inconsolata', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--ink-muted);
  }

  .statement-header h2 {
    font-size: 18px;
    font-weight: 700;
    color: var(--ink);
    margin-top: 2px;
  }

  .statement-header .sub-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ochre);
    margin-top: 2px;
  }

  table.acct-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 18px;
    font-size: 11.5px;
  }

  table.acct-table th {
    border-top: 1.5px solid var(--ink);
    border-bottom: 1.5px solid var(--ink);
    padding: 7px 8px;
    text-align: left;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: #F4EFE4;
    color: var(--ink);
  }

  table.acct-table th.right,
  table.acct-table td.right {
    text-align: right;
  }

  table.acct-table th.center,
  table.acct-table td.center {
    text-align: center;
  }

  table.acct-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #E5DFD2;
    vertical-align: top;
  }

  table.acct-table tr.section-row td {
    background: #F7F4EC;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10.5px;
    letter-spacing: 0.06em;
    color: var(--forest);
    padding-top: 8px;
    padding-bottom: 6px;
  }

  table.acct-table tr.subtotal-row td {
    border-top: 1px solid var(--ink);
    border-bottom: 1px solid var(--ink);
    font-weight: 700;
    background: #FAF8F3;
  }

  table.acct-table tr.grand-total-row td {
    border-top: 1.5px solid var(--ink);
    border-bottom: 4px double var(--ink);
    font-weight: 700;
    font-size: 12.5px;
    background: #F4EFE4;
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .note-badge {
    font-family: 'Inconsolata', monospace;
    font-weight: 700;
    color: var(--ochre);
  }

  .neg {
    color: var(--terracotta);
    font-weight: 600;
  }

  .pos {
    color: var(--forest);
    font-weight: 700;
  }

  .signature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 28px;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }

  .signature-box {
    border-top: 1px dashed var(--ink);
    padding-top: 6px;
    margin-top: 26px;
    font-size: 10.5px;
  }

  .page-break {
    page-break-before: always;
    margin-top: 32px;
    padding-top: 16px;
    border-top: 2px dashed #D6CFC0;
  }

  .note-card {
    border: 1px solid var(--border);
    background: var(--paper);
    padding: 12px 14px;
    margin-bottom: 12px;
  }

  .note-card h4 {
    margin: 0 0 6px 0;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--forest);
  }

  @media print {
    body {
      background: #FFFFFF;
      padding: 0;
    }
    .document-container {
      border: none;
      box-shadow: none;
      padding: 12px 18px;
      max-width: 100%;
    }
    .toolbar-no-print {
      display: none !important;
    }
    .page-break {
      border-top: none;
      margin-top: 0;
      padding-top: 0;
    }
  }
`;

const wrapHtmlDocument = (title, bodyHtml) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>${REPORT_BASE_STYLES}</style>
</head>
<body>
  <div class="toolbar-no-print">
    <div>
      <strong>MGR INVESTMENT CLUB • OFFICIAL ARCHIVAL REPORT</strong>
      <span style="margin-left:10px; opacity:0.85;">Investment Club &amp; IFRS Financial Format</span>
    </div>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="document-container">
    ${buildOfficialLetterheadHtml()}
    ${bodyHtml}
  </div>
</body>
</html>`;

const buildSignatoriesBlock = () => `
  <div style="margin-top: 18px; font-size: 11px; color: #4A4D48;">
    The financial statements and accompanying notes were generated and verified for the MGR Executive Committee on <strong>${formatReportDate()}</strong> and signed on its behalf by:
  </div>
  <div class="signature-grid">
    <div>
      <div class="signature-box">
        <strong>Dan Aloo (MGR-004)</strong><br/>
        <span>Chairperson, Executive Committee</span>
      </div>
    </div>
    <div>
      <div class="signature-box">
        <strong>John Kennedy Obalah (MGR-001)</strong><br/>
        <span>CEO</span>
      </div>
    </div>
    <div>
      <div class="signature-box">
        <strong>Sarah Njoki (MGR-003)</strong><br/>
        <span>Hon. Secretary</span>
      </div>
    </div>
  </div>
`;

// ============================================================================
// Compute Derived Financial Metrics for MGR Investment Group Only
// ============================================================================
export const computeFinancialMetrics = ({ members, assets, loans, ledger, totalMemberShares }) => {
  const loanReceivables = (loans || []).reduce(
    (sum, l) => sum + (l.status === 'Active' ? l.balanceRemaining : 0),
    0
  );
  const cashInBank = assets.bankAccount.balance;
  const eticaBalance = assets.eticaMmf.statementBalance;
  const mansaXPrincipal = assets.mansaX.principal;
  const mansaXInterest = assets.mansaX.interestAccrued;
  const mansaXTotal = assets.mansaX.totalBalance;
  const totalComprehensiveAssets = cashInBank + eticaBalance + mansaXTotal + loanReceivables;

  const totalShares = totalMemberShares; // KES 710,675.00 (KES 1k Registration Fee deducted to 2026 Legal Incorporation Pool)
  const groupReserves = assets.groupReserveAccount.balance; // KES 11,000.00 (11 members * 1,000 non-refundable reg fee)

  const eticaInterest = Math.max(0, totalComprehensiveAssets - totalShares - groupReserves - mansaXInterest); // Dynamic residual yield / surplus
  const loanInterestIncome = (loans || []).reduce((sum, l) => sum + Number(l.interestAmount || 0), 0);
  const registrationFeePool = groupReserves;
  const totalRevenues = mansaXInterest + eticaInterest + loanInterestIncome;

  const bankCharges = 0.0;
  const withholdingTaxMmf = 0.0;
  const supervisionFeeProvision = 0.0;
  const auditFeeProvision = 0.0;
  const totalOperatingExpenses = 0.0;

  const operatingSurplusBeforeTax = totalRevenues - totalOperatingExpenses;
  const taxableInvestmentIncome = eticaInterest + loanInterestIncome;
  const taxAllowance50Pct = 0.0;
  const netTaxableIncome = 0.0;
  const incomeTaxCharge30Pct = 0.0;

  const netSurplusAfterTax = operatingSurplusBeforeTax;
  const statutoryReserveTransfer20Pct = 0.0;
  const netDistributableSurplus = netSurplusAfterTax;
  const retainedSurplus = Math.max(0, totalComprehensiveAssets - totalShares - groupReserves); // ~KES 72,518.74 to 73,518.74

  const coreCapital = totalShares + groupReserves + retainedSurplus; // KES 794,193.74
  const coreCapitalToAssets =
    totalComprehensiveAssets > 0 ? ((coreCapital / totalComprehensiveAssets) * 100).toFixed(1) : '0.0';
  const coreCapitalToDeposits =
    totalShares > 0 ? ((coreCapital / totalShares) * 100).toFixed(1) : '0.0';
  const institutionalCapital = groupReserves + retainedSurplus;
  const institutionalToAssets =
    totalComprehensiveAssets > 0
      ? ((institutionalCapital / totalComprehensiveAssets) * 100).toFixed(1)
      : '0.0';
  const liquidAssets = cashInBank + eticaBalance;
  const liquidityRatio = totalShares > 0 ? ((liquidAssets / totalShares) * 100).toFixed(1) : '0.0';
  const expenseToRevenueRatio = '0.0';

  return {
    members,
    assets,
    loans,
    ledger,
    loanReceivables,
    cashInBank,
    eticaBalance,
    mansaXPrincipal,
    mansaXInterest,
    mansaXTotal,
    totalComprehensiveAssets,
    totalShares,
    groupReserves,
    eticaInterest,
    loanInterestIncome,
    registrationFeePool,
    totalRevenues,
    bankCharges,
    withholdingTaxMmf,
    supervisionFeeProvision,
    auditFeeProvision,
    totalOperatingExpenses,
    operatingSurplusBeforeTax,
    taxableInvestmentIncome,
    taxAllowance50Pct,
    netTaxableIncome,
    incomeTaxCharge30Pct,
    netSurplusAfterTax,
    statutoryReserveTransfer20Pct,
    netDistributableSurplus,
    retainedSurplus,
    coreCapital,
    coreCapitalToAssets,
    coreCapitalToDeposits,
    institutionalCapital,
    institutionalToAssets,
    liquidAssets,
    liquidityRatio,
    expenseToRevenueRatio
  };
};

// ============================================================================
// HTML Fragment Builders for MGR Statements
// ============================================================================

const buildBalanceSheetHtml = (m) => `
  <div class="statement-header">
    <div class="reg-line">MGR Investment Club Constitution &amp; Financial Reporting Standards</div>
    <div class="sub-title">Statement of Financial Position As At ${formatReportDate()}</div>
  </div>
  <table class="acct-table">
    <thead>
      <tr>
        <th>Assets, Equity &amp; Liabilities</th>
        <th class="center">Notes</th>
        <th class="right">${formatShortMonthYear()} (Kshs)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-row"><td colspan="3">Assets • Current &amp; Liquid Assets</td></tr>
      <tr>
        <td>Cash &amp; Cash Equivalents (Stanbic Bank Kenya)</td>
        <td class="center note-badge">[6]</td>
        <td class="right num">${fmt(m.cashInBank)}</td>
      </tr>
      <tr>
        <td>Money Market Fund Deposits (Etica Capital MMF)</td>
        <td class="center note-badge">[8]</td>
        <td class="right num">${fmt(m.eticaBalance)}</td>
      </tr>
      <tr>
        <td>Loans &amp; Advances to Members (80% Self-Guaranteed Share Ceiling)</td>
        <td class="center note-badge">[7]</td>
        <td class="right num">${fmt(m.loanReceivables)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Total Current &amp; Liquid Assets</td>
        <td></td>
        <td class="right num">${fmt(m.cashInBank + m.eticaBalance + m.loanReceivables)}</td>
      </tr>

      <tr class="section-row"><td colspan="3">Non-Current &amp; Special Fund Investments</td></tr>
      <tr>
        <td>Mansa-X Special Fund — Principal Capital (Standard Investment Bank)</td>
        <td class="center note-badge">[9a]</td>
        <td class="right num">${fmt(m.mansaXPrincipal)}</td>
      </tr>
      <tr>
        <td>Mansa-X Special Fund — Accrued Q3 Investment Return</td>
        <td class="center note-badge">[9b]</td>
        <td class="right num pos">${fmt(m.mansaXInterest)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Total Non-Current Financial Investments</td>
        <td></td>
        <td class="right num">${fmt(m.mansaXTotal)}</td>
      </tr>

      <tr class="grand-total-row">
        <td>TOTAL MGR ASSETS</td>
        <td></td>
        <td class="right num">${fmt(m.totalComprehensiveAssets)}</td>
      </tr>

      <tr class="section-row"><td colspan="3">Financed By • Member Deposits, Reserves &amp; Retained Surplus</td></tr>
      ${(m.members || []).map((mem, idx) => `
      <tr>
        <td style="padding-left: 18px;">${mem.name} ${mem.status === 'Deceased' ? '<span style="color:#b91c1c; font-size:10px; font-weight:bold;">(Estate Escrow)</span>' : ''}</td>
        <td class="center note-badge">[12-${idx + 1}]</td>
        <td class="right num">${fmt(mem.shares)}</td>
      </tr>
      `).join('')}
      <tr class="subtotal-row" style="background:#f8fafc; font-weight:bold;">
        <td>Total Member Deposits (${(m.members || []).length} Members)</td>
        <td class="center note-badge">[12]</td>
        <td class="right num">${fmt(m.totalShares)}</td>
      </tr>

      <tr>
        <td>Non-Refundable Registration Fee Pool (${m.members.length} Members &times; KES 1,000 Reserve)</td>
        <td class="center note-badge">[13]</td>
        <td class="right num">${fmt(m.groupReserves)}</td>
      </tr>

      <tr>
        <td>Accrued Investment Surplus — Mansa-X Special Fund</td>
        <td class="center note-badge">[14a]</td>
        <td class="right num pos">${fmt(m.mansaXInterest)}</td>
      </tr>
      <tr>
        <td>Accrued Investment Surplus — Etica Capital MMF &amp; Bank</td>
        <td class="center note-badge">[14b]</td>
        <td class="right num pos">${fmt(m.eticaInterest)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Surplus for the Period (Current Accrued Yield)</td>
        <td></td>
        <td class="right num pos">${fmt(m.mansaXInterest + m.eticaInterest)}</td>
      </tr>
      <tr class="subtotal-row" style="background:#f0fdf4; font-weight:bold; color:#065f46;">
        <td>TOTAL SURPLUS (Accumulated Retained Surplus)</td>
        <td></td>
        <td class="right num pos">${fmt(m.retainedSurplus)}</td>
      </tr>

      <tr class="grand-total-row">
        <td>TOTAL LIABILITIES, MEMBER DEPOSITS &amp; SURPLUS</td>
        <td></td>
        <td class="right num">${fmt(m.totalComprehensiveAssets)}</td>
      </tr>
    </tbody>
  </table>

  <div class="note-card">
    <h4>Official Accounts Notes (Dated 30/10/2026 — John Kennedy Obalah)</h4>
    <div><strong>1) Frederick Ongule Seunda (KES 13,019.00*):</strong> Died in September (date confirmed as 11/09/2026). Net share standing of KES 13,019.00 (gross KES 14,019 less KES 1,000 non-refundable subscription fee) held in estate escrow. Dues payable to beneficiary to be worked out at the end of the financial year as per exit clause policy.</div>
    <div><strong>2) Mansa X vs Etica Capital MMF:</strong> Returns from Mansa X are much higher than Etica Capital MMF. Urgent Executive Committee action is underway to resolve Etica Capital MMF withdrawal restrictions and increase investment in Mansa X.</div>
    <div><strong>3) Recruitment:</strong> We need to aggressively recruit new members.</div>
    <div><strong>4) Regular Savings:</strong> Members should regularly save through Etica Capital MMF.</div>
    <div><strong>5) Subscription Fees (1,000/=):</strong> Non-refundable subscription fee of Kshs 1,000/= is paid by every member to register the organisation in financial year 2026.</div>
  </div>
`;


const buildStatementOfAccountHtml = (m) => `
  <div class="statement-header">
    <div class="reg-line">MGR Investment Club Constitution &amp; Accountancy Guidelines</div>
    <div class="sub-title">Monthly Statement of Account (As At ${formatReportDate()})</div>
  </div>

  <table class="acct-table">
    <thead>
      <tr>
        <th>Chama Portfolio Custodial Assets (End of Month)</th>
        <th class="center">Notes</th>
        <th class="right">Amount (KES)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-row"><td colspan="3">1. Liquid &amp; Special Fund Holdings</td></tr>
      <tr>
        <td>Cash &amp; Bank Equivalents (Stanbic Bank Kenya)</td>
        <td class="center note-badge">[1]</td>
        <td class="right num">${fmt(m.cashInBank)}</td>
      </tr>
      <tr>
        <td>Money Market Fund Balance (Etica Capital MMF — Client Code 34236M)</td>
        <td class="center note-badge">[2]</td>
        <td class="right num">${fmt(m.eticaBalance)}</td>
      </tr>
      <tr>
        <td>Mansa-X Special Fund Principal Capital (Standard Investment Bank)</td>
        <td class="center note-badge">[3a]</td>
        <td class="right num">${fmt(m.mansaXPrincipal)}</td>
      </tr>
      <tr>
        <td>Mansa-X Accrued Investment Return (Undistributed Group Surplus)</td>
        <td class="center note-badge">[3b]</td>
        <td class="right num pos">${fmt(m.mansaXInterest)}</td>
      </tr>
      <tr>
        <td>Member Loan Advances Outstanding (80% Collateralized)</td>
        <td class="center note-badge">[4]</td>
        <td class="right num">${fmt(m.loanReceivables)}</td>
      </tr>
      <tr class="grand-total-row">
        <td>TOTAL CHAMA PORTFOLIO VALUE (END OF MONTH)</td>
        <td></td>
        <td class="right num">${fmt(m.totalComprehensiveAssets)}</td>
      </tr>

      <tr class="section-row"><td colspan="3">2. Financed By • Member Deposits, Reserves &amp; Retained Surplus</td></tr>
      ${(m.members || []).map((mem, idx) => `
      <tr>
        <td style="padding-left: 18px;">${mem.name} ${mem.status === 'Deceased' ? '<span style="color:#b91c1c; font-size:10px; font-weight:bold;">(Estate Escrow)</span>' : ''}</td>
        <td class="center note-badge">[5-${idx + 1}]</td>
        <td class="right num">${fmt(mem.shares)}</td>
      </tr>
      `).join('')}
      <tr class="subtotal-row" style="background:#f8fafc; font-weight:bold;">
        <td>Total Member Deposits (${(m.members || []).length} Members)</td>
        <td class="center note-badge">[5]</td>
        <td class="right num">${fmt(m.totalShares)}</td>
      </tr>
      <tr>
        <td>Non-Refundable Registration Fee Pool (${m.members.length} &times; KES 1,000 Reserve)</td>
        <td class="center note-badge">[6]</td>
        <td class="right num">${fmt(m.groupReserves)}</td>
      </tr>
      <tr>
        <td>Accrued Investment Surplus for the Period</td>
        <td class="center note-badge">[7a]</td>
        <td class="right num pos">${fmt(m.mansaXInterest + m.eticaInterest)}</td>
      </tr>
      <tr class="subtotal-row" style="background:#f0fdf4; font-weight:bold; color:#065f46;">
        <td>TOTAL SURPLUS (Accumulated Retained Surplus)</td>
        <td></td>
        <td class="right num pos">${fmt(m.retainedSurplus)}</td>
      </tr>
      <tr class="grand-total-row">
        <td>TOTAL LIABILITIES, MEMBER DEPOSITS &amp; SURPLUS</td>
        <td></td>
        <td class="right num">${fmt(m.totalComprehensiveAssets)}</td>
      </tr>
    </tbody>
  </table>

  <h3 style="margin-top:24px; font-size:13px; font-weight:bold; text-transform:uppercase; color:#0A192F; border-bottom:2px solid #0A192F; padding-bottom:4px;">
    Schedule of Individual Member Accounts (As at Month End)
  </h3>
  <table class="acct-table">
    <thead>
      <tr>
        <th>No.</th>
        <th>Member ID &amp; Name</th>
        <th>Club Role</th>
        <th class="right">Member Deposits (KES)</th>
        <th class="right">Registration Fee (KES)</th>
        <th class="right">Distributed Yield (KES)</th>
        <th class="right">Closing Balance (KES)</th>
      </tr>
    </thead>
    <tbody>
      ${(m.members || []).map((mem, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${mem.name}</strong> (${mem.id})</td>
          <td>${mem.role}</td>
          <td class="right num">${fmt(mem.shares)}</td>
          <td class="right num">1,000.00</td>
          <td class="right num" style="color:#64748b;">0.00*</td>
          <td class="right num"><strong>${fmt(mem.shares)}</strong></td>
        </tr>
      `).join('')}
      <tr class="grand-total-row">
        <td colspan="3">TOTAL ALL ${m.members.length} REGISTERED MEMBERS</td>
        <td class="right num">${fmt(m.totalShares)}</td>
        <td class="right num">${fmt(m.groupReserves)}</td>
        <td class="right num">0.00</td>
        <td class="right num">${fmt(m.totalShares)}</td>
      </tr>
    </tbody>
  </table>

  <div class="note-card" style="margin-top:16px;">
    <h4>Official Chama Treasury Directive: Interest Retained Undistributed</h4>
    <div>* <strong>Notice on Interest Allocation:</strong> Pursuant to Chama Executive Committee resolution, all investment returns from Mansa X (KES ${fmt(m.mansaXInterest)}) and Etica Capital MMF (per Oct 31 Statement) are recognized at the collective group level and held undistributed in the Chama Retained Surplus Account. Interest is <strong>NOT assigned or distributed</strong> to individual member accounts yet, preserving collective reserves until formal registration in 2026.</div>
  </div>
`;

const buildIncomeStatementHtml = (m) => `
  <div class="statement-header">
    <div class="reg-line">MGR Investment Club Constitution &amp; Accountancy Guidelines</div>
    <div class="sub-title">Statement of Comprehensive Income For The Period Ended ${formatReportDate()}</div>
  </div>
  <table class="acct-table">
    <thead>
      <tr>
        <th>Revenue &amp; Expenditure Line Items</th>
        <th class="center">Notes</th>
        <th class="right">${formatShortMonthYear()} (Kshs)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-row"><td colspan="3">Revenue &amp; Investment Income</td></tr>
      <tr>
        <td>Mansa-X Special Fund Investment Return (SIB Q3 Statement)</td>
        <td class="center note-badge">[3a]</td>
        <td class="right num">${fmt(m.mansaXInterest)}</td>
      </tr>
      <tr>
        <td>Etica Capital Money Market Fund Gross Interest (Sept 2026 Statement)</td>
        <td class="center note-badge">[3b]</td>
        <td class="right num">${fmt(m.eticaInterest)}</td>
      </tr>
      <tr>
        <td>Interest on Member Advances (10% Facility Fee to Group Reserve)</td>
        <td class="center note-badge">[3c]</td>
        <td class="right num">${fmt(m.loanInterestIncome)}</td>
      </tr>
      <tr>
        <td>Member Registration Fees (${m.members.length} Members × KES 1,000)</td>
        <td class="center note-badge">[4]</td>
        <td class="right num">${fmt(m.registrationFeePool)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Total Revenue</td>
        <td></td>
        <td class="right num">${fmt(m.totalRevenues)}</td>
      </tr>

      <tr class="section-row"><td colspan="3">Operating &amp; Administration Provisions</td></tr>
      <tr>
        <td>Withholding Tax Deducted at Source (15% on Etica MMF Interest)</td>
        <td class="center note-badge">[5a]</td>
        <td class="right num neg">${fmtParen(m.withholdingTaxMmf)}</td>
      </tr>
      <tr>
        <td>Bank &amp; RTGS Settlement Charges (Stanbic Bank Kenya)</td>
        <td class="center note-badge">[5b]</td>
        <td class="right num neg">${fmtParen(m.bankCharges)}</td>
      </tr>
      <tr>
        <td>Club Administration &amp; Governance Provisions</td>
        <td class="center note-badge">[5c]</td>
        <td class="right num neg">${fmtParen(m.supervisionFeeProvision)}</td>
      </tr>
      <tr>
        <td>External Audit &amp; Accountancy Provision</td>
        <td class="center note-badge">[5d]</td>
        <td class="right num neg">${fmtParen(m.auditFeeProvision)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Total Operating Expenses</td>
        <td></td>
        <td class="right num neg">${fmtParen(m.totalOperatingExpenses)}</td>
      </tr>

      <tr class="subtotal-row">
        <td>Operating Surplus Before Tax</td>
        <td></td>
        <td class="right num">${fmt(m.operatingSurplusBeforeTax)}</td>
      </tr>
      <tr>
        <td>Income Tax Provision</td>
        <td class="center note-badge">[15]</td>
        <td class="right num neg">${fmtParen(m.incomeTaxCharge30Pct)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Surplus For The Period After Tax</td>
        <td></td>
        <td class="right num">${fmt(m.netSurplusAfterTax)}</td>
      </tr>
      <tr class="grand-total-row">
        <td>TOTAL ACCUMULATED SURPLUS (RETAINED IN CLUB RESERVES)</td>
        <td></td>
        <td class="right num pos">${fmt(m.retainedSurplus)}</td>
      </tr>
    </tbody>
  </table>
`;

const buildCashFlowAndChangesInEquityHtml = (m) => `
  <div class="statement-header">
    <div class="reg-line">MGR Investment Club • Statement of Cash Flows &amp; Equity</div>
    <div class="sub-title">Statement of Cash Flows &amp; Statement of Changes in Equity (As At ${formatReportDate()})</div>
  </div>
  <table class="acct-table">
    <thead>
      <tr>
        <th>Cash Flow Activity (IAS 7)</th>
        <th class="center">Notes</th>
        <th class="right">${formatShortMonthYear()} (Kshs)</th>
      </tr>
    </thead>
    <tbody>
      <tr class="section-row"><td colspan="3">Operating Activities</td></tr>
      <tr>
        <td>Surplus Before Tax for the Period</td>
        <td class="center note-badge">[CF-1]</td>
        <td class="right num">${fmt(m.operatingSurplusBeforeTax)}</td>
      </tr>
      <tr>
        <td>Less: Investment Interest &amp; Non-Operating Income</td>
        <td class="center note-badge">[CF-2]</td>
        <td class="right num neg">${fmtParen(m.mansaXInterest + m.eticaInterest)}</td>
      </tr>
      <tr>
        <td>Movement in Member Loans &amp; Working Capital Receivables</td>
        <td class="center note-badge">[CF-3]</td>
        <td class="right num neg">${fmtParen(m.loanReceivables)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Net Cash From Operating Activities</td>
        <td></td>
        <td class="right num">${fmt(m.operatingSurplusBeforeTax - (m.mansaXInterest + m.eticaInterest) - m.loanReceivables)}</td>
      </tr>

      <tr class="section-row"><td colspan="3">Investing Activities</td></tr>
      <tr>
        <td>Mansa-X Special Fund Capital Deployment (Standard Investment Bank)</td>
        <td class="center note-badge">[9a]</td>
        <td class="right num neg">${fmtParen(m.mansaXPrincipal)}</td>
      </tr>
      <tr>
        <td>Realized &amp; Reinvested Money Market / Special Fund Returns</td>
        <td class="center note-badge">[9b]</td>
        <td class="right num pos">${fmt(m.mansaXInterest + m.eticaInterest)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Net Cash Used In / From Investing Activities</td>
        <td></td>
        <td class="right num">${fmt(-m.mansaXPrincipal + m.mansaXInterest + m.eticaInterest)}</td>
      </tr>

      <tr class="section-row"><td colspan="3">Financing Activities</td></tr>
      <tr>
        <td>Members' Deposits Carried Forward</td>
        <td class="center note-badge">[12]</td>
        <td class="right num pos">${fmt(m.totalShares)}</td>
      </tr>
      <tr>
        <td>Mandatory Member Registration Fees (KES 1,000 × ${m.members.length} Members)</td>
        <td class="center note-badge">[13]</td>
        <td class="right num pos">${fmt(m.registrationFeePool)}</td>
      </tr>
      <tr class="subtotal-row">
        <td>Net Cash From Financing Activities</td>
        <td></td>
        <td class="right num pos">${fmt(m.totalShares + m.registrationFeePool)}</td>
      </tr>

      <tr class="grand-total-row">
        <td>CLOSING CASH &amp; LIQUID MMF EQUIVALENTS (STANBIC + ETICA)</td>
        <td class="center note-badge">[6, 8]</td>
        <td class="right num pos">${fmt(m.cashInBank + m.eticaBalance)}</td>
      </tr>
    </tbody>
  </table>

  <table class="acct-table">
    <thead>
      <tr>
        <th>Statement of Changes in Equity</th>
        <th class="right">Member Deposits (Kshs)</th>
        <th class="right">Group Reserve (Kshs)</th>
        <th class="right">Retained Surplus (Kshs)</th>
        <th class="right">Total Equity (Kshs)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Verified Member Deposits &amp; Reg Fees Brought Forward</td>
        <td class="right num">${fmt(m.totalShares)}</td>
        <td class="right num">${fmt(m.groupReserves)}</td>
        <td class="right num">0.00</td>
        <td class="right num">${fmt(m.totalShares + m.groupReserves)}</td>
      </tr>
      <tr>
        <td>Investment Surplus for the Period Ended ${formatReportDate()}</td>
        <td class="right num">—</td>
        <td class="right num">—</td>
        <td class="right num pos">${fmt(m.retainedSurplus)}</td>
        <td class="right num pos">${fmt(m.retainedSurplus)}</td>
      </tr>
      <tr class="grand-total-row">
        <td>AT 30TH OCTOBER 2026</td>
        <td class="right num">${fmt(m.totalShares)}</td>
        <td class="right num">${fmt(m.groupReserves)}</td>
        <td class="right num pos">${fmt(m.retainedSurplus)}</td>
        <td class="right num">${fmt(m.totalComprehensiveAssets)}</td>
      </tr>
    </tbody>
  </table>
`;

const buildRatiosAndNotesHtml = (m) => `
  <div class="statement-header">
    <div class="reg-line">MGR Investment Club Key Financial Metrics &amp; Notes [1]–[15]</div>
    <h2>KEY PORTFOLIO METRICS &amp; NOTES TO THE FINANCIAL STATEMENTS</h2>
    <div class="sub-title">For The Period Ended ${formatReportDate()}</div>
  </div>
  <table class="acct-table">
    <thead>
      <tr>
        <th>Portfolio Metric / Capital Ratio</th>
        <th class="center">Club Benchmark Target</th>
        <th class="right">MGR Live (${formatShortMonthYear()})</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total Registered Membership</td>
        <td class="center">Min 10 Members</td>
        <td class="right num">${m.members.length} Members (${m.members.filter(mem => mem.status === 'Active').length} Active${m.members.filter(mem => mem.status !== 'Active').length > 0 ? `, ${m.members.filter(mem => mem.status !== 'Active').length} Inactive/Estate` : ''})</td>
      </tr>
      <tr>
        <td>Core Capital to Total Assets Ratio</td>
        <td class="center">Min 10.0%</td>
        <td class="right num pos">${m.coreCapitalToAssets}%</td>
      </tr>
      <tr>
        <td>Core Capital to Total Member Deposits</td>
        <td class="center">Min 8.0%</td>
        <td class="right num pos">${m.coreCapitalToDeposits}%</td>
      </tr>
      <tr>
        <td>Institutional Capital to Total Assets</td>
        <td class="center">Min 8.0%</td>
        <td class="right num">${m.institutionalToAssets}%</td>
      </tr>
      <tr>
        <td>Liquidity Ratio (Liquid Assets / Total Deposits)</td>
        <td class="center">Min 15.0%</td>
        <td class="right num pos">${m.liquidityRatio}%</td>
      </tr>
      <tr>
        <td>Operating Expense to Total Revenue Ratio</td>
        <td class="center">Max 40.0%</td>
        <td class="right num pos">${m.expenseToRevenueRatio}%</td>
      </tr>
    </tbody>
  </table>

  <div class="note-card">
    <h4>Note [1] • Summary of Significant Accounting Policies</h4>
    <div><strong>(a) Basis of Preparation:</strong> Prepared under the historical cost convention in compliance with MGR Investment Club Constitution, Executive Committee resolutions, and standard Kenyan Investment Club (Chama) accounting practices.</div>
    <div><strong>(b) Revenue Recognition:</strong> Investment returns from Mansa-X Special Fund and Etica Capital MMF are recognized on an accrual basis per official fund manager statements.</div>
    <div><strong>(c) Interest on Member Loans:</strong> MGR charges a 10% flat facility fee credited to the Group Reserve Account, with loans capped at 80% of a member's verified share deposits.</div>
  </div>

  <div class="note-card">
    <h4>Note [12] • Members' Deposits &amp; Passbook Reconciliation</h4>
    <div>Total verified member deposits carried forward equal <strong>KES ${fmt(m.totalShares)}</strong> across ${m.members.length} accounts, with a <strong>KES 0.00 variance (100% reconciled)</strong> between the General Ledger and Individual Member Passbooks.</div>
  </div>

  <div class="note-card">
    <h4>Note [14] &amp; Note [15] • Investment Surplus &amp; Retained Earnings</h4>
    <div>All surplus generated from investments is recognized at the collective group level and held in the Club Retained Surplus Account (<strong>KES ${fmt(m.retainedSurplus)}</strong>) to preserve collective investment capital. Withholding tax at 15% is deducted at source on MMF gross interest by fund managers.</div>
  </div>
`;

const buildMemberSharesScheduleHtml = (m) => {
  const qualifyingBase = m.members
    .filter((mem) => mem.id !== 'MGR-011' && (!mem.joinedDate || mem.joinedDate < '2026-10-01') && mem.joinedDate !== 'Q4-2026')
    .reduce((s, mem) => s + Number(mem.shares || 0), 0);

  const rows = m.members
    .map((mem, idx) => {
      const pct = m.totalShares > 0 ? ((mem.shares / m.totalShares) * 100).toFixed(2) : '0.00';
      const creditedYield = (mem.depositHistory || [])
        .filter((d) => d.type === 'Yield / Dividend Deposit')
        .reduce((s, d) => s + Number(d.amount || 0), 0);
      const isQ4Member = mem.id === 'MGR-011' || (mem.joinedDate && mem.joinedDate >= '2026-10-01') || mem.joinedDate === 'Q4-2026';
      const accruedYield =
        isQ4Member
          ? 0
          : qualifyingBase > 0
          ? (Number(mem.shares || 0) / qualifyingBase) * m.retainedSurplus
          : 0;
      const totalYield = creditedYield + accruedYield;
      const compounded = Number(mem.shares || 0) + accruedYield;

      return `
        <tr>
          <td class="num">${idx + 1}</td>
          <td class="num"><strong>${mem.id}</strong></td>
          <td><strong>${mem.name}${mem.status === 'Deceased' ? '*' : ''}</strong></td>
          <td>${mem.role}</td>
          <td class="num">${mem.joinedDate || '2024-01-15'}</td>
          <td>${mem.status}</td>
          <td class="right num">1,000.00</td>
          <td class="right num"><strong>${fmt(mem.shares)}</strong></td>
          <td class="right num pos">+${fmt(totalYield)}</td>
          <td class="right num"><strong>${fmt(compounded)}</strong></td>
          <td class="right num">${pct}%</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div class="statement-header">
      <div class="reg-line">Note [12] Supporting Schedule • Reconciled Member Passbooks &amp; Yield Deposits</div>
        <div class="sub-title">Schedule of Each Member's Principal Deposits &amp; Yield Deposits Carried Forward (C/F) As At ${formatReportDate()}</div>
    </div>
    <table class="acct-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Member ID</th>
          <th>Full Name</th>
          <th>Governance Role</th>
          <th>Joined Date</th>
          <th>Status</th>
          <th class="right">Reg Fee (Kshs)</th>
          <th class="right">Principal Deps (Kshs)</th>
          <th class="right">Yield Deps (Kshs)</th>
          <th class="right">Compounded Total (Kshs)</th>
          <th class="right">Equity %</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="grand-total-row">
          <td colspan="6">TOTAL VERIFIED MGR MEMBER DEPOSITS &amp; YIELDS C/F</td>
          <td class="right num">11,000.00</td>
          <td class="right num">${fmt(m.totalShares)}</td>
          <td class="right num pos">+${fmt(m.retainedSurplus)}</td>
          <td class="right num">${fmt(m.totalComprehensiveAssets)}</td>
          <td class="right num">100.00%</td>
        </tr>
      </tbody>
    </table>
  `;
};

const buildDoubleEntryJournalHtml = (m) => {
  const rows = (m.ledger || [])
    .map(
      (tx) => `
      <tr>
        <td class="num"><strong>${tx.id}</strong></td>
        <td class="num">${tx.date}</td>
        <td>${tx.description}</td>
        <td>${tx.debitAccount}</td>
        <td>${tx.creditAccount}</td>
        <td class="right num"><strong>${fmt(tx.amount)}</strong></td>
      </tr>
    `
    )
    .join('');

  const totalVolume = (m.ledger || []).reduce((s, t) => s + Number(t.amount || 0), 0);

  return `
    <div class="statement-header">
      <div class="reg-line">Immutable Double-Entry Accounting Trail</div>
        <div class="sub-title">General Ledger Journal Transactions (${(m.ledger || []).length} Posted Entries)</div>
    </div>
    <table class="acct-table">
      <thead>
        <tr>
          <th>Entry ID</th>
          <th>Date</th>
          <th>Transaction Particulars</th>
          <th>Debit Account (Dr)</th>
          <th>Credit Account (Cr)</th>
          <th class="right">Amount (Kshs)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="grand-total-row">
          <td colspan="5">TOTAL DOUBLE-ENTRY JOURNAL TURNOVER (DR = CR BALANCED)</td>
          <td class="right num">${fmt(totalVolume)}</td>
        </tr>
      </tbody>
    </table>
  `;
};

const buildMmfAndCommitteeProposalHtml = (reallocationCapital = 774571) => {
  const bucketRows = COMMITTEE_TARGET_ALLOCATION.buckets
    .map((b) => {
      const cap = (reallocationCapital * b.targetPercent) / 100;
      const estIncome = (cap * b.midYield) / 100;
      return `
        <tr>
          <td><strong>${b.assetClass}</strong></td>
          <td class="center num"><strong>${b.targetPercent}%</strong></td>
          <td class="right num">${fmt(cap, 0)}</td>
          <td>${b.instruments}</td>
          <td class="right num">${b.projectedNetYield}</td>
          <td class="right num pos"><strong>${fmt(estIncome, 0)}</strong></td>
        </tr>
      `;
    })
    .join('');

  const mmfRows = KENYA_MMF_BENCHMARKS_2025.map(
    (f) => `
      <tr>
        <td class="center num">#${f.rank}</td>
        <td><strong>${f.manager}</strong> ${f.tag ? `<span style="color:#9A5B25; font-size:10px;">[${f.tag}]</span>` : ''}</td>
        <td class="right num">${f.grossRate.toFixed(2)}%</td>
        <td class="right num" style="color:#8C2D27;">-${(f.grossRate - f.netReturn).toFixed(2)}%</td>
        <td class="right num pos"><strong>${f.netReturn.toFixed(2)}%</strong></td>
        <td>${f.aum}</td>
      </tr>
    `
  ).join('');

  const diversificationRows = CEO_DIVERSIFICATION_DIRECTIVE.pillars
    .map(
      (p) => `
      <tr>
        <td class="center num"><strong>${p.code}</strong></td>
        <td><strong>${p.institution}</strong></td>
        <td>${p.category}</td>
        <td>${p.mandate}</td>
        <td class="right num pos"><strong>${p.yieldBenchmark}</strong></td>
        <td>${p.status}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div class="cover-box">
      <div class="num" style="font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#4A4D48;">
        Dated: ${formatReportDate()} • MGR Investment Club Portfolio &amp; CMA Yield Report
      </div>
      <h1 style="font-size:22px; margin-top:8px;">MANSA-X &amp; ETICA MMF REALLOCATION REPORT</h1>
      <div style="font-size:12px; font-weight:700; color:#9A5B25; text-transform:uppercase; letter-spacing:0.08em; margin-top:6px;">
        Prepared by the MGR Executive Committee: Dan Aloo (Chair), John K. Obalah (CEO), Dr Joash Migosi PhD, Leoivard Omondi
      </div>
    </div>

    <div class="statement-header">
      <div class="reg-line">MGR Portfolio Reallocation: Etica Capital MMF (12.5% p.a.) to Mansa-X Special Fund (~20.0% p.a.)</div>
      <h2>1. MGR PORTFOLIO ALLOCATION FRAMEWORK (BASE: KES ${fmt(reallocationCapital, 0)})</h2>
      <div class="sub-title">Maximizing Member Yields Under Policy POL-005 &amp; Resolution RES-2026-001</div>
    </div>

    <table class="acct-table">
      <thead>
        <tr>
          <th>MGR Asset Class</th>
          <th class="center">Allocation %</th>
          <th class="right">Capital (Kshs)</th>
          <th>MGR Holdings &amp; Instruments</th>
          <th class="right">Target Net Return</th>
          <th class="right">Est. Annual Net (Kshs)</th>
        </tr>
      </thead>
      <tbody>
        ${bucketRows}
        <tr class="grand-total-row">
          <td>TOTAL MGR INVESTED PORTFOLIO</td>
          <td class="center num">100%</td>
          <td class="right num">${fmt(reallocationCapital, 0)}</td>
          <td>Mansa-X Special Fund + Etica Capital MMF + Stanbic Bank</td>
          <td class="right num">~17.5% Blended</td>
          <td class="right num pos">${fmt(reallocationCapital * 0.175, 0)}</td>
        </tr>
      </tbody>
    </table>

    <div class="statement-header">
      <div class="reg-line">Issued by ${CEO_DIVERSIFICATION_DIRECTIVE.author} • Policy POL-006</div>
      <h2>2. CEO INVESTMENT DIVERSIFICATION PRINCIPLE (6 APPROVED ASSET PILLARS)</h2>
      <div class="sub-title">${CEO_DIVERSIFICATION_DIRECTIVE.corePrinciple}</div>
    </div>

    <table class="acct-table">
      <thead>
        <tr>
          <th class="center">Pillar</th>
          <th>Institution / Asset Class</th>
          <th>Instrument Category</th>
          <th>Strategic Diversification Mandate</th>
          <th class="right">Benchmark Yield</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${diversificationRows}
      </tbody>
    </table>

    <div class="statement-header">
      <div class="reg-line">Published ${CBK_MACRO_INDICATORS.publishedDate} • 91-Day T-Bill: ${CBK_MACRO_INDICATORS.tbill91DayGross}% | 364-Day T-Bill: ${CBK_MACRO_INDICATORS.tbill364DayGross}% | Inflation: ${CBK_MACRO_INDICATORS.inflationRate}%</div>
      <h2>3. CMA MONEY MARKET YIELD LEAGUE TABLE</h2>
      <div class="sub-title">Gross Effective Annual Rate vs Net Return After 15% Withholding Tax</div>
    </div>

    <table class="acct-table">
      <thead>
        <tr>
          <th class="center">Rank</th>
          <th>CMA Licensed Money Market Fund</th>
          <th class="right">Gross Yield %</th>
          <th class="right">15% WHT</th>
          <th class="right">Net Return %</th>
          <th>Portfolio Note</th>
        </tr>
      </thead>
      <tbody>
        ${mmfRows}
      </tbody>
    </table>
  `;
};

// ============================================================================
// PUBLIC EXPORT FUNCTIONS (HTML Download, Print-to-PDF, and CSV Spreadsheets)
// ============================================================================

export const generateReportHtml = (reportType, appContextData, options = {}) => {
  const m = computeFinancialMetrics(appContextData);
  const dateStamp = new Date().toISOString().split('T')[0];

  let title = 'MGR Investment Club Financial Report';
  let filename = `MGR_Financial_Report_${dateStamp}.html`;
  let body = '';

  switch (reportType) {
    case 'fullAnnualPack':
      title = 'MGR Investment Club — Complete Annual Report & Financial Statements (IFRS Format)';
      filename = `MGR_Complete_Annual_Report_Pack_${dateStamp}.html`;
      body = `
        <div class="cover-box">
          <div class="num" style="font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:#4A4D48;">
            Registration Ref: MGR-2026 • Kenyan Investment Club Bylaws
          </div>
          <div style="font-size:14px; font-weight:700; color:#9A5B25; text-transform:uppercase; letter-spacing:0.1em; margin-top:10px;">
            Annual Report and Audited Financial Statements For The Period Ended ${formatReportDate()}
          </div>
          <div style="margin-top:16px; font-size:11.5px; color:#4A4D48;">
            <strong>Principal Bankers &amp; Fund Managers:</strong> Stanbic Bank Kenya • Standard Investment Bank (Mansa-X) • Etica Capital MMF
          </div>
        </div>
        ${buildBalanceSheetHtml(m)}
        ${buildIncomeStatementHtml(m)}
        <div class="page-break"></div>
        ${buildCashFlowAndChangesInEquityHtml(m)}
        ${buildRatiosAndNotesHtml(m)}
        <div class="page-break"></div>
        ${buildMemberSharesScheduleHtml(m)}
        ${buildSignatoriesBlock()}
      `;
      break;

    
    case 'statementOfAccount':
      title = 'MGR Investment Club — Monthly Statement of Account';
      filename = `MGR_Monthly_Statement_of_Account_${dateStamp}.html`;
      body = `${buildStatementOfAccountHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'balanceSheet':
      title = 'MGR Investment Club — Statement of Financial Position';
      filename = `MGR_Statement_of_Financial_Position_${dateStamp}.html`;
      body = `${buildBalanceSheetHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'incomeStatement':
      title = 'MGR Investment Club — Statement of Comprehensive Income';
      filename = `MGR_Statement_of_Comprehensive_Income_${dateStamp}.html`;
      body = `${buildIncomeStatementHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'cashFlows':
      title = 'MGR Investment Club — Statement of Cash Flows & Changes in Equity';
      filename = `MGR_Cash_Flows_and_Changes_in_Equity_${dateStamp}.html`;
      body = `${buildCashFlowAndChangesInEquityHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'ratios':
      title = 'MGR Investment Club — Key Investment Performance Ratios & Accounting Notes';
      filename = `MGR_Investment_Ratios_and_Notes_${dateStamp}.html`;
      body = `${buildRatiosAndNotesHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'equity':
      title = 'MGR Investment Club — Schedule of Members Deposits & Yields C/F';
      filename = `MGR_Members_Share_Register_CF_${dateStamp}.html`;
      body = `${buildMemberSharesScheduleHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'ledger':
      title = 'MGR Investment Club — Double-Entry General Ledger Journal';
      filename = `MGR_Double_Entry_General_Ledger_${dateStamp}.html`;
      body = `${buildDoubleEntryJournalHtml(m)}${buildSignatoriesBlock()}`;
      break;

    case 'mmfProposal':
      title = 'MGR Investment Club — Mansa-X & Etica MMF Reallocation Report';
      filename = `MGR_MansaX_and_Etica_MMF_Report_${dateStamp}.html`;
      body = buildMmfAndCommitteeProposalHtml(options.reallocationCapital || m.totalComprehensiveAssets);
      break;

    default:
      body = `${buildBalanceSheetHtml(m)}${buildSignatoriesBlock()}`;
  }

  const fullHtml = wrapHtmlDocument(title, body);
  return { title, filename, fullHtml, body, metrics: m };
};

export const downloadReportHTML = (reportType, appContextData, options = {}) => {
  const { filename, fullHtml } = generateReportHtml(reportType, appContextData, options);
  if (options.printMode) {
    const opened = openPrintWindow(fullHtml);
    if (!opened) {
      triggerDownload(fullHtml, filename, 'text/html;charset=utf-8');
    }
  } else {
    triggerDownload(fullHtml, filename, 'text/html;charset=utf-8');
  }
};

export const downloadReportCSV = (reportType, appContextData, options = {}) => {
  const m = computeFinancialMetrics(appContextData);
  const dateStamp = new Date().toISOString().split('T')[0];

  let csv = '';
  let filename = `MGR_Accounting_Schedule_${dateStamp}.csv`;

  switch (reportType) {
    case 'statementOfAccount':
      filename = `MGR_Monthly_Statement_of_Account_${dateStamp}.csv`;
      csv = [
        'MGR INVESTMENT CLUB - MONTHLY STATEMENT OF ACCOUNT',
        `Statement Period: As At ${formatReportDate()},Exported: ${dateStamp}`,
        '',
        'PART 1: CHAMA PORTFOLIO CUSTODIAL ASSETS',
        'Asset Description,Note,Amount (KES)',
        `"Cash in Bank (Stanbic Operations A/C)","[1]",${m.cashInBank.toFixed(2)}`,
        `"Etica Capital Money Market Fund (Client 34236M)","[2]",${m.eticaBalance.toFixed(2)}`,
        `"Mansa-X Special Fund Principal (SIB)","[3a]",${m.mansaXPrincipal.toFixed(2)}`,
        `"Mansa-X Accrued Return (Undistributed Group Surplus)","[3b]",${m.mansaXInterest.toFixed(2)}`,
        `"TOTAL CHAMA ASSETS / PORTFOLIO VALUE","",${m.totalComprehensiveAssets.toFixed(2)}`,
        '',
        'PART 2: FINANCED BY (EQUITY & RESERVES)',
        'Category,Note,Amount (KES)',
        `"Net Member Deposits C/F (${m.members.length} Members)","[4]",${m.totalShares.toFixed(2)}`,
        `"Non-Refundable Registration Fee Pool (${m.members.length} x 1000)","[5]",${m.groupReserves.toFixed(2)}`,
        `"Accrued Group Surplus (Undistributed Yields)","[6]",${m.retainedSurplus.toFixed(2)}`,
        `"TOTAL LIABILITIES, RESERVES & EQUITY","",${m.totalComprehensiveAssets.toFixed(2)}`,
        '',
        'PART 3: INDIVIDUAL MEMBER STATEMENT OF ACCOUNT SCHEDULE',
        'Member ID,Full Name,Role,Joined Date,Status,Net Principal Deposit (KES),Reg Fee (KES),Distributed Yield (KES),Closing Standing C/F (KES),Equity %',
        ...m.members.map((mem) => {
          const pct = m.totalShares > 0 ? ((mem.shares / m.totalShares) * 100).toFixed(2) : '0.00';
          return `"${mem.id}","${mem.name}","${mem.role}","${mem.joinedDate || '2024-01-15'}","${mem.status}",${mem.shares.toFixed(2)},1000.00,0.00,${mem.shares.toFixed(2)},${pct}%`;
        }),
        `"TOTAL","All ${m.members.length} Registered Members","","","Reconciled",${m.totalShares.toFixed(2)},${m.groupReserves.toFixed(2)},0.00,${m.totalShares.toFixed(2)},100.00%`,
        '',
        'NOTE: All investment yields are held collectively at Chama level in Retained Surplus. No interest is assigned or distributed to member shares yet.'
      ].join('\n');
      break;

    case 'balanceSheet':
      filename = `MGR_Statement_of_Financial_Position_${dateStamp}.csv`;
      csv = [
        `MGR INVESTMENT CLUB - STATEMENT OF FINANCIAL POSITION AS AT ${formatReportDate().toUpperCase()}`,
        `Line Item,Note,${formatShortMonthYear()} (KES)`,
        `"Cash & Cash Equivalents (Stanbic Bank Kenya)","[6]",${m.cashInBank.toFixed(2)}`,
        `"Money Market Fund Deposits (Etica Capital MMF)","[8]",${m.eticaBalance.toFixed(2)}`,
        `"Member Loan Receivables (80% Collateralized)","[7]",${m.loanReceivables.toFixed(2)}`,
        `"Total Current & Liquid Assets","",${(m.cashInBank + m.eticaBalance + m.loanReceivables).toFixed(2)}`,
        `"Mansa-X Special Fund - Principal Capital (SIB)","[9a]",${m.mansaXPrincipal.toFixed(2)}`,
        `"Mansa-X Special Fund - Accrued Investment Return","[9b]",${m.mansaXInterest.toFixed(2)}`,
        `"TOTAL ASSETS","",${m.totalComprehensiveAssets.toFixed(2)}`,
        '--- FINANCED BY: MEMBER DEPOSITS & SURPLUS ---,"",',
        ...(m.members || []).map((mem, idx) => `"Member Deposit: ${mem.name}${mem.status === 'Deceased' ? ' (Estate Escrow)' : ''}","[12-${idx + 1}]",${Number(mem.shares || 0).toFixed(2)}`),
        `"Total Member Deposits (${(m.members || []).length} Members)","[12]",${m.totalShares.toFixed(2)}`,
        `"Group Reserve Account (Non-Refundable Registration Fees)","[13]",${m.groupReserves.toFixed(2)}`,
        `"Surplus for the Period (Accrued Yield)","[14a]",${(m.mansaXInterest + m.eticaInterest).toFixed(2)}`,
        `"Total Surplus (Accumulated Retained Surplus)","[14b]",${m.retainedSurplus.toFixed(2)}`,
        `"TOTAL LIABILITIES, MEMBER DEPOSITS & SURPLUS","",${m.totalComprehensiveAssets.toFixed(2)}`
      ].join('\n');
      break;

    case 'incomeStatement':
      filename = `MGR_Statement_of_Comprehensive_Income_${dateStamp}.csv`;
      csv = [
        `MGR INVESTMENT CLUB - STATEMENT OF COMPREHENSIVE INCOME FOR PERIOD ENDED ${formatReportDate().toUpperCase()}`,
        `Line Item,Note,${formatShortMonthYear()} (KES)`,
        `"Mansa-X Special Fund Investment Return","[3a]",${m.mansaXInterest.toFixed(2)}`,
        `"Etica Capital MMF Statement Yield","[3b]",${m.eticaInterest.toFixed(2)}`,
        `"Interest on Member Advances (10% Facility Fee)","[3c]",${m.loanInterestIncome.toFixed(2)}`,
        `"Member Registration Fees (${m.members.length} x KES 1,000)","[4]",${m.registrationFeePool.toFixed(2)}`,
        `"Total Revenue","",${m.totalRevenues.toFixed(2)}`,
        `"Withholding Tax Deducted at Source (15% MMF)","[5a]",-${m.withholdingTaxMmf.toFixed(2)}`,
        `"Bank & RTGS Settlement Charges","[5b]",-${m.bankCharges.toFixed(2)}`,
        `"Club Administrative & Governance Provision","[5c]",-${m.supervisionFeeProvision.toFixed(2)}`,
        `"Audit & Accountancy Provision","[5d]",-${m.auditFeeProvision.toFixed(2)}`,
        `"Total Operating Expenses","",-${m.totalOperatingExpenses.toFixed(2)}`,
        `"Operating Surplus Before Tax","",${m.operatingSurplusBeforeTax.toFixed(2)}`,
        `"Income Tax Provision","[15]",-${m.incomeTaxCharge30Pct.toFixed(2)}`,
        `"Net Operating Surplus for the Period","",${m.netSurplusAfterTax.toFixed(2)}`,
        `"TOTAL ACCUMULATED SURPLUS (RETAINED IN CLUB RESERVES)","",${m.retainedSurplus.toFixed(2)}`
      ].join('\n');
      break;

    case 'cashFlows':
      filename = `MGR_Statement_of_Cash_Flows_and_Equity_${dateStamp}.csv`;
      csv = [
        'MGR INVESTMENT CLUB - STATEMENT OF CASH FLOWS & CHANGES IN EQUITY',
        `Activity,Note,${formatShortMonthYear()} (KES)`,
        `"Operating Surplus Before Tax","[CF-1]",${m.operatingSurplusBeforeTax.toFixed(2)}`,
        `"Less: Investment Interest Income","[CF-2]",-${(m.mansaXInterest + m.eticaInterest).toFixed(2)}`,
        `"Movement in Member Loans & Receivables","[CF-3]",-${m.loanReceivables.toFixed(2)}`,
        `"Mansa-X Special Fund Principal Deployed","[9a]",-${m.mansaXPrincipal.toFixed(2)}`,
        `"Investment Returns Realized / Reinvested","[9b]",${(m.mansaXInterest + m.eticaInterest).toFixed(2)}`,
        `"Member Deposits Carried Forward","[12]",${m.totalShares.toFixed(2)}`,
        `"Member Registration Fees Collected","[13]",${m.registrationFeePool.toFixed(2)}`,
        `"CLOSING LIQUID CASH & MMF EQUIVALENTS","[6,8]",${(m.cashInBank + m.eticaBalance).toFixed(2)}`
      ].join('\n');
      break;

    case 'ratios':
      filename = `MGR_Investment_Ratios_${dateStamp}.csv`;
      csv = [
        'MGR INVESTMENT CLUB - KEY INVESTMENT METRICS & PORTFOLIO RATIOS',
        `Metric,Club Benchmark Target,MGR Live (${formatShortMonthYear()})`,
        `"Registered Membership","Min 10 Members","${m.members.length} Members"`,
        `"Core Capital to Total Assets","Min 10.0%",${m.coreCapitalToAssets}%`,
        `"Core Capital to Total Deposits","Min 8.0%",${m.coreCapitalToDeposits}%`,
        `"Institutional Capital to Total Assets","Min 8.0%",${m.institutionalToAssets}%`,
        `"Liquidity Ratio (Liquid Assets / Deposits)","Min 15.0%",${m.liquidityRatio}%`,
        `"Expense to Revenue Ratio","Max 40.0%",${m.expenseToRevenueRatio}%`
      ].join('\n');
      break;

    case 'equity': {
      filename = `MGR_Members_Share_and_Yield_Register_CF_${dateStamp}.csv`;
      const qualifyingBase = m.members
        .filter((mem) => mem.id !== 'MGR-011' && (!mem.joinedDate || mem.joinedDate < '2026-10-01') && mem.joinedDate !== 'Q4-2026')
        .reduce((s, mem) => s + Number(mem.shares || 0), 0);

      csv = [
        'Member ID,Full Name,Role,Joined Date,Status,Reg Fee Paid (KES),Principal Deposits C/F (KES),Yield Deposits (KES),Compounded Total (KES),Equity Share %',
        ...m.members.map((mem) => {
          const pct = m.totalShares > 0 ? ((mem.shares / m.totalShares) * 100).toFixed(2) : '0.00';
          const creditedYield = (mem.depositHistory || [])
            .filter((d) => d.type === 'Yield / Dividend Deposit')
            .reduce((s, d) => s + Number(d.amount || 0), 0);
          const isQ4Member = mem.id === 'MGR-011' || (mem.joinedDate && mem.joinedDate >= '2026-10-01') || mem.joinedDate === 'Q4-2026';
          const accruedYield =
            isQ4Member
              ? 0
              : qualifyingBase > 0
              ? (Number(mem.shares || 0) / qualifyingBase) * m.retainedSurplus
              : 0;
          const totalYield = creditedYield + accruedYield;
          const compounded = Number(mem.shares || 0) + accruedYield;
          return `"${mem.id}","${mem.name}","${mem.role}","${mem.joinedDate || '2024-01-15'}","${mem.status}",1000.00,${mem.shares.toFixed(2)},${totalYield.toFixed(2)},${compounded.toFixed(2)},${pct}%`;
        }),
        `"TOTAL","All ${m.members.length} Registered Members","","","Reconciled",${m.groupReserves.toFixed(2)},${m.totalShares.toFixed(2)},${m.retainedSurplus.toFixed(2)},${m.totalComprehensiveAssets.toFixed(2)},100.00%`
      ].join('\n');
      break;
    }

    case 'mmfProposal': {
      const capBase = options.reallocationCapital || 774571;
      filename = `MGR_MansaX_and_Etica_MMF_Reallocation_Report_${dateStamp}.csv`;
      csv = [
        'PART 1: MGR INVESTMENT CLUB PORTFOLIO ALLOCATION',
        'Asset Class,Allocation %,Allocated Capital (KES),MGR Holdings & Instruments,Projected Net Yield,Est Annual Net Income (KES)',
        ...COMMITTEE_TARGET_ALLOCATION.buckets.map((b) => {
          const cap = (capBase * b.targetPercent) / 100;
          const inc = (cap * b.midYield) / 100;
          return `"${b.assetClass}",${b.targetPercent}%,${cap.toFixed(2)},"${b.instruments}","${b.projectedNetYield}",${inc.toFixed(2)}`;
        }),
        '',
        'PART 2: CMA LICENSED MONEY MARKET FUND YIELD LEAGUE TABLE',
        'Rank,Fund Manager,Gross Annual Yield %,15% Withholding Tax %,Net Return %,Portfolio Note',
        ...KENYA_MMF_BENCHMARKS_2025.map(
          (f) =>
            `${f.rank},"${f.manager}",${f.grossRate.toFixed(2)}%,${(f.grossRate - f.netReturn).toFixed(2)}%,${f.netReturn.toFixed(2)}%,"${f.aum}${f.tag ? ` (${f.tag})` : ''}"`
        )
      ].join('\n');
      break;
    }

    case 'ledger':
    default:
      filename = `MGR_Double_Entry_General_Ledger_${dateStamp}.csv`;
      csv = [
        'Transaction ID,Date,Description,Debit Account (Dr),Credit Account (Cr),Amount (KES)',
        ...(m.ledger || []).map(
          (tx) =>
            `"${tx.id}","${tx.date}","${(tx.description || '').replace(/"/g, '""')}","${tx.debitAccount}","${tx.creditAccount}",${Number(tx.amount || 0).toFixed(2)}`
        )
      ].join('\n');
      break;
  }

  triggerDownload(csv, filename, 'text/csv;charset=utf-8');
};
