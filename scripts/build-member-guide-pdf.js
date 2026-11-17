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

const docName = 'MGR_Member_App_Guide_and_Orientation_Circular';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MGR Investment Group - Member Web Application Orientation Manual & Consultative Guide</title>
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
        content: "MGR CLUB • MEMBER APPLICATION MANUAL & CONSULTATIVE GUIDE";
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
      font-size: 19pt;
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

    .consultative-banner {
      border: 1.5px solid var(--ochre);
      background: var(--ochre-light);
      padding: 10px 14px;
      margin-bottom: 16px;
      border-radius: 4px;
    }

    .consultative-banner h4 {
      margin: 0 0 4px 0;
      font-family: 'Newsreader', serif;
      font-size: 10.5pt;
      color: var(--ochre);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .consultative-banner p {
      margin: 0;
      font-size: 8.8pt;
      line-height: 1.45;
      color: #5A3515;
    }

    h2 {
      font-family: 'Newsreader', serif;
      font-size: 13.5pt;
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
      font-size: 11pt;
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

    .checklist-box {
      border: 1.5px dashed var(--forest);
      background: var(--forest-light);
      padding: 12px 16px;
      margin: 14px 0;
      border-radius: 4px;
      page-break-inside: avoid;
    }

    .checklist-box h4 {
      margin: 0 0 6px 0;
      font-family: 'Newsreader', serif;
      font-size: 11pt;
      color: var(--forest-dark);
      text-transform: uppercase;
      letter-spacing: 0.05em;
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
    <div class="masthead-sup">Official Executive Communication • Republic of Kenya</div>
    <div class="masthead-title">MGR INVESTMENT GROUP</div>
    <div class="masthead-sub">Member Web Application Orientation Manual &amp; Consultative Guide</div>
    <div class="masthead-meta">
      <span>REF: MGR/CIR/2026/APP-01</span>
      <span>STATUS: DRAFT FOR MEMBER FEEDBACK</span>
      <span>DATE: FINANCIAL YEAR 2026</span>
      <span>GOVERNED: CAP 30A &amp; DPA 2019</span>
    </div>
  </div>

  <!-- Consultative Notice -->
  <div class="consultative-banner">
    <h4>Consultative Draft Notice — Review &amp; Member Feedback</h4>
    <p>
      This document introduces the newly architected official <strong>MGR Investment Group Web Application</strong>. It provides an operational manual explaining how the platform works, its advantages for individual shareholders, its security protocols, and how to access each feature on smartphones and computers. This is <strong>not a final unalterable instrument</strong>; it is circulated to all 11 General Members to invite comments, suggestions, and corrections prior to formal executive ratification.
    </p>
  </div>

  <h2>1. Executive Summary &amp; Purpose</h2>
  <p>
    The MGR Investment Group Web Portal has been commissioned to replace informal WhatsApp messaging, paper receipts, and unverified offline spreadsheets with a transparent, double-entry financial operating system. Under <strong>The Partnership Act (Cap 29)</strong>, <strong>Limited Liability Partnership Act (Cap 30A)</strong>, and the <strong>Kenya Data Protection Act 2019</strong>, our club requires immutable records of capital deposits, interest compounding, statutory identity files, and dual-authorization banking protocols.
  </p>
  <p>
    <strong>Core Principles:</strong>
  </p>
  <ul>
    <li><strong>Individual Financial Transparency:</strong> Every member can instantly inspect their share balance, percentage equity, and net yield at any time.</li>
    <li><strong>Member-Controlled Privacy:</strong> Member identity files (National ID, KRA PIN, Passport Photo) are securely encrypted and can only be opened when the member issues a temporary 24-hour single-use PIN.</li>
    <li><strong>Democratic Governance:</strong> Major capital reallocations (such as surplus transfers between Etica MMF and Mansa X) are subject to 10-member democratic ratification.</li>
    <li><strong>Zero Technical Overhead for Members:</strong> Technical operations (cPanel server administration, SMTP mail relay, SQLite/MySQL synchronization, and TLS security) are handled exclusively by the System Administrator. General members enjoy an intuitive, zero-maintenance interface.</li>
  </ul>

  <h2>2. Key Advantages for Every Member</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Capability</th>
        <th style="width: 40%;">Member Benefit</th>
        <th style="width: 35%;">Governance Standard</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Live Equity Visibility</strong></td>
        <td>Check your exact share stake (e.g. 9.09%), cumulative monthly deposits, and prorated interest without waiting for annual AGM books.</td>
        <td>Constitution Section 8 &amp; Audited Double-Entry Books</td>
      </tr>
      <tr>
        <td><strong>Self-Controlled KYC Vault</strong></td>
        <td>Upload your National ID, KRA PIN, and Passport Photo. Executive officers cannot open them unless you generate and give them a 24-hour expiring PIN.</td>
        <td>Article 31 of Kenyan Constitution &amp; Kenya DPA 2019</td>
      </tr>
      <tr>
        <td><strong>Democratic Ratification</strong></td>
        <td>Vote digitally on executive investment proposals, loan approvals, and capital transfers. Track the 10-member threshold in real time.</td>
        <td>Three-Tier Investment Policy Protocol (I.P.S.)</td>
      </tr>
      <tr>
        <td><strong>Instant Deposit Logging</strong></td>
        <td>Log your M-Pesa transaction reference immediately upon sending funds. The Treasurer matches it directly to bank/MMF statements.</td>
        <td>Zero Unreconciled Funds Mandate</td>
      </tr>
      <tr>
        <td><strong>80% Emergency Credit</strong></td>
        <td>Instantly verify your qualified borrowing limit against unencumbered share savings with automatic set-off risk protection.</td>
        <td>Emergency Credit Bylaw Clause 3.2</td>
      </tr>
      <tr>
        <td><strong>Mobile Phone Native PWA</strong></td>
        <td>Install directly onto your Android phone or iPhone home screen with one tap. Fast, full-screen, with offline local caching.</td>
        <td>Progressive Web App (PWA) Standard</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>3. How to Use the Application: Module-by-Module Walkthrough</h2>

  <div class="feature-card">
    <h4>Module 1: Sign In &amp; New Member Registration</h4>
    <p>
      Located directly on the landing screen with two prominent, finger-friendly tabs:
    </p>
    <ul>
      <li><strong>[ 🔑 Log In ] (Existing Members):</strong> Enter your official Member ID (e.g. <span class="badge">MGR-001</span> through <span class="badge">MGR-011</span>), registered email, or mobile phone number, along with your password.
        <em>Default initial member password:</em> <code>MGR@2026</code> (you can change this in your profile). A collapsible <strong>"Founding Member Quick Pre-fill"</strong> list allows one-tap ID selection. If you forget your password, tap <em>"Use Email OTP"</em> to receive a 6-digit code via cPanel mail.
      </li>
      <li><strong>[ 👤 Register ] (New Users):</strong> For onboarding new members. Enter your Full Legal Name, Email, Phone (M-Pesa), Password, 4-digit Account Security PIN, and consent to the Kenyan Data Protection Charter.
      </li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>Module 2: Executive Dashboard</h4>
    <p>
      The high-altitude financial command center. Displays:
    </p>
    <ul>
      <li><strong>Total Club Assets:</strong> Consolidated net valuation across Equity Bank, Etica MMF, and Mansa X.</li>
      <li><strong>Your Personal Stake:</strong> Your exact equity percentage (e.g., 9.09%), total deposits credited, and accrued interest.</li>
      <li><strong>Strategic Asset Balance:</strong> Visual distribution across high-yield Mansa X (~20% p.a.), liquid Etica Capital MMF (11.08%–12.50%), and Equity Bank operational cash.</li>
      <li><strong>Emergency Liquidity Indicator:</strong> Live calculation of the club's mandatory 20% liquid reserve.</li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>Module 3: Member Register &amp; Personal Share Statements</h4>
    <p>
      Comprehensive directory of all 11 founding members and their committee assignments:
    </p>
    <ul>
      <li><strong>Individual Statement:</strong> View your personalized transaction statement, cumulative savings, and net withdrawable balance. Printable as an official PDF for personal or banking verification.</li>
      <li><strong>Deposit Logging:</strong> Enter your M-Pesa transaction reference (e.g. <code>SKL9842JX7</code>), amount, date, and receiving destination (Etica MMF, Mansa X, or Equity Bank) for treasurer sign-off.</li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>Module 4: Double-Entry General Ledger &amp; Audit Trail</h4>
    <p>
      The mathematical backbone of MGR club finances:
    </p>
    <ul>
      <li>Every single shilling is tracked through dual debit and credit entries with verified balancing.</li>
      <li>Filter transactions by date, financial quarter, category, or payment reference.</li>
      <li>View the permanent audit trail recording who initiated, edited, or ratified each financial action.</li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>Module 5: Official Documents &amp; Constitutional Repository</h4>
    <p>
      Interactive viewer and verified PDF downloads for all 5 ratified club legal instruments:
    </p>
    <ol>
      <li><strong>MGR Club Constitution &amp; LLP Partnership Agreement (Cap 30A)</strong></li>
      <li><strong>MGR Investment Policy Statement &amp; Objectives (3-Tier Protocol)</strong></li>
      <li><strong>Emergency Credit, Member Loan &amp; Set-Off Bylaws (80% Ceiling)</strong></li>
      <li><strong>Bereavement, Succession &amp; Exit Protocol (Bylaw Clause 4.2)</strong></li>
      <li><strong>Treasury Yield Prorating &amp; Interest Distribution Policy</strong></li>
    </ol>
  </div>

  <div class="feature-card">
    <h4>Module 6: Confidential KYC Legal Vault &amp; 24-Hour PIN Protocol</h4>
    <p>
      A secure repository for storing mandatory statutory compliance files:
    </p>
    <ul>
      <li><strong>Stored Files:</strong> National ID Card, Passport Photo, KRA PIN Certificate, Club Sign-Up Forms.</li>
      <li><strong>The 24-Hour Single-Use PIN Rule:</strong> Your files remain permanently locked. When an Executive Committee officer needs to verify your identity or sign-up docs, you open your vault and tap <strong>"Copy Authorization PIN"</strong>.</li>
      <li>A <strong>24-hour countdown clock</strong> begins immediately. The officer enters your PIN to access the documents. After 24 hours, the PIN expires and the vault automatically relocks. You can also tap <em>"Generate New PIN"</em> at any moment to cancel previous codes.</li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>Module 7: Democratic Financial Ratification</h4>
    <p>
      Empowers the general membership with binding veto and ratification powers:
    </p>
    <ul>
      <li>Proposed treasury actions (such as reallocating KES 200,000 from Etica MMF to Mansa X) are submitted as formal resolutions.</li>
      <li>Members cast their digital vote/ratification. A real-time progress bar tracks consensus towards the required 10-member threshold.</li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>Module 8: MMF &amp; Treasury Statement Advisory</h4>
    <p>
      Monitors yields and comparative market opportunities:
    </p>
    <ul>
      <li>Tracks Etica Capital MMF returns vs Mansa X Special Funds.</li>
      <li><strong>The 6 Member Research Portfolios:</strong> Provides background and analysis for Fixed Income Funds (FIF), Derivatives, Real Estate Investment Trusts (REITs), Exchange Traded Funds (ETFs), Government Infrastructure Bonds (IFs), and the Nairobi Securities Exchange (NSE).</li>
    </ul>
  </div>

  <div class="page-break"></div>

  <h2>4. Mobile Phone Installation: Android &amp; iPhone (PWA Guide)</h2>
  <p>
    The web app is optimized to work as a standalone mobile application without requiring Google Play Store or Apple App Store downloads:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 50%;">Android Phones (Samsung, Tecno, Infinix, Pixel)</th>
        <th style="width: 50%;">Apple iPhones (iOS Safari)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <ol>
            <li>Open Chrome, Edge, or Opera and navigate to the portal URL.</li>
            <li>Tap the <strong>"Install Mobile App"</strong> button at the bottom of the login screen.</li>
            <li>Or tap the browser menu (<strong>⋮</strong> in top right) and select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
            <li>The official MGR Investment Group crest will be added directly to your phone's home screen.</li>
          </ol>
        </td>
        <td>
          <ol>
            <li>Open the portal URL exclusively in <strong>Safari</strong>.</li>
            <li>Tap the <strong>Share</strong> button (the square icon with an arrow pointing up at the bottom of your screen).</li>
            <li>Scroll down the menu and tap <strong>"Add to Home Screen"</strong>.</li>
            <li>Confirm by tapping <strong>Add</strong> in the top right corner. The app will launch in full screen with no Safari browser bars.</li>
          </ol>
        </td>
      </tr>
    </tbody>
  </table>

  <h2>5. Administrative &amp; Technical Demarcation</h2>
  <div class="feature-card" style="background: #FFFFFF; border-left: 4px solid var(--forest);">
    <h4>Zero Technical Burden on General Members</h4>
    <p>
      Members and Executive Officers focus entirely on club governance, savings, and investments. All technical and server-side operations are handled directly by the <strong>System Administrator (Super Admin / IT Team)</strong>:
    </p>
    <ul>
      <li><strong>cPanel Web Hosting:</strong> Server uptime, PHP runtime, Apache <code>.htaccess</code> routing, and SSL/TLS certificate renewals.</li>
      <li><strong>Mail Delivery &amp; SMTP:</strong> cPanel mail server routing for OTP codes and treasury circulars.</li>
      <li><strong>Database Synchronization:</strong> Automatic two-way synchronization between client storage and the central SQLite/MySQL database (<code>api.php</code>).</li>
      <li><strong>Security &amp; Encryption:</strong> Password salting and hashing (bcrypt), session tokens, and regular off-site database backups.</li>
    </ul>
  </div>

  <div class="feature-card">
    <h4>App Governance &amp; System Access Hierarchy</h4>
    <ul>
      <li><strong>System Administrator (IT Infrastructure):</strong> Technical administration of web hosting infrastructure, cPanel mail routing (SMTP), SQLite/MySQL database synchronization, and forensic audit logging.</li>
      <li><strong>Executive Leadership (CEO &amp; Chairman):</strong> Corporate governance, general meeting presidency, executive committee resolutions, and statutory incorporation under the Companies Act.</li>
      <li><strong>Treasury Custodian (Treasurer / CFO):</strong> Custody of Etica MMF &amp; Mansa X reconciliations, double-entry ledger postings, loan disbursements, and pro-rata dividend distributions.</li>
      <li><strong>Executive Officers (Secretary, Compliance, Research, Vice Chair):</strong> Legal compliance audits, secretarial registers, fund performance intelligence, and member application reviews.</li>
      <li><strong>General Members (Shareholders):</strong> Self-service equity ledger, personal deposit logging, 80% share-backed loans, and democratic voting / unanimous ratification.</li>
    </ul>
  </div>

  <h2>6. Member Feedback &amp; Consultative Review Checklist</h2>
  <div class="checklist-box">
    <h4>Members' Feedback Questionnaire</h4>
    <p style="font-size: 8.8pt; margin-bottom: 8px;">
      Please peruse the application and submit your feedback on the following five points to the Secretary or Investment Officer:
    </p>
    <ul style="list-style-type: none; margin-left: 0;">
      <li>[ &nbsp; ] <strong>1. Document PIN Expiry:</strong> Is the 24-hour expiration window practical for sharing your documents with executives, or do you prefer 12 or 48 hours?</li>
      <li>[ &nbsp; ] <strong>2. Deposit Logging:</strong> Are the M-Pesa transaction reference and account destination fields simple to use?</li>
      <li>[ &nbsp; ] <strong>3. Personal Statement Layout:</strong> Does the statement display your share percentage, monthly deposits, and accrued interest clearly?</li>
      <li>[ &nbsp; ] <strong>4. Notification Options:</strong> Would you like SMS notifications integrated alongside the current cPanel Email OTP dispatch?</li>
      <li>[ &nbsp; ] <strong>5. General Suggestions:</strong> Are there any additional tools, reports, or data points you would like added to your dashboard?</li>
    </ul>
  </div>

  <!-- Attestation Block -->
  <div class="attestation">
    <div class="attest-col">
      <div class="sign-line"></div>
      <div class="attest-label">For the Executive Committee &amp; Systems Admin</div>
      <div style="font-size: 8.5pt; font-weight: 700; margin-top: 2px;">MGR Investment Group Executive Secretariat</div>
      <div style="font-size: 7.8pt; color: var(--ink-muted);">Ratified Consultative Distribution • FY 2026</div>
    </div>
    <div class="attest-col">
      <div class="sign-line"></div>
      <div class="attest-label">General Membership Receipt &amp; Feedback Channel</div>
      <div style="font-size: 8.5pt; font-weight: 700; margin-top: 2px;">All 11 Founding Shareholders</div>
      <div style="font-size: 7.8pt; color: var(--ink-muted);">Official MGR Forum • WhatsApp &amp; Email Submission</div>
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

