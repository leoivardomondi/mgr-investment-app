// ============================================================================
// MGR INVESTMENT GROUP — PORTFOLIO TARGETS, MARKET RATES & MEMBER PORTRAITS
// Clean MGR-specific investment parameters & CMA market yield benchmarks
// ============================================================================

export const KENYA_MMF_BENCHMARKS_2025 = [
  { rank: 1, manager: "Gulfcap Money Market Fund", grossRate: 13.87, netReturn: 11.79, aum: "CMA Licensed MMF", tag: "Market Leader" },
  { rank: 2, manager: "Cytonn Money Market Fund", grossRate: 13.85, netReturn: 11.77, aum: "CMA Licensed MMF", tag: "High Yield" },
  { rank: 3, manager: "Kuza Money Market Fund", grossRate: 13.83, netReturn: 11.76, aum: "CMA Licensed MMF", tag: "High Yield" },
  { rank: 4, manager: "Orient Money Market Fund", grossRate: 13.40, netReturn: 11.39, aum: "CMA Licensed MMF", tag: null },
  { rank: 5, manager: "Lofty Corban Money Market Fund", grossRate: 13.15, netReturn: 11.18, aum: "CMA Licensed MMF", tag: null },
  { rank: 6, manager: "Ndovu Money Market Fund", grossRate: 13.06, netReturn: 11.10, aum: "CMA Licensed MMF", tag: null },
  { rank: 7, manager: "Etica Money Market Fund", grossRate: 13.04, netReturn: 11.08, aum: "KES 250,209.74 (MGR Active Holding as at 31/10/2026)", tag: "MGR Portfolio" },
  { rank: 8, manager: "Gen Africa Money Market Fund", grossRate: 12.89, netReturn: 10.96, aum: "CMA Licensed MMF", tag: null },
  { rank: 9, manager: "Nabo Money Market Fund", grossRate: 12.85, netReturn: 10.92, aum: "CMA Licensed MMF", tag: null },
  { rank: 10, manager: "Enwealth Money Market Fund", grossRate: 12.65, netReturn: 10.75, aum: "CMA Licensed MMF", tag: null },
  { rank: 11, manager: "ArvoCap Money Market Fund", grossRate: 12.64, netReturn: 10.74, aum: "CMA Licensed MMF", tag: null },
  { rank: 12, manager: "Britam Money Market Fund", grossRate: 12.43, netReturn: 10.57, aum: "CMA Licensed MMF", tag: null },
  { rank: 13, manager: "Old Mutual Money Market Fund", grossRate: 12.32, netReturn: 10.47, aum: "CMA Licensed MMF", tag: null },
  { rank: 14, manager: "Madison Money Market Fund", grossRate: 11.84, netReturn: 10.06, aum: "CMA Licensed MMF", tag: null },
  { rank: 15, manager: "Apollo Money Market Fund", grossRate: 11.61, netReturn: 9.87, aum: "CMA Licensed MMF", tag: null },
  { rank: 16, manager: "Jubilee Money Market Fund", grossRate: 11.55, netReturn: 9.82, aum: "CMA Licensed MMF", tag: null },
  { rank: 17, manager: "Dry Associates Money Market Fund", grossRate: 11.49, netReturn: 9.77, aum: "CMA Licensed MMF", tag: null },
  { rank: 18, manager: "Sanlam Money Market Fund", grossRate: 11.43, netReturn: 9.72, aum: "CMA Licensed MMF", tag: null },
  { rank: 19, manager: "I&M Money Market Fund", grossRate: 11.41, netReturn: 9.70, aum: "CMA Licensed MMF", tag: null },
  { rank: 20, manager: "Faulu Money Market Fund", grossRate: 11.38, netReturn: 9.67, aum: "CMA Licensed MMF", tag: null },
  { rank: 21, manager: "CIC Money Market Fund", grossRate: 10.85, netReturn: 9.22, aum: "CMA Licensed MMF", tag: null },
  { rank: 22, manager: "African Alliance Money Market Fund", grossRate: 10.78, netReturn: 9.16, aum: "CMA Licensed MMF", tag: null },
  { rank: 23, manager: "Absa Money Market Fund", grossRate: 10.58, netReturn: 8.99, aum: "CMA Licensed MMF", tag: null },
  { rank: 24, manager: "Co-op Money Market Fund", grossRate: 10.58, netReturn: 8.99, aum: "CMA Licensed MMF", tag: null },
  { rank: 25, manager: "ICEA Money Market Fund", grossRate: 10.43, netReturn: 8.87, aum: "CMA Licensed MMF", tag: null },
  { rank: 26, manager: "KCB Money Market Fund", grossRate: 10.23, netReturn: 8.70, aum: "CMA Licensed MMF", tag: null },
  { rank: 27, manager: "Gencap Money Market Fund", grossRate: 10.02, netReturn: 8.52, aum: "CMA Licensed MMF", tag: null },
  { rank: 28, manager: "Mali Money Market Fund", grossRate: 10.01, netReturn: 8.51, aum: "CMA Licensed MMF", tag: null },
  { rank: 29, manager: "Mayfair Money Market Fund", grossRate: 9.66, netReturn: 8.21, aum: "CMA Licensed MMF", tag: null },
  { rank: 30, manager: "Stanbic Money Market Fund", grossRate: 7.58, netReturn: 6.44, aum: "KES 2,512.00 (MGR Operations Bank)", tag: "MGR Banker" },
  { rank: 31, manager: "Ziidi Money Market Fund", grossRate: 7.25, netReturn: 6.16, aum: "Mobile MMF", tag: null },
  { rank: 32, manager: "Equity Money Market Fund", grossRate: 5.48, netReturn: 4.66, aum: "Bank MMF", tag: null }
];

