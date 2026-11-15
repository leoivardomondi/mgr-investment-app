// Initial data for MGR Investment Group (as of 30/10/2026)

export function getQuarterForDate(dateStr) {
  if (!dateStr) return 'Q4-2026';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Q4-2026';
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  let q = 1;
  if (month >= 1 && month <= 3) q = 1;
  else if (month >= 4 && month <= 6) q = 2;
  else if (month >= 7 && month <= 9) q = 3;
  else q = 4;
  return `Q${q}-${year}`;
}

export function getMemberTwoNames(name) {
  if (!name) return '';
  const knownMap = {
    "Benjamin Ambrose Alila Madara": "Benjamin Madara",
    "Benjamin Alila Ambrose Madara": "Benjamin Madara",
    "Dr Joash Migosi PhD": "Joash Migosi",
    "Rev Moses Okwayo": "Moses Okwayo",
    "John Kennedy Obalah": "John Obalah",
    "Leoivard Omondi Ongule": "Leoivard Omondi",
    "Frederick Ongule Seunda": "Frederick Seunda"
  };
  if (knownMap[name]) return knownMap[name];

  const clean = name.replace(/\b(Dr|Dr\.|Rev|Rev\.|Prof|Prof\.|Mr|Mr\.|Mrs|Mrs\.|Ms|Ms\.|PhD|MD|Hon|Eng)\b/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return name;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export const INITIAL_MEMBERS = [
  {
    "id": "MGR-001",
    "name": "John Kennedy Obalah",
    "gender": "male",
    "role": "CEO",
    "committeeRole": "Executive Committee",
    "shares": 408737,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "JK",
    "joinedDate": "2024-01-01",
    "depositHistory": [
      {
        "id": "DEP-001-A",
        "date": "2024-01-01",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "Dan Aloo (Chairman)"
      },
      {
        "id": "DEP-001-B",
        "date": "2026-05-18",
        "amount": 288000,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited member capital contribution allocated to Mansa X Special Funds.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "Dan Aloo (Chairman)"
      },
      {
        "id": "DEP-001-C",
        "date": "2026-07-15",
        "amount": 120737,
        "destination": "Etica Capital MMF",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited member capital contribution allocated to Etica Capital MMF.",
        "attributedQuarter": "Q3-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q3-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "Dan Aloo (Chairman)"
      }
    ]
  },
  {
    "id": "MGR-002",
    "name": "Alice Tuei",
    "gender": "female",
    "role": "Member",
    "committeeRole": "General Member",
    "shares": 10800,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "AT",
    "joinedDate": "2024-04-12",
    "recruitedBy": "Dan Aloo",
    "depositHistory": [
      {
        "id": "DEP-002-A",
        "date": "2024-04-12",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q2-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-002-B",
        "date": "2026-05-08",
        "amount": 10800,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-003",
    "name": "Sarah Njoki",
    "gender": "female",
    "role": "Secretary",
    "committeeRole": "Executive Committee",
    "shares": 817,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "SN",
    "joinedDate": "2024-01-15",
    "depositHistory": [
      {
        "id": "DEP-003-A",
        "date": "2024-01-15",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-003-B",
        "date": "2026-04-20",
        "amount": 817,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-004",
    "name": "Dan Aloo",
    "gender": "male",
    "role": "Chairman",
    "committeeRole": "Executive Committee",
    "shares": 160076,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "DA",
    "joinedDate": "2024-01-01",
    "depositHistory": [
      {
        "id": "DEP-004-A",
        "date": "2024-01-01",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-004-B",
        "date": "2026-05-15",
        "amount": 120000,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited member capital contribution allocated to Mansa X Special Funds.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-004-C",
        "date": "2026-07-10",
        "amount": 40076,
        "destination": "Etica Capital MMF",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited member capital contribution allocated to Etica Capital MMF.",
        "attributedQuarter": "Q3-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q3-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-005",
    "name": "Moses Okwayo",
    "gender": "male",
    "role": "Member",
    "committeeRole": "General Member",
    "shares": 43162,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "MO",
    "joinedDate": "2024-03-01",
    "recruitedBy": "Dan Aloo",
    "depositHistory": [
      {
        "id": "DEP-005-A",
        "date": "2024-03-01",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-005-B",
        "date": "2026-05-14",
        "amount": 43162,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-006",
    "name": "Benjamin Ambrose Alila Madara",
    "gender": "male",
    "role": "Compliance Officer",
    "committeeRole": "Executive Committee",
    "shares": 10683,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "BM",
    "joinedDate": "2024-01-20",
    "depositHistory": [
      {
        "id": "DEP-006-A",
        "date": "2024-01-20",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-006-B",
        "date": "2026-05-05",
        "amount": 10683,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-007",
    "name": "Frederick Ongule Seunda",
    "gender": "male",
    "role": "Deceased Member",
    "committeeRole": "Estate Escrow (Deceased)",
    "shares": 13019,
    "regFeePaid": true,
    "status": "Deceased",
    "phone": "",
    "email": "",
    "avatar": "FO",
    "joinedDate": "2024-02-15",
    "recruitedBy": "Dan Aloo",
    "demiseDate": "2026-09-11",
    "beneficiaryName": "Declared Beneficiary / Estate Administrator",
    "beneficiaryRelation": "Beneficiary as per Records",
    "beneficiaryContact": "",
    "notes": "Deceased 11th Sept 2026. Non-refundable KES 1,000/= registration fee accounted for (Option B). Net shares KES 13,019.00 held in estate escrow.",
    "depositHistory": [
      {
        "id": "DEP-007-A",
        "date": "2024-02-15",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-007-B",
        "date": "2026-05-10",
        "amount": 13019,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution held in Estate Escrow (Option B: Gross KES 14,019 less KES 1,000 Reg Fee).",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "Dan Aloo (Chairman)"
      }
    ]
  },
  {
    "id": "MGR-008",
    "name": "Richard Ruto",
    "gender": "male",
    "role": "Member",
    "committeeRole": "General Member",
    "shares": 2540,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "RR",
    "joinedDate": "2024-03-10",
    "recruitedBy": "John Kennedy Obalah",
    "depositHistory": [
      {
        "id": "DEP-008-A",
        "date": "2024-03-10",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-008-B",
        "date": "2026-04-25",
        "amount": 2540,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-009",
    "name": "Dr Joash Migosi PhD",
    "gender": "male",
    "role": "Research Officer",
    "committeeRole": "Executive Committee",
    "shares": 4841,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "JM",
    "joinedDate": "2024-02-01",
    "depositHistory": [
      {
        "id": "DEP-009-A",
        "date": "2024-02-01",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-009-B",
        "date": "2026-05-02",
        "amount": 4841,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-010",
    "name": "Josephat Lubanga",
    "gender": "male",
    "role": "Vice Chairman",
    "committeeRole": "Executive Committee",
    "shares": 39000,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "JL",
    "joinedDate": "2024-01-10",
    "depositHistory": [
      {
        "id": "DEP-010-A",
        "date": "2024-01-10",
        "amount": 1000,
        "destination": "Cash in Bank",
        "type": "Registration Fee",
        "transactionRef": "REG-FEE-2026",
        "transactionMessage": "Mandatory non-refundable registration fee pool (Option B — 11 members registered).",
        "attributedQuarter": "Q1-2024",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      },
      {
        "id": "DEP-010-B",
        "date": "2026-05-12",
        "amount": 39000,
        "destination": "Mansa X Special Funds",
        "type": "Share Capital",
        "transactionRef": "AUDIT-2026",
        "transactionMessage": "Audited historical member capital contribution recognized in the October 2026 Statement of Financial Position.",
        "attributedQuarter": "Q2-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q2-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  },
  {
    "id": "MGR-011",
    "name": "Leoivard Omondi Ongule",
    "gender": "male",
    "role": "Treasurer",
    "committeeRole": "Executive Committee",
    "shares": 17000,
    "regFeePaid": true,
    "status": "Active",
    "phone": "",
    "email": "",
    "avatar": "LO",
    "joinedDate": "2026-10-14",
    "recruitedBy": "Executive Committee",
    "notes": "Appointed Acting Treasurer on 31/10/2026 by CEO John Kennedy Obalah following extensive executive consultations. Paid non-refundable registration fee KES 1,000/= on 14/10/2026 (Ref: UJDGFAA8WB) and KES 17,000/= share deposit on 29/10/2026 (Ref: UJSGF05XHV) into Etica Capital MMF (Joint Acc 34236M).",
    "depositHistory": [
      {
        "id": "DEP-011-A",
        "date": "2026-10-14",
        "amount": 1000,
        "destination": "Etica Capital MMF",
        "type": "Registration Fee",
        "transactionRef": "UJDGFAA8WB",
        "transactionMessage": "Direct deposit to ETICA CAPITAL LTD (Paybill 4096483, Acc 34236M, Ref: UJDGFAA8WB on 14/10/2026) — Mandatory non-refundable registration fee reserve.",
        "attributedQuarter": "Q4-2026",
        "isMmfPrincipal": false,
        "mmfPrincipalQuarter": null,
        "status": "Verified & Reconciled",
        "approvedBy": "Dan Aloo (Chairman)"
      },
      {
        "id": "DEP-011-B",
        "date": "2026-10-29",
        "amount": 17000,
        "destination": "Etica Capital MMF",
        "type": "Share Capital",
        "transactionRef": "UJSGF05XHV",
        "transactionMessage": "Direct deposit to ETICA CAPITAL LTD (Paybill 4096483, Acc 34236M, Ref: UJSGF05XHV on 29/10/2026) — Share capital contribution.",
        "attributedQuarter": "Q4-2026",
        "isMmfPrincipal": true,
        "mmfPrincipalQuarter": "Q4-2026",
        "status": "Verified & Reconciled",
        "approvedBy": "John Kennedy Obalah (CEO)"
      }
    ]
  }
];

export const INITIAL_GROUP_ASSETS = {
  mansaX: {
    name: "Mansa X Special Funds",
    principal: 500000.00,
    interestAccrued: 41587.00,
    totalBalance: 541587.00,
    interestRateAnnualized: 0.20, // 20%
    asOfDate: "2026-09-30",
    notes: "Returns from Mansa X are much higher than Etica Capital MMF (~20% p.a.). Priority investment vehicle."
  },
  eticaMmf: {
    name: "Etica Capital MMF",
    statementBalance: 250209.74,
    openingBalance: 230587.79,
    octoberInflows: 18000.00,
    octoberNetInterest: 1621.95,
    interestRateAnnualized: 0.125, // 12.5%
    asOfDate: "2026-10-31",
    paybillBusinessNo: "4096483",
    clientCode: "34236M",
    payeeName: "ETICA CAPITAL LTD",
    notes: "EMMF Joint Account 34236M official statement as at Oct. 31, 2026. Opening Balance: KES 230,587.79, Oct 14 Inflow: KES 1,000.00 (Leoivard reg fee), Oct 29 Inflow: KES 17,000.00 (Leoivard share deposit), October Net Interest: KES 1,621.95. Closing Balance: KES 250,209.74."
  },
  bankAccount: {
    name: "Cash in Bank",
    balance: 2512.00,
    bankName: "Equity Bank Kenya",
    accountNumber: "Chama Joint Account",
    notes: "Main operational clearing and Chama joint account (Lowest ledger fees in banking sector & flexible Chama opening)"
  },
  groupReserveAccount: {
    name: "Group Reserve & Reg Fee Account",
    balance: 11000.00, // 11 members * 1,000 non refundable registration fee
    description: "KSh 1,000/= non-refundable registration fee collected per member for formal registration in 2026 + 10% loan interest pools."
  }
};

export const INITIAL_POLICIES = [
  {
    id: "POL-001",
    title: "New Member Approval & Registration Deposit Policy",
    category: "Membership",
    dateEffective: "2026-01-01",
    author: "Dan Aloo (Chairman) & John Kennedy Obalah (CEO)",
    content: "New member approval is strictly granted after depositing the mandatory non-refundable KSh 1,000/= registration fee to the Group Account (e.g. into Etica Capital MMF or Bank). Until this KSh 1,000 deposit is verified by the Executive Committee, applicants remain in 'Pending Approval' status with zero voting rights and no loan borrowing eligibility. Upon deposit verification, the applicant is officially admitted as an approved member and issued their Membership ID.",
    active: true
  },
  {
    id: "POL-002",
    title: "Loan Facility & 80% Borrowing Threshold",
    category: "Credit & Lending",
    dateEffective: "2025-06-01",
    author: "Benjamin Ambrose Madara (Compliance Officer)",
    content: "A member is eligible to borrow up to a maximum limit of 80% of their total active shareholding in the group. A mandatory 10% interest is charged on the borrowed principal, which is immediately debited and credited directly to the Group Account to boost collective reserves.",
    active: true
  },
  {
    id: "POL-003",
    title: "Peer-to-Peer Direct Liquid Loan Settlement",
    category: "Credit & Lending",
    dateEffective: "2025-09-15",
    author: "Leoivard Omondi Ongule (Treasurer)",
    content: "Where liquid funds are provided directly by a fellow member rather than group cash reserves, the borrower's loan amount collateral is instantly debited from their share capital and credited to the payee providing the liquid funds, ensuring complete security and zero club default risk.",
    active: true
  },
  {
    id: "POL-004",
    title: "Exit Clause & Deceased Member Settlement",
    category: "Governance & Succession",
    dateEffective: "2025-01-01",
    author: "Sarah Njoki (Secretary) & Dr Joash Migosi PhD",
    content: "In the event of a member's demise, their account shall carry a 'Deceased' tag. Dues payable to the declared beneficiary shall be calculated and settled at the close of the financial year pursuant to the club's exit policy. Alternatively, management may offer the deceased member's shares for internal purchase to active members to provide prompt liquidity to the estate.",
    active: true
  },
  {
    id: "POL-005",
    title: "MMF Yield Maximization & Mansa X Allocation",
    category: "Investments",
    dateEffective: "2026-10-01",
    author: "Dr Joash Migosi PhD (Research Officer)",
    content: "The club shall actively channel reserves into highest-yielding regulated instruments. Mansa X special fund currently delivers ~20% annualized yield compared to Etica Capital MMF. The executive committee shall resolve bank withdrawal restrictions to maximize allocations to Mansa X.",
    active: true
  },
  {
    id: "POL-006",
    title: "CEO Investment Principle: Multi-Asset & Institutional Diversification Policy",
    category: "Investments",
    dateEffective: "2026-11-05",
    author: "John Kennedy Obalah (CEO)",
    content: "One of the core principles of investment is diversification: (1) Etica Capital MMF shall be maintained as a single consolidated MMF portfolio; (2) SIB — Standard Investment Bank (Mansa-X Special Fund) serves as our high-yield anchor; (3) Nabo Capital is approved for secondary institutional fund diversification; and (4) future club capital tranches shall diversify across CBK Government Securities (Treasury Bills & Bonds), Tax-Exempt Infrastructure Bonds (IFBs), Derivatives, REITs (Real Estate Investment Trusts), and ETFs (Exchange-Traded Funds).",
    active: true
  }
];

export const INITIAL_RESOLUTIONS = [
  {
    id: "RES-2026-001",
    title: "Resolution on Etica Capital MMF Withdrawal & Mansa X Capital Reallocation",
    description: "Urgent resolution authorising the Executive Committee to formally petition and engage Etica Capital MMF management to allow withdrawal of KSh 150,000/= to KSh 200,000/= for reinvestment into Mansa X Special Funds yielding ~20% p.a.",
    proposedBy: "John Kennedy Obalah (CEO)",
    deadline: "2026-11-15",
    status: "Active",
    votes: {
      yes: ["MGR-001", "MGR-004", "MGR-011", "MGR-009", "MGR-010"],
      no: [],
      abstain: ["MGR-006"]
    },
    quorumNeeded: 7
  },
  {
    id: "RES-2026-002",
    title: "Exit Settlement Procedure for Late Frederick Ongule Seunda's Beneficiary",
    description: "Authorization to compute terminal share value (KSh 13,019.00 net of KSh 1,000 registration fee plus pro-rata MMF interest) of late member Frederick Ongule Seunda and open internal share acquisition window to members before final financial year payout.",
    proposedBy: "Leoivard Omondi Ongule (Treasurer)",
    deadline: "2026-11-20",
    status: "Active",
    votes: {
      yes: ["MGR-011", "MGR-001", "MGR-004", "MGR-003"],
      no: [],
      abstain: []
    },
    quorumNeeded: 7
  },
  {
    id: "RES-2026-003",
    title: "Formal Registration of MGR Investment Group in 2026",
    description: "Approve the utilization of KSh 1,000/= non-refundable subscription funds accumulated in the Group Account for legal registration as a formal Limited Liability Partnership or Registered Investment Club.",
    proposedBy: "Dan Aloo (Chairman)",
    deadline: "2026-12-05",
    status: "Active",
    votes: {
      yes: ["MGR-004", "MGR-001", "MGR-006", "MGR-003", "MGR-010", "MGR-005"],
      no: [],
      abstain: []
    },
    quorumNeeded: 7
  }
];

export const INITIAL_LOANS = [];

export const INITIAL_LEDGER = [
  {
    id: "TX-1001",
    date: "2026-05-01",
    description: "Principal Investment Allocation into Mansa X Special Funds (May 2026)",
    debitAccount: "Mansa X Special Funds",
    creditAccount: "Members Capital Pool",
    amount: 500000.00,
    type: "Investment"
  },
  {
    id: "TX-1002",
    date: "2026-09-30",
    description: "Mansa X Q3 Interest Accrued as at 30/09/2026 (~20% p.a.)",
    debitAccount: "Mansa X Special Funds",
    creditAccount: "Interest Income / Surplus",
    amount: 41587.00,
    type: "Interest"
  },
  {
    id: "TX-1003",
    date: "2026-09-30",
    description: "Etica Capital MMF Opening Balance Recognition prior to October Inflows",
    debitAccount: "Etica Capital MMF",
    creditAccount: "Members Capital Pool & MMF Surplus",
    amount: 230587.79,
    type: "MMF Statement"
  },
  {
    id: "TX-1004",
    date: "2026-10-13",
    description: "Direct Deposit by New Member No. 011 Leoivard Omondi Ongule to ETICA CAPITAL LTD (Paybill 4096483, Client Code 34236M, Ref: UJDGFAA8WB at 9:04 PM) — Non-Refundable Registration Fee (Deducted from Member Shares)",
    debitAccount: "Etica Capital MMF",
    creditAccount: "Group Reserve Account (Non-refundable Registration Pool)",
    amount: 1000.00,
    type: "Registration Fee"
  },
  {
    id: "TX-1005",
    date: "2026-10-28",
    description: "Direct Deposit by New Member No. 011 Leoivard Omondi Ongule to ETICA CAPITAL LTD (Paybill 4096483, Client Code 34236M, Ref: UJSGF05XHV at 5:10 PM — Bringing Etica statement balance to KES 250,209.74 as at 31/10/2026)",
    debitAccount: "Etica Capital MMF",
    creditAccount: "Leoivard Omondi Ongule - Shares",
    amount: 17000.00,
    type: "Deposit"
  },
  {
    id: "TX-1006",
    date: "2026-10-30",
    description: "Cash in Bank Balance Verification (Stanbic Bank Kenya)",
    debitAccount: "Cash in Bank",
    creditAccount: "Group Operating & Surplus Reserves",
    amount: 2512.00,
    type: "Liquidity"
  },
  {
    id: "TX-1007",
    date: "2026-10-31",
    description: "Etica Capital MMF Net October Interest Accrued (Oct 1 to Oct 31, 2026 — Statement Account 34236M, Net of 15% WHT, credited to Retained Surplus)",
    debitAccount: "Etica Capital MMF",
    creditAccount: "Undistributed Group Retained Surplus",
    amount: 1621.95,
    type: "Interest"
  }
];

export const INITIAL_PROSPECTS = [];

export const INITIAL_PORTFOLIO_ADVISORIES = [
  {
    id: "ADV-001",
    category: "PORTFOLIO REALLOCATION ANALYSIS",
    title: "Annual Opportunity Loss: KES 17,294/=",
    content: "Mansa X special funds deliver ~20% annualized yield vs Etica Capital MMF at ~12.5%. Etica's withdrawal restrictions on KES 250,209.74 are currently costing members KES 18,765/= per year in missed yield.",
    financialImpact: "KES 18,765/=",
    actionLabel: "Resolve Withdrawal Lock",
    actionTarget: "governance",
    severity: "warning",
    status: "active",
    author: "Dr Joash Migosi PhD & John Kennedy Obalah",
    createdAt: "2026-10-15",
    resolvedAt: null,
    resolvedBy: null,
    resolutionNotes: null
  },
  {
    id: "ADV-002",
    category: "CEO PORTFOLIO DIVERSIFICATION DIRECTIVE",
    title: "Multi-Asset Diversification: Etica (1 Portfolio), SIB, Nabo Capital, T-Bills/Bonds, IFBs, Derivatives, REITs & ETFs",
    content: "One of the principles of investment is diversification: In Etica Capital MMF we can do only one portfolio. Others we should do include: (1) SIB — Standard Investment Bank, (2) Nabo Capital, (3) Government Securities (Treasury Bills / Bonds), (4) Tax-Exempt Infrastructure Bonds, and (5) Capital Markets instruments including Derivatives, REITs, and ETFs.",
    financialImpact: "Multi-Asset Shield",
    actionLabel: "View Diversification Roadmap",
    actionTarget: "mmf",
    severity: "info",
    status: "active",
    author: "John Kennedy Obalah (CEO)",
    createdAt: "2026-11-05",
    resolvedAt: null,
    resolvedBy: null,
    resolutionNotes: null
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ANN-004",
    title: "CEO Investment Directive: Principle of Portfolio Diversification Across 6 Asset Pillars",
    category: "Investment & Yield Notice",
    priority: "Official Notice",
    date: "2026-11-05",
    author: "John Kennedy Obalah (CEO)",
    content: "One of the principles of investment is diversification: In Etica Capital MMF we can do only one portfolio. Others we should do include SIB (Standard Investment Bank), Nabo Capital, Government Securities (Treasury Bills / Bonds), Infrastructure Bonds, Derivatives, REITs, and ETFs to protect member capital and maximize risk-adjusted yields.",
    actionLabel: "Open Diversification Strategy",
    actionTarget: "mmf",
    pinned: true
  },
  {
    id: "ANN-005",
    title: "Executive Gazette: Appointment of Leoivard Omondi Ongule as Acting Treasurer",
    category: "Governance & Treasury",
    priority: "Official Gazette",
    date: "2026-10-31",
    author: "John Kennedy Obalah (CEO)",
    content: "Following extensive consultations within the Executive Committee, CEO John Kennedy Obalah has appointed Leoivard Omondi Ongule as Acting Treasurer of MGR Investment Club with immediate effect, and revoked the appointment of Benjamin Ambrose Alila Madara as Treasurer, reassigning him to Compliance Officer. The full Executive Committee stands confirmed as: Dan Aloo (Chairman), Josephat Lubanga (Vice Chairman), Sarah Njoki (Secretary), Leoivard Omondi Ongule (Treasurer), Dr Joash Migosi PhD (Research Officer), Benjamin Ambrose Alila Madara (Compliance Officer), and John Kennedy Obalah (CEO).",
    actionLabel: "View Executive Roster",
    actionTarget: "governance",
    pinned: true
  },
  {
    id: "ANN-001",
    title: "Bereavement Notice: Demise of Member Frederick Ongule Seunda (11th September 2026)",
    category: "Bereavement & Demise Notice",
    priority: "Urgent",
    date: "2026-09-11",
    author: "Sarah Njoki (Secretary) & Dan Aloo (Chairman)",
    content: "It is with profound sorrow that the Executive Committee announces the passing of our esteemed member, Frederick Ongule Seunda (Member No: 007), on 11th September 2026. In accordance with Bylaw Clause 4.2 and Policy POL-004, his net share capital of KES 13,019.00 (gross KES 14,019.00 less KES 1,000 non-refundable registration fee) has been placed in estate escrow. Terminal dues will be calculated and settled to his declared beneficiary at the close of the financial year, or members may acquire his shares through internal buyout to provide immediate liquidity to the bereaved family.",
    actionLabel: "View Estate Buyout Window",
    actionTarget: "marketplace",
    pinned: true,
    memberId: "MGR-007"
  },
  {
    id: "ANN-002",
    title: "Quarter 3 Mansa X Accrued Interest (KES 41,587.00 — Retained Undistributed)",
    category: "Investment & Yield Notice",
    priority: "Official Notice",
    date: "2026-10-30",
    author: "John Kennedy Obalah (CEO) & Dr Joash Migosi PhD",
    content: "The Executive Committee notes the accrued net interest of KES 41,587.00 from Mansa X Special Funds (~20% p.a.). Pursuant to Chama treasury resolution, all interest earned is retained undistributed at the collective group level in the Chama Retained Surplus Account. Interest is NOT assigned or distributed to individual member accounts yet, preserving collective reserves until formal registration in 2026 and the Annual General Meeting (AGM).",
    actionLabel: "View Balanced Sheet",
    actionTarget: "ledger",
    pinned: false
  },
  {
    id: "ANN-003",
    title: "Executive Resolution: Etica Capital MMF Withdrawal Reallocation",
    category: "Governance & Treasury",
    priority: "High Priority",
    date: "2026-10-25",
    author: "Dan Aloo (Chairman) & Benjamin Madara",
    content: "Notice of formal petition to Etica Capital MMF management to lift withdrawal lock on KES 250,209.74 for reinvestment into Mansa X Special Funds to stop annual opportunity losses of KES 18,765.00 per year.",
    actionLabel: "View Resolution & Vote",
    actionTarget: "governance",
    pinned: false
  }
];
