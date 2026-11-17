import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MGR Club Constitution / LLP Agreement</title>
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
        content: "MGR CLUB • CONSTITUTION & LLP AGREEMENT";
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

    /* Cover Header / Masthead */
    .masthead {
      border: 3px double var(--ink);
      background: var(--paper);
      padding: 24px 28px;
      margin-bottom: 22px;
      text-align: center;
      position: relative;
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
      font-size: 22pt;
      font-weight: 700;
      color: var(--forest);
      letter-spacing: 0.02em;
      line-height: 1.15;
      margin: 4px 0 6px 0;
    }

    .masthead-subtitle {
      font-family: 'Newsreader', serif;
      font-style: italic;
      font-size: 12pt;
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

    /* Table of Contents Box */
    .toc-box {
      background: var(--forest-light);
      border-left: 4px solid var(--forest);
      border-top: 1px solid var(--border);
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 14px 18px;
      margin-bottom: 22px;
    }

    .toc-title {
      font-family: 'Newsreader', serif;
      font-weight: 700;
      font-size: 12pt;
      color: var(--forest);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 16px;
      font-size: 8.8pt;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      color: var(--ink);
      text-decoration: none;
      border-bottom: 1px dotted #B0C4B6;
      padding-bottom: 2px;
    }

    .toc-num {
      font-family: 'Inconsolata', monospace;
      font-weight: 700;
      color: var(--forest);
      margin-right: 6px;
    }

    /* Section Headings */
    .article-header {
      border-bottom: 2px solid var(--forest);
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-after: avoid;
      break-after: avoid;
    }

    .article-header h2 {
      font-family: 'Newsreader', serif;
      font-size: 13.5pt;
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
      font-size: 12pt;
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

    .sub-clause-list {
      margin: 4px 0 8px 18px;
      padding-left: 0;
      list-style-type: none;
    }

    .sub-clause-list li {
      margin-bottom: 4px;
      position: relative;
      padding-left: 20px;
      text-align: justify;
    }

    .sub-clause-list li::before {
      position: absolute;
      left: 0;
      font-family: 'Inconsolata', monospace;
      font-weight: 700;
      color: var(--ochre);
    }

    .list-alpha li:nth-child(1)::before { content: "a)"; }
    .list-alpha li:nth-child(2)::before { content: "b)"; }
    .list-alpha li:nth-child(3)::before { content: "c)"; }
    .list-alpha li:nth-child(4)::before { content: "d)"; }
    .list-alpha li:nth-child(5)::before { content: "e)"; }
    .list-alpha li:nth-child(6)::before { content: "f)"; }
    .list-alpha li:nth-child(7)::before { content: "g)"; }

    /* Callout & Statutory Notice Boxes */
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

    .statute-box.gold .statute-box-title {
      color: var(--ochre);
    }

    .statute-box.crimson .statute-box-title {
      color: var(--terracotta);
    }

    /* Key Terms Highlighting */
    strong {
      color: var(--forest-dark);
      font-weight: 700;
    }

    .pill {
      display: inline-block;
      font-family: 'Inconsolata', monospace;
      font-size: 8pt;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 3px;
      background: #EAE6DB;
      color: var(--ink);
      border: 1px solid var(--border);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .pill.green {
      background: #E2ECE5;
      color: var(--forest);
      border-color: #B5D1BE;
    }

    .pill.gold {
      background: #FDF3E3;
      color: var(--ochre);
      border-color: #E6CEAE;
    }

    /* Tables */
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

    /* Signatures Matrix */
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

    /* Preamble quote */
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
  </style>
</head>
<body>

  <!-- ================= PAGE 1 ================= -->
  <div class="page">
    <div class="masthead">
      <div class="masthead-crest">M</div>
      <div class="masthead-eyebrow">The Republic of Kenya • Investment Club Governance &amp; Partnership Instrument</div>
      <h1 class="masthead-title">MGR CLUB CONSTITUTION</h1>
      <div class="masthead-subtitle">Limited Liability Partnership (LLP) Agreement &amp; Code of Internal Governance</div>
      <div class="masthead-meta">
        <span><strong>Instrument Ref:</strong> MGR/CONST/2026/V1</span>
        <span><strong>Legal Basis:</strong> LLP Act Cap 30A</span>
        <span><strong>Signatories:</strong> 11 Founding Members</span>
        <span><strong>Version:</strong> Official Ratified</span>
      </div>
    </div>

    <div class="preamble">
      "We, the founding members of MGR CLUB, united in our collective ambition to build generational wealth, foster prudent capital stewardship, and enforce unwavering transparency, mutual accountability, and democratic investment leadership, hereby solemnly adopt, enact, and bind ourselves to this Constitution and Limited Liability Partnership Agreement."
    </div>

    <div class="toc-box">
      <div class="toc-title">Table of Articles &amp; Clauses</div>
      <div class="toc-grid">
        <a class="toc-item" href="#art1"><span><span class="toc-num">1.0</span>Name of the Club</span><span class="font-mono">P. 1</span></a>
        <a class="toc-item" href="#art2"><span><span class="toc-num">2.0</span>Legal Status</span><span class="font-mono">P. 1</span></a>
        <a class="toc-item" href="#art3"><span><span class="toc-num">3.0</span>Vision, Mission &amp; Objectives</span><span class="font-mono">P. 1</span></a>
        <a class="toc-item" href="#art4"><span><span class="toc-num">4.0</span>Membership</span><span class="font-mono">P. 1</span></a>
        <a class="toc-item" href="#art5"><span><span class="toc-num">5.0</span>Executive Committee</span><span class="font-mono">P. 2</span></a>
        <a class="toc-item" href="#art6"><span><span class="toc-num">6.0</span>Committee Stability &amp; Continuity</span><span class="font-mono">P. 2</span></a>
        <a class="toc-item" href="#art7"><span><span class="toc-num">7.0</span>Meetings of Members</span><span class="font-mono">P. 3</span></a>
        <a class="toc-item" href="#art8"><span><span class="toc-num">8.0</span>Financial Management</span><span class="font-mono">P. 3</span></a>
        <a class="toc-item" href="#art9"><span><span class="toc-num">9.0</span>Profits, Losses &amp; Distributions</span><span class="font-mono">P. 3</span></a>
        <a class="toc-item" href="#art10"><span><span class="toc-num">10.0</span>Member Exit &amp; Loan Settlement</span><span class="font-mono">P. 4</span></a>
        <a class="toc-item" href="#art11"><span><span class="toc-num">11.0</span>Constitutional Amendments</span><span class="font-mono">P. 5</span></a>
        <a class="toc-item" href="#art12"><span><span class="toc-num">12.0</span>Dissolution &amp; Winding Up</span><span class="font-mono">P. 5</span></a>
        <a class="toc-item" href="#art13"><span><span class="toc-num">13.0</span>2027 Co. Act Conversion</span><span class="font-mono">P. 5</span></a>
      </div>
    </div>

    <!-- 1.0 NAME OF THE CLUB -->
    <div class="article-header" id="art1">
      <h2><span class="article-num">1.0</span> Name of the Club</h2>
    </div>
    <div class="clause">
      <span class="clause-num">1.1</span> The name of the Club shall be <strong>MGR CLUB</strong> (hereinafter alternatively designated as <em>"the Club"</em> or <em>"the Partnership"</em>).
    </div>

    <!-- 2.0 LEGAL STATUS -->
    <div class="article-header" id="art2">
      <h2><span class="article-num">2.0</span> Legal Status</h2>
    </div>
    <div class="clause">
      <span class="clause-num">2.1</span> <strong>MGR CLUB</strong> shall operate as an investment club and may be registered as a <strong>Limited Liability Partnership (LLP)</strong> in accordance with applicable laws of Kenya (including the Limited Liability Partnerships Act, Cap 30A of the Laws of Kenya).
    </div>
    <div class="clause">
      <span class="clause-num">2.2</span> The Club shall possess all corporate legal powers necessary to pursue its objectives, acquire, lease, hold, and dispose of movable and immovable property, enter into binding contracts, open and operate banking and custodian accounts, sue and be sued in its registered name.
    </div>

    <!-- 3.0 VISION, MISSION AND OBJECTIVES -->
    <div class="article-header" id="art3">
      <h2><span class="article-num">3.0</span> Vision, Mission and Objectives</h2>
    </div>
    <div class="clause">
      <span class="clause-num">3.1</span> <strong>Vision Statement:</strong> Financial strength, sustainable growth, and enduring prosperity for current and future generations.
    </div>
    <div class="clause">
      <span class="clause-num">3.2</span> <strong>Mission Statement:</strong> Creating and preserving wealth through disciplined investment management, informed decision-making, prudent risk oversight, and unwavering commitment to integrity, transparency, and accountability.
    </div>
    <div class="clause">
      <span class="clause-num">3.3</span> <strong>Strategic Objectives:</strong> The core strategic objectives of MGR CLUB shall be:
      <ul class="sub-clause-list list-alpha">
        <li>Grow and preserve Members' capital through prudent investment practices;</li>
        <li>Promote regular savings and disciplined financial management among Members;</li>
        <li>Build a diversified and resilient investment portfolio across CMA-regulated and multi-asset classes;</li>
        <li>Ensure transparency, accountability, and sound governance;</li>
        <li>Enhance Members' financial literacy and investment knowledge; and</li>
        <li>Create long-term value for current and future generations.</li>
      </ul>
    </div>

    <!-- 4.0 MEMBERSHIP -->
    <div class="article-header" id="art4">
      <h2><span class="article-num">4.0</span> Membership</h2>
    </div>
    <div class="clause">
      <span class="clause-num">4.1</span> <strong>Eligibility for Membership:</strong> Membership shall be open to individuals who subscribe to the Vision, Mission, and Objectives of MGR CLUB, are of sound mind, have attained the age of eighteen (18) years, and are approved by the Executive Committee and general membership.
    </div>
    <div class="clause">
      <span class="clause-num">4.2</span> <strong>Admission Procedures &amp; Entry Protocol:</strong> Every prospective member must be formally sponsored and seconded in writing by not less than two (2) active founding members in good standing, submit verified legal identity documents into the confidential KYC Vault under Kenya Data Protection Act 2019 standards, be unanimously recommended by the Executive Committee, and be ratified by not less than two-thirds (2/3) of the General Membership. Upon admission, the new entrant shall:
      <ul class="sub-clause-list list-alpha">
        <li>Pay a mandatory, non-refundable administrative registration fee of <strong>KES 5,000</strong> credited directly to Club Reserves;</li>
        <li>Contribute a minimum initial share capital buy-in of <strong>KES 50,000</strong> (payable lump-sum or within three approved monthly installments) to prevent dilution of founding member equity; and</li>
        <li>Observe a mandatory <strong>six (6) months probationary window</strong> during which the new entrant shall not be eligible for emergency borrowings or executive office, and all earned yields are automatically capitalized into share capital.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">4.3</span> <strong>Rights and Obligations of Members:</strong> Every Member in good standing shall have the right to inspect audited statements, participate in general meetings, cast votes, apply for short-term emergency loans under Clause 10.5, and share in pro-rata investment yields. Each Member is strictly obligated to make punctual capital deposits, maintain fiduciary confidentiality, and uphold cooperative integrity.
    </div>
    <div class="clause">
      <span class="clause-num">4.4</span> <strong>Membership Contributions and Savings:</strong> Each Member shall contribute agreed regular capital deposits into the designated Club institutional treasury accounts. All member deposits are credited net of the mandatory registration fee and remain subject to the Club's capital preservation holding guidelines.
    </div>
    <div class="clause">
      <span class="clause-num">4.5</span> <strong>Suspension and Expulsion of Members:</strong> A Member may be suspended or expelled for conduct prejudicial to the financial stability or reputation of MGR CLUB, non-compliance with loan obligations, or gross breach of trust, by a resolution supported by not less than two-thirds (2/3) of all Members, subject to fair hearing and the settlement provisions in Clause 10.0.
    </div>
  </div>

  <!-- ================= PAGE 2 ================= -->
  <div class="page page-break">
    <!-- 5.0 EXECUTIVE COMMITTEE -->
    <div class="article-header" id="art5">
      <h2><span class="article-num">5.0</span> Executive Committee</h2>
    </div>
    <div class="clause">
      <span class="clause-num">5.1</span> <strong>Composition of the Executive Committee:</strong> The Executive Committee shall comprise seven (7) key officers:
      <ul class="sub-clause-list list-alpha">
        <li><strong>Chairperson:</strong> Presides over general meetings, signs executive resolutions, calls emergency meetings, and provides primary leadership;</li>
        <li><strong>Vice Chairperson:</strong> Deputizes the Chairperson, coordinates committee affairs, and oversees secondary resolution approvals;</li>
        <li><strong>Secretary:</strong> Maintains the official member register, drafts policies, records meeting minutes, and custodians official correspondence;</li>
        <li><strong>Treasurer:</strong> Manages institutional bank and MMF accounts, records deposits, prepares double-entry accounting ledgers, and oversees treasury operations;</li>
        <li><strong>Research Officer:</strong> Conducts investment intelligence, market research, and comparative yield analyses across CMA-regulated funds;</li>
        <li><strong>Compliance Officer:</strong> Audits operations, enforces constitutional compliance, and oversees bereavement exit settlements; and</li>
        <li><strong>Chief Executive Officer (CEO):</strong> Directs strategic asset allocation, operational execution, legal incorporation, and statutory compliance.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">5.2</span> <strong>Election and Appointment of Office Bearers:</strong> Subject to Clause 6.0, Executive Committee members shall be appointed or elected from among Members in good standing by democratic resolution.
    </div>
    <div class="clause">
      <span class="clause-num">5.3</span> <strong>Functions and Responsibilities of the Executive Committee:</strong> The Committee shall execute day-to-day administrative affairs, execute treasury reallocations within approved risk thresholds, prepare periodic accounting statements, enforce constitutional rules, and liaise with licensed fund managers and statutory bodies.
    </div>
    <div class="clause">
      <span class="clause-num">5.4</span> <strong>Meetings of the Executive Committee:</strong> The Executive Committee shall convene at least quarterly, or as frequently as necessary, physically or via secure digital teleconferencing.
    </div>
    <div class="clause">
      <span class="clause-num">5.5</span> <strong>Quorum and Decision-Making:</strong> The quorum for Executive Committee meetings shall be not less than four (4) members. Decisions shall be reached by consensus, or failing consensus, by a simple majority vote. In the event of a tie, the Chairperson shall hold a casting vote.
    </div>
    <div class="clause">
      <span class="clause-num">5.6</span> <strong>Removal from Office:</strong> An officer may be removed for gross misconduct, physical or mental incapacity, persistent failure to discharge duties, or bankruptcy, pursuant to a resolution passed by not less than two-thirds (2/3) of all Members of the Club at a duly convened meeting.
    </div>

    <!-- 6.0 EXECUTIVE COMMITTEE STABILITY AND CONTINUITY OF LEADERSHIP -->
    <div class="article-header" id="art6">
      <h2><span class="article-num">6.0</span> Executive Committee Stability and Continuity of Leadership</h2>
    </div>

    <div class="statute-box gold">
      <div class="statute-box-title">Founding Leadership Continuity Mandate • Formative Stage Protection</div>
      <div class="clause">
        <span class="clause-num">6.1</span> <strong>Tenure of the Initial Executive Committee:</strong> In recognition of the critical role played by the founding leadership during the establishment and implementation phases of MGR CLUB, members of the initial Executive Committee shall be expected to serve throughout the early formative and performance (execution) stages of the Club.
      </div>
      <div class="clause">
        <span class="clause-num">6.2</span> <strong>Restriction on Voluntary Exit from Office:</strong> No member of the initial Executive Committee shall voluntarily resign or relinquish his or her office during the early formative and performance stages of MGR CLUB, except where:
        <ul class="sub-clause-list list-alpha">
          <li>the Executive Committee member is unable to continue serving due to ill health, permanent incapacity, relocation, or other compelling circumstances deemed reasonable by the Members; or</li>
          <li>the resignation is approved by a resolution passed by not less than two-thirds (2/3) of all Members of MGR CLUB at a duly convened meeting.</li>
        </ul>
      </div>
      <div class="clause">
        <span class="clause-num">6.3</span> <strong>Continuity of Operations:</strong> The purpose of this provision is to ensure leadership stability, preserve institutional memory, and facilitate the effective implementation of the Club's strategic objectives during its developmental stages.
      </div>
      <div class="clause">
        <span class="clause-num">6.4</span> <strong>Filling of Vacancies:</strong> Where a vacancy arises in accordance with this Clause, the Members shall appoint a replacement in accordance with the Club's governing documents. The replacement Executive Committee member shall serve for the remainder of the unexpired term of office.
      </div>
      <div class="clause">
        <span class="clause-num">6.5</span> <strong>Duration of the Restriction:</strong> For purposes of this Clause, the early formative and performance (execution) stages shall mean the period commencing from the date of establishment of MGR CLUB and ending upon the earlier of:
        <ul class="sub-clause-list list-alpha">
          <li>the completion of the Club's first three (3) financial years of operation; or</li>
          <li>such other date as may be determined by a resolution supported by not less than two-thirds (2/3) of all Members of the Club.</li>
        </ul>
      </div>
      <div class="clause">
        <span class="clause-num">6.6</span> <strong>General Effect:</strong> This Clause balances the need for leadership continuity during the Club's formative years with the recognition that exceptional circumstances may necessitate an Executive Committee member's departure. It also seeks to prevent abrupt leadership changes that could disrupt the execution of the Club's investment strategy and governance framework.
      </div>
    </div>
  </div>

  <!-- ================= PAGE 3 ================= -->
  <div class="page page-break">
    <!-- 7.0 MEETINGS OF MEMBERS -->
    <div class="article-header" id="art7">
      <h2><span class="article-num">7.0</span> Meetings of Members</h2>
    </div>
    <div class="clause">
      <span class="clause-num">7.1</span> <strong>Annual General Meetings:</strong> An Annual General Meeting (AGM) shall be held once in each calendar year, not later than four (4) months following the close of the financial year, to receive audited financial statements, review fund allocations, ratify policies, and deliberate club business.
    </div>
    <div class="clause">
      <span class="clause-num">7.2</span> <strong>Special Meetings:</strong> Special Meetings may be called by the Chairperson, the Executive Committee, or upon written requisition signed by not less than one-third (1/3) of fully paid-up Members stating the specific agenda.
    </div>
    <div class="clause">
      <span class="clause-num">7.3</span> <strong>Notice of Meetings:</strong> Not less than fourteen (14) days' written notice of an AGM and seven (7) days' notice of a Special Meeting shall be circulated to all Members via official electronic portal or registered messaging.
    </div>
    <div class="clause">
      <span class="clause-num">7.4</span> <strong>Quorum Requirements:</strong> The quorum for general meetings shall be not less than two-thirds (2/3) of all fully paid-up Members. In the absence of a quorum after thirty minutes, the meeting shall stand adjourned to the same day in the subsequent week.
    </div>
    <div class="clause">
      <span class="clause-num">7.5</span> <strong>Voting Procedures and Resolutions:</strong> Each Member in good standing possesses one vote. Ordinary decisions pass by simple majority. Constitutional amendments require two-thirds (2/3) majority. Any treasury action distributing yields or reallocating member deposits requires the unanimous (100%) ratification mandate of all active members.
    </div>

    <!-- 8.0 FINANCIAL MANAGEMENT -->
    <div class="article-header" id="art8">
      <h2><span class="article-num">8.0</span> Financial Management</h2>
    </div>
    <div class="clause">
      <span class="clause-num">8.1</span> <strong>Financial Year:</strong> The Financial Year of MGR CLUB shall commence on the first (1st) day of January and conclude on the thirty-first (31st) day of December in each calendar year, with quarterly accounting closings on 31st March (Q1), 30th June (Q2), 30th September (Q3), and 31st December (Q4).
    </div>
    <div class="clause">
      <span class="clause-num">8.2</span> <strong>Bank Accounts and Signatories:</strong> All Club funds shall be held in designated operational and investment accounts opened in the Club's registered name with Central Bank of Kenya (CBK)-licensed commercial banks and Capital Markets Authority (CMA)-regulated fund managers as approved by the Executive Committee from time to time.
      <ul class="sub-clause-list list-alpha">
        <li><strong>Commercial Banking Accounts:</strong> Maintained for operational clearing, member contribution pooling, and liquidity reserves (including designated Chama joint accounts with commercial banks);</li>
        <li><strong>Capital Market Investment Accounts:</strong> Maintained with CMA-regulated fund managers, custodians, and special funds for capital preservation and growth; and</li>
        <li><strong>Dual Signatory Mandate:</strong> All banking instructions, fund disbursements, and account operations strictly require dual or triple authorized digital and documentary signatures of designated Executive Committee signatories (Chairperson, CEO, and Treasurer).</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">8.3</span> <strong>Accounting Records and Financial Statements:</strong> The Treasurer and Executive Committee shall maintain true and complete double-entry records. Quarterly and annual statements—Statement of Financial Position, Statement of Comprehensive Income, Statement of Cash Flows, and Statement of Changes in Equity—shall be prepared in strict alignment with International Financial Reporting Standards (IFRS).
    </div>
    <div class="clause">
      <span class="clause-num">8.4</span> <strong>Audits and Financial Reviews:</strong> The books of account shall be audited annually by an independent auditor or internal audit committee prior to presentation at the AGM.
    </div>
    <div class="clause">
      <span class="clause-num">8.5</span> <strong>Investment Policies and Governance:</strong> All investment activities, capital allocations, and portfolio management shall be governed by an approved <strong>Investment Policy Statement (IPS)</strong> formulated in accordance with the Club's Vision, Mission, and Strategic Objectives. Every Investment Policy Statement and subsequent strategic rebalancing shall adhere to the Club's three-tier governance workflow:
      <ul class="sub-clause-list list-alpha">
        <li><strong>Research &amp; Origination:</strong> Formulated by the Investment Research Officer / Analyst through rigorous due diligence and peer market benchmarking;</li>
        <li><strong>Executive Committee Deliberation:</strong> Evaluated, stress-tested, and resolved by the Executive Committee against risk, return, and liquidity parameters; and</li>
        <li><strong>General Membership Ratification:</strong> Tabled before and democratically ratified by the Members prior to strategic implementation.</li>
      </ul>
      Specific target allocation thresholds, dynamic yield oversight procedures, tactical reallocations, and strategic asset class mandates shall be set out in the ratified Investment Policy Statement and reviewed periodically.
    </div>

    <!-- 9.0 PROFITS, LOSSES AND DISTRIBUTIONS -->
    <div class="article-header" id="art9">
      <h2><span class="article-num">9.0</span> Profits, Losses and Triple Appropriations Policy</h2>
    </div>
    <div class="clause">
      <span class="clause-num">9.1</span> <strong>Allocation of Realized Net Profits:</strong> Net realized earnings and investment yields shall be credited to the Club's audited surplus account. Under no circumstances shall capital deposits of members be utilized to pay distributions.
    </div>
    <div class="clause">
      <span class="clause-num">9.2</span> <strong>Dividend Policy:</strong> Distributable surplus (representing 75% to 85% of net realized annual profit) shall be attributed pro-rata based on qualifying active capital and verified holding-period days. Each Member may elect either cash disbursement or automated compounding into share capital. Declaration requires formal recommendation by the Treasurer and <strong>100% unanimous active member ratification</strong>.
    </div>
    <div class="clause">
      <span class="clause-num">9.3</span> <strong>Executive Honoraria Policy:</strong> In recognition of the fiduciary time and operational liability assumed by active Executive Committee officers (Chairperson, CEO, Treasurer, Secretary, Research Officer), a discretionary honoraria pool may be appropriated, subject to strict statutory benchmarks:
      <ul class="sub-clause-list list-alpha">
        <li><strong>Positive Surplus Prerequisite:</strong> Payable strictly and exclusively in financial years yielding an audited net operating profit exceeding the prevailing 91-day Central Bank of Kenya (CBK) Treasury Bill benchmark;</li>
        <li><strong>Statutory Pool Ceiling:</strong> Strictly capped at <strong>not more than five per cent (5%)</strong> of net realized annual investment surplus (or a modest flat annual stipend ratified at the AGM); and</li>
        <li><strong>Non-Cumulative:</strong> Zero liability in deficit or negative-yield years. Must be disclosed in annual accounts and ratified at the AGM.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">9.4</span> <strong>Statutory Reserves &amp; Retention Policy:</strong> The Club shall mandatorily deduct and retain <strong>between ten per cent (10%) and twenty per cent (20%)</strong> of every periodic net surplus prior to dividend or honoraria declarations. The Reserve Fund shall serve as:
      <ul class="sub-clause-list list-alpha">
        <li>An institutional buffer against macroeconomic volatility and yield compression;</li>
        <li>Liquidity backing for the 30-day emergency credit facility; and</li>
        <li>The dedicated corporate incorporation and compliance fund for the <strong>2027 transition to a Company Limited by Shares</strong> under the Companies Act 2015. Reserves remain indivisible institutional capital and cannot be claimed by exiting members.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">9.5</span> <strong>Treatment of Losses:</strong> In the event of an unavoidable systemic capital loss, such deficit shall be apportioned among Members pro-rata to their capital contributions, subject to prior absorption by capital reserves.
    </div>
  </div>

  <!-- ================= PAGE 4 ================= -->
  <div class="page page-break">
    <!-- 10.0 EXIT OF MEMBERS AND SETTLEMENT OF BORROWINGS -->
    <div class="article-header" id="art10">
      <h2><span class="article-num">10.0</span> Exit of Members and Settlement of Borrowings</h2>
    </div>

    <div class="clause">
      <span class="clause-num">10.1</span> <strong>Voluntary Exit &amp; Advance Notice:</strong> A Member wishing to withdraw from MGR CLUB shall give not less than <strong>ninety (90) to one hundred and eighty (180) days' written notice</strong> to the Secretary and CEO. The extended notice window is legally mandatory to protect the Club from premature liquidation of fixed-income assets, MMF lock-ins, or infrastructure bonds attracting early-redemption penalties.
    </div>

    <div class="clause">
      <span class="clause-num">10.2</span> <strong>Valuation of Exiting Member's Interest:</strong> The net exit value shall be determined as of the notice expiry date based on audited book balances:
      <ul class="sub-clause-list list-alpha">
        <li><strong>Share Deposits:</strong> Valued at 1:1 par value of unencumbered verified capital contributions;</li>
        <li><strong>Prorated Net Yield:</strong> Attributed compound interest up to the date of notice expiry;</li>
        <li><strong>Deductions:</strong> 100% deduction of any outstanding emergency borrowings, loan interest, or unfulfilled obligations;</li>
        <li><strong>Administrative Exit Charge:</strong> A deduction of <strong>three per cent (3%)</strong> of gross entitlements to defray legal, audit, and transaction overhead; and</li>
        <li><strong>Forfeiture of Reserves:</strong> Exiting members possess no claim over the accumulated statutory reserve fund, which remains the permanent property of MGR CLUB.</li>
      </ul>
    </div>

    <div class="statute-box crimson">
      <div class="statute-box-title">Mandatory Right of Set-Off &amp; Loan Settlement Rules</div>
      <div class="clause">
        <span class="clause-num">10.3</span> <strong>Outstanding Loans and Set-Off:</strong> Where a Member seeking to exit has an outstanding emergency loan or any other debt due to the Club:
        <ul class="sub-clause-list list-alpha">
          <li>the Club shall deduct the outstanding principal together with accrued interest from the Member's capital account before any settlement is made;</li>
          <li>the Member's shares, savings, and other entitlements shall constitute security for such obligations;</li>
          <li>the Club shall have the right of set-off against any amount payable to the Member; and</li>
          <li>any deficiency remaining after set-off shall remain a debt recoverable from the Member.</li>
        </ul>
      </div>
      <div class="clause">
        <span class="clause-num">10.4</span> <strong>Settlement Framework (Internal Buyout &amp; Staggered Tranches):</strong> Subject to mandatory set-off under Clause 10.3, the net amount due shall be settled through:
        <ul class="sub-clause-list list-alpha">
          <li><strong>Right of First Refusal:</strong> The exiting shares shall first be offered pro-rata to continuing active members to purchase at 1:1 par value within sixty (60) days, consolidating their equity stakes without drawing cash from Club institutional accounts; or</li>
          <li><strong>Staggered Institutional Payout:</strong> Where settled from Club treasury funds, payment shall be executed in two equal tranches: <strong>Tranche 1 (50%)</strong> within ninety (90) days following valuation, and <strong>Tranche 2 (50%)</strong> within one hundred and eighty (180) days.</li>
        </ul>
      </div>
    </div>

    <!-- 10.5 EMERGENCY BORROWING BY MEMBERS -->
    <div class="article-header">
      <h2><span class="article-num">10.5</span> Emergency Borrowing by Members</h2>
    </div>
    <div class="clause">
      <span class="clause-num">10.5.1</span> <strong>Purpose:</strong> MGR CLUB may, subject to availability of funds, extend short-term emergency loans to Members.
    </div>
    <div class="clause">
      <span class="clause-num">10.5.2</span> <strong>Eligibility:</strong> A Member shall qualify for an emergency loan if he or she:
      <ul class="sub-clause-list list-alpha">
        <li>is a Member in good standing;</li>
        <li>has sufficient shares, savings, or capital contributions to secure the loan; and</li>
        <li>has complied with all other requirements prescribed by MGR CLUB.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">10.5.3</span> <strong>Loan Limit:</strong> A Member may borrow an amount <strong>not exceeding ninety per cent (90%)</strong> of his or her shares, savings, or capital contributions standing to his or her credit at the date of application.
    </div>
    <div class="clause">
      <span class="clause-num">10.5.4</span> <strong>Security:</strong> The Member's shares, savings, and capital contributions shall serve as security for the loan, and MGR CLUB may exercise its right of set-off in accordance with Clause 10.3.
    </div>
    <div class="clause">
      <span class="clause-num">10.5.5</span> <strong>Interest Rate:</strong> Emergency loans shall attract interest at the rate of <strong>ten per cent (10%) per month</strong> on the principal amount advanced.
    </div>
    <div class="clause">
      <span class="clause-num">10.5.6</span> <strong>Repayment Period:</strong> The loan shall be repayable in full within <strong>thirty (30) calendar days</strong> from the date of disbursement.
    </div>
    <div class="clause">
      <span class="clause-num">10.5.7</span> <strong>Default:</strong> Where a Member fails to repay the loan within the prescribed period:
      <ul class="sub-clause-list list-alpha">
        <li>the outstanding principal and accrued interest shall immediately become due and payable;</li>
        <li>MGR CLUB may recover the amount from the Member's shares, savings, or other entitlements without further notice;</li>
        <li>the Member may be denied access to further loans until full settlement; and</li>
        <li>the Club may institute appropriate recovery proceedings where necessary.</li>
      </ul>
    </div>

    <!-- 10.6 to 10.9 -->
    <div class="clause">
      <span class="clause-num">10.6</span> <strong>Exit During the Currency of a Loan:</strong> A Member shall not be permitted to withdraw from MGR CLUB while having an outstanding loan balance unless:
      <ul class="sub-clause-list list-alpha">
        <li>the loan and accrued interest are fully repaid prior to the effective date of exit; or</li>
        <li>MGR CLUB offsets the outstanding amount against the Member's shares, savings, capital contributions, and other entitlements.</li>
      </ul>
      Where the outstanding loan exceeds the value of the Member's entitlements, the Member shall remain liable for the balance outstanding.
    </div>
    <div class="clause">
      <span class="clause-num">10.7</span> <strong>Death or Incapacity of a Borrowing Member:</strong> In the event of death or permanent incapacity of a Member who has an outstanding loan:
      <ul class="sub-clause-list list-alpha">
        <li>MGR CLUB shall first recover the outstanding loan balance and accrued interest from the Member's shares and other entitlements; and</li>
        <li>any remaining balance due shall be paid to the legal personal representative or beneficiary in accordance with applicable law and the Club's Bereavement Protocol.</li>
      </ul>
    </div>
    <div class="clause">
      <span class="clause-num">10.8</span> <strong>Restriction on Withdrawal of Secured Shares:</strong> A Member whose shares, savings, or capital contributions have been pledged as security for an emergency loan shall not withdraw, transfer, or otherwise dispose of such interest until the loan has been fully discharged.
    </div>
    <div class="clause">
      <span class="clause-num">10.9</span> <strong>Interpretation and Effect of This Clause:</strong> This Clause ensures that:
      <ul class="sub-clause-list list-alpha">
        <li>borrowings are fully secured by Members' shares and savings;</li>
        <li>outstanding loans are automatically deducted upon exit;</li>
        <li>no Member may exit the Club without first settling all loan obligations; and</li>
        <li>the liquidity, stability, and financial integrity of MGR CLUB are protected.</li>
      </ul>
    </div>
  </div>

  <!-- ================= PAGE 5 ================= -->
  <div class="page page-break">
    <!-- 11.0 AMENDMENT -->
    <div class="article-header" id="art11">
      <h2><span class="article-num">11.0</span> Amendment of this Constitution / LLP Agreement</h2>
    </div>
    <div class="clause">
      <span class="clause-num">11.1</span> This Constitution may be amended by a resolution supported by not less than two-thirds (2/3) of all Members present and voting at a duly convened meeting, provided that notice of the proposed amendment has been circulated in advance.
    </div>

    <!-- 12.0 DISSOLUTION AND WINDING UP -->
    <div class="article-header" id="art12">
      <h2><span class="article-num">12.0</span> Dissolution and Winding Up</h2>
    </div>
    <div class="clause">
      <span class="clause-num">12.1</span> MGR CLUB may be dissolved in accordance with applicable law and a resolution passed by not less than three-quarters (3/4) of all Members.
    </div>
    <div class="clause">
      <span class="clause-num">12.2</span> Upon dissolution, all debts, liabilities, and external obligations shall first be fully discharged, after which the remaining net assets and reserves shall be distributed among Members pro-rata to their respective capital contributions.
    </div>

    <!-- 13.0 CORPORATE TRANSFORMATION (COMPANIES ACT 2015) -->
    <div class="article-header" id="art13">
      <h2><span class="article-num">13.0</span> Corporate Transformation: Company Limited by Shares (Companies Act 2015)</h2>
    </div>
    <div class="clause">
      <span class="clause-num">13.1</span> <strong>Commercial Nature:</strong> MGR Investment Group is expressly declared and constituted as a for-profit commercial investment enterprise dedicated to compound wealth creation.
    </div>
    <div class="clause">
      <span class="clause-num">13.2</span> <strong>2027 Limited Company Incorporation Mandate:</strong> The Executive Committee is formally mandated and directed to initiate and conclude the incorporation of <strong>MGR INVESTMENT GROUP LIMITED</strong> as a <strong>Private Company Limited by Shares</strong> under the <strong>Companies Act, No. 17 of 2015 (Laws of Kenya)</strong> during the 2027 financial year.
    </div>
    <div class="clause">
      <span class="clause-num">13.3</span> <strong>Share Capital Conversion:</strong> Upon incorporation, the verified net member capital pool (standing at KES 710,675.00+ as of FY 2026) shall convert into fully paid-up Ordinary Shares of equal par value registered in the names of the 11 founding shareholders.
    </div>
    <div class="clause">
      <span class="clause-num">13.4</span> <strong>Governance &amp; Articles of Association:</strong> This Constitution and its ratified streamlined policies shall seamlessly convert into the Articles of Association of the Company, and the Executive Committee shall transition into the initial Board of Directors subject to statutory fiduciary duties under Sections 142–148 of the Companies Act 2015.
    </div>

    <!-- SCHEDULE 1 -->
    <div class="article-header" style="margin-top:24px;">
      <h2><span class="article-num">SCHEDULE 1</span> Official Founding Members Register (001 – 011)</h2>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:10%;">No.</th>
          <th style="width:30%;">Member Name</th>
          <th style="width:25%;">Official Role</th>
          <th style="width:15%; text-align:right;">Net Capital (KES)</th>
          <th style="width:20%; text-align:center;">Membership Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-mono"><strong>001</strong></td>
          <td><strong>John Kennedy Obalah</strong></td>
          <td>Chief Executive Officer (CEO)</td>
          <td class="text-right font-mono">408,737.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>002</strong></td>
          <td><strong>Alice Tuei</strong></td>
          <td>Member</td>
          <td class="text-right font-mono">10,800.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>003</strong></td>
          <td><strong>Sarah Njoki</strong></td>
          <td>Honorary Secretary</td>
          <td class="text-right font-mono">817.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>004</strong></td>
          <td><strong>Dan Aloo</strong></td>
          <td>Chairperson, Exec Committee</td>
          <td class="text-right font-mono">160,076.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>005</strong></td>
          <td><strong>Moses Okwayo</strong></td>
          <td>Member</td>
          <td class="text-right font-mono">43,162.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>006</strong></td>
          <td><strong>Benjamin Ambrose Alila Madara</strong></td>
          <td>Compliance Officer</td>
          <td class="text-right font-mono">10,683.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>007</strong></td>
          <td><strong>Frederick Ongule Seunda (Late)</strong></td>
          <td>Beneficiary / Estate Record</td>
          <td class="text-right font-mono">13,019.00</td>
          <td class="text-center"><span class="pill gold">Estate Settlement</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>008</strong></td>
          <td><strong>Richard Ruto</strong></td>
          <td>Member</td>
          <td class="text-right font-mono">2,540.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>009</strong></td>
          <td><strong>Dr Joash Migosi PhD</strong></td>
          <td>Research Officer</td>
          <td class="text-right font-mono">4,841.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>010</strong></td>
          <td><strong>Josephat Lubanga</strong></td>
          <td>Vice Chairperson</td>
          <td class="text-right font-mono">39,000.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
        <tr>
          <td class="font-mono"><strong>011</strong></td>
          <td><strong>Leoivard Omondi Ongule</strong></td>
          <td>Treasurer</td>
          <td class="text-right font-mono">17,000.00</td>
          <td class="text-center"><span class="pill green">Active Member</span></td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background:#EAE4D6; font-weight:700;">
          <td colspan="3" style="text-align:right;">TOTAL REGISTERED MEMBER CAPITAL POOL:</td>
          <td class="text-right font-mono" style="color:var(--forest);">KES 710,675.00</td>
          <td class="text-center font-mono">11 MEMBERS</td>
        </tr>
      </tfoot>
    </table>

    <!-- SCHEDULE 2 -->
    <div class="article-header" style="margin-top:16px;">
      <h2><span class="article-num">SCHEDULE 2</span> Executive Committee Signatories &amp; Attestation</h2>
    </div>
    <p style="font-size:8.8pt; color:var(--ink-muted); margin-bottom:10px;">
      IN WITNESS WHEREOF, the undersigned Executive Committee officers and founding members, duly authorized by the General Meeting of MGR CLUB, have hereunto set their hands and verified seals on this <strong>30th day of October, 2026</strong>.
    </p>

    <table class="sign-table">
      <tr>
        <td style="width:33.3%;">
          <div class="sign-box-role">Chairperson, Exec Committee</div>
          <div class="sign-box-name">Dan Aloo (004)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026</div>
        </td>
        <td style="width:33.3%;">
          <div class="sign-box-role">Chief Executive Officer (CEO)</div>
          <div class="sign-box-name">John Kennedy Obalah (001)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026</div>
        </td>
        <td style="width:33.3%;">
          <div class="sign-box-role">Honorary Secretary</div>
          <div class="sign-box-name">Sarah Njoki (003)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="sign-box-role">Treasurer</div>
          <div class="sign-box-name">Leoivard Omondi Ongule (011)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026</div>
        </td>
        <td>
          <div class="sign-box-role">Vice Chairperson</div>
          <div class="sign-box-name">Josephat Lubanga (010)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026</div>
        </td>
        <td>
          <div class="sign-box-role">Research Officer</div>
          <div class="sign-box-name">Dr Joash Migosi PhD (009)</div>
          <div class="sign-line"></div>
          <div class="sign-date">Date: 30 / 10 / 2026</div>
        </td>
      </tr>
      <tr>
        <td colspan="3">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div class="sign-box-role">Compliance Officer &amp; Auditor</div>
              <div class="sign-box-name">Benjamin Ambrose Alila Madara (006)</div>
              <div class="sign-date">Date: 30 / 10 / 2026 • Constitutional Integrity Verified</div>
            </div>
            <div style="text-align:right;">
              <span class="pill green" style="padding:4px 10px; font-size:8.5pt;">SEALED &amp; RATIFIED BY UNANIMOUS CONSENSUS</span>
            </div>
          </div>
        </td>
      </tr>
    </table>

  </div>

</body>
</html>
`;

// Save HTML to public and dist
const publicHtmlPath = path.join(projectRoot, 'public', 'documents', 'MGR_Club_Constitution_LLP_Agreement.html');
const distHtmlPath = path.join(projectRoot, 'dist', 'documents', 'MGR_Club_Constitution_LLP_Agreement.html');
fs.writeFileSync(publicHtmlPath, HTML_CONTENT, 'utf8');
if (fs.existsSync(path.dirname(distHtmlPath))) {
  fs.writeFileSync(distHtmlPath, HTML_CONTENT, 'utf8');
}
console.log('HTML written to:', publicHtmlPath);

// Output PDF paths
const publicPdfPath = path.join(projectRoot, 'public', 'documents', 'MGR_Club_Constitution_LLP_Agreement.pdf');
const distPdfPath = path.join(projectRoot, 'dist', 'documents', 'MGR_Club_Constitution_LLP_Agreement.pdf');
const rootPdfPath = path.join(projectRoot, 'MGR_Club_Constitution_LLP_Agreement.pdf');

// Render PDF with Edge / Chrome headless
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExe = fs.existsSync(edgePath) ? edgePath : chromePath;

console.log('Rendering PDF using:', browserExe);

try {
  execFileSync(browserExe, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${publicPdfPath}`,
    publicHtmlPath
  ]);

  if (fs.existsSync(publicPdfPath)) {
    fs.copyFileSync(publicPdfPath, rootPdfPath);
    if (fs.existsSync(path.dirname(distPdfPath))) {
      fs.copyFileSync(publicPdfPath, distPdfPath);
    }
    const stat = fs.statSync(publicPdfPath);
    console.log(`SUCCESS: PDF rendered (${stat.size} bytes)`);
    console.log(`Saved to:\n  - ${publicPdfPath}\n  - ${distPdfPath}\n  - ${rootPdfPath}`);
  } else {
    console.error('PDF file was not created');
  }
} catch (err) {
  console.error('Error generating PDF:', err);
}