export const CBK_MACRO_INDICATORS = {
  publishedDate: "30th October 2026",
  averageMmfGross: 11.38,
  averageMmfNet: 9.67,
  tbill91DayGross: 8.44,
  tbill91DayNet: 7.20,
  tbill182DayGross: 8.62,
  tbill182DayNet: 7.30,
  tbill364DayGross: 10.02,
  tbill364DayNet: 8.60,
  inflationRate: 3.60,
  centralBankRate: 10.00,
  withholdingTaxRate: 15.0
};

export const MANSA_X_FACT_SHEET = {
  fundName: "Mansa-X Special Fund",
  fundManager: "Standard Investment Bank (SIB)",
  regulator: "Capital Markets Authority (CMA)",
  historicalReturns: [
    { year: "2023", netReturn: 18.01 },
    { year: "2024", netReturn: 19.53 },
    { year: "2025", netReturn: 19.80 },
    { year: "2026 Q3", netReturn: 20.00 }
  ],
  minInvestmentKES: 250000,
  minInvestmentUSD: 2500,
  lockInPeriod: "6 Months",
  managementFee: "5.0% p.a.",
  performanceFee: "10% on returns exceeding 25% (KES)",
  liquidityWindow: "48–72 Hours after lock-in",
  strategy: "MGR Investment Group's primary high-yield special fund holding (KES 500,000.00 principal + KES 41,587.00 Q3 net return = KES 541,587.00)."
};

