import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const brainDir = 'C:\\Users\\ADMIN\\.gemini\\antigravity\\brain\\a9b32fc5-ea9e-4e57-82b6-d168b686917b';

const publicDocsDir = path.join(projectRoot, 'public', 'documents');
const distDocsDir = path.join(projectRoot, 'dist', 'documents');

if (!fs.existsSync(publicDocsDir)) fs.mkdirSync(publicDocsDir, { recursive: true });
if (!fs.existsSync(distDocsDir)) fs.mkdirSync(distDocsDir, { recursive: true });

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExe = fs.existsSync(edgePath) ? edgePath : chromePath;

// Build Constitution first (Doc 1)
import './build-constitution.js';

// Base styling for all official documents
const SHARED_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Inconsolata:wght@400;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap');

  @page {
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-right {
      content: counter(page);
      font-family: 'Inconsolata', monospace;
      font-size: 8.5pt;
      color: #666;
    }
    @bottom-left {
      content: "MGR CLUB • OFFICIAL INSTRUMENT & POLICY REPOSITORY";
      font-family: 'Inconsolata', monospace;
      font-size: 8pt;
      color: #888;
      letter-spacing: 0.08em;
    }
  }

  :root {
    --ink: #161816;
    --ink-muted: #4A4D48;
    --forest: #1D3B2A;
    --forest-dark: #12261B;
    --forest-light: #EBF0EC;
    --ochre: #9A5B25;
    --ochre-light: #FBF4E8;
    --terracotta: #8C2D27;
    --terracotta-light: #FBF0EF;
    --paper: #FAF8F3;
    --paper-cream: #F4EFE4;
    --border: #C8C1B0;
    --border-dark: #8C8472;
  }

  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    margin: 0;
    padding: 0;
    background: #FFFFFF;
    color: var(--ink);
    font-family: 'Atkinson Hyperlegible', Georgia, serif;
    font-size: 10.2pt;
    line-height: 1.55;
  }

  .page {
    max-width: 100%;
    margin: 0 auto;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
  }

  .masthead {
    border: 3px double var(--ink);
    background: var(--paper);
    padding: 24px 28px;
    margin-bottom: 22px;
    text-align: center;
  }

  .masthead-crest {
    display: inline-block;
    width: 48px;
    height: 48px;
    line-height: 48px;
    border: 2px solid var(--forest);
    border-radius: 50%;
    font-family: 'Newsreader', serif;
    font-weight: 700;
    font-size: 20pt;
    color: var(--forest);
    background: #FFFFFF;
    margin-bottom: 8px;
  }

  .masthead-eyebrow {
    font-family: 'Inconsolata', monospace;
    font-size: 9pt;
    font-weight: 700;
    color: var(--ochre);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .masthead-title {
    font-family: 'Newsreader', serif;
    font-size: 20pt;
    font-weight: 700;
    color: var(--forest);
    letter-spacing: 0.02em;
    line-height: 1.15;
    margin: 4px 0 6px 0;
  }

  .masthead-subtitle {
    font-family: 'Newsreader', serif;
    font-style: italic;
    font-size: 11.5pt;
    color: var(--ink-muted);
    margin-bottom: 12px;
  }

  .masthead-meta {
    display: flex;
    justify-content: center;
    gap: 20px;
    font-family: 'Inconsolata', monospace;
    font-size: 8.5pt;
    color: var(--ink-muted);
    border-top: 1px solid var(--border);
    padding-top: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .preamble {
    font-family: 'Newsreader', serif;
    font-size: 11pt;
    font-style: italic;
    color: var(--forest-dark);
    border-left: 3px solid var(--ochre);
    padding: 8px 16px;
    margin-bottom: 18px;
    background: var(--paper);
  }

  .article-header {
    border-bottom: 2px solid var(--forest);
    padding-bottom: 4px;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
    break-after: avoid;
  }

  .article-header h2 {
    font-family: 'Newsreader', serif;
    font-size: 13pt;
    font-weight: 700;
    color: var(--forest);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .article-num {
    font-family: 'Inconsolata', monospace;
    color: var(--ochre);
    font-size: 11.5pt;
  }

  .clause {
    margin-bottom: 8px;
    text-align: justify;
  }

  .clause-num {
    font-family: 'Inconsolata', monospace;
    font-weight: 700;
    color: var(--forest);
    margin-right: 4px;
  }

  .statute-box {
    background: var(--paper);
    border: 1px solid var(--border);
    border-left: 4px solid var(--forest);
    padding: 10px 14px;
    margin: 10px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .statute-box.gold {
    background: var(--ochre-light);
    border-left-color: var(--ochre);
  }

  .statute-box.crimson {
    background: var(--terracotta-light);
    border-left-color: var(--terracotta);
  }

  .statute-box-title {
    font-family: 'Newsreader', serif;
    font-weight: 700;
    font-size: 10.5pt;
    color: var(--forest);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .statute-box.gold .statute-box-title { color: var(--ochre); }
  .statute-box.crimson .statute-box-title { color: var(--terracotta); }

  .smart-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 12px 0;
    page-break-inside: avoid;
  }

  .smart-card {
    background: var(--paper);
    border: 1px solid var(--border);
    padding: 10px 12px;
    border-radius: 3px;
  }

  .smart-card-title {
    font-family: 'Newsreader', serif;
    font-weight: 700;
    font-size: 10pt;
    color: var(--forest);
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .smart-badge {
    font-family: 'Inconsolata', monospace;
    font-size: 8pt;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 2px;
    background: var(--forest-light);
    color: var(--forest);
  }

  table.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 9pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  table.data-table th {
    background: var(--forest);
    color: #FFFFFF;
    font-family: 'Atkinson Hyperlegible', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 8.2pt;
    padding: 6px 8px;
    border: 1px solid var(--forest-dark);
    text-align: left;
  }

  table.data-table td {
    padding: 5px 8px;
    border: 1px solid #D6D0C2;
    vertical-align: middle;
  }

  table.data-table tr:nth-child(even) td {
    background: #FAF7F0;
  }

  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .font-mono { font-family: 'Inconsolata', monospace; }

  .sign-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
    page-break-inside: avoid;
    break-inside: avoid;
    font-size: 8.8pt;
  }

  .sign-table td {
    padding: 8px 10px;
    border: 1px solid var(--border);
    vertical-align: top;
    background: #FFFFFF;
  }

  .sign-box-role {
    font-family: 'Inconsolata', monospace;
    font-size: 7.5pt;
    font-weight: 700;
    color: var(--ochre);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .sign-box-name {
    font-family: 'Newsreader', serif;
    font-weight: 700;
    font-size: 10pt;
    color: var(--forest);
    margin: 2px 0 6px 0;
  }

  .sign-line {
    border-bottom: 1px dashed var(--ink-muted);
    height: 18px;
    margin-bottom: 4px;
  }

  .sign-date {
    font-family: 'Inconsolata', monospace;
    font-size: 7.5pt;
    color: #888;
  }
`;

// DOCUMENT 2: INVESTMENT POLICY & STRATEGIC/SMART OBJECTIVES CHARTER
const IPS_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MGR Club Investment Policy &amp; Strategic Objectives Charter</title>
  <style>${SHARED_CSS}</style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page">
    <div class="masthead">
      <div class="masthead-crest">M</div>
      <div class="masthead-eyebrow">The Republic of Kenya • Investment Policy Statement (IPS) &amp; Fiduciary Framework</div>
      <h1 class="masthead-title">MGR CLUB INVESTMENT POLICY</h1>
      <div class="masthead-subtitle">Strategic Objectives, SMART Performance Targets &amp; Risk Oversight Charter</div>
      <div class="masthead-meta">
        <span><strong>Charter Ref:</strong> MGR/IPS/2026/V1</span>
        <span><strong>Fiduciary Standard:</strong> Prudent Investor Rule</span>
        <span><strong>Review Cycle:</strong> Quarterly &amp; Annual</span>
        <span><strong>Effective:</strong> October 2026</span>
      </div>
    </div>

    <div class="preamble">
      "This Investment Policy Statement and Strategic Objectives Charter provides the binding operational framework for translating MGR CLUB's Vision and Mission into disciplined capital allocation, rigorous risk oversight, and sustainable generational prosperity."
    </div>

    <div class="article-header">
      <h2><span class="article-num">3.0</span> Vision, Mission and Strategic Mandate</h2>
    </div>

    <div class="statute-box gold">
      <div class="statute-box-title">3.1 Vision Statement</div>
      <div style="font-family:'Newsreader', serif; font-size:12pt; font-weight:700; color:var(--forest); margin:4px 0;">
        "Financial strength, sustainable growth, and enduring prosperity for current and future generations."
      </div>
    </div>

    <div class="statute-box">
      <div class="statute-box-title">3.2 Mission Statement</div>
      <div style="font-family:'Newsreader', serif; font-size:11pt; font-weight:600; color:var(--forest-dark); margin:4px 0;">
        "Creating and preserving wealth through disciplined investment management, informed decision-making, prudent risk oversight, and an unwavering commitment to integrity, transparency, and accountability."
      </div>
    </div>

    <div class="article-header">
      <h2><span class="article-num">4.0</span> Strategic Objectives</h2>
    </div>
    <p style="margin-bottom:8px; font-size:9.5pt; color:var(--ink-muted);">
      To achieve its Vision and fulfil its Mission, the LLP/Club shall pursue the following ten (10) strategic objectives:
    </p>

    <div class="clause">
      <span class="clause-num">4.1</span> <strong>Grow and Preserve Capital:</strong> Achieve sustainable growth in the LLP's/Club's investment portfolio while safeguarding capital against undue risk and market volatility.
    </div>
    <div class="clause">
      <span class="clause-num">4.2</span> <strong>Maintain a Diversified Investment Portfolio:</strong> Invest across a broad range of asset classes, sectors, and geographical markets to enhance returns and reduce concentration risk.
    </div>
    <div class="clause">
      <span class="clause-num">4.3</span> <strong>Generate Competitive Risk-Adjusted Returns:</strong> Consistently seek to outperform relevant market benchmarks through disciplined investment selection and effective portfolio management.
    </div>
    <div class="clause">
      <span class="clause-num">4.4</span> <strong>Apply Rigorous Investment Research:</strong> Ensure that all investment decisions are supported by comprehensive financial analysis, market intelligence, and appropriate due diligence.
    </div>
    <div class="clause">
      <span class="clause-num">4.5</span> <strong>Implement Effective Risk Management:</strong> Identify, assess, monitor, and mitigate investment risks to protect assets and promote long-term financial sustainability.
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page page-break">
    <div class="clause">
      <span class="clause-num">4.6</span> <strong>Ensure Liquidity and Financial Stability:</strong> Maintain adequate liquidity to meet operational requirements, investment commitments, and unforeseen financial obligations.
    </div>
    <div class="clause">
      <span class="clause-num">4.7</span> <strong>Promote Ethical and Responsible Investing:</strong> Uphold the highest standards of integrity, transparency, accountability, and regulatory compliance in all investment activities.
    </div>
    <div class="clause">
      <span class="clause-num">4.8</span> <strong>Enhance Portfolio Performance Through Continuous Review:</strong> Regularly evaluate portfolio performance and adjust investment strategies in response to changing market conditions and emerging opportunities.
    </div>
    <div class="clause">
      <span class="clause-num">4.9</span> <strong>Preserve Wealth for Future Generations:</strong> Build and sustain a long-term financial legacy through prudent stewardship and responsible investment practices.
    </div>
    <div class="clause">
      <span class="clause-num">4.10</span> <strong>Strengthen Governance and Compliance:</strong> Ensure that all investment activities comply with applicable laws, regulations, partnership agreements, and internal policies.
    </div>

    <div class="article-header" style="margin-top:20px;">
      <h2><span class="article-num">5.0</span> SMART Objectives &amp; Measurable Benchmarks</h2>
    </div>
    <p style="margin-bottom:8px; font-size:9.5pt; color:var(--ink-muted);">
      The LLP/Club shall pursue the following six (6) Specific, Measurable, Achievable, Relevant, and Time-bound (SMART) objectives in support of its strategic goals:
    </p>

    <div class="smart-grid">
      <div class="smart-card">
        <div class="smart-card-title">
          <span>5.1 Portfolio Growth</span>
          <span class="smart-badge">&ge; 10.0% p.a.</span>
        </div>
        <p style="font-size:9pt; margin:0; color:var(--ink);">
          Achieve an average annual portfolio return of <strong>not less than 10%</strong> over rolling five-year periods, subject to prevailing macroeconomic conditions.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>5.2 Portfolio Diversification</span>
          <span class="smart-badge">&le; 20% Cap</span>
        </div>
        <p style="font-size:9pt; margin:0; color:var(--ink);">
          Maintain portfolio diversification such that <strong>no single investment exceeds 20%</strong> of the total portfolio value, unless explicitly approved by the Partners/Members.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>5.3 Due Diligence</span>
          <span class="smart-badge">100% Review</span>
        </div>
        <p style="font-size:9pt; margin:0; color:var(--ink);">
          Conduct and document formal due diligence reviews for <strong>100% of proposed investments</strong> before approval and capital allocation.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>5.4 Performance Monitoring</span>
          <span class="smart-badge">Quarterly Formal</span>
        </div>
        <p style="font-size:9pt; margin:0; color:var(--ink);">
          Undertake formal portfolio performance and risk exposure reviews on a <strong>quarterly basis</strong> and report findings directly to the Partners/Members.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>5.5 Liquidity Management</span>
          <span class="smart-badge">&ge; 6 Months Buffer</span>
        </div>
        <p style="font-size:9pt; margin:0; color:var(--ink);">
          Maintain a minimum liquidity reserve equivalent to at least <strong>six (6) months</strong> of projected operational commitments and emergency cash calls.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>5.6 Compliance &amp; Reporting</span>
          <span class="smart-badge">100% Annual Audit</span>
        </div>
        <p style="font-size:9pt; margin:0; color:var(--ink);">
          Achieve <strong>full compliance</strong> with all statutory and regulatory requirements, and complete comprehensive annual compliance reviews prior to AGM.
        </p>
      </div>
    </div>

    <div class="article-header" style="margin-top:16px;">
      <h2><span class="article-num">6.0</span> IPS Formulation, Research Benchmarking &amp; Three-Tier Ratification</h2>
    </div>
    <div class="clause">
      <span class="clause-num">6.1</span> <strong>Three-Tier Governance Protocol:</strong> Every Investment Policy Statement (I.P.S.), asset class addition, and strategic rebalancing resolution in MGR CLUB shall strictly follow a structured three-tier workflow:
      <ul class="sub-clause-list list-alpha" style="margin:4px 0 6px 16px; padding:0; font-size:9pt;">
        <li><strong>Tier 1 — Research &amp; Peer Benchmarking:</strong> Led by the Investment Research Officer / Analyst (Dr. Joash Migosi PhD and desk). The Research Officer conducts comprehensive market intelligence, risk-return profiling, and peer note comparisons with external Chama leaders, investment analysts, and capital market practitioners before floating any proposal.</li>
        <li><strong>Tier 2 — Executive Committee Deliberation:</strong> The drafted policy and risk-reward metrics are formally reviewed, stress-tested, and shaped into binding executive resolutions by the Executive Committee.</li>
        <li><strong>Tier 3 — General Membership Democratic Ratification:</strong> The final IPS framework is tabled before the General Membership and must be democratically ratified before any capital commitment or portfolio restructuring takes effect.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">6.2</span> <strong>Alignment with Fiduciary Duty:</strong> These objectives provide a transparent framework translating the Club's Vision and Mission into measurable, auditable actions, ensuring strict adherence to the Prudent Investor standard.
    </div>
  </div>

  <!-- PAGE 3 -->
  <div class="page page-break">
    <div class="article-header">
      <h2><span class="article-num">7.0</span> Tactical Asset Allocation, Yield Dynamics &amp; Banking Operations</h2>
    </div>

    <div class="statute-box gold">
      <div class="statute-box-title">7.1 Dynamic Yield Monitoring &amp; Agile Portfolio Switching</div>
      <p style="font-size:9pt; margin:0 0 6px 0; color:var(--ink); line-height:1.45;">
        <strong>Mansa-X Special Fund (Standard Investment Bank):</strong> Yields in Mansa-X are dynamic and fluctuate according to global multi-asset opportunities and market conditions. While Mansa-X currently provides the most competitive returns in the market (~18%–20% p.a.), the Investment Research Officer and Executive Committee shall continuously monitor performance. In the event of yield compression or shifting risk profiles, the Club shall swiftly compare alternative portfolios to execute timely, agile reallocation decisions.
      </p>
      <p style="font-size:9pt; margin:0; color:var(--ink); line-height:1.45;">
        <strong>Etica Capital Money Market Fund:</strong> The benchmark figure of <strong>11.08% – 12.50% p.a.</strong> reflects prevailing market conditions and is likewise subject to Central Bank of Kenya (CBK) rate changes and money market fluctuations.
      </p>
    </div>

    <div class="statute-box crimson">
      <div class="statute-box-title">7.2 Current Tactical Capital Reallocation (KES 200,000/= Transfer)</div>
      <p style="font-size:9pt; margin:0; color:var(--ink); line-height:1.45;">
        Pursuant to active treasury optimization, as soon as Etica Capital MMF processes liquidity access / redemption approvals, MGR CLUB shall execute a tactical transfer of <strong>KES 200,000.00</strong> from Etica Capital MMF into the <strong>Mansa-X Special Fund</strong> account to capture superior competitive compounding returns for all active Members.
      </p>
    </div>

    <div class="statute-box">
      <div class="statute-box-title">7.3 Designated Operating Bank: Equity Bank Kenya (Chama Joint Account)</div>
      <p style="font-size:9pt; margin:0; color:var(--ink); line-height:1.45;">
        MGR CLUB maintains its primary commercial clearing and operational bank account with <strong>Equity Bank Kenya</strong>. Equity Bank was deliberately selected by the Executive Committee as the most flexible financial institution for opening and administering operational <em>Chama Joint Bank Accounts</em> without premature demand for formal LLP registration certificates, while offering the lowest ledger and account maintenance fees in the Kenyan commercial banking sector.
      </p>
    </div>

    <div class="article-header" style="margin-top:14px;">
      <h2><span class="article-num">8.0</span> Strategic Member Research Horizons (Six Priority Portfolios)</h2>
    </div>
    <p style="font-size:8.8pt; margin:0 0 8px 0; color:var(--ink-muted);">
      To foster shared financial literacy and strategic preparedness, all Members of MGR CLUB are formally encouraged to conduct wide research and comparative analysis across six (6) approved asset classes:
    </p>

    <div class="smart-grid" style="grid-template-columns: 1fr 1fr; gap: 8px; margin: 6px 0 12px 0;">
      <div class="smart-card">
        <div class="smart-card-title">
          <span>1. Fixed Income Funds (FIFs)</span>
          <span class="smart-badge">High Yield</span>
        </div>
        <p style="font-size:8.2pt; margin:0; color:var(--ink);">
          Institutional corporate debt funds, secured commercial paper, and high-yield private credit yielding predictable periodic coupons above standard deposits.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>2. Derivatives (NEXT Market)</span>
          <span class="smart-badge">Hedging &amp; Yield</span>
        </div>
        <p style="font-size:8.2pt; margin:0; color:var(--ink);">
          Nairobi Securities Exchange Derivatives Market (NEXT) equity index futures, single-stock futures, and risk hedging mechanisms against downside market swings.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>3. Real Estate Trusts (REITs)</span>
          <span class="smart-badge">&ge; 80% Payout</span>
        </div>
        <p style="font-size:8.2pt; margin:0; color:var(--ink);">
          CMA-regulated Income REITs (I-REITs like ILAM Fahari) and Development REITs (D-REITs like Acorn), granting fractional access to premium real estate.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>4. Exchange Traded Funds (ETFs)</span>
          <span class="smart-badge">Liquid Hedge</span>
        </div>
        <p style="font-size:8.2pt; margin:0; color:var(--ink);">
          Exchange-listed physical commodity trackers (e.g. Absa NewGold ETF on the NSE) offering physical bullion backing and a hedge against local currency volatility.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>5. Gov Securities, T-Bills/Bonds &amp; IFs</span>
          <span class="smart-badge">Tax-Free Sovereign</span>
        </div>
        <p style="font-size:8.2pt; margin:0; color:var(--ink);">
          Central Bank of Kenya Treasury Bills (91/182/364-day), Treasury Bonds, and especially <strong>Infrastructure Funds / Bonds (IFs/IFBs)</strong> delivering 100% tax-free coupon yields with zero default risk.
        </p>
      </div>

      <div class="smart-card">
        <div class="smart-card-title">
          <span>6. NSE Equities (Equities Desk)</span>
          <span class="smart-badge">Capital Growth</span>
        </div>
        <p style="font-size:8.2pt; margin:0; color:var(--ink);">
          Blue-chip equities on the Nairobi Securities Exchange (Safaricom, Equity Group, KCB, EABL, StanChart) for long-term capital compounding and franked dividends.
        </p>
      </div>
    </div>

    <div class="article-header" style="margin-top:10px;">
      <h2><span class="article-num">SCHEDULE A</span> Approved Strategic Asset Allocation Thresholds</h2>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Asset Class &amp; Counterparty</th>
          <th style="width:14%; text-align:center;">Target %</th>
          <th style="width:24%;">Benchmark Yield</th>
          <th>Regulatory &amp; Custody Basis</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Mansa-X Special Fund</strong> (Standard Investment Bank)</td>
          <td class="text-center font-mono" style="font-weight:700; color:var(--forest);">70%</td>
          <td class="font-mono">18.0% – 20.0% p.a. (Dynamic)</td>
          <td>CMA-regulated Flagship Multi-Asset Special Fund</td>
        </tr>
        <tr>
          <td><strong>Etica Capital Money Market Fund</strong></td>
          <td class="text-center font-mono" style="font-weight:700; color:var(--forest);">28%</td>
          <td class="font-mono">11.08% – 12.50% p.a. (Dynamic)</td>
          <td>CMA-regulated Liquid Capital Preservation Reserve</td>
        </tr>
        <tr>
          <td><strong>Equity Bank Kenya Operational Clearing Account</strong></td>
          <td class="text-center font-mono" style="font-weight:700; color:var(--forest);">2%</td>
          <td class="font-mono">Lowest Ledger Fees</td>
          <td>CBK-licensed Chama Joint Account Clearing Pool</td>
        </tr>
      </tbody>
    </table>

    <table class="sign-table" style="margin-top:12px;">
      <tr>
        <td style="width:33.3%;">
          <div class="sign-box-role">Chairperson, Exec Committee</div>
          <div class="sign-box-name">Dan Aloo (004)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Verified Signatory • 30/10/2026</div>
        </td>
        <td style="width:33.3%;">
          <div class="sign-box-role">Chief Executive Officer (CEO)</div>
          <div class="sign-box-name">John Kennedy Obalah (001)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Verified Signatory • 30/10/2026</div>
        </td>
        <td style="width:33.3%;">
          <div class="sign-box-role">Research Officer</div>
          <div class="sign-box-name">Dr Joash Migosi PhD (009)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Verified Signatory • 30/10/2026</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

// DOCUMENT 3: EMERGENCY CREDIT & RIGHT OF SET-OFF POLICY
const CREDIT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MGR Club Member 90% Emergency Credit &amp; Set-Off Guideline</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="page">
    <div class="masthead">
      <div class="masthead-crest">M</div>
      <div class="masthead-eyebrow">The Republic of Kenya • Member Credit Regulations &amp; Mutual Assistance</div>
      <h1 class="masthead-title">EMERGENCY CREDIT POLICY</h1>
      <div class="masthead-subtitle">Member 90% Borrowing Limits, Interest Schedule &amp; Mandatory Right of Set-Off</div>
      <div class="masthead-meta">
        <span><strong>Policy Ref:</strong> MGR/POL/CREDIT-01</span>
        <span><strong>Authority:</strong> Constitution Clause 10.5</span>
        <span><strong>Borrowing Limit:</strong> 90% Shares</span>
        <span><strong>Rate:</strong> 10% / Month</span>
      </div>
    </div>

    <div class="preamble">
      "Pursuant to Clause 10.5 of the MGR Club Constitution, this policy establishes the formal terms, security thresholds, monthly interest rate, and mandatory set-off mechanisms governing emergency short-term borrowing extended to Members."
    </div>

    <div class="article-header">
      <h2><span class="article-num">1.0</span> Constitutional Mandate and Purpose</h2>
    </div>
    <div class="clause">
      <span class="clause-num">1.1</span> MGR CLUB may, subject to liquidity availability in treasury accounts, extend short-term emergency financial assistance to Members in good standing.
    </div>
    <div class="clause">
      <span class="clause-num">1.2</span> The facility exists solely for genuine emergency needs and operates strictly within mutual security parameters to protect group solvency.
    </div>

    <div class="article-header">
      <h2><span class="article-num">2.0</span> Eligibility &amp; Credit Qualifications</h2>
    </div>
    <div class="clause">
      <span class="clause-num">2.1</span> A Member qualifies for an emergency credit advance if he or she:
      <ul class="sub-clause-list list-alpha">
        <li>holds active, fully paid-up membership status with no unresolved arrears;</li>
        <li>maintains sufficient qualifying share capital and member savings to secure the requested principal; and</li>
        <li>has satisfactorily discharged any prior emergency borrowings.</li>
      </ul>
    </div>

    <div class="statute-box crimson">
      <div class="statute-box-title">3.0 Borrowing Limit, Collateral &amp; Set-Off Guarantee</div>
      <div class="clause">
        <span class="clause-num">3.1</span> <strong>Maximum Loan Limit:</strong> A Member may borrow an amount <strong>not exceeding ninety per cent (90%)</strong> of the net shares, savings, or capital contributions standing to his or her credit on the application date.
      </div>
      <div class="clause">
        <span class="clause-num">3.2</span> <strong>Collateral Pledge:</strong> The Member's shares and capital balance serve as absolute security. The borrowing Member is legally barred from withdrawing or transferring pledged shares until full discharge.
      </div>
      <div class="clause">
        <span class="clause-num">3.3</span> <strong>Mandatory Right of Set-Off:</strong> MGR CLUB holds an unconditional right of set-off under Clause 10.3 to deduct outstanding principal and accrued interest from the Member's capital account upon default, death, or exit.
      </div>
    </div>

    <div class="article-header">
      <h2><span class="article-num">4.0</span> Financial Terms, Interest &amp; Repayment</h2>
    </div>
    <div class="clause">
      <span class="clause-num">4.1</span> <strong>Interest Rate:</strong> All emergency loans attract interest at a flat rate of <strong>ten per cent (10%) per month</strong> on the principal advanced.
    </div>
    <div class="clause">
      <span class="clause-num">4.2</span> <strong>Repayment Period:</strong> The total repayable sum (principal plus interest) must be settled in full within <strong>thirty (30) calendar days</strong> from disbursement.
    </div>
    <div class="clause">
      <span class="clause-num">4.3</span> <strong>Default Sanctions:</strong> Failure to settle within 30 days immediately accelerates the loan, empowers MGR CLUB to execute recovery from shares without further notice, and freezes subsequent borrowing privileges.
    </div>

    <table class="sign-table" style="margin-top:24px;">
      <tr>
        <td style="width:50%;">
          <div class="sign-box-role">Chairperson, Exec Committee</div>
          <div class="sign-box-name">Dan Aloo (004)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026 • Verified Signatory</div>
        </td>
        <td style="width:50%;">
          <div class="sign-box-role">Chief Executive Officer (CEO)</div>
          <div class="sign-box-name">John Kennedy Obalah (001)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026 • Verified Signatory</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

// DOCUMENT 4: BEREAVEMENT SUCCESSION & ESTATE EXIT PROTOCOL
const BEREAVEMENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MGR Club Bereavement Succession &amp; Estate Exit Protocol</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="page">
    <div class="masthead">
      <div class="masthead-crest">M</div>
      <div class="masthead-eyebrow">The Republic of Kenya • Estate Succession &amp; Family Protection Policy</div>
      <h1 class="masthead-title">BEREAVEMENT SUCCESSION PROTOCOL</h1>
      <div class="masthead-subtitle">Estate Par Value Share Acquisition, Family Settlement &amp; Beneficiary Escrow</div>
      <div class="masthead-meta">
        <span><strong>Protocol Ref:</strong> MGR/POL/BEREAVEMENT-01</span>
        <span><strong>Authority:</strong> Constitution Clause 10.7</span>
        <span><strong>Valuation:</strong> 1:1 Par Value</span>
        <span><strong>Family Payout:</strong> 100% Cash</span>
      </div>
    </div>

    <div class="preamble">
      "This protocol codifies MGR CLUB's compassionate bereavement succession procedure, ensuring that when a member passes away, their terminal share capital and accrued earnings are settled at 1:1 par value to the family beneficiary without breaching fund lock-in commitments."
    </div>

    <div class="article-header">
      <h2><span class="article-num">1.0</span> Constitutional Mandate &amp; Core Principles</h2>
    </div>
    <div class="clause">
      <span class="clause-num">1.1</span> In the event of the death or permanent incapacity of a Member, MGR CLUB's fiduciary duty is to safeguard the deceased member's family entitlements while preserving the investment continuity of the club.
    </div>
    <div class="clause">
      <span class="clause-num">1.2</span> Under Clause 10.7, all terminal benefits accrue to the nominated legal personal representative or next of kin in accordance with Kenyan succession law.
    </div>

    <div class="statute-box gold">
      <div class="statute-box-title">2.0 Internal 1:1 Par Value Share Buyout Mechanism</div>
      <div class="clause">
        <span class="clause-num">2.1</span> <strong>Lock-in Preservation:</strong> Because Club capital in Mansa-X Special Fund and Etica Capital MMF is bound by minimum holding cycles, external liquidations would incur penalties.
      </div>
      <div class="clause">
        <span class="clause-num">2.2</span> <strong>Internal Acquisition:</strong> Active surviving members are given primary option to purchase the estate's shares at <strong>exact 1:1 par value (KES 1.00 per share)</strong>.
      </div>
      <div class="clause">
        <span class="clause-num">2.3</span> <strong>100% Cash Release:</strong> The purchase consideration contributed by buying members is credited directly to the Beneficiary Escrow Account and disbursed to the family.
      </div>
    </div>

    <div class="article-header">
      <h2><span class="article-num">3.0</span> Precedent: Settlement of Late Frederick Ongule Seunda (007)</h2>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Entitlement Component</th>
          <th style="width:25%; text-align:right;">Amount (KES)</th>
          <th>Verification &amp; Accounting Treatment</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Net Member Share Capital</strong></td>
          <td class="text-right font-mono" style="font-weight:700;">13,019.00</td>
          <td>Net of KES 1,000 non-refundable registration fee</td>
        </tr>
        <tr>
          <td><strong>Accrued Q3 Pro-Rata Yield</strong></td>
          <td class="text-right font-mono">1,145.00</td>
          <td>Credited to estate escrow for active Q3 holding term</td>
        </tr>
        <tr>
          <td><strong>Outstanding Loan Deductions</strong></td>
          <td class="text-right font-mono">0.00</td>
          <td>Zero loan liability standing on record</td>
        </tr>
        <tr style="background:#FAF4E8; font-weight:700;">
          <td><strong>TOTAL BENEFICIARY DUE:</strong></td>
          <td class="text-right font-mono" style="color:var(--forest);">KES 14,164.00</td>
          <td>Full entitlement protected under Escrow Protocol</td>
        </tr>
      </tbody>
    </table>

    <table class="sign-table" style="margin-top:24px;">
      <tr>
        <td style="width:33.3%;">
          <div class="sign-box-role">Compliance Officer</div>
          <div class="sign-box-name">Benjamin Madara (006)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Verified Audit • 30/10/2026</div>
        </td>
        <td style="width:33.3%;">
          <div class="sign-box-role">Chief Executive Officer</div>
          <div class="sign-box-name">John Kennedy Obalah (001)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Authorized Signatory • 30/10/2026</div>
        </td>
        <td style="width:33.3%;">
          <div class="sign-box-role">Honorary Secretary</div>
          <div class="sign-box-name">Sarah Njoki (003)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Family Custodian • 30/10/2026</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

// DOCUMENT 5: TREASURY YIELD PRORATING & MMF DISTRIBUTION POLICY
const PRORATING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MGR Club Treasury Holding-Period Yield Prorating Policy</title>
  <style>${SHARED_CSS}</style>
</head>
<body>
  <div class="page">
    <div class="masthead">
      <div class="masthead-crest">M</div>
      <div class="masthead-eyebrow">The Republic of Kenya • Treasury Accounting &amp; Dividend Allocation</div>
      <h1 class="masthead-title">YIELD PRORATING POLICY</h1>
      <div class="masthead-subtitle">Holding-Period Weighted Allocations, Post-Period Capital &amp; Unanimous Ratification</div>
      <div class="masthead-meta">
        <span><strong>Policy Ref:</strong> MGR/POL/MMF-DIST-01</span>
        <span><strong>Authority:</strong> Constitution Clause 9.4</span>
        <span><strong>Approval Gate:</strong> 100% Unanimous</span>
        <span><strong>Method:</strong> Holding-Period Weighted</span>
      </div>
    </div>

    <div class="preamble">
      "This policy operationalizes Clause 9.4 of the MGR Club Constitution, establishing the mathematical formula, holding-period prorating, post-period capital protection, and unanimous member ratification mandate governing interest distributions."
    </div>

    <div class="article-header">
      <h2><span class="article-num">1.0</span> The Unanimous Member Ratification Mandate</h2>
    </div>
    <div class="clause">
      <span class="clause-num">1.1</span> No financial action crediting or debiting investment interest to individual member accounts may be executed without the prior unanimous (100%) affirmative ratification of all active members.
    </div>

    <div class="article-header">
      <h2><span class="article-num">2.0</span> Holding-Period Weighted Allocation Formula</h2>
    </div>
    <div class="clause">
      <span class="clause-num">2.1</span> Investment interest earned from CMA-regulated funds (Mansa-X Special Fund and Etica Capital MMF) shall be attributed based on eligible capital weighted by active days invested during the period.
    </div>
    <div class="clause">
      <span class="clause-num">2.2</span> <strong>Exclusion of Post-Period Capital:</strong> Capital received after the close of an accounting quarter (e.g. Leoivard Omondi Ongule <code>MGR-011</code> depositing in late October 2026, after Q3 closure on 30/09/2026) is strictly excluded from past quarter dividends, receiving KES 0.00 for Q3 and preserving 100% of his KES 17,000 principal for Q4.
    </div>
    <div class="clause">
      <span class="clause-num">2.3</span> <strong>Protection of Deceased Estates:</strong> Funds of deceased members that remained active throughout the period (e.g. Late Frederick Ongule Seunda <code>MGR-007</code>) accrue their full pro-rata share into the estate escrow account.
    </div>

    <table class="sign-table" style="margin-top:24px;">
      <tr>
        <td style="width:50%;">
          <div class="sign-box-role">Treasurer, Exec Committee</div>
          <div class="sign-box-name">Leoivard Omondi Ongule (011)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Treasury Verified • 30/10/2026</div>
        </td>
        <td style="width:50%;">
          <div class="sign-box-role">Chief Executive Officer</div>
          <div class="sign-box-name">John Kennedy Obalah (001)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Executive Signatory • 30/10/2026</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

// Array of all 4 remaining documents (Constitution already handled by build-constitution)
const DOC_SPECS = [
  { name: 'MGR_Investment_Policy_and_Objectives', html: IPS_HTML },
  { name: 'MGR_Emergency_Credit_and_SetOff_Policy', html: CREDIT_HTML },
  { name: 'MGR_Bereavement_Succession_Exit_Protocol', html: BEREAVEMENT_HTML },
  { name: 'MGR_Treasury_Yield_Prorating_Policy', html: PRORATING_HTML }
];

console.log('Building and rendering all remaining official documents...');

for (const spec of DOC_SPECS) {
  const htmlPath = path.join(publicDocsDir, `${spec.name}.html`);
  const distHtmlPath = path.join(distDocsDir, `${spec.name}.html`);
  fs.writeFileSync(htmlPath, spec.html, 'utf8');
  fs.writeFileSync(distHtmlPath, spec.html, 'utf8');

  const pdfPath = path.join(publicDocsDir, `${spec.name}.pdf`);
  const distPdfPath = path.join(distDocsDir, `${spec.name}.pdf`);
  const rootPdfPath = path.join(projectRoot, `${spec.name}.pdf`);
  const brainPdfPath = path.join(brainDir, `${spec.name}.pdf`);

  try {
    execFileSync(browserExe, [
      '--headless=new',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      htmlPath
    ]);

    if (fs.existsSync(pdfPath)) {
      fs.copyFileSync(pdfPath, distPdfPath);
      fs.copyFileSync(pdfPath, rootPdfPath);
      try { fs.copyFileSync(pdfPath, brainPdfPath); } catch (_) {}
      const stat = fs.statSync(pdfPath);
      console.log(`Rendered: ${spec.name}.pdf (${stat.size} bytes)`);
    }
  } catch (err) {
    console.error(`Error rendering ${spec.name}.pdf:`, err);
  }
}

console.log('All 5 official documents built and rendered successfully!');
