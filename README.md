# MGR Investment Group — Private Wealth Ledger & Governance Portal

Official accountancy, treasury management, and corporate governance web application for **MGR Investment Group** (MGR Club / LLP), designed for high-fidelity member share tracking, CMA-regulated MMF reconciliations, pro-rata dividend compounding, mutual credit management, bereavement succession escrow, and constitutional governance.

---

## 🏛️ Official Member Registry (Schedule 1)

| # | Member ID | Name | Governance Position | Committee Tier | Net Shares (KES) | Equity % |
|---|---|---|---|---|---|---|
| 1 | **MGR-001** | **John Kennedy Obalah** | Chief Executive Officer (CEO) | Executive Committee | 408,737.00 | 57.51% |
| 2 | **MGR-002** | **Alice Tuei** | General Member | General Membership | 10,800.00 | 1.52% |
| 3 | **MGR-003** | **Sarah Njoki** | Secretary | Executive Committee | 817.00 | 0.12% |
| 4 | **MGR-004** | **Dan Aloo** | Chairman | Executive Committee | 160,076.00 | 22.52% |
| 5 | **MGR-005** | **Moses Okwayo** | General Member | General Membership | 43,162.00 | 6.07% |
| 6 | **MGR-006** | **Benjamin Ambrose Madara** | Compliance Officer | Executive Committee | 10,683.00 | 1.50% |
| 7 | **MGR-007** | **Frederick Ongule Seunda** *(Late)* | Member (Estate Escrow) | Deceased Member | 13,019.00 | 1.83% |
| 8 | **MGR-008** | **Richard Ruto** | General Member | General Membership | 2,540.00 | 0.36% |
| 9 | **MGR-009** | **Dr Joash Migosi PhD** | Research Officer / Analyst | Executive Committee | 4,841.00 | 0.68% |
| 10 | **MGR-010** | **Josephat Lubanga** | Vice Chairman | Executive Committee | 39,000.00 | 5.49% |
| 11 | **MGR-011** | **Leoivard Omondi Ongule** | Treasurer | Executive Committee | 17,000.00 | 2.39% |
| **TOTAL** | | | | | **KES 710,675.00** | **100.00%** |

*Note on Registration Reserve Pool:* 11 Members × KES 1,000/= Registration Fee = **KES 11,000.00** held in the Group Reserve Account toward formal LLP registration.

---

## 💼 Group Portfolio & Treasury Assets

- **Mansa-X Special Fund (Standard Investment Bank):** KES 541,587.00 (KES 500,000 principal + KES 41,587 Q3 net accrued return ~20% annualized).
- **Etica Capital Money Market Fund:** KES 250,209.74 (Liquid capital preservation reserve).
- **Equity Bank Kenya (Chama Joint Account):** KES 2,512.00 (Primary commercial clearing account with lowest ledger fees).
- **Group Reserve & Statutory Pool:** KES 11,000.00+ (Non-refundable registration fees and loan interest earnings).

---

## 📜 Official Legal Documents & Charters (Pre-Rendered PDFs)

1. **[MGR Club Constitution / LLP Agreement](public/documents/MGR_Club_Constitution_LLP_Agreement.pdf):** 12 Articles covering Founding Stability Mandate (6.0), Banking & Dual Signatories (8.2), 3-Tier IPS Governance (8.5), Emergency Borrowing Limits (10.5), and Schedule 1 Member Register.
2. **[Investment Policy Statement & SMART Objectives Charter](public/documents/MGR_Investment_Policy_and_Objectives.pdf):** Vision, Mission, 10 Strategic Objectives, 6 SMART Targets, 3-Tier IPS Protocol, Dynamic Yield Oversight, Tactical KES 200,000 Reallocation, and the 6 Member Research Portfolios.
3. **[Member 90% Emergency Credit & Set-Off Guideline](public/documents/MGR_Emergency_Credit_and_SetOff_Policy.pdf):** 90% borrowing limit against member deposits, 10% monthly interest, 30-day term, and mandatory right of set-off.
4. **[Bereavement Succession & Estate Exit Protocol](public/documents/MGR_Bereavement_Succession_Exit_Protocol.pdf):** 1:1 par value internal buyout for deceased member shares, 100% payout to beneficiaries, zero disruption of MMF lock-in cycles.
5. **[Treasury Holding-Period Yield Prorating Policy](public/documents/MGR_Treasury_Yield_Prorating_Policy.pdf):** Pro-rata capital holding-period yield attribution and unanimous active member ratification rules.

---

## 🚀 Tech Stack & Architecture

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons, Inconsolata & Newsreader typography.
- **Backend API:** Lightweight PHP (`public/api.php`) with dual database support:
  - **SQLite (Default):** Zero-configuration local database with automatic WAL mode and schema auto-migration.
  - **MySQL (cPanel Production):** Automatically connects when MySQL credentials are provided.
- **Security & Kenyan Law Compliance:**
  - Article 31 of Constitution of Kenya (Right to Privacy) and Kenya Data Protection Act 2019.
  - 24-Hour single-executive PIN protection for member confidential KYC files (National ID, KRA PIN, Passport Photo).
  - RBAC (Role-Based Access Control) for Super Admins, Treasury Admin, Executive Officers, and General Members.
- **PWA / Android WebAPK:** Installable on Android (WebAPK / Chrome), iOS (Safari Add to Home Screen), and desktop.

---

## 💻 Local Development & Build

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run linter
npm run lint

# Build production bundle and compile all official PDFs
npm run build:cpanel
```