export const COMMITTEE_TARGET_ALLOCATION = {
  signatories: [
    { name: "Dan Aloo (MGR-004)", role: "Chairman, Executive Committee" },
    { name: "John Kennedy Obalah (MGR-001)", role: "CEO" },
    { name: "Dr Joash Migosi PhD (MGR-009)", role: "Research Officer" },
    { name: "Leoivard Omondi Ongule (MGR-011)", role: "Treasurer" }
  ],
  proposalDate: "30th October 2026",
  buckets: [
    {
      assetClass: "Mansa-X Special Fund (Standard Investment Bank)",
      targetPercent: 70,
      instruments: "Primary high-yield CMA-regulated Special Fund (Current: KES 541,587.00)",
      projectedNetYield: "18.0% – 20.0% p.a.",
      midYield: 20.00
    },
    {
      assetClass: "Etica Capital Money Market Fund",
      targetPercent: 28,
      instruments: "Liquid Money Market Fund holding (Current: KES 250,209.74 as at 31/10/2026 — single MMF portfolio)",
      projectedNetYield: "11.08% – 12.50% p.a.",
      midYield: 12.50
    },
    {
      assetClass: "Equity Bank Operational & Registration Reserve",
      targetPercent: 2,
      instruments: "Equity Bank Kenya Chama Joint Account (KES 2,512.00) & Member Reg Pool (KES 11,000.00) — Lowest Ledger Fees",
      projectedNetYield: "Operational Liquidity",
      midYield: 0.00
    }
  ]
};

export const MEMBER_RESEARCH_PORTFOLIOS = [
  {
    num: "1",
    title: "Fixed Income Funds (FIFs)",
    badge: "Credit & Fixed Coupon",
    summary: "Institutional corporate debt funds, commercial paper, and high-yield private credit funds offering stable coupon yields above standard bank deposits."
  },
  {
    num: "2",
    title: "Derivatives (NEXT Market)",
    badge: "Risk Hedging & Futures",
    summary: "Nairobi Securities Exchange Derivatives Market (NEXT) equity index futures, single-stock futures, and downside hedging instruments."
  },
  {
    num: "3",
    title: "Real Estate Investment Trusts (REITs)",
    badge: "Property & ≥80% Payout",
    summary: "CMA-regulated Income REITs (I-REITs like ILAM Fahari) and Development REITs (D-REITs like Acorn Student Accommodation REITs) with mandatory distribution."
  },
  {
    num: "4",
    title: "Exchange Traded Funds (ETFs)",
    badge: "Gold & Commodity Hedge",
    summary: "Listed physical asset trackers (such as the Absa NewGold ETF on the NSE), providing a gold bullion hedge against inflation and shilling depreciation."
  },
  {
    num: "5",
    title: "Government Securities, T-Bills & Bonds (Especially IFs / Infrastructure Bonds)",
    badge: "100% Tax-Free Sovereign",
    summary: "Central Bank of Kenya Treasury Bills (91/182/364-day) and Treasury Bonds, especially Infrastructure Bonds (IFBs) offering 100% tax-free coupon yields with sovereign backing."
  },
  {
    num: "6",
    title: "Nairobi Securities Exchange (NSE Equities)",
    badge: "Capital Growth & Dividends",
    summary: "Publicly traded blue-chip equities on the Nairobi Securities Exchange (Safaricom, Equity Group, KCB Group, EABL, StanChart) for long-term equity compounding and dividends."
  }
];

export const MGR_OFFICIAL_IPS_POLICY = {
  bankPolicy: {
    bankName: "Equity Bank Kenya",
    accountType: "Chama Joint Bank Account",
    rationale: "Maintained as our primary commercial bank because it is the only bank flexible enough to open a Chama joint bank account (other commercial banks insist on an investment club registration certificate first). Furthermore, Equity Bank provides the lowest ledger and account maintenance fees in the Kenyan banking sector."
  },
  returnOnInvestment: {
    mansaX: {
      name: "Mansa-X Special Fund (Standard Investment Bank)",
      yieldNote: "Yields fluctuate with multi-asset market conditions (~18%–20% p.a.). MGR keeps monitoring performance continuously so that if yields drop, the Club promptly compares alternative portfolios and makes quick investment decisions."
    },
    eticaMmf: {
      name: "Etica Capital Money Market Fund",
      yieldNote: "The benchmark figure of 11.08% – 12.50% p.a. is also subject to fluctuations based on Central Bank of Kenya (CBK) rate movements and prevailing liquidity."
    }
  },
  ipsWorkflow: {
    step1: "Research from Investment Officer / Analyst (with external peer note comparisons before floating ideas)",
    step2: "Discussion and stress-testing by the Executive Committee",
    step3: "Democratic ratification by the General Membership"
  },
  tacticalReallocation: {
    amount: "KES 200,000.00",
    source: "Etica Capital MMF",
    destination: "Mansa-X Special Fund (Standard Investment Bank)",
    timing: "As soon as Etica Capital MMF grants liquidity access to funds",
    reason: "Mansa-X returns are currently the most competitive in the market."
  },
  researchPortfolios: [
    "1) FIF (Fixed Income Funds)",
    "2) Derivatives (NEXT Market)",
    "3) REITs (Real Estate Investment Trusts)",
    "4) ETFs (Exchange Traded Funds)",
    "5) Government Securities / Treasury Bills / Bonds (especially IFs / Infrastructure Funds)",
    "6) Nairobi Securities Exchange (NSE Equities)"
  ]
};

