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

const docName = 'MGR_Statutory_Policy_Streamlining_Instrument';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MGR Investment Group - Statutory Policy Streamlining Instrument & 2027 Corporate Roadmap</title>
  <style>
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
        content: "MGR CLUB • STATUTORY POLICY STREAMLINING INSTRUMENT (REF: STREAMLINE-01)";
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
      --paper: #FAF8F3;
      --border: #C8C1B0;
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
      font-size: 9.8pt;
      line-height: 1.5;
    }

    .masthead {
      border: 3px double var(--ink);
      background: var(--paper);
      padding: 18px 24px;
      margin-bottom: 18px;
      text-align: center;
    }

    .masthead-crest {
      display: inline-block;
      width: 44px;
      height: 44px;
      line-height: 44px;
      background: var(--forest);
      color: #FFFFFF;
      font-family: 'Newsreader', serif;
      font-weight: 700;
      font-size: 16pt;
      border: 2px solid var(--ochre);
      border-radius: 50%;
      margin-bottom: 6px;
    }

    .masthead-sup {
      font-family: 'Inconsolata', monospace;
      font-size: 7.5pt;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--ink-muted);
      margin-bottom: 4px;
    }

    .masthead-title {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 18pt;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--forest-dark);
      margin: 4px 0 2px 0;
    }

    .masthead-sub {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 11pt;
      font-style: italic;
      color: var(--ochre);
      margin-bottom: 8px;
    }

    .masthead-meta {
      font-family: 'Inconsolata', monospace;
      font-size: 7.5pt;
      border-top: 1px solid var(--border);
      padding-top: 6px;
      margin-top: 6px;
      display: flex;
      justify-content: space-around;
      color: var(--ink-muted);
    }

    .directive-banner {
      border: 1.5px solid var(--ochre);
      background: var(--ochre-light);
      padding: 10px 14px;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .directive-banner h4 {
      margin: 0 0 4px 0;
      font-family: 'Newsreader', serif;
      font-size: 10.5pt;
      color: var(--ochre);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .directive-banner p {
      margin: 0;
      font-size: 8.8pt;
      line-height: 1.45;
      color: #5A3515;
    }

    h2 {
      font-family: 'Newsreader', serif;
      font-size: 13pt;
      font-weight: 700;
      color: var(--forest-dark);
      border-bottom: 1.5px solid var(--forest);
      padding-bottom: 3px;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-family: 'Newsreader', serif;
      font-size: 10.8pt;
      font-weight: 700;
      color: var(--ochre);
      margin-top: 12px;
      margin-bottom: 4px;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 7px 0;
      text-align: justify;
    }

    ul, ol {
      margin: 4px 0 8px 18px;
      padding: 0;
    }

    li {
      margin-bottom: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px 0;
      font-size: 8.8pt;
      page-break-inside: avoid;
    }

    th {
      background: var(--forest);
      color: #FFFFFF;
      font-family: 'Inconsolata', monospace;
      font-weight: 600;
      font-size: 8pt;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 6px 8px;
      border: 1px solid var(--forest-dark);
      text-align: left;
    }

    td {
      padding: 5px 8px;
      border: 1px solid var(--border);
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: var(--paper);
    }

    .feature-card {
      border: 1px solid var(--border);
      background: var(--paper);
      padding: 10px 12px;
      margin-bottom: 10px;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .feature-card h4 {
      margin: 0 0 4px 0;
      font-family: 'Newsreader', serif;
      font-size: 10.5pt;
      color: var(--forest-dark);
      font-weight: 700;
    }

    .feature-card p {
      margin: 0 0 4px 0;
      font-size: 8.8pt;
      line-height: 1.45;
    }

    .badge {
      display: inline-block;
      font-family: 'Inconsolata', monospace;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 1.5px 5px;
      border-radius: 3px;
      border: 1px solid var(--border);
      background: #FFFFFF;
      color: var(--forest-dark);
    }

    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .formula-box {
      border: 1.5px solid var(--forest);
      background: var(--forest-light);
      padding: 10px 14px;
      margin: 10px 0;
      border-radius: 4px;
      font-family: 'Inconsolata', monospace;
      font-size: 9pt;
      font-weight: 700;
      color: var(--forest-dark);
      text-align: center;
      page-break-inside: avoid;
    }

    .attestation {
      margin-top: 22px;
      border-top: 2px solid var(--ink);
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }

    .attest-col {
      width: 46%;
    }

    .sign-line {
      border-bottom: 1px solid #000;
      height: 28px;
      margin-bottom: 4px;
    }

    .attest-label {
      font-family: 'Inconsolata', monospace;
      font-size: 7.5pt;
      text-transform: uppercase;
      color: var(--ink-muted);
    }
  </style>
</head>
<body>

  <!-- Masthead -->
  <div class="masthead">
    <div class="masthead-crest">MGR</div>
    <div class="masthead-sup">Official Executive Governance Instrument • Republic of Kenya</div>
    <div class="masthead-title">MGR INVESTMENT GROUP</div>
    <div class="masthead-sub">Statutory Policy Streamlining Instrument &amp; 2027 Corporate Roadmap</div>
    <div class="masthead-meta">
      <span>REF: MGR/POL/2026/STREAMLINE-01</span>
      <span>SPONSOR: OFFICE OF THE CEO &amp; EXECUTIVE COMMITTEE</span>
      <span>DATE: FY 2026</span>
      <span>ENACTMENT: CAP 30A &amp; COMPANIES ACT 2015</span>
    </div>
  </div>

  <!-- Executive Mandate Banner -->
  <div class="directive-banner">
    <h4>Executive Mandate &amp; Directives of John Oballa Ojwang' (CEO / MGR-001)</h4>
    <p>
      This statutory instrument codifies the strategic directives issued on 17th November 2026. It affirms MGR Investment Group as a <strong>for-profit commercial investment enterprise</strong>, sets a binding target for registration as a <strong>Private Limited Company by Shares in 2027</strong> under the <strong>Companies Act 2015</strong>, establishes a two-stage ratification and general meeting adoption process, and provides comprehensive operational streamlining for <strong>(A) Entry Policy</strong>, <strong>(B) Exit &amp; Settlement Policy</strong>, and <strong>(C) Appropriations Policy (Dividends, Executive Honoraria, and Statutory Reserves)</strong>.
    </p>
  </div>

  <h2>1. Procedural Roadmap for Constitutional Adoption</h2>
  <p>
    In strict adherence to CEO directives, the finalization of the supreme Constitution and Bylaws shall avoid informal shortcuts and adhere to the following two-stage adoption pathway:
  </p>
  <ol>
    <li><strong>Stage 1 — Executive Committee Convening &amp; Ratification:</strong> The Executive Committee (Chairperson Dan Aloo, CEO John Oballa Ojwang', Treasurer Sarah Njoki, Secretary Alice Owuor, et al.) shall formally convene to scrutinize these streamlined clauses and pass an executive resolution recommending them to the general membership.</li>
    <li><strong>Stage 2 — General Meeting Convening &amp; Formal Adoption:</strong> The Secretariat shall issue statutory notice convening a <strong>Special General Meeting (SGM)</strong> of all 11 founding members to formally debate, vote upon, and enact the supreme Constitution and these streamlined policies by a two-thirds (2/3) constitutional majority.</li>
  </ol>

  <h2>2. Commercial Nature &amp; 2027 Companies Act Transition Roadmap</h2>
  <div class="feature-card">
    <h4>2.1 For-Profit Commercial Status</h4>
    <p>
      MGR Investment Group is expressly declared a <strong>for-profit commercial investment vehicle</strong>. All activities are organized toward wealth generation, active multi-asset investing, and capital appreciation for its registered shareholders.
    </p>
  </div>

  <div class="feature-card">
    <h4>2.2 2027 Limited Company by Shares Incorporation Milestone</h4>
    <p>
      <strong>Statutory Conversion (2027):</strong> The Executive Committee is formally mandated to execute the incorporation of <strong>MGR INVESTMENT GROUP LIMITED</strong> as a <strong>Private Company Limited by Shares</strong> under the <strong>Companies Act, No. 17 of 2015 (Laws of Kenya)</strong> during the 2027 financial year.
    </p>
    <ul>
      <li><strong>Share Capital Conversion:</strong> Existing member net capital balances (KES 710,675.00+ as of FY 2026) shall convert into fully paid-up Ordinary Shares of equal par value registered in the names of the 11 founding shareholders.</li>
      <li><strong>Articles of Association:</strong> This Constitution and these streamlined policies shall seamlessly convert into the registered Articles of Association of the Company.</li>
      <li><strong>Board Governance:</strong> Executive Committee officers shall transition into the initial Board of Directors, assuming fiduciary duties codified under Sections 142–148 of the Companies Act 2015.</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <h2>3. Streamlined Policy A: Entry Clause &amp; Membership Vetting</h2>
  <div class="feature-card">
    <h4>Admission Requirements &amp; Qualification</h4>
    <ul>
      <li><strong>Sponsorship:</strong> Every applicant must be nominated and seconded in writing by at least <strong>two (2) active founding members in good standing</strong>.</li>
      <li><strong>Vetting &amp; KYC:</strong> Mandatory submission of National ID, Passport Photo, KRA PIN Certificate, and Next-of-Kin nomination into the encrypted KYC Vault under Kenya Data Protection Act 2019 standards. Admission requires unanimous Executive Committee recommendation and 2/3 General Meeting ratification.</li>
      <li><strong>Non-Refundable Registration Fee:</strong> Payment of a non-refundable administrative onboarding fee of <strong>KES 5,000</strong> credited directly to Club Reserves.</li>
      <li><strong>Initial Capital Buy-In:</strong> Minimum initial share capital contribution of <strong>KES 50,000</strong> (payable lump-sum or in up to three monthly installments) to prevent dilution of founding member equity.</li>
      <li><strong>Six (6) Months Probationary Window:</strong> Newly admitted members must observe a 6-month probationary period during which they are strictly barred from borrowing emergency credit or holding executive office, and all earned yields are automatically capitalized into their share balance.</li>
    </ul>
  </div>

  <h2>4. Streamlined Policy B: Exit Clause, Valuation &amp; Settlement</h2>
  <div class="feature-card">
    <h4>Exit Categories &amp; Extended Notice Period</h4>
    <ul>
      <li><strong>Voluntary Withdrawal:</strong> Requires mandatory advance written notice of <strong>ninety (90) to one hundred and eighty (180) days</strong> to allow treasury liquidity planning and prevent early liquidation penalties on locked MMF and fixed-income assets.</li>
      <li><strong>Mandatory Right of Set-Off:</strong> Under no circumstances shall an exiting member be settled while holding an outstanding emergency loan. The Club shall automatically deduct 100% of unpaid principal and accrued 10% monthly interest from the capital account before calculating net dues.</li>
    </ul>
  </div>

  <div class="formula-box">
    Net Exit Entitlement = Verified Share Deposits (1:1 Par) + Prorated Yield &minus; Set-Off Deductions &minus; 3% Admin Levy
  </div>

  <div class="feature-card">
    <h4>Settlement Framework: Internal Buyout &amp; Staggered Tranches</h4>
    <ul>
      <li><strong>Continuing Member Right of First Refusal:</strong> The exiting shares shall first be offered pro-rata to the continuing 10 members at 1:1 par value to allow them to consolidate their ownership.</li>
      <li><strong>Staggered Payout Tranches:</strong> Where settled from institutional treasury accounts, payment shall be executed in two equal tranches: <strong>Tranche 1 (50%)</strong> within 90 days of valuation, and <strong>Tranche 2 (50%)</strong> within 180 days.</li>
      <li><strong>Forfeiture of Reserves:</strong> Exiting members possess no claim over the accumulated statutory reserve fund, which remains the permanent property of MGR.</li>
    </ul>
  </div>

  <h2>5. Streamlined Policy C: Triple Appropriations Policy</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Appropriation Head</th>
        <th style="width: 20%;">Allocation Range</th>
        <th style="width: 55%;">Governing Parameters &amp; Conditions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1. Statutory Reserves &amp; Retention</strong></td>
        <td><strong>10% to 20%</strong> of Net Annual Surplus</td>
        <td>Mandatory statutory retention deducted prior to any dividend or honoraria declaration. Serves as capital fortification, buffer against market downturns, liquidity backing for emergency loans, and the dedicated fund for <strong>2027 Limited Company incorporation</strong>. Permanent and non-distributable.</td>
      </tr>
      <tr>
        <td><strong>2. Executive Honoraria</strong></td>
        <td><strong>3% to 5% Capped</strong> (or flat stipend)</td>
        <td>Discretionary performance allowance for active Executive Committee officers (Chairman, CEO, Treasurer, Secretary, Research Officer) dedicating operational time. <strong>Strict condition: Payable ONLY upon positive audited operating profit exceeding the 91-day CBK Treasury Bill benchmark.</strong> Zero liability if in deficit. Explicitly disclosed and ratified at the AGM.</td>
      </tr>
      <tr>
        <td><strong>3. Member Dividends</strong></td>
        <td><strong>75% to 85%</strong> of Distributable Surplus</td>
        <td>Paid strictly out of realized net operating surplus (never from principal deposits). Attributed pro-rata based on qualifying capital balance and exact active holding-period days. Members elect between immediate cash payout or automated compounding (reinvestment). Requires unanimous (100%) active member ratification.</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Executive Action Matrix: Convening Milestones</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Milestone</th>
        <th style="width: 45%;">Action Item</th>
        <th style="width: 20%;">Lead Official</th>
        <th style="width: 15%;">Timeline</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Milestone 1</strong></td>
        <td>Convene Executive Committee Meeting to deliberate and ratify Streamlining Instrument</td>
        <td>CEO &amp; Chairman</td>
        <td>Within 14 Days</td>
      </tr>
      <tr>
        <td><strong>Milestone 2</strong></td>
        <td>Issue statutory 14-day notice convening the Special General Meeting (SGM) of all 11 Members</td>
        <td>Secretary</td>
        <td>Post-Exec Meeting</td>
      </tr>
      <tr>
        <td><strong>Milestone 3</strong></td>
        <td>Table Constitution &amp; Streamlining Instrument at SGM for democratic 2/3 member adoption</td>
        <td>General Membership</td>
        <td>SGM Assembly</td>
      </tr>
      <tr>
        <td><strong>Milestone 4</strong></td>
        <td>Execute physical and cryptographic attestation signatures of all 11 founding shareholders</td>
        <td>All 11 Members</td>
        <td>Within 7 Days Post-SGM</td>
      </tr>
      <tr>
        <td><strong>Milestone 5</strong></td>
        <td>Initiate incorporation filings for 2027 Company Limited by Shares conversion</td>
        <td>CEO &amp; Legal Counsel</td>
        <td>Q1 2027</td>
      </tr>
    </tbody>
  </table>

  <!-- Attestation Block -->
  <div class="attestation">
    <div class="attest-col">
      <div class="sign-line"></div>
      <div class="attest-label">For the Executive Committee:</div>
      <div style="font-size: 8.5pt; font-weight: 700; margin-top: 2px;">DAN ALOO — Executive Chairman</div>
      <div style="font-size: 7.8pt; color: var(--ink-muted);">Ratified Executive Directorate • FY 2026</div>
    </div>
    <div class="attest-col">
      <div class="sign-line"></div>
      <div class="attest-label">Executive Sponsor &amp; Policy Originator:</div>
      <div style="font-size: 8.5pt; font-weight: 700; margin-top: 2px;">JOHN OBALLA OJWANG' — Chief Executive Officer (CEO)</div>
      <div style="font-size: 7.8pt; color: var(--ink-muted);">Super Administrator &amp; Founder • MGR-001</div>
    </div>
  </div>

</body>
</html>
`;

// Write HTML
const htmlPath = path.join(publicDocsDir, `${docName}.html`);
const distHtmlPath = path.join(distDocsDir, `${docName}.html`);
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
fs.writeFileSync(distHtmlPath, htmlContent, 'utf8');
console.log(`HTML written to: ${htmlPath}`);

// Render PDF
const pdfPath = path.join(publicDocsDir, `${docName}.pdf`);
const distPdfPath = path.join(distDocsDir, `${docName}.pdf`);
const rootPdfPath = path.join(projectRoot, `${docName}.pdf`);
const brainPdfPath = path.join(brainDir, `${docName}.pdf`);

console.log(`Rendering PDF using: ${browserExe}`);

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
    console.log(`SUCCESS: PDF rendered (${stat.size} bytes)`);
    console.log(`Saved to:\n  - ${pdfPath}\n  - ${distPdfPath}\n  - ${rootPdfPath}\n  - ${brainPdfPath}`);
  } else {
    console.error(`Failed to generate ${pdfPath}`);
  }
} catch (err) {
  console.error(`Error rendering PDF:`, err);
}