export const CEO_DIVERSIFICATION_DIRECTIVE = {
  author: "John Kennedy Obalah (CEO — MGR-001)",
  date: "5th November 2026",
  corePrinciple: "One of the core principles of investment is diversification. In Etica Capital MMF we can maintain a single liquid portfolio, while diversifying our broader club capital across top-tier regulated managers and multi-asset classes:",
  pillars: [
    {
      code: "PILLAR 1",
      institution: "Etica Capital MMF",
      category: "Single Liquid MMF Portfolio",
      status: "Active Holding (KES 250,209.74 as at 31/10/2026)",
      yieldBenchmark: "13.04% Gross / 11.08% Net",
      mandate: "Maintain as 1 consolidated liquid Money Market Fund portfolio for member onboarding inflows & short-term treasury liquidity."
    },
    {
      code: "PILLAR 2",
      institution: "SIB — Standard Investment Bank (Mansa-X)",
      category: "Special Multi-Asset Fund",
      status: "Active Anchor Holding (KES 541,587.00)",
      yieldBenchmark: "~19.80% – 20.00% Net p.a.",
      mandate: "Primary high-yield CMA-regulated special fund delivering superior compounded returns for MGR shareholders."
    },
    {
      code: "PILLAR 3",
      institution: "Nabo Capital",
      category: "Tier-1 Institutional Money Market & Fixed Income",
      status: "Approved Diversification Target",
      yieldBenchmark: "12.85% Gross / 10.92% Net (Rank #9 CMA)",
      mandate: "Secondary institutional fund manager to eliminate single-manager concentration risk alongside Etica & SIB."
    },
    {
      code: "PILLAR 4",
      institution: "Government Securities (Treasury Bills & Bonds)",
      category: "CBK Sovereign Debt (91 / 182 / 364-Day T-Bills & Fixed Coupon Bonds)",
      status: "Approved Diversification Target",
      yieldBenchmark: "8.44% – 15.50% p.a. (Risk-Free Sovereign)",
      mandate: "Direct Central Bank of Kenya (DhowCSD) sovereign placements for guaranteed principal security and predictable coupon cashflows."
    },
    {
      code: "PILLAR 5",
      institution: "Infrastructure Bonds (IFBs)",
      category: "100% Tax-Exempt Sovereign Infrastructure Bonds",
      status: "Approved High-Priority Target",
      yieldBenchmark: "14.00% – 16.50% Net (0% WHT)",
      mandate: "Tax-free sovereign infrastructure bonds issued by CBK with zero withholding tax, maximizing net distributable member yields."
    },
    {
      code: "PILLAR 6",
      institution: "Derivatives, REITs & ETFs",
      category: "NSE NEXT Derivatives, Real Estate Investment Trusts (REITs) & Exchange-Traded Funds (ETFs)",
      status: "Approved Capital Markets Sleeve",
      yieldBenchmark: "Capital Appreciation + Hedged Yield",
      mandate: "Exposure to income/development REITs (e.g., Acorn I-REIT/D-REIT), global/local ETFs, and regulated derivatives for inflation hedging and long-term capital growth."
    }
  ]
};


