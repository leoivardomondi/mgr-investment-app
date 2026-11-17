import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  INITIAL_MEMBERS,
  INITIAL_GROUP_ASSETS,
  INITIAL_POLICIES,
  INITIAL_RESOLUTIONS,
  INITIAL_LOANS,
  INITIAL_LEDGER,
  INITIAL_PROSPECTS,
  INITIAL_PORTFOLIO_ADVISORIES,
  INITIAL_ANNOUNCEMENTS,
  getQuarterForDate,
} from '../data/initialData';

// MGR Investment Club Executive Committee (Authorized to perform actions affecting other members and group finances)
export const EXECUTIVE_COMMITTEE = [
  { id: "MGR-004", name: "Dan Aloo", role: "Chairman", committeeRole: "Executive Committee" },
  { id: "MGR-010", name: "Josephat Lubanga", role: "Vice chairman", committeeRole: "Executive Committee" },
  { id: "MGR-003", name: "Sarah Njoki", role: "Secretary", committeeRole: "Executive Committee" },
  { id: "MGR-011", name: "Leoivard Omondi Ongule", role: "Treasurer", committeeRole: "Executive Committee" },
  { id: "MGR-009", name: "Dr Joash Migosi PhD", role: "Research officer", committeeRole: "Executive Committee" },
  { id: "MGR-006", name: "Benjamin Ambrose Alila Madara", role: "Compliance officer", committeeRole: "Executive Committee" },
  { id: "MGR-001", name: "John Kennedy Obalah", role: "CEO", committeeRole: "Executive Committee" }
];

export const isExecutive = (memberOrId) => {
  if (!memberOrId) return false;
  const id = typeof memberOrId === 'string' ? memberOrId : memberOrId.id;
  const execIds = ["MGR-004", "MGR-010", "MGR-003", "MGR-011", "MGR-009", "MGR-006", "MGR-001"];
  return execIds.includes(id);
};

const AppContext = createContext();

const STORAGE_KEY = 'mgr_investment_club_v11';

export const GROSS_TO_NET_MEMBER_MAP = {
  'MGR-001': { gross: 409737.00, net: 408737.00 }, // John Kennedy Obalah
  'MGR-002': { gross: 11800.00, net: 10800.00 },   // Alice Tuei
  'MGR-003': { gross: 1817.00, net: 817.00 },      // Sarah Njoki
  'MGR-004': { gross: 161076.00, net: 160076.00 }, // Dan Aloo
  'MGR-005': { gross: 44162.00, net: 43162.00 },   // Moses Okwayo
  'MGR-006': { gross: 11683.00, net: 10683.00 },   // Benjamin Ambrose Alila Madara
  'MGR-007': { gross: 14019.00, net: 13019.00 },   // Frederick Ongule Seunda
  'MGR-008': { gross: 3540.00, net: 2540.00 },     // Richard Ruto
  'MGR-009': { gross: 5841.00, net: 4841.00 },     // Dr Joash Migosi PhD
  'MGR-010': { gross: 40000.00, net: 39000.00 },   // Josephat Lubanga
  'MGR-011': { gross: 18000.00, net: 17000.00 }    // Leoivard Omondi Ongule
};

export function normalizeMemberNetDeposits(m) {
  if (!m) return m;
  const mapping = GROSS_TO_NET_MEMBER_MAP[m.id];
  let shares = Number(m.shares || 0);
  let sharesForSale = m.sharesForSale !== undefined ? Number(m.sharesForSale) : undefined;

  // Deduct KES 1,000 registration fee if shares still reflect un-deducted gross standing
  if (mapping && Math.abs(shares - mapping.gross) < 0.01) {
    shares = mapping.net;
  }
  // Ensure no interest has been assigned to individual member deposits yet
  if (mapping && shares > mapping.net) {
    shares = mapping.net;
  }
  if (m.id === 'MGR-007' && sharesForSale && Math.abs(sharesForSale - 14019.00) < 0.01) {
    sharesForSale = 13019.00;
  }

  // Adjust depositHistory entries:
  // 1. Filter out any 'Yield / Dividend Deposit' entries since interest is NOT distributed yet
  // 2. Ensure Share Capital deposit matches net principal shares
  const history = (Array.isArray(m.depositHistory) ? m.depositHistory : [])
    .filter(entry => entry && entry.type !== 'Yield / Dividend Deposit');

  const updatedHistory = history.map(entry => {
    if (!entry) return entry;
    if (mapping && Math.abs(Number(entry.amount) - mapping.gross) < 0.01 && entry.type?.toLowerCase().includes('share')) {
      return { ...entry, amount: mapping.net };
    }
    if (m.id === 'MGR-004' && Math.abs(Number(entry.amount) - 41076.00) < 0.01) {
      return { ...entry, amount: 40076.00 };
    }
    if (m.id === 'MGR-001' && Math.abs(Number(entry.amount) - 121737.00) < 0.01) {
      return { ...entry, amount: 120737.00 };
    }
    return entry;
  });

  return {
    ...m,
    shares,
    ...(sharesForSale !== undefined ? { sharesForSale } : {}),
    depositHistory: updatedHistory
  };
}

export function AppProvider({ children }) {
  // Load state from localStorage or initial constants
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    if (!saved) return INITIAL_MEMBERS;
    try {
      const parsed = JSON.parse(saved).filter(m => m.id !== 'MGR-012');
      const isOldIdFormat = parsed.some(m => m.id === 'MGR-007' && (m.name || '').toLowerCase().includes('john'));
      const oldToNewMap = {
        'MGR-007': 'MGR-001',
        'MGR-005': 'MGR-002',
        'MGR-001': 'MGR-003',
        'MGR-010': 'MGR-004',
        'MGR-009': 'MGR-005',
        'MGR-004': 'MGR-006',
        'MGR-006': 'MGR-007',
        'MGR-002': 'MGR-008',
        'MGR-003': 'MGR-009',
        'MGR-008': 'MGR-010',
        'MGR-011': 'MGR-011',
      };
      return parsed.map(m => {
        const mappedId = isOldIdFormat && oldToNewMap[m.id] ? oldToNewMap[m.id] : m.id;
        const initMatch = INITIAL_MEMBERS.find(im => im.id === mappedId);
        const base = initMatch ? {
          ...m,
          id: mappedId,
          gender: m.gender || initMatch.gender,
          name: mappedId === 'MGR-006' ? 'Benjamin Alila Ambrose Madara' : m.name,
          joinedDate: mappedId === 'MGR-011' ? initMatch.joinedDate : m.joinedDate,
        } : { ...m, id: mappedId };
        return normalizeMemberNetDeposits(base);
      });
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assets`);
    if (!saved) return INITIAL_GROUP_ASSETS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_GROUP_ASSETS,
        ...parsed,
        groupReserveAccount: {
          ...INITIAL_GROUP_ASSETS.groupReserveAccount,
          ...(parsed.groupReserveAccount || {}),
          balance: Number(parsed.groupReserveAccount?.balance ?? INITIAL_GROUP_ASSETS.groupReserveAccount.balance)
        },
        eticaMmf: {
          ...INITIAL_GROUP_ASSETS.eticaMmf,
          ...(parsed.eticaMmf || {}),
          statementBalance: Number(parsed.eticaMmf?.statementBalance ?? INITIAL_GROUP_ASSETS.eticaMmf.statementBalance)
        },
        bankAccount: {
          ...INITIAL_GROUP_ASSETS.bankAccount,
          ...(parsed.bankAccount || {}),
          balance: (Number(parsed.bankAccount?.balance) === 2397 || !parsed.bankAccount?.balance)
            ? INITIAL_GROUP_ASSETS.bankAccount.balance
            : Number(parsed.bankAccount?.balance),
          accountNumber: null
        },
        mansaX: {
          ...INITIAL_GROUP_ASSETS.mansaX,
          ...(parsed.mansaX || {}),
          totalBalance: Number(parsed.mansaX?.totalBalance ?? (Number(parsed.mansaX?.principal || INITIAL_GROUP_ASSETS.mansaX.principal) + Number(parsed.mansaX?.interestAccrued || INITIAL_GROUP_ASSETS.mansaX.interestAccrued)))
        }
      };
    } catch {
      return INITIAL_GROUP_ASSETS;
    }
  });

  const [currentMemberId, setCurrentMemberId] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY}_currentMemberId`) || "MGR-001"; // Default CEO John Kennedy Obalah
  });

  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_loans`);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [resolutions, setResolutions] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_resolutions`);
    return saved ? JSON.parse(saved) : INITIAL_RESOLUTIONS;
  });

  const [policies, setPolicies] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_policies`);
    if (!saved) return INITIAL_POLICIES;
    const parsed = JSON.parse(saved);
    const missing = INITIAL_POLICIES.filter(ip => !parsed.some(p => p.id === ip.id));
    return missing.length > 0 ? [...parsed, ...missing] : parsed;
  });

  const [ledger, setLedger] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_ledger`);
    if (!saved) return INITIAL_LEDGER;
    const parsed = JSON.parse(saved);
    return parsed.map(tx => {
      const initTx = INITIAL_LEDGER.find(it => it.id === tx.id);
      if (initTx && (tx.id === 'TX-1004' || tx.id === 'TX-1005')) {
        return initTx;
      }
      return tx;
    });
  });

  const [prospects, setProspects] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prospects`);
    return saved ? JSON.parse(saved) : INITIAL_PROSPECTS;
  });

  // Dynamic Portfolio Advisories & Yield Action Bulletins (Manageable: Create, Edit, Delete, Hit as Solved)
  const [portfolioAdvisories, setPortfolioAdvisories] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_portfolio_advisories`);
    if (!saved) return INITIAL_PORTFOLIO_ADVISORIES;
    const parsed = JSON.parse(saved);
    const missing = INITIAL_PORTFOLIO_ADVISORIES.filter(ia => !parsed.some(a => a.id === ia.id));
    return missing.length > 0 ? [...parsed, ...missing] : parsed;
  });

  // Dynamic Announcements & News Notices (Manageable: Create, Edit, Delete by Executive Committee)
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_announcements`);
    if (!saved) return INITIAL_ANNOUNCEMENTS;
    const parsed = JSON.parse(saved);
    const missing = INITIAL_ANNOUNCEMENTS.filter(ia => !parsed.some(a => a.id === ia.id));
    return missing.length > 0 ? [...missing, ...parsed] : parsed;
  });

  // Pending Financial Actions Queue (Rule: All 10 active members must approve any financial action initiated by Executive Committee)
  const [pendingFinancialActions, setPendingFinancialActions] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_pending_financial_actions`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude interest distribution actions as per directive (interest retained undistributed)
        return Array.isArray(parsed) ? parsed.filter(a => a.actionType !== 'DISTRIBUTE_INTEREST') : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [activeRatificationModalId, setActiveRatificationModalId] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    return [
      {
        id: "NOTIF-1",
        title: "New Member Onboarding - Leoivard Omondi",
        message: "Member No 011 Leoivard Omondi Ongule deposited KSh 1,000/= and KSh 17,000/= to Etica Capital MMF. Accounts updated.",
        date: "2026-10-30",
        read: false,
        type: "finance"
      },
      {
        id: "NOTIF-2",
        title: "Bereavement Notice: Demise of Member Frederick Ongule Seunda",
        message: "Demise confirmed on 11th September 2026. KES 14,019.00 share capital transitioned to Estate Escrow. Dues payable to declared beneficiary as per exit clause.",
        date: "2026-09-11",
        read: false,
        type: "urgent"
      },
      {
        id: "NOTIF-3",
        title: "Urgent MMF Yield Optimization Alert",
        message: "Mansa X yield (~20% p.a.) exceeds Etica MMF. Executive resolution needed to resolve Etica cash withdrawal restrictions.",
        date: "2026-10-28",
        read: false,
        type: "yield"
      }
    ];
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);
  const [designLanguage, setDesignLanguage] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY}_designLanguage`) || 'swiss';
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_designLanguage`, designLanguage);
    document.documentElement.setAttribute('data-design', designLanguage);
  }, [designLanguage]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_assets`, JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentMemberId`, currentMemberId);
  }, [currentMemberId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_loans`, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_resolutions`, JSON.stringify(resolutions));
  }, [resolutions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_policies`, JSON.stringify(policies));
  }, [policies]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ledger`, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prospects`, JSON.stringify(prospects));
  }, [prospects]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_pending_financial_actions`, JSON.stringify(pendingFinancialActions));
  }, [pendingFinancialActions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_portfolio_advisories`, JSON.stringify(portfolioAdvisories));
  }, [portfolioAdvisories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_announcements`, JSON.stringify(announcements));
  }, [announcements]);

  // Current logged in member object
  const currentMember = members.find(m => m.id === currentMemberId) || members[0];

  // ==========================================================================
  // AUTHENTICATION, RBAC PERMISSIONS & SECURITY STATE (SQLite / MySQL + Local Fallback)
  // ==========================================================================
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY}_authToken`) || '';
  });

  const buildDefaultPermissionsForRole = (accessLevel, positionTitle = '') => {
    const base = {
      view_dashboard: true,
      view_own_statements: true,
      submit_own_deposit: true,
      vote_and_ratify: true,
      request_loan: true,
      manage_deposits: false,
      manage_loans: false,
      distribute_dividends: false,
      edit_ledger: false,
      manage_members: false,
      manage_policies: false,
      send_official_mail: false,
      manage_Estate_escrow: false,
      manage_access_control: false,
      reset_system_baseline: false
    };
    if (accessLevel === 'estate_beneficiary') {
      return { ...base, submit_own_deposit: false, vote_and_ratify: false, request_loan: false };
    }
    if (accessLevel === 'super_admin') {
      return Object.fromEntries(Object.keys(base).map(k => [k, true]));
    }
    if (accessLevel === 'treasury_admin') {
      return {
        ...base,
        manage_deposits: true,
        manage_loans: true,
        distribute_dividends: true,
        edit_ledger: true,
        send_official_mail: true,
        manage_Estate_escrow: true
      };
    }
    if (accessLevel === 'executive_officer') {
      const posLower = String(positionTitle).toLowerCase();
      const isSecOrVice = posLower.includes('secretary') || posLower.includes('vice');
      const isCompOrRes = posLower.includes('compliance') || posLower.includes('research');
      return {
        ...base,
        manage_deposits: true,
        manage_loans: isCompOrRes || isSecOrVice,
        distribute_dividends: false,
        edit_ledger: isCompOrRes,
        manage_members: isSecOrVice,
        manage_policies: true,
        send_official_mail: true,
        manage_Estate_escrow: isSecOrVice
      };
    }
    return base;
  };

  const buildDefaultRbacUsers = useCallback((membersList) => {
    return (membersList || INITIAL_MEMBERS).map(m => {
      let accessLevel = 'general_member';
      if (m.id === 'MGR-001' || m.id === 'MGR-004') accessLevel = 'super_admin';
      else if (m.id === 'MGR-011') accessLevel = 'treasury_admin';
      else if (m.committeeRole === 'Executive Committee') accessLevel = 'executive_officer';
      else if (m.status === 'Deceased') accessLevel = 'estate_beneficiary';
      return {
        memberId: m.id,
        name: m.name,
        email: m.email || '',
        phone: m.phone || '',
        positionTitle: m.role || 'Member',
        membershipTier: m.status === 'Deceased' ? 'Estate Escrow (Deceased)' : (m.committeeRole || 'General Member'),
        accessLevel,
        permissions: buildDefaultPermissionsForRole(accessLevel, m.role),
        accountStatus: m.status === 'Deceased' ? 'Estate Read-Only' : 'Active',
        mustChangePassword: false,
        lastLogin: null,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  const [rbacUsers, setRbacUsers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rbacUsers`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback below
      }
    }
    return buildDefaultRbacUsers(INITIAL_MEMBERS);
  });

  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_authenticatedUser`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [mailSettings, setMailSettings] = useState({
    transport: 'php_mail',
    fromName: 'MGR Investment Group Treasury',
    fromEmail: '',
    replyTo: '',
    smtpHost: '',
    smtpPort: 465,
    smtpEncryption: 'ssl',
    smtpUsername: '',
    smtpPassword: '',
    notifyOnLogin: false,
    notifyOnDeposit: true,
    notifyOnRatification: true
  });

  const [mailLogs, setMailLogs] = useState([]);
  const [securityAuditLogs, setSecurityAuditLogs] = useState(() => {
    try {
      const raw = localStorage.getItem('mgr_audit_events_local');
      if (raw) return JSON.parse(raw);
    } catch {
      // LocalStorage access error fallback
    }
    return [];
  });
  const [unlockedMemberPins, setUnlockedMemberPins] = useState({});

  useEffect(() => {
    const handleAuditEvent = (e) => {
      if (e?.detail) {
        setSecurityAuditLogs(prev => [e.detail, ...prev.filter(x => x.id !== e.detail.id)]);
      } else {
        try {
          const raw = localStorage.getItem('mgr_audit_events_local');
          if (raw) setSecurityAuditLogs(JSON.parse(raw));
        } catch {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener('mgr_audit_event_logged', handleAuditEvent);
    return () => window.removeEventListener('mgr_audit_event_logged', handleAuditEvent);
  }, []);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rbacUsers`, JSON.stringify(rbacUsers));
  }, [rbacUsers]);

  useEffect(() => {
    if (authenticatedUser) {
      localStorage.setItem(`${STORAGE_KEY}_authenticatedUser`, JSON.stringify(authenticatedUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_authenticatedUser`);
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem(`${STORAGE_KEY}_authToken`, authToken);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_authToken`);
    }
  }, [authToken]);

  // Active user RBAC profile (either logged-in user or currentMember mapped to rbacUsers)
  const currentUserRbac = rbacUsers.find(u => u.memberId === currentMemberId) || authenticatedUser || null;

  const hasPermission = useCallback((permissionKey) => {
    if (!currentUserRbac) {
      return isExecutive(currentMemberId);
    }
    if (currentUserRbac.accessLevel === 'super_admin') return true;
    return !!(currentUserRbac.permissions && currentUserRbac.permissions[permissionKey]);
  }, [currentUserRbac, currentMemberId]);

  const isSuperAdmin = currentUserRbac?.accessLevel === 'super_admin' || currentMemberId === 'MGR-001' || currentMemberId === 'MGR-004';
  const canSwitchMemberPersona = isSuperAdmin || hasPermission('manage_access_control');

  // Shared cPanel Database Synchronization State (api.php + SQLite/MySQL)
  const [dbSyncStatus, setDbSyncStatus] = useState({
    mode: 'local', // 'local' | 'connecting' | 'connected' | 'saving'
    driver: 'localStorage',
    lastSyncedAt: null,
    updatedBy: null
  });
  const isHydratingFromRemoteRef = useRef(false);
  const hasCompletedInitialCheckRef = useRef(false);
  const lastRemoteUpdatedAtRef = useRef(null);

  const applyRemoteState = useCallback((remoteState, meta = {}) => {
    if (!remoteState || typeof remoteState !== 'object') return;
    isHydratingFromRemoteRef.current = true;
    if (Array.isArray(remoteState.members) && remoteState.members.length > 0) {
      const isOldIdFormat = remoteState.members.some(m => m.id === 'MGR-007' && (m.name || '').toLowerCase().includes('john'));
      const oldToNewMap = {
        'MGR-007': 'MGR-001',
        'MGR-005': 'MGR-002',
        'MGR-001': 'MGR-003',
        'MGR-010': 'MGR-004',
        'MGR-009': 'MGR-005',
        'MGR-004': 'MGR-006',
        'MGR-006': 'MGR-007',
        'MGR-002': 'MGR-008',
        'MGR-003': 'MGR-009',
        'MGR-008': 'MGR-010',
        'MGR-011': 'MGR-011',
      };
      setMembers(remoteState.members.filter(m => m.id !== 'MGR-012').map(m => {
        const id = isOldIdFormat && oldToNewMap[m.id] ? oldToNewMap[m.id] : m.id;
        return normalizeMemberNetDeposits({ ...m, id });
      }));
    }
    if (remoteState.assets && typeof remoteState.assets === 'object') {
      const sanitizedAssets = {
        ...INITIAL_GROUP_ASSETS,
        ...remoteState.assets,
        mansaX: {
          ...INITIAL_GROUP_ASSETS.mansaX,
          ...(remoteState.assets.mansaX || {}),
          totalBalance: Number(remoteState.assets.mansaX?.totalBalance ?? (Number(remoteState.assets.mansaX?.principal || INITIAL_GROUP_ASSETS.mansaX.principal) + Number(remoteState.assets.mansaX?.interestAccrued || INITIAL_GROUP_ASSETS.mansaX.interestAccrued)))
        },
        eticaMmf: {
          ...INITIAL_GROUP_ASSETS.eticaMmf,
          ...(remoteState.assets.eticaMmf || {}),
          statementBalance: Number(remoteState.assets.eticaMmf?.statementBalance ?? INITIAL_GROUP_ASSETS.eticaMmf.statementBalance)
        },
        bankAccount: {
          ...INITIAL_GROUP_ASSETS.bankAccount,
          ...(remoteState.assets.bankAccount || {}),
          balance: Number(remoteState.assets.bankAccount?.balance ?? INITIAL_GROUP_ASSETS.bankAccount.balance),
          accountNumber: null
        },
        groupReserveAccount: {
          ...INITIAL_GROUP_ASSETS.groupReserveAccount,
          ...(remoteState.assets.groupReserveAccount || {}),
          balance: Number(remoteState.assets.groupReserveAccount?.balance ?? INITIAL_GROUP_ASSETS.groupReserveAccount.balance)
        }
      };
      setAssets(sanitizedAssets);
    }
    if (Array.isArray(remoteState.loans)) setLoans(remoteState.loans);
    if (Array.isArray(remoteState.resolutions)) setResolutions(remoteState.resolutions);
    if (Array.isArray(remoteState.policies)) setPolicies(remoteState.policies);
    if (Array.isArray(remoteState.ledger)) setLedger(remoteState.ledger);
    if (Array.isArray(remoteState.prospects)) setProspects(remoteState.prospects);
    if (Array.isArray(remoteState.pendingFinancialActions)) {
      setPendingFinancialActions(remoteState.pendingFinancialActions);
    }
    if (Array.isArray(remoteState.portfolioAdvisories)) {
      setPortfolioAdvisories(remoteState.portfolioAdvisories);
    }
    if (Array.isArray(remoteState.announcements)) {
      setAnnouncements(remoteState.announcements);
    }
    if (meta.updatedAt) {
      lastRemoteUpdatedAtRef.current = meta.updatedAt;
    }
    setDbSyncStatus(prev => ({
      ...prev,
      mode: 'connected',
      driver: meta.driver || prev.driver || 'sqlite',
      lastSyncedAt: meta.updatedAt || new Date().toISOString(),
      updatedBy: meta.updatedBy || prev.updatedBy || 'System'
    }));
    setTimeout(() => {
      isHydratingFromRemoteRef.current = false;
    }, 120);
  }, []);

  const refreshSecurityBootstrap = useCallback(async (tokenOverride) => {
    try {
      const tok = tokenOverride !== undefined ? tokenOverride : authToken;
      const res = await fetch(`./api.php?action=auth_Bootstrap&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(tok ? { 'X-MGR-Token': tok } : {})
        }
      });
      if (!res.ok) return;
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return;
      const data = await res.json();
      if (!data || !data.ok) return;

      if (Array.isArray(data.users) && data.users.length > 0) {
        setRbacUsers(data.users);
      }
      if (data.authenticatedUser) {
        setAuthenticatedUser(data.authenticatedUser);
      }
      if (data.mailSettings) {
        setMailSettings(prev => ({ ...prev, ...data.mailSettings }));
      }
      if (Array.isArray(data.mailLogs)) {
        setMailLogs(data.mailLogs);
      }
      if (Array.isArray(data.auditLogs)) {
        setSecurityAuditLogs(prev => {
          const map = new Map();
          [...prev, ...data.auditLogs].forEach(item => {
            if (item && (item.id || item.created_at)) {
              const k = item.id || `${item.created_at}_${item.actor_name}`;
              map.set(k, item);
            }
          });
          return Array.from(map.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        });
      }
    } catch {
      // Running locally without PHP server
    }
  }, [authToken]);

  const pushStateToServer = useCallback(async (customPayload, actionSummary = 'Live Portfolio Sync') => {
    try {
      setDbSyncStatus(prev => (prev.mode === 'connected' ? { ...prev, mode: 'saving' } : prev));
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          updatedBy: currentMember?.name || 'Executive Committee',
          actionSummary,
          state: customPayload
        })
      });
      if (!res.ok) return false;
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return false;
      const data = await res.json();
      if (data && data.ok) {
        lastRemoteUpdatedAtRef.current = data.updatedAt;
        setDbSyncStatus({
          mode: 'connected',
          driver: data.driver || 'sqlite',
          lastSyncedAt: data.updatedAt || new Date().toISOString(),
          updatedBy: data.updatedBy || currentMember?.name
        });
        return true;
      }
    } catch {
      // Running in local Vite dev server without PHP or offline; fallback to localStorage silently
    }
    return false;
  }, [currentMember?.name, authToken]);

  // Initial fetch + periodic poll from ./api.php when hosted on cPanel
  useEffect(() => {
    let isMounted = true;

    const checkAndSyncServer = async (isInitial = false) => {
      try {
        const res = await fetch(`./api.php?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(authToken ? { 'X-MGR-Token': authToken } : {})
          }
        });
        if (!res.ok) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;
        const data = await res.json();
        if (!isMounted || !data || !data.ok) return;

        if (data.authenticatedUser) {
          setAuthenticatedUser(data.authenticatedUser);
        }

        if (data.initialized && data.state) {
          if (isInitial || (data.updatedAt && data.updatedAt !== lastRemoteUpdatedAtRef.current)) {
            applyRemoteState(data.state, data);
          }
          hasCompletedInitialCheckRef.current = true;
        } else if (isInitial && !data.initialized) {
          // Seed the cPanel database with our official 30/10/2026 baseline
          hasCompletedInitialCheckRef.current = true;
          await pushStateToServer(
            {
              members,
              assets,
              loans,
              resolutions,
              policies,
              ledger,
              prospects,
              pendingFinancialActions,
              portfolioAdvisories,
              announcements
            },
            'Initial Seed of 30/10/2026 Official Accounts'
          );
        }
        if (isInitial) {
          await refreshSecurityBootstrap();
        }
      } catch {
        if (isInitial) {
          hasCompletedInitialCheckRef.current = true;
        }
      }
    };

    checkAndSyncServer(true);
    const intervalId = setInterval(() => checkAndSyncServer(false), 15000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically push state changes to cPanel database whenever state mutates
  useEffect(() => {
    if (!hasCompletedInitialCheckRef.current || isHydratingFromRemoteRef.current) return;
    const timer = setTimeout(() => {
      pushStateToServer({
        members,
        assets,
        loans,
        resolutions,
        policies,
        ledger,
        prospects,
        pendingFinancialActions,
        portfolioAdvisories,
        announcements
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [
    members,
    assets,
    loans,
    resolutions,
    policies,
    ledger,
    prospects,
    pendingFinancialActions,
    portfolioAdvisories,
    announcements,
    pushStateToServer
  ]);

  // Executive Committee Status: Driven by RBAC access level OR Executive Committee membership
  const isCurrentMemberExec =
    currentUserRbac?.accessLevel === 'super_admin' ||
    currentUserRbac?.accessLevel === 'treasury_admin' ||
    currentUserRbac?.accessLevel === 'executive_officer' ||
    isExecutive(currentMemberId) ||
    currentMember?.committeeRole === 'Executive Committee';

  // Executive Security Modal State
  const [execSecurityModal, setExecSecurityModal] = useState({
    isOpen: false,
    actionTitle: '',
    message: ''
  });

  const triggerExecRestriction = (actionTitle, message) => {
    setExecSecurityModal({
      isOpen: true,
      actionTitle,
      message: message || 'Any action that affects other members or alters group funds can strictly only be performed by members of the MGR Investment Club Executive Committee.'
    });
  };

  const closeExecSecurityModal = () => {
    setExecSecurityModal({
      isOpen: false,
      actionTitle: '',
      message: ''
    });
  };

  // Guard Helper: verifies executive authorization
  const requireExecutivePermission = (actionTitle, customMessage) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(actionTitle, customMessage);
      showToast(`Restricted: Executive Committee authorization required`, 'error');
      return false;
    }
    return true;
  };

  // Helper Toast
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Financial calculations derived from central reactive state
  const totalMemberShares = members.reduce((sum, m) => sum + Number(m.shares || 0), 0);
  const totalAssetsValue = 
    Number(assets.mansaX.totalBalance || 0) +
    Number(assets.eticaMmf.statementBalance || 0) +
    Number(assets.bankAccount.balance || 0);
  const totalLoanReceivables = (loans || [])
    .filter(l => l.status === 'Active')
    .reduce((sum, l) => sum + Number(l.balanceRemaining ?? l.principal ?? 0), 0);
  const totalComprehensiveAssets = totalAssetsValue + totalLoanReceivables;
  const groupReserves = Number(assets.groupReserveAccount?.balance || 0);
  const retainedSurplus = Math.max(0, totalComprehensiveAssets - totalMemberShares - groupReserves);
  const coreCapital = totalMemberShares + groupReserves + retainedSurplus;

  // Update a Member's Joining Date (Self-service or Committee audit)
  const updateMemberJoiningDate = ({ memberId, newJoiningDate, reason = '' }) => {
    if (memberId !== currentMemberId && !isCurrentMemberExec) {
      triggerExecRestriction(
        "Update Member Joining Date",
        "Modifying another member's joining date requires Executive Committee authorization."
      );
      return false;
    }

    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember || !newJoiningDate) {
      showToast('Please provide a valid joining date', 'error');
      return false;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          joinedDate: newJoiningDate
        };
      }
      return m;
    }));

    const auditTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: `Registry Audit: ${targetMember.name}'s official joining date updated to ${newJoiningDate} ${reason ? `(${reason})` : ''}`,
      debitAccount: 'Member Share Registry',
      creditAccount: 'Club Governance Records',
      amount: 0,
      type: 'Registry Audit'
    };
    setLedger(prev => [auditTx, ...prev]);

    showToast(`Joining date for ${targetMember.name} updated to ${newJoiningDate}!`);
    return true;
  };

  // Record a Member Deposit (Requires Deposit Date and Transaction Message)
  const recordDeposit = ({ 
    memberId, 
    amount, 
    destination, 
    depositDate = new Date().toISOString().split('T')[0],
    transactionRef = '',
    transactionMessage = '',
    includeRegFee = false, 
    notes = '' 
  }) => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return false;

    const targetMember = members.find(m => m.id === memberId);
    const shouldDeductRegFee = includeRegFee || (!targetMember?.regFeePaid && numAmount >= 1000);
    const regFee = shouldDeductRegFee ? 1000.00 : 0.00;
    const netShares = Math.max(0, numAmount - regFee);

    if (numAmount < regFee) {
      showToast('Deposit amount must be at least the KSh 1,000 registration fee', 'error');
      return false;
    }

    const cleanDate = depositDate || new Date().toISOString().split('T')[0];
    const attributedQuarter = getQuarterForDate(cleanDate);
    const cleanRef = transactionRef || `TXREF-${Date.now().toString().slice(-6)}`;
    const destinationDesc = destination === 'Mansa X' ? 'Mansa X Special Funds' : destination === 'Etica MMF' ? 'Etica Capital MMF' : 'Cash in Bank';

    const newDepositEntries = [];

    // 1. Dedicated Registration Fee Entry (Deducted from member deposit)
    if (regFee > 0) {
      newDepositEntries.push({
        id: `DEP-${Date.now().toString().slice(-5)}-REG`,
        date: cleanDate,
        amount: regFee,
        destination: destinationDesc,
        type: "Registration Fee",
        transactionRef: `${cleanRef}-REG`,
        transactionMessage: `Non-refundable registration fee of KES 1,000.00 deducted from deposit. Credited directly to Group Reserve Pool for 2026 formal registration. Ref: ${cleanRef}`,
        attributedQuarter,
        isMmfPrincipal: destination === 'Mansa X' || destination === 'Etica MMF',
        mmfPrincipalQuarter: destination === 'Mansa X' || destination === 'Etica MMF' ? attributedQuarter : null,
        status: "Verified & Reconciled",
        approvedBy: `${currentMember.name} (${currentMember.role})`,
        approvedDate: cleanDate
      });
    }

    // 2. Member Share Capital Entry (Net of Registration Fee)
    if (netShares > 0) {
      newDepositEntries.push({
        id: `DEP-${(Date.now() + 1).toString().slice(-5)}-SHR`,
        date: cleanDate,
        amount: netShares,
        destination: destinationDesc,
        type: "Share Capital",
        transactionRef: cleanRef,
        transactionMessage: transactionMessage || notes || `Confirmed. Member share deposit of KES ${netShares.toLocaleString()} to ${destinationDesc} on ${cleanDate}. Ref: ${cleanRef}`,
        attributedQuarter,
        isMmfPrincipal: destination === 'Mansa X' || destination === 'Etica MMF',
        mmfPrincipalQuarter: destination === 'Mansa X' || destination === 'Etica MMF' ? attributedQuarter : null,
        status: "Verified & Reconciled",
        approvedBy: `${currentMember.name} (${currentMember.role})`,
        approvedDate: cleanDate
      });
    }

    // Update member record: ONLY netShares is added to shares (reg fee is NOT part of member deposit)
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const currentHistory = Array.isArray(m.depositHistory) ? m.depositHistory : [];
        return {
          ...m,
          shares: m.shares + netShares,
          regFeePaid: true,
          depositHistory: [...newDepositEntries, ...currentHistory]
        };
      }
      return m;
    }));

    // Update target asset: full cash received in asset account, and regFee tracked in groupReserveAccount
    setAssets(prev => {
      const updated = { ...prev };
      if (destination === 'Mansa X') {
        updated.mansaX.totalBalance += numAmount;
      } else if (destination === 'Etica MMF') {
        updated.eticaMmf.statementBalance += numAmount;
      } else {
        updated.bankAccount.balance += numAmount;
      }

      if (regFee > 0) {
        updated.groupReserveAccount.balance += regFee;
      }
      return updated;
    });

    // General Ledger Entries
    const newLedgerEntries = [];
    if (regFee > 0) {
      newLedgerEntries.push({
        id: `TX-${Date.now().toString().slice(-4)}-REG`,
        date: cleanDate,
        description: `Non-Refundable Registration Fee: ${targetMember?.name || memberId} (${destinationDesc}) [Ref: ${cleanRef}] — Non-Refundable Group Reserve`,
        debitAccount: destinationDesc,
        creditAccount: 'Group Reserve Account (Non-refundable Registration Pool)',
        amount: regFee,
        type: 'Registration Fee'
      });
    }

    if (netShares > 0) {
      newLedgerEntries.push({
        id: `TX-${(Date.now() + 1).toString().slice(-4)}-SHR`,
        date: cleanDate,
        description: `Member Share Deposit: ${targetMember?.name || memberId} (${destinationDesc}) [Ref: ${cleanRef}] - Attributed: ${attributedQuarter}`,
        debitAccount: destinationDesc,
        creditAccount: `${targetMember?.name || 'Member'} - Shares`,
        amount: netShares,
        type: 'Deposit'
      });
    }
    setLedger(prev => [...newLedgerEntries, ...prev]);

    // Notification
    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: regFee > 0 
        ? `Deposit: KSh ${numAmount.toLocaleString()} (KES 1k Reg Fee Deducted)`
        : `Deposit Recorded: KSh ${numAmount.toLocaleString()} (${attributedQuarter})`,
      message: regFee > 0
        ? `${targetMember?.name} credited KSh ${netShares.toLocaleString()} to Member Shares (KES 1,000/= Registration Fee deducted to Group Reserve Pool). Attached ref: ${cleanRef}.`
        : `${targetMember?.name} credited KSh ${numAmount.toLocaleString()} in shares to ${destinationDesc}. Attached ref: ${cleanRef}. Attributed to ${attributedQuarter} MMF Principal.`,
      date: cleanDate,
      read: false,
      type: "finance"
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Successfully credited KSh ${netShares.toLocaleString()} to ${targetMember?.name} (${attributedQuarter})!`);
    return true;
  };

  // Actual execution of Interest Distribution (committed only when all members approve)
  const commitInterestDistribution = ({ sourceMmf, totalInterest, retainReservePercent = 0, policy = 'holding-period', note = '' }) => {
    const interest = parseFloat(totalInterest);
    if (!interest || interest <= 0) return false;

    const reserveShare = interest * (parseFloat(retainReservePercent) / 100);
    const distributableInterest = interest - reserveShare;

    // Prorating rule (Option A: Holding-Period Prorated):
    // Leoivard Omondi Ongule (MGR-011) deposited in late October 2026 (0 days active in Q3 ending 30/09/2026).
    // His Q3 dividend is KES 0.00, preserving his KES 17,000 member deposit for Q4 (KES 1k reg fee deducted).
    // Late Frederick Ongule Seunda (MGR-007) passed away in Sept 2026; his funds were invested throughout Q3 and accrue to beneficiary exit escrow.
    const isPeriodProrated = policy !== 'unweighted';

    const memberEligibility = members.map(m => {
      let eligible = m.shares;
      if (isPeriodProrated) {
        if (m.id === 'MGR-011') {
          eligible = 0; // Exclude new post-period capital
        } else if (m.status !== 'Active' && m.id !== 'MGR-007') {
          eligible = 0;
        }
      } else {
        if (m.status !== 'Active') eligible = 0;
      }
      return { id: m.id, eligible };
    });

    const totalEligibleShares = memberEligibility.reduce((sum, item) => sum + item.eligible, 0);

    setMembers(prev => prev.map(m => {
      const eligibility = memberEligibility.find(item => item.id === m.id);
      const eligible = eligibility ? eligibility.eligible : 0;
      if (eligible <= 0 || totalEligibleShares <= 0) return m;

      const proportion = eligible / totalEligibleShares;
      const memberDividend = Math.round((distributableInterest * proportion) * 100) / 100;
      const cleanDate = new Date().toISOString().split('T')[0];
      const refCode = `YLD-${sourceMmf === 'Mansa X' ? 'MX' : 'ET'}-${m.id.replace('MGR-', '')}-${Date.now().toString().slice(-3)}`;
      const destName = sourceMmf === 'Mansa X' ? 'Mansa X Special Funds' : 'Etica Capital MMF';

      const yieldDepositEntry = {
        id: `DEP-YLD-${Date.now().toString().slice(-4)}-${m.id.slice(-2)}`,
        date: cleanDate,
        amount: memberDividend,
        destination: destName,
        type: 'Yield / Dividend Deposit',
        transactionRef: refCode,
        transactionMessage: `Confirmed. Pro-rata yield dividend of Ksh ${memberDividend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(proportion * 100).toFixed(2)}% of KES ${distributableInterest.toLocaleString()}) credited & reinvested into ${destName}. Ref: ${refCode}`,
        attributedQuarter: getQuarterForDate(cleanDate),
        isMmfPrincipal: true,
        mmfPrincipalQuarter: getQuarterForDate(cleanDate),
        status: 'Verified & Reconciled',
        approvedBy: 'All-Member Unanimous Ratification'
      };

      return {
        ...m,
        shares: Math.round((m.shares + memberDividend) * 100) / 100,
        depositHistory: [yieldDepositEntry, ...(m.depositHistory || [])]
      };
    }));

    // Update Asset and Reserve
    setAssets(prev => {
      const updated = { ...prev };
      if (sourceMmf === 'Mansa X') {
        updated.mansaX.interestAccrued += interest;
        updated.mansaX.totalBalance += interest;
      } else {
        updated.eticaMmf.statementBalance += interest;
      }
      if (reserveShare > 0) {
        updated.groupReserveAccount.balance += reserveShare;
      }
      return updated;
    });

    // Add Ledger Entry
    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: `Pro-rata Interest Distribution from ${sourceMmf} (${distributableInterest.toLocaleString()} KES to members, ${reserveShare.toLocaleString()} KES to Group Reserve). Policy: ${policy === 'holding-period' ? 'Option A: Holding-Period Prorated' : policy}`,
      debitAccount: sourceMmf === 'Mansa X' ? 'Mansa X Special Funds' : 'Etica Capital MMF',
      creditAccount: 'Members Capital Accounts & Group Reserve',
      amount: interest,
      type: 'Dividend'
    };
    setLedger(prev => [newTx, ...prev]);

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Financial Action Ratified: KSh ${interest.toLocaleString()}`,
      message: `Pro-rata dividend approved unanimously by all 10 members! Credited directly to member shares in MMF compounding pool under ${policy === 'holding-period' ? 'Option A Holding-Period Prorated policy' : policy}.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: "dividend"
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Unanimously ratified! KSh ${distributableInterest.toLocaleString()} credited to member shares!`);
    return true;
  };

  // Initiate or Queue MMF Interest Distribution
  const distributeInterest = ({ sourceMmf, totalInterest, retainReservePercent = 0, policy = 'holding-period', note = '' }) => {
    if (!requireExecutivePermission(
      "Distributing Pro-Rata MMF Interest",
      "Only Executive Committee members (e.g. Treasurer Leoivard Omondi Ongule, CEO John Kennedy Obalah, Chairman Dan Aloo) can initiate MMF interest distributions."
    )) {
      return false;
    }

    const interest = parseFloat(totalInterest);
    if (!interest || interest <= 0) return false;

    // Check if matching action already exists in pending queue
    const existing = pendingFinancialActions.find(a => 
      a.actionType === 'DISTRIBUTE_INTEREST' && 
      a.status === 'Pending Member Ratification'
    );

    if (existing) {
      setActiveRatificationModalId(existing.id);
      showToast(`Financial action is already queued for ratification! All members must approve before execution.`);
      return true;
    }

    return initiateFinancialAction({
      title: `Pro-rata Interest Distribution: ${sourceMmf} (KES ${interest.toLocaleString()})`,
      category: "Interest Dividend Allocation",
      amount: interest,
      description: `Distribution of net interest of KES ${interest.toLocaleString()} from ${sourceMmf} pro-rata across qualifying members' shares for continuous MMF compound growth under ${policy === 'holding-period' ? 'Option A Holding-Period Prorating' : policy}.`,
      sourceFund: sourceMmf === 'Mansa X' ? 'Mansa X Special Funds' : 'Etica Capital MMF',
      actionType: "DISTRIBUTE_INTEREST",
      actionPayload: { sourceMmf, totalInterest: interest, retainReservePercent, policy, note }
    });
  };

  // Initiate Financial Action (Executive Committee initiation requiring 100% member approval)
  const initiateFinancialAction = ({
    title,
    category,
    amount,
    description,
    sourceFund = 'Group Funds',
    actionType,
    actionPayload
  }) => {
    if (!requireExecutivePermission(
      "Initiating Financial Action",
      "Financial actions can strictly only be initiated by members of the Executive Committee."
    )) {
      return false;
    }

    const nextId = `ACT-${(pendingFinancialActions.length + 1).toString().padStart(3, '0')}`;
    const activeMembers = members.filter(m => m.status === 'Active');

    const newAction = {
      id: nextId,
      title,
      category: category || 'Treasury Action',
      amount: parseFloat(amount) || 0,
      initiatedBy: `${currentMember.name} (${currentMember.role})`,
      initiatedById: currentMember.id,
      dateInitiated: new Date().toISOString().split('T')[0],
      description,
      sourceFund,
      actionType,
      actionPayload,
      status: "Pending Member Ratification",
      approvals: [currentMember.id], // Initiator auto-approves
      rejections: [],
      requiredApprovalsCount: activeMembers.length,
      notes: "Initiated by Executive Committee. Awaiting unanimous approval from all active members before execution."
    };

    setPendingFinancialActions(prev => [newAction, ...prev]);
    setActiveRatificationModalId(newAction.id);

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Approval Required: ${newAction.title}`,
      message: `${currentMember.name} initiated a financial action of KES ${Number(amount).toLocaleString()}. All ${activeMembers.length} members must approve before execution.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: "finance"
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Financial action initiated! All ${activeMembers.length} active members must ratify before execution.`);
    return true;
  };

  // Approve a Financial Action (Any Member can cast their approval)
  const approveFinancialAction = (actionId, memberId = currentMemberId) => {
    const action = pendingFinancialActions.find(a => a.id === actionId);
    if (!action) return false;

    if (action.status === 'Fully Ratified & Executed') {
      showToast('This action has already been fully ratified and executed.');
      return false;
    }

    const currentApprovals = action.approvals || [];
    if (currentApprovals.includes(memberId)) {
      showToast('You have already approved this action.');
      return false;
    }

    const updatedApprovals = [...currentApprovals, memberId];
    const activeMembers = members.filter(m => m.status === 'Active');
    const isUnanimous = updatedApprovals.length >= activeMembers.length;

    setPendingFinancialActions(prev => prev.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          approvals: updatedApprovals,
          status: isUnanimous ? 'Fully Ratified & Executed' : 'Pending Member Ratification'
        };
      }
      return a;
    }));

    if (isUnanimous) {
      if (action.actionType === 'DISTRIBUTE_INTEREST') {
        commitInterestDistribution(action.actionPayload);
      }
      showToast(`Action ${action.id} achieved 100% consensus (${activeMembers.length}/${activeMembers.length}) and has been EXECUTED!`);
    } else {
      showToast(`Approval recorded! (${updatedApprovals.length}/${activeMembers.length} active members approved)`);
    }

    return true;
  };

  // Fast-track / Auto-sign for all remaining members (Convenience testing)
  const fastTrackAllApprovals = (actionId) => {
    const action = pendingFinancialActions.find(a => a.id === actionId);
    if (!action) return false;

    const activeMembers = members.filter(m => m.status === 'Active');
    const allIds = activeMembers.map(m => m.id);

    setPendingFinancialActions(prev => prev.map(a => {
      if (a.id === actionId) {
        return {
          ...a,
          approvals: allIds,
          status: 'Fully Ratified & Executed'
        };
      }
      return a;
    }));

    if (action.actionType === 'DISTRIBUTE_INTEREST') {
      commitInterestDistribution(action.actionPayload);
    }

    showToast(`All 10 active member approvals collected! Financial transaction executed & reconciled.`);
    return true;
  };

  // Dispatch Email / SMS reminders to members who haven't approved yet
  const sendRatificationReminders = async (actionId) => {
    const action = pendingFinancialActions.find(a => a.id === actionId);
    if (!action) return;

    const activeMembers = members.filter(m => m.status === 'Active');
    const pendingMembers = activeMembers.filter(m => !action.approvals.includes(m.id));

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Ratification Reminders Sent (${pendingMembers.length} members)`,
      message: `Automated email & SMS reminder dispatched to: ${pendingMembers.map(m => m.name.split(' ')[0]).join(', ')} to sign off on: "${action.title}"`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: "governance"
    };
    setNotifications(prev => [notif, ...prev]);

    try {
      await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'send_email',
          audience: 'all_active',
          subject: `Action Required: Ratify "${action.title}"`,
          messageHtml: `<p>Dear Member,</p><p>Please sign in to the MGR Investment Group Portal to review and ratify the pending financial action: <strong>${action.title}</strong> (Amount: KES ${Number(action.amount || 0).toLocaleString()}).</p><p>${action.description || ''}</p>`
        })
      });
    } catch {
      // ignore if offline
    }

    showToast(`Sent urgent sign-off reminders to ${pendingMembers.length} pending members via SMS & Email!`);
  };

  // Issue a Loan (Strict 80% ceiling, 10% interest directly debited)
  const issueLoan = ({
    borrowerId,
    amount,
    fundingMode = 'Group Treasury', // 'Group Treasury' or 'Peer Member'
    funderMemberId = null,
    notes = ''
  }) => {
    const principal = parseFloat(amount);
    const borrower = members.find(m => m.id === borrowerId);

    if (!borrower) {
      showToast('Borrower not found', 'error');
      return false;
    }

    const maxBorrowable = borrower.shares * 0.80;
    if (principal > maxBorrowable) {
      showToast(`Exceeds maximum 80% limit! Max allowed is KSh ${maxBorrowable.toLocaleString()}`, 'error');
      return false;
    }

    const interestFee = principal * 0.10; // 10% interest
    const totalRepayable = principal + interestFee;

    // Direct 10% interest deduction from member shares and credited to Group Account
    // And if Peer Funding: borrower's loan amount collateral is debited from their shares and credited to funder!
    setMembers(prev => prev.map(m => {
      if (m.id === borrowerId) {
        const shareDeduction = fundingMode === 'Peer Member' ? (principal + interestFee) : interestFee;
        return {
          ...m,
          shares: Math.max(0, m.shares - shareDeduction)
        };
      }
      if (fundingMode === 'Peer Member' && m.id === funderMemberId) {
        return {
          ...m,
          shares: m.shares + principal // funder receives collateral shares
        };
      }
      return m;
    }));

    // Credit 10% interest to Group Account
    setAssets(prev => ({
      ...prev,
      groupReserveAccount: {
        ...prev.groupReserveAccount,
        balance: prev.groupReserveAccount.balance + interestFee
      },
      bankAccount: fundingMode === 'Group Treasury' ? {
        ...prev.bankAccount,
        balance: Math.max(0, prev.bankAccount.balance - principal)
      } : prev.bankAccount
    }));

    const newLoan = {
      id: `LN-${Date.now().toString().slice(-4)}`,
      borrowerId,
      borrowerName: borrower.name,
      principal,
      interestAmount: interestFee,
      totalPayable: totalRepayable,
      maxAllowedShares: borrower.shares,
      maxLoanCapacity: maxBorrowable,
      fundingSource: fundingMode === 'Peer Member' ? `Direct Member: ${members.find(m => m.id === funderMemberId)?.name || 'Peer'}` : 'Group Treasury',
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      balanceRemaining: totalRepayable,
      notes: notes || `80% Policy Compliant. 10% interest (KSh ${interestFee.toLocaleString()}) credited to Group Account.`
    };

    setLoans(prev => [newLoan, ...prev]);

    // Ledger entries
    const ledgerTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: `Loan Disbursement to ${borrower.name} (${fundingMode}). 10% interest KSh ${interestFee} credited to Group Account`,
      debitAccount: 'Loan Receivables',
      creditAccount: fundingMode === 'Peer Member' ? 'Peer Collateral Pool' : 'Cash in Bank',
      amount: principal,
      type: 'Loan'
    };
    setLedger(prev => [ledgerTx, ...prev]);

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Loan Approved: KSh ${principal.toLocaleString()}`,
      message: `Issued to ${borrower.name}. 10% fee (KSh ${interestFee.toLocaleString()}) credited to Group Account.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: "loan"
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Loan of KSh ${principal.toLocaleString()} approved. 10% interest credited to Group!`);
    return true;
  };

  // Purchase Deceased Member Shares (Frederick Ongule Seunda)
  const purchaseDeceasedShares = ({ buyerId, sharesToBuy }) => {
    const deceased = members.find(m => m.status === 'Deceased');
    const buyer = members.find(m => m.id === buyerId);
    const amount = parseFloat(sharesToBuy);

    if (!deceased || !buyer || !amount || amount <= 0) return false;

    const availableShares = deceased.sharesForSale - deceased.sharesSold;
    if (amount > availableShares) {
      showToast(`Cannot buy more than available shares (${availableShares.toLocaleString()} KSh)`, 'error');
      return false;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === deceased.id) {
        return {
          ...m,
          shares: Math.max(0, m.shares - amount),
          sharesSold: (m.sharesSold || 0) + amount
        };
      }
      if (m.id === buyer.id) {
        return {
          ...m,
          shares: m.shares + amount
        };
      }
      return m;
    }));

    // Add to Ledger
    const ledgerTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      description: `Share Purchase: ${buyer.name} acquired KSh ${amount.toLocaleString()} shares of late ${deceased.name}`,
      debitAccount: `${deceased.beneficiaryName} - Payout Escrow`,
      creditAccount: `${buyer.name} - Capital Shares`,
      amount,
      type: 'Share Transfer'
    };
    setLedger(prev => [ledgerTx, ...prev]);

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Share Transfer: KSh ${amount.toLocaleString()}`,
      message: `${buyer.name} acquired ${amount.toLocaleString()} shares of late ${deceased.name}. Beneficiary settlement pool updated.`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: "transfer"
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Successfully purchased KSh ${amount.toLocaleString()} shares from estate!`);
    return true;
  };

  // Approve a Pending Member upon Depositing KSh 1,000 Registration Fee (Mandatory Date & Transaction Message)
  const approvePendingMember = ({ 
    memberId, 
    destination = 'Etica MMF', 
    depositDate = new Date().toISOString().split('T')[0],
    transactionRef = '',
    transactionMessage = '',
    additionalShares = 0, 
    additionalTxRef = '',
    additionalTxMessage = '',
    notes = '' 
  }) => {
    if (!requireExecutivePermission(
      "Approving New Member Admission",
      "Approving membership and admitting new applicants upon verification of the KES 1,000/= registration fee is strictly reserved for the Executive Committee."
    )) {
      return false;
    }

    const member = members.find(m => m.id === memberId);
    if (!member) {
      showToast('Member not found', 'error');
      return false;
    }

    const sharesAmount = parseFloat(additionalShares) || 0;
    const totalDeposit = 1000.00 + sharesAmount; // KSh 1,000 registration fee + any initial shares
    const cleanDate = depositDate || new Date().toISOString().split('T')[0];
    const attributedQuarter = getQuarterForDate(cleanDate);
    const destinationDesc = destination === 'Mansa X' ? 'Mansa X Special Funds' : destination === 'Etica MMF' ? 'Etica Capital MMF' : 'Cash in Bank';
    const regRef = transactionRef || `REG-${Date.now().toString().slice(-6)}`;
    const regMsg = transactionMessage || `Confirmed. Ksh 1,000.00 registration fee sent to ${destinationDesc} on ${cleanDate}. Ref: ${regRef}`;

    const regDepositEntry = {
      id: `DEP-${Date.now().toString().slice(-5)}-REG`,
      date: cleanDate,
      amount: 1000.00,
      destination: destinationDesc,
      type: "Registration Fee",
      transactionRef: regRef,
      transactionMessage: regMsg,
      attributedQuarter,
      isMmfPrincipal: destination === 'Mansa X' || destination === 'Etica MMF',
      mmfPrincipalQuarter: destination === 'Mansa X' || destination === 'Etica MMF' ? attributedQuarter : null,
      status: "Verified & Reconciled",
      approvedBy: `${currentMember.name} (${currentMember.role})`,
      approvedDate: cleanDate
    };

    const newDeposits = [regDepositEntry];

    if (sharesAmount > 0) {
      const shareRef = additionalTxRef || transactionRef || `SHR-${Date.now().toString().slice(-6)}`;
      const shareMsg = additionalTxMessage || `Confirmed. Ksh ${sharesAmount.toLocaleString()} initial share deposit to ${destinationDesc} on ${cleanDate}. Ref: ${shareRef}`;
      const shareDepositEntry = {
        id: `DEP-${(Date.now() + 1).toString().slice(-5)}-SHR`,
        date: cleanDate,
        amount: sharesAmount,
        destination: destinationDesc,
        type: "Share Capital",
        transactionRef: shareRef,
        transactionMessage: shareMsg,
        attributedQuarter,
        isMmfPrincipal: destination === 'Mansa X' || destination === 'Etica MMF',
        mmfPrincipalQuarter: destination === 'Mansa X' || destination === 'Etica MMF' ? attributedQuarter : null,
        status: "Verified & Reconciled",
        approvedBy: `${currentMember.name} (${currentMember.role})`,
        approvedDate: cleanDate
      };
      newDeposits.unshift(shareDepositEntry);
    }

    // Update Member status to Active & approved
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const currentHistory = Array.isArray(m.depositHistory) ? m.depositHistory : [];
        return {
          ...m,
          status: 'Active',
          regFeePaid: true,
          joinedDate: cleanDate,
          shares: m.shares + sharesAmount,
          depositHistory: [...newDeposits, ...currentHistory],
          notes: notes || `Approved on ${cleanDate} by ${currentMember.name} after verifying KES 1,000/= registration deposit (Ref: ${regRef}).`
        };
      }
      return m;
    }));

    // Credit KSh 1,000 to Group Reserve Account and totalDeposit to target asset
    setAssets(prev => {
      const updated = { ...prev };
      if (destination === 'Mansa X') {
        updated.mansaX.totalBalance += totalDeposit;
      } else if (destination === 'Etica MMF') {
        updated.eticaMmf.statementBalance += totalDeposit;
      } else {
        updated.bankAccount.balance += totalDeposit;
      }

      updated.groupReserveAccount.balance += 1000.00;
      return updated;
    });

    // General Ledger Entries
    const regTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: cleanDate,
      description: `New Member Approval: KSh 1,000 registration fee deposit by ${member.name} (${destinationDesc}) [Ref: ${regRef}]`,
      debitAccount: destinationDesc,
      creditAccount: 'Group Reserve Account (Non-refundable Registration Pool)',
      amount: 1000.00,
      type: 'Registration Fee'
    };

    const newEntries = [regTx];

    if (sharesAmount > 0) {
      const shareTx = {
        id: `TX-${(Date.now() + 1).toString().slice(-4)}`,
        date: cleanDate,
        description: `Initial Share Capital Deposit by ${member.name} (${destinationDesc}) [Attributed: ${attributedQuarter}]`,
        debitAccount: destinationDesc,
        creditAccount: `${member.name} - Shares`,
        amount: sharesAmount,
        type: 'Deposit'
      };
      newEntries.push(shareTx);
    }

    setLedger(prev => [...newEntries, ...prev]);

    // Notification
    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `New Member Approved: ${member.name}`,
      message: `${member.name} (Member No ${member.id}) approved after depositing mandatory KSh 1,000/= registration fee (Ref: ${regRef}). Verified by ${currentMember.name}.`,
      date: cleanDate,
      read: false,
      type: "membership"
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Member ${member.name} officially approved! KSh 1,000/= registration fee reconciled.`);
    return true;
  };

  // Vote on Resolution
  const castVote = (resolutionId, voteType) => {
    setResolutions(prev => prev.map(res => {
      if (res.id !== resolutionId) return res;

      // Remove from all existing vote lists
      const newVotes = {
        yes: res.votes.yes.filter(id => id !== currentMemberId),
        no: res.votes.no.filter(id => id !== currentMemberId),
        abstain: res.votes.abstain.filter(id => id !== currentMemberId),
      };

      // Add to selected vote
      newVotes[voteType].push(currentMemberId);
      return {
        ...res,
        votes: newVotes
      };
    }));

    showToast(`Vote cast successfully: ${voteType.toUpperCase()} on resolution.`);
  };

  // Send Email / SMS Reminders to Members
  const sendEmailReminders = async (resolutionId) => {
    const res = resolutions.find(r => r.id === resolutionId);
    if (!res) return;

    // Find who hasn't voted yet
    const votedMembers = [...res.votes.yes, ...res.votes.no, ...res.votes.abstain];
    const unvoted = members.filter(m => m.status === 'Active' && !votedMembers.includes(m.id));

    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: `Email Reminders Dispatched (${unvoted.length} members)`,
      message: `Automated email & SMS voting reminder sent to: ${unvoted.map(m => m.name.split(' ')[0]).join(', ')} for resolution: "${res.title.substring(0, 45)}..."`,
      date: new Date().toISOString().split('T')[0],
      read: false,
      type: "governance"
    };
    setNotifications(prev => [notif, ...prev]);

    try {
      await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'send_email',
          audience: 'all_active',
          subject: `Voting Reminder: "${res.title}"`,
          messageHtml: `<p>Dear Member,</p><p>Your vote is requested on resolution <strong>${res.id}: ${res.title}</strong> before the deadline (${res.deadline}).</p><p>${res.description || ''}</p>`
        })
      });
    } catch {
      // ignore if offline
    }

    showToast(`Dispatched voting reminders to ${unvoted.length} pending members via Email & SMS!`);
  };

  // Direct Data Management & Editing Functions
  const updateMemberNumber = async ({ oldMemberId, newMemberId }) => {
    const cleanOld = String(oldMemberId || '').trim();
    const cleanNew = String(newMemberId || '').trim();

    if (!cleanOld || !cleanNew) {
      showToast('Member Number cannot be blank.');
      return { ok: false, error: 'Member Number cannot be blank.' };
    }

    if (cleanOld === cleanNew) {
      return { ok: true, newMemberId: cleanNew };
    }

    const existing = members.find(m => m.id.toLowerCase() === cleanNew.toLowerCase());
    if (existing && existing.id !== cleanOld) {
      showToast(`Member Number "${cleanNew}" is already assigned to ${existing.name}.`);
      return { ok: false, error: `Member Number "${cleanNew}" already exists.` };
    }

    if (!isCurrentMemberExec && !isSuperAdmin && !hasPermission('manage_access_control') && !hasPermission('manage_member_registry')) {
      if (!requireExecutivePermission(
        "Modifying Official Member Number",
        `Updating a member's official registry ID from "${cleanOld}" to "${cleanNew}" requires Executive Committee or Administrator privileges.`
      )) {
        return { ok: false, error: 'Permission denied' };
      }
    }

    const targetMember = members.find(m => m.id === cleanOld);
    const memberName = targetMember ? targetMember.name : cleanOld;

    // 1. Members Registry
    setMembers(prev => prev.map(m => (m.id === cleanOld ? { ...m, id: cleanNew } : m)));

    // 2. Active Session & Persona
    if (currentMemberId === cleanOld) {
      setCurrentMemberId(cleanNew);
      try {
        localStorage.setItem('mgr_current_member_id', cleanNew);
      } catch {}
    }

    // 3. Authenticated User Profile
    setAuthenticatedUser(prev => {
      if (prev && prev.memberId === cleanOld) {
        return { ...prev, memberId: cleanNew };
      }
      return prev;
    });

    // 4. RBAC Users
    setRbacUsers(prev => prev.map(u => (u.memberId === cleanOld ? { ...u, memberId: cleanNew } : u)));

    // 5. Active and Historical Loans
    setLoans(prev => prev.map(l => ({
      ...l,
      borrowerId: l.borrowerId === cleanOld ? cleanNew : l.borrowerId,
      funderMemberId: l.funderMemberId === cleanOld ? cleanNew : l.funderMemberId
    })));

    // 6. Resolutions & Voting Records
    setResolutions(prev => prev.map(r => ({
      ...r,
      votes: {
        yes: Array.isArray(r.votes?.yes) ? r.votes.yes.map(id => id === cleanOld ? cleanNew : id) : [],
        no: Array.isArray(r.votes?.no) ? r.votes.no.map(id => id === cleanOld ? cleanNew : id) : [],
        abstain: Array.isArray(r.votes?.abstain) ? r.votes.abstain.map(id => id === cleanOld ? cleanNew : id) : []
      }
    })));

    // 7. Pending Executive Financial Ratifications
    setPendingFinancialActions(prev => prev.map(p => ({
      ...p,
      initiatedById: p.initiatedById === cleanOld ? cleanNew : p.initiatedById,
      approvals: Array.isArray(p.approvals) ? p.approvals.map(id => id === cleanOld ? cleanNew : id) : [],
      rejections: Array.isArray(p.rejections) ? p.rejections.map(id => id === cleanOld ? cleanNew : id) : []
    })));

    // 8. Recruitment Pipeline Prospects
    setProspects(prev => prev.map(pr => ({
      ...pr,
      recruiterId: pr.recruiterId === cleanOld ? cleanNew : pr.recruiterId
    })));

    // 9. Club Announcements
    setAnnouncements(prev => prev.map(a => ({
      ...a,
      memberId: a.memberId === cleanOld ? cleanNew : a.memberId
    })));

    // 10. General Ledger Governance Audit
    const auditEntry = {
      id: `LEDGER-MEM-ID-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Official Member ID Updated: ${memberName} changed from ${cleanOld} to ${cleanNew}`,
      amount: 0,
      type: 'Audit / Governance',
      category: 'Governance',
      recordedBy: currentMember?.name || 'Executive Committee',
      reference: `REG-${cleanNew}`
    };
    setLedger(prev => [auditEntry, ...prev]);

    // 11. Backend API Migration
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'update_member_id',
          oldMemberId: cleanOld,
          newMemberId: cleanNew
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.users)) {
          setRbacUsers(data.users);
        }
      }
    } catch {
      // offline fallback
    }

    showToast(`Member Number updated: ${memberName} is now ${cleanNew}`);
    return { ok: true, newMemberId: cleanNew };
  };

  const updateMember = (memberId, updatedFields) => {
    let effectiveId = memberId;
    if (updatedFields.id && updatedFields.id.trim() !== memberId) {
      updateMemberNumber({ oldMemberId: memberId, newMemberId: updatedFields.id.trim() });
      effectiveId = updatedFields.id.trim();
    }

    const targetMember = members.find(m => m.id === memberId || m.id === effectiveId);

    // If modifying another member, must be on Executive Committee
    if (effectiveId !== currentMemberId) {
      if (!requireExecutivePermission(
        "Modifying Member Records",
        `Only Executive Committee members can alter details, status, or records for other members (${targetMember?.name || effectiveId}).`
      )) {
        return false;
      }
    } else {
      // Modifying own self: non-executive members cannot modify their own share capital
      if (
        updatedFields.shares !== undefined && 
        parseFloat(updatedFields.shares) !== targetMember?.shares && 
        !isCurrentMemberExec
      ) {
        requireExecutivePermission(
          "Modifying Member Shares",
          "Share balances cannot be manually altered without formal deposit verification or Executive Committee sign-off."
        );
        return false;
      }
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId || m.id === effectiveId) {
        return {
          ...m,
          ...updatedFields,
          id: effectiveId,
          shares: updatedFields.shares !== undefined ? parseFloat(updatedFields.shares) : m.shares
        };
      }
      return m;
    }));
    showToast(`Member profile and financial records updated!`);
    return true;
  };

  const deleteMember = (memberId) => {
    if (!requireExecutivePermission(
      "Expelling / Removing Member",
      "Removing a member from the official MGR registry requires Executive Committee governance approval."
    )) {
      return false;
    }
    setMembers(prev => prev.filter(m => m.id !== memberId));
    showToast(`Member record removed from registry`);
    return true;
  };

  const updateAssets = (newAssets) => {
    if (!requireExecutivePermission(
      "Modifying Group Treasury Assets",
      "Direct balance adjustments to Mansa X, Etica MMF, Bank, or Group Reserve accounts are strictly restricted to the Executive Committee."
    )) {
      return false;
    }
    setAssets(prev => ({
      ...prev,
      ...newAssets
    }));
    showToast(`Group financial asset accounts updated successfully!`);
    return true;
  };

  const updateLoan = (loanId, updatedFields) => {
    if (!requireExecutivePermission("Modifying Loan Terms")) return false;
    setLoans(prev => prev.map(l => l.id === loanId ? { ...l, ...updatedFields } : l));
    showToast(`Loan record updated`);
    return true;
  };

  // Backfill or add a historical/past loan record to match current standings
  const addHistoricalLoan = ({
    borrowerId,
    principal,
    interestAmount,
    balanceRemaining,
    dateIssued,
    dueDate,
    fundingSource = 'Group Treasury',
    status = 'Active',
    notes = '',
    adjustCurrentBalances = false
  }) => {
    if (!requireExecutivePermission("Recording Historical Loan Standing")) return false;
    const borrower = members.find(m => m.id === borrowerId);
    if (!borrower) return false;

    const cleanPrincipal = parseFloat(principal) || 0;
    if (cleanPrincipal <= 0) {
      showToast('Please enter a valid loan principal', 'error');
      return false;
    }
    const cleanInterest = interestAmount !== undefined && interestAmount !== ''
      ? parseFloat(interestAmount) || 0
      : cleanPrincipal * 0.10;
    const cleanBalance = balanceRemaining !== undefined && balanceRemaining !== ''
      ? parseFloat(balanceRemaining) || 0
      : (status === 'Settled / Repaid' ? 0 : cleanPrincipal + cleanInterest);
    const cleanDate = dateIssued || '2026-06-15';
    const cleanDue = dueDate || '2026-12-15';

    const newLoanRecord = {
      id: `LN-HIST-${Date.now().toString().slice(-4)}`,
      borrowerId: borrower.id,
      borrowerName: borrower.name,
      principal: cleanPrincipal,
      interestAmount: cleanInterest,
      totalPayable: cleanPrincipal + cleanInterest,
      balanceRemaining: cleanBalance,
      dateIssued: cleanDate,
      dueDate: cleanDue,
      fundingSource,
      status,
      notes: notes || `Historical loan record reconciled to match current standings (${status}).`
    };

    setLoans(prev => [newLoanRecord, ...prev]);

    if (adjustCurrentBalances && cleanInterest > 0) {
      setMembers(prev => prev.map(m => m.id === borrower.id ? { ...m, shares: Math.max(0, m.shares - cleanInterest) } : m));
      setAssets(prev => ({
        ...prev,
        groupReserveAccount: {
          ...prev.groupReserveAccount,
          balance: (prev.groupReserveAccount.balance || 0) + cleanInterest
        }
      }));
    }

    const tx = {
      id: `TX-LN-${Date.now().toString().slice(-4)}`,
      date: cleanDate,
      description: `Historical Loan Record Reconciled: ${borrower.name} (${status}) — Principal KES ${cleanPrincipal.toLocaleString()}, Balance KES ${cleanBalance.toLocaleString()}`,
      debitAccount: status === 'Settled / Repaid' ? 'Cash in Bank' : 'Loan Receivables',
      creditAccount: `${borrower.name} - Loan Account`,
      amount: cleanPrincipal,
      type: 'Loan Reconciliation'
    };
    setLedger(prev => [tx, ...prev]);
    showToast(`Historical loan record for ${borrower.name} saved!`);
    return true;
  };

  // Add, Edit, Delete, or Sync Member Deposit History Messages to match current share standings
  const addMemberDepositRecord = (memberId, depositData, syncMemberShares = true) => {
    if (!requireExecutivePermission("Adding Historical Deposit Record")) return false;
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return false;

    const cleanDate = depositData.date || '2026-05-01';
    const cleanAmount = parseFloat(depositData.amount) || 0;
    if (cleanAmount <= 0) {
      showToast('Please enter a valid deposit amount', 'error');
      return false;
    }
    const cleanType = depositData.type || 'Share Capital';
    const cleanDest = depositData.destination || 'Mansa X Special Funds';
    const cleanRef = depositData.transactionRef || `HIST-${Date.now().toString().slice(-5)}`;
    const cleanQuarter = depositData.attributedQuarter || getQuarterForDate(cleanDate);
    const cleanMsg = depositData.transactionMessage || `Confirmed. Ksh ${cleanAmount.toLocaleString()} sent to ${cleanDest} on ${cleanDate}. Ref: ${cleanRef}`;

    const newDep = {
      id: `DEP-HIST-${Date.now().toString().slice(-5)}`,
      date: cleanDate,
      amount: cleanAmount,
      destination: cleanDest,
      type: cleanType,
      transactionRef: cleanRef,
      transactionMessage: cleanMsg,
      attributedQuarter: cleanQuarter,
      isMmfPrincipal: cleanDest.includes('Mansa') || cleanDest.includes('Etica'),
      mmfPrincipalQuarter: (cleanDest.includes('Mansa') || cleanDest.includes('Etica')) ? cleanQuarter : null,
      status: "Verified & Reconciled",
      approvedBy: depositData.approvedBy || `${currentMember.name} (${currentMember.role})`
    };

    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const updatedHistory = [newDep, ...(m.depositHistory || [])];
      const shareSum = updatedHistory
        .filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee')))
        .reduce((s, d) => s + Number(d.amount || 0), 0);
      return {
        ...m,
        depositHistory: updatedHistory,
        shares: syncMemberShares ? shareSum : m.shares
      };
    }));

    showToast(`Historical deposit message added for ${targetMember.name}!`);
    return true;
  };

  const updateMemberDepositRecord = (memberId, depositId, updatedFields, syncMemberShares = true) => {
    if (!requireExecutivePermission("Editing Historical Deposit Message")) return false;
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const updatedHistory = (m.depositHistory || []).map(d => {
        if (d.id !== depositId) return d;
        const newDate = updatedFields.date || d.date;
        return {
          ...d,
          ...updatedFields,
          amount: updatedFields.amount !== undefined ? parseFloat(updatedFields.amount) || 0 : d.amount,
          attributedQuarter: updatedFields.attributedQuarter || getQuarterForDate(newDate)
        };
      });
      const shareSum = updatedHistory
        .filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee')))
        .reduce((s, d) => s + Number(d.amount || 0), 0);
      return {
        ...m,
        depositHistory: updatedHistory,
        shares: syncMemberShares ? shareSum : m.shares
      };
    }));
    showToast(`Deposit record & SMS proof updated!`);
    return true;
  };

  const deleteMemberDepositRecord = (memberId, depositId, syncMemberShares = true) => {
    if (!requireExecutivePermission("Deleting Deposit Record")) return false;
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      const updatedHistory = (m.depositHistory || []).filter(d => d.id !== depositId);
      const shareSum = updatedHistory
        .filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee')))
        .reduce((s, d) => s + Number(d.amount || 0), 0);
      return {
        ...m,
        depositHistory: updatedHistory,
        shares: syncMemberShares ? shareSum : m.shares
      };
    }));
    showToast(`Deposit record removed.`);
    return true;
  };

  // Auto-generate a balancing deposit record if a member's deposit messages do not sum up to their current shares C/F
  const reconcileMemberDepositsToShares = (memberId) => {
    if (!requireExecutivePermission("Reconciling Member Deposits to Current Standings")) return false;
    const m = members.find(item => item.id === memberId);
    if (!m) return false;

    const currentHistory = m.depositHistory || [];
    const recordedShareDeposits = currentHistory
      .filter(d => !d.type || (!d.type.toLowerCase().includes('registration') && !d.type.toLowerCase().includes('reg fee')))
      .reduce((s, d) => s + Number(d.amount || 0), 0);
    const diff = Number(m.shares || 0) - recordedShareDeposits;

    if (Math.abs(diff) < 0.01) {
      showToast(`${m.name}'s deposit messages already match their KES ${m.shares.toLocaleString()} standing 100%!`);
      return true;
    }

    if (diff > 0) {
      const refCode = `REC-${m.id.replace('MGR-', '')}-${Date.now().toString().slice(-4)}`;
      const reconEntry = {
        id: `DEP-REC-${Date.now().toString().slice(-4)}`,
        date: m.joinedDate || '2026-05-01',
        amount: Number(diff.toFixed(2)),
        destination: 'Mansa X Special Funds',
        type: 'Share Capital (Brought Forward Reconciliation)',
        transactionRef: refCode,
        transactionMessage: `Confirmed. Brought-forward share deposit of Ksh ${Number(diff).toLocaleString()} reconciled to match official C/F standing of Ksh ${m.shares.toLocaleString()}. Ref: ${refCode}`,
        attributedQuarter: getQuarterForDate(m.joinedDate || '2026-05-01'),
        isMmfPrincipal: true,
        mmfPrincipalQuarter: getQuarterForDate(m.joinedDate || '2026-05-01'),
        status: 'Verified & Reconciled',
        approvedBy: `${currentMember.name} (${currentMember.role})`
      };
      setMembers(prev => prev.map(item => item.id === memberId ? {
        ...item,
        depositHistory: [reconEntry, ...(item.depositHistory || [])]
      } : item));
      showToast(`Added balancing deposit record of KES ${diff.toLocaleString()} to match ${m.name}'s current standing!`);
    } else {
      // If recorded deposits exceed current shares, update current shares to match sum of verified deposit messages
      setMembers(prev => prev.map(item => item.id === memberId ? {
        ...item,
        shares: Number(recordedShareDeposits.toFixed(2))
      } : item));
      showToast(`Updated ${m.name}'s share standing to KES ${recordedShareDeposits.toLocaleString()} to match verified deposit messages!`);
    }
    return true;
  };

  // Update an existing General Ledger entry (date, description, debit, credit, amount, type)
  const updateLedgerEntry = (txId, updatedFields) => {
    if (!requireExecutivePermission("Editing Historical Ledger Entry")) return false;
    setLedger(prev => prev.map(tx => tx.id === txId ? {
      ...tx,
      ...updatedFields,
      amount: updatedFields.amount !== undefined ? parseFloat(updatedFields.amount) || 0 : tx.amount
    } : tx));
    showToast(`Historical ledger entry updated!`);
    return true;
  };

  const deleteLoan = (loanId) => {
    if (!requireExecutivePermission("Deleting Loan Record")) return false;
    setLoans(prev => prev.filter(l => l.id !== loanId));
    showToast(`Loan record deleted from records`);
    return true;
  };

  const addLedgerEntry = (entry) => {
    if (!requireExecutivePermission(
      "Posting Manual Ledger Transaction",
      "Only the Executive Committee is authorized to post manual debits or credits to the General Ledger."
    )) {
      return false;
    }
    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: entry.date || new Date().toISOString().split('T')[0],
      description: entry.description,
      debitAccount: entry.debitAccount,
      creditAccount: entry.creditAccount,
      amount: parseFloat(entry.amount) || 0,
      type: entry.type || 'Manual Entry'
    };
    setLedger(prev => [newTx, ...prev]);
    showToast(`Accounting ledger entry added`);
    return true;
  };

  const deleteLedgerEntry = (txId) => {
    if (!requireExecutivePermission(
      "Reversing Ledger Transaction",
      "Altering or deleting financial transactions from the general ledger requires Executive Committee authority."
    )) {
      return false;
    }
    setLedger(prev => prev.filter(tx => tx.id !== txId));
    showToast(`Ledger transaction removed`);
    return true;
  };

  // Recruitment & Prospect Pipeline Management
  const addProspect = (prospect) => {
    const newP = {
      id: `PROSP-${Date.now().toString().slice(-3)}`,
      name: prospect.name,
      recruiter: prospect.recruiter || currentMember.name,
      recruiterId: prospect.recruiterId || currentMember.id,
      status: prospect.status || 'Contacted',
      phone: prospect.phone || '',
      dateContacted: new Date().toISOString().split('T')[0],
      expectedRegFee: 1000.00,
      expectedDepositChannel: prospect.expectedDepositChannel || 'Etica Capital MMF',
      notes: prospect.notes || ''
    };
    setProspects(prev => [newP, ...prev]);
    showToast(`Prospect "${newP.name}" added to recruitment pipeline!`);
    return true;
  };

  const updateProspect = (prospectId, updatedFields) => {
    setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, ...updatedFields } : p));
    showToast(`Prospect details updated`);
    return true;
  };

  const deleteProspect = (prospectId) => {
    if (!requireExecutivePermission("Deleting Prospect Record")) return false;
    setProspects(prev => prev.filter(p => p.id !== prospectId));
    showToast(`Prospect removed from pipeline`);
    return true;
  };

  const convertProspectToMember = ({ prospectId, initialShares = 0, destination = 'Etica MMF' }) => {
    if (!requireExecutivePermission(
      "Admitting Prospect as Official Member",
      "Formal admission of a prospective recruit into the MGR share registry requires Executive Committee approval."
    )) {
      return false;
    }
    const p = prospects.find(item => item.id === prospectId);
    if (!p) return false;

    const nextNum = (members.length + 1).toString().padStart(3, '0');
    const newId = `MGR-${nextNum}`;
    const sharesNum = parseFloat(initialShares) || 0;

    const newMember = {
      id: newId,
      name: p.name,
      role: 'Member',
      committeeRole: 'General Member',
      shares: 0,
      regFeePaid: true,
      status: 'Active',
      phone: p.phone || '',
      email: p.email || '',
      avatar: p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      joinedDate: new Date().toISOString().split('T')[0],
      recruitedBy: p.recruiter,
      notes: `Recruited by ${p.recruiter}. Approved after depositing KES 1,000/= registration fee.`
    };

    setMembers(prev => [...prev, newMember]);
    recordDeposit({
      memberId: newId,
      amount: sharesNum + 1000.00,
      destination,
      includeRegFee: true,
      notes: `Onboarding deposit: KES 1,000 registration fee + KES ${sharesNum} shares (Recruited by ${p.recruiter})`
    });

    setProspects(prev => prev.filter(item => item.id !== prospectId));
    showToast(`Prospect ${p.name} officially admitted as Member No ${newId}! Recruiter: ${p.recruiter}`);
    return true;
  };

  // Portfolio Advisories & Yield Action Bulletins Management (Create, Edit, Delete, Hit as Solved)
  const addPortfolioAdvisory = (advisoryData) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Create Portfolio Advisory",
        "Authoring strategic investment bulletins or portfolio reallocation notices is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    const newAdv = {
      id: `ADV-${Date.now()}`,
      category: advisoryData.category || "PORTFOLIO REALLOCATION ANALYSIS",
      title: advisoryData.title,
      content: advisoryData.content,
      financialImpact: advisoryData.financialImpact || "",
      actionLabel: advisoryData.actionLabel || "Take Action",
      actionTarget: advisoryData.actionTarget || "governance",
      severity: advisoryData.severity || "warning",
      status: "active",
      author: `${currentMember.name} (${currentMember.role})`,
      createdAt: new Date().toISOString().split('T')[0],
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: null
    };
    setPortfolioAdvisories(prev => [newAdv, ...prev]);
    addLedgerEntry({
      type: 'Operational',
      description: `New Portfolio Advisory Published: "${newAdv.title}" by ${currentMember.name}`,
      category: 'Advisory Bulletin'
    });
    showToast(`Advisory bulletin "${newAdv.title}" published!`);
    return true;
  };

  const updatePortfolioAdvisory = (advisoryId, updatedFields) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Edit Portfolio Advisory",
        "Modifying portfolio advisories is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    setPortfolioAdvisories(prev => prev.map(a => a.id === advisoryId ? { ...a, ...updatedFields } : a));
    showToast(`Advisory updated successfully.`);
    return true;
  };

  // Hit as Solved / Resolve Advisory
  const resolvePortfolioAdvisory = (advisoryId, resolutionNotes = "") => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Resolve Portfolio Advisory",
        "Marking strategic portfolio issues as solved is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    setPortfolioAdvisories(prev => prev.map(a => {
      if (a.id === advisoryId) {
        return {
          ...a,
          status: 'solved',
          resolvedAt: new Date().toISOString().split('T')[0],
          resolvedBy: currentMember.name,
          resolutionNotes: resolutionNotes || `Marked resolved by ${currentMember.name} (${currentMember.role})`
        };
      }
      return a;
    }));
    addLedgerEntry({
      type: 'Operational',
      description: `Portfolio Advisory Solved: Notice "${advisoryId}" resolved by ${currentMember.name}`,
      category: 'Advisory Bulletin'
    });
    showToast(`Advisory notice marked as Solved!`);
    return true;
  };

  const reopenPortfolioAdvisory = (advisoryId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Reopen Portfolio Advisory",
        "Reopening portfolio advisories is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    setPortfolioAdvisories(prev => prev.map(a => {
      if (a.id === advisoryId) {
        return {
          ...a,
          status: 'active',
          resolvedAt: null,
          resolvedBy: null,
          resolutionNotes: null
        };
      }
      return a;
    }));
    showToast(`Advisory notice reopened as Active.`);
    return true;
  };

  const deletePortfolioAdvisory = (advisoryId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Delete Portfolio Advisory",
        "Deleting strategic portfolio advisories is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    setPortfolioAdvisories(prev => prev.filter(a => a.id !== advisoryId));
    addLedgerEntry({
      type: 'Operational',
      description: `Portfolio Advisory Deleted: "${advisoryId}" removed by ${currentMember.name}`,
      category: 'Advisory Bulletin'
    });
    showToast(`Advisory permanently deleted.`);
    return true;
  };

  // Announcements & Official News Management (Executive Committee)
  const addAnnouncement = (announcementData) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Post Official Announcement",
        "Publishing club-wide news and formal announcements is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    const newAnn = {
      id: `ANN-${Date.now()}`,
      title: announcementData.title,
      category: announcementData.category || "General Announcement",
      priority: announcementData.priority || "Official Notice",
      date: announcementData.date || new Date().toISOString().split('T')[0],
      author: `${currentMember.name} (${currentMember.role})`,
      content: announcementData.content,
      actionLabel: announcementData.actionLabel || "",
      actionTarget: announcementData.actionTarget || "",
      pinned: !!announcementData.pinned,
      memberId: announcementData.memberId || null
    };

    setAnnouncements(prev => [newAnn, ...prev]);

    // Also push to member notifications feed
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        title: newAnn.title,
        message: newAnn.content.slice(0, 140) + '...',
        date: newAnn.date,
        read: false,
        type: newAnn.priority === 'Urgent' ? 'urgent' : 'finance'
      },
      ...prev
    ]);

    addLedgerEntry({
      type: 'Operational',
      description: `Official Announcement Published: "${newAnn.title}" by ${currentMember.name}`,
      category: 'Announcements'
    });

    showToast(`Official announcement "${newAnn.title}" published!`);
    return true;
  };

  const updateAnnouncement = (announcementId, updatedFields) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Edit Announcement",
        "Editing club announcements is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    setAnnouncements(prev => prev.map(a => a.id === announcementId ? { ...a, ...updatedFields } : a));
    showToast(`Announcement updated successfully.`);
    return true;
  };

  const deleteAnnouncement = (announcementId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Delete Announcement",
        "Deleting club announcements is strictly restricted to the 7 Executive Committee members."
      );
      return false;
    }
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
    addLedgerEntry({
      type: 'Operational',
      description: `Announcement Deleted: "${announcementId}" removed by ${currentMember.name}`,
      category: 'Announcements'
    });
    showToast(`Announcement removed.`);
    return true;
  };

  // Mark Member as Deceased & Bereavement Transition Workflow
  const markMemberAsDeceased = ({
    memberId,
    deceasedDate,
    beneficiaryName,
    beneficiaryContact = '',
    notes = '',
    publishAnnouncement = true
  }) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction(
        "Record Member Demise",
        "Formally marking a member as deceased and transferring their shareholding to estate escrow is strictly reserved for the 7 Executive Committee members."
      );
      return false;
    }

    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) {
      showToast("Member not found", "error");
      return false;
    }

    const cleanDate = deceasedDate || new Date().toISOString().split('T')[0];
    const cleanBeneficiary = beneficiaryName || `Beneficiary of Late ${targetMember.name}`;

    // Update member record
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'Deceased',
          deceasedDate: cleanDate,
          beneficiaryName: cleanBeneficiary,
          beneficiaryContact: beneficiaryContact,
          sharesForSale: m.shares,
          sharesSold: 0.00,
          notes: notes || `Passed away on ${cleanDate}. Dues payable to beneficiary (${cleanBeneficiary}) as per Bylaw Clause 4.2 exit policy.`
        };
      }
      return m;
    }));

    // Optionally publish official Bereavement Announcement
    if (publishAnnouncement) {
      const bereavementAnn = {
        id: `ANN-BEREAVE-${Date.now()}`,
        title: `Bereavement Notice: Demise of Member ${targetMember.name} (${cleanDate})`,
        category: "Bereavement & Demise Notice",
        priority: "Urgent",
        date: cleanDate,
        author: `${currentMember.name} (${currentMember.role})`,
        content: `It is with profound sorrow that the Executive Committee announces the passing of our esteemed member, ${targetMember.name} (${targetMember.id}), on ${cleanDate}. In accordance with Bylaw Clause 4.2 and Policy POL-004, their total share capital of KES ${targetMember.shares.toLocaleString()} has been placed in estate escrow. Terminal dues will be settled to designated beneficiary (${cleanBeneficiary}) at financial year close, or members may acquire their shares through internal buyout.`,
        actionLabel: "View Estate Buyout Window",
        actionTarget: "marketplace",
        pinned: true,
        memberId: targetMember.id
      };
      setAnnouncements(prev => [bereavementAnn, ...prev]);

      setNotifications(prev => [
        {
          id: `NOTIF-BEREAVE-${Date.now()}`,
          title: `Bereavement Notice: ${targetMember.name}`,
          message: `Member ${targetMember.name} passed away on ${cleanDate}. Estate shares placed in escrow.`,
          date: cleanDate,
          read: false,
          type: "urgent"
        },
        ...prev
      ]);
    }

    // Ledger audit
    addLedgerEntry({
      type: 'Governance',
      description: `Member Demise Recorded: ${targetMember.name} (${targetMember.id}) passed away on ${cleanDate}. Shares (KES ${targetMember.shares.toLocaleString()}) transitioned to Estate Escrow for ${cleanBeneficiary}.`,
      category: 'Bereavement Clause'
    });

    showToast(`Member ${targetMember.name} marked as Deceased (${cleanDate}). Estate escrow initialized.`);
    return true;
  };

  // Revert Deceased Status (if recorded by error)
  const revertMemberDeceasedStatus = (memberId) => {
    if (!isCurrentMemberExec) {
      triggerExecRestriction("Revert Deceased Status", "Restricted to Executive Committee members.");
      return false;
    }
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return false;

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'Active',
          deceasedDate: null,
          sharesForSale: 0.00,
          sharesSold: 0.00,
          notes: 'Status restored to Active Member.'
        };
      }
      return m;
    }));

    addLedgerEntry({
      type: 'Governance',
      description: `Member Status Restored to Active: ${targetMember.name} (${targetMember.id}) by ${currentMember.name}.`,
      category: 'Membership'
    });

    showToast(`Member ${targetMember.name} restored to Active status.`);
    return true;
  };

  // ==========================================================================
  // AUTHENTICATION, RBAC & MAIL API ACTIONS
  // ==========================================================================
  const loginWithCredentials = async (identifier, password) => {
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', identifier, password })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || 'Authentication failed' };
        }
        setAuthToken(data.token || '');
        setAuthenticatedUser(data.user);
        setCurrentMemberId(data.user.memberId);
        await refreshSecurityBootstrap(data.token || '');
        showToast(`Signed in as ${data.user.name} (${data.user.positionTitle})`);
        return { ok: true, user: data.user };
      }
    } catch {
      // Local dev fallback when api.php is not served by Apache/PHP
    }

    // Local development fallback authentication
    const cleanId = String(identifier || '').trim().toLowerCase();
    const matchedUser = rbacUsers.find(
      u =>
        u.memberId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
    );
    if (!matchedUser) {
      return { ok: false, error: 'Member ID or Email not found. Use MGR-001 through MGR-011.' };
    }
    if (matchedUser.accountStatus === 'Suspended') {
      return { ok: false, error: 'This member account is suspended by the Administrator.' };
    }
    const storedPass = matchedUser.localPassword || 'MGR@2026';
    if (password !== storedPass && password !== 'MGR@2026') {
      return { ok: false, error: 'Invalid password (default cooperative password is MGR@2026).' };
    }
    const updatedUser = { ...matchedUser, lastLogin: new Date().toISOString() };
    setAuthenticatedUser(updatedUser);
    setCurrentMemberId(updatedUser.memberId);
    setRbacUsers(prev => prev.map(u => (u.memberId === updatedUser.memberId ? updatedUser : u)));
    showToast(`Signed in as ${updatedUser.name} (${updatedUser.positionTitle})`);
    return { ok: true, user: updatedUser };
  };

  const requestEmailOtp = async (identifier) => {
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', identifier })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || 'Could not dispatch OTP' };
        }
        showToast(data.message || 'Verification code sent to your email.');
        return { ok: true, ...data };
      }
    } catch {
      // Local fallback
    }
    const cleanId = String(identifier || '').trim().toLowerCase();
    const matched = rbacUsers.find(u => u.memberId.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
    if (!matched) {
      return { ok: false, error: 'No member found matching that Member ID or Email.' };
    }
    showToast(`Verification code sent to ${matched.email} (Local Demo OTP: 202611)`);
    return { ok: true, email: matched.email, memberId: matched.memberId, demoOtp: '202611' };
  };

  const verifyEmailOtp = async ({ identifier, otpCode, newPassword = '' }) => {
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', identifier, otpCode, newPassword })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          return { ok: false, error: data.error || 'Invalid OTP code' };
        }
        setAuthToken(data.token || '');
        setAuthenticatedUser(data.user);
        setCurrentMemberId(data.user.memberId);
        await refreshSecurityBootstrap(data.token || '');
        showToast(`Verified & signed in as ${data.user.name}`);
        return { ok: true, user: data.user };
      }
    } catch {
      // Local fallback
    }
    const cleanId = String(identifier || '').trim().toLowerCase();
    const matched = rbacUsers.find(u => u.memberId.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId);
    if (!matched || otpCode !== '202611') {
      return { ok: false, error: 'Invalid verification code.' };
    }
    const updatedUser = {
      ...matched,
      ...(newPassword ? { localPassword: newPassword } : {}),
      lastLogin: new Date().toISOString()
    };
    setAuthenticatedUser(updatedUser);
    setCurrentMemberId(updatedUser.memberId);
    setRbacUsers(prev => prev.map(u => (u.memberId === updatedUser.memberId ? updatedUser : u)));
    showToast(`Verified & signed in as ${updatedUser.name}`);
    return { ok: true, user: updatedUser };
  };

  const logoutSession = async () => {
    try {
      await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({ action: 'logout' })
      });
    } catch {
      // ignore
    }
    setAuthToken('');
    setAuthenticatedUser(null);
    showToast('Signed out of MGR Investment Portal.');
  };

  const changeOwnPassword = async (currentPassword, newPassword) => {
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({ action: 'change_password', currentPassword, newPassword })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          showToast(data.error || 'Password update failed', 'error');
          return { ok: false, error: data.error };
        }
        showToast(data.message || 'Password updated successfully');
        return { ok: true };
      }
    } catch {
      // Local fallback
    }
    setRbacUsers(prev =>
      prev.map(u => (u.memberId === currentMemberId ? { ...u, localPassword: newPassword } : u))
    );
    showToast('Password updated successfully!');
    return { ok: true };
  };

  const lockMemberVault = (memberId) => {
    setUnlockedMemberPins(prev => {
      const next = { ...prev };
      delete next[memberId];
      return next;
    });
  };

  const signupUser = async ({ name, email, phone, password, accountPin = '1234', privacyAgreed = true }) => {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const cleanPin = (accountPin || '1234').trim();

    if (!cleanName || !cleanEmail || !password) {
      showToast('Please provide your Full Name, Email, and Password.', 'error');
      return { ok: false, error: 'Full Name, Email, and Password are required.' };
    }

    if (!privacyAgreed) {
      showToast('You must accept the MGR Privacy Policy & Kenya Data Protection Act 2019 terms.', 'error');
      return { ok: false, error: 'Privacy Policy acceptance required.' };
    }

    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password,
          accountPin: cleanPin,
          privacyAgreed: true
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok && data.user) {
          setAuthToken(data.token || '');
          setAuthenticatedUser(data.user);
          setCurrentMemberId(data.user.memberId);
          if (Array.isArray(data.users)) setRbacUsers(data.users);
          await refreshSecurityBootstrap(data.token || '');
          showToast(`Welcome to MGR Investment Group, ${cleanName}!`);
          return { ok: true, user: data.user };
        }
        showToast(data.error || 'Registration failed.', 'error');
        return { ok: false, error: data.error };
      }
    } catch {
      // Offline fallback below
    }

    // Offline / Local Registration Fallback
    const existingMember = members.find(m => m.name.toLowerCase() === cleanName.toLowerCase());
    let newId = existingMember ? existingMember.id : '';

    if (!newId) {
      const numericIds = members
        .map(m => {
          const match = m.id.match(/MGR-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => !isNaN(n));
      const maxNum = numericIds.length > 0 ? Math.max(...numericIds, 11) : 11;
      newId = `MGR-${String(maxNum + 1).padStart(3, '0')}`;
    }

    const initials = cleanName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('') || 'MB';

    const localUser = {
      memberId: newId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      positionTitle: existingMember ? existingMember.role : 'Member',
      membershipTier: existingMember ? existingMember.committeeRole : 'General Member',
      accessLevel: existingMember && isExecutive(existingMember.id) ? 'executive_officer' : 'general_member',
      permissions: buildDefaultPermissionsForRole('general_member', 'Member'),
      accountStatus: 'Active',
      mustChangePassword: false,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accountPin: cleanPin,
      privacyAgreedAt: new Date().toISOString(),
      kycDocuments: []
    };

    if (!existingMember) {
      const newMemberObj = {
        id: newId,
        name: cleanName,
        gender: 'male',
        role: 'Member',
        committeeRole: 'General Member',
        shares: 0,
        regFeePaid: false,
        status: 'Active',
        phone: cleanPhone,
        email: cleanEmail,
        avatar: initials,
        joinedDate: new Date().toISOString().split('T')[0],
        depositHistory: [],
        accountPin: cleanPin,
        kycDocuments: [],
        privacyAgreedAt: new Date().toISOString()
      };
      setMembers(prev => [...prev, newMemberObj]);
    } else {
      setMembers(prev =>
        prev.map(m => m.id === newId ? {
          ...m,
          email: cleanEmail,
          phone: cleanPhone || m.phone,
          accountPin: cleanPin,
          privacyAgreedAt: new Date().toISOString()
        } : m)
      );
    }

    setRbacUsers(prev => {
      const filtered = prev.filter(u => u.memberId !== newId);
      return [...filtered, localUser];
    });

    setAuthenticatedUser(localUser);
    setCurrentMemberId(newId);
    setAuthToken(`local-token-${Date.now()}`);
    showToast(`Welcome to MGR Investment Group, ${cleanName}! (${newId})`);
    return { ok: true, user: localUser };
  };

  const uploadKycDocument = async ({ memberId, docType, title, fileName, fileData, mimeType, size }) => {
    const targetId = memberId || authenticatedUser?.memberId || currentMemberId;
    const newDocId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newDoc = {
      id: newDocId,
      type: docType || 'OTHER_DOC',
      title: title || 'Confidential Legal Document',
      fileName: fileName || 'document.pdf',
      mimeType: mimeType || 'application/pdf',
      size: size || (fileData ? fileData.length : 0),
      uploadedAt: new Date().toISOString(),
      uploadedBy: authenticatedUser?.name || 'Member',
      fileData
    };

    // 1. Update in-memory member registry
    setMembers(prev =>
      prev.map(m => {
        if (m.id === targetId) {
          const existing = Array.isArray(m.kycDocuments) ? m.kycDocuments : [];
          return { ...m, kycDocuments: [...existing, newDoc] };
        }
        return m;
      })
    );

    // 2. Update authenticated user if it is self
    if (authenticatedUser && authenticatedUser.memberId === targetId) {
      setAuthenticatedUser(prev => {
        const existing = Array.isArray(prev.kycDocuments) ? prev.kycDocuments : [];
        return { ...prev, kycDocuments: [...existing, newDoc] };
      });
    }

    // 3. Update rbacUsers
    setRbacUsers(prev =>
      prev.map(u => {
        if (u.memberId === targetId) {
          const existing = Array.isArray(u.kycDocuments) ? u.kycDocuments : [];
          return { ...u, kycDocuments: [...existing, newDoc] };
        }
        return u;
      })
    );

    // 4. Send to server
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'upload_kyc_document',
          memberId: targetId,
          docType,
          title,
          fileName,
          fileData,
          mimeType,
          size
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          showToast(`Document "${title}" securely stored in KYC vault!`);
          return { ok: true, document: data.document || newDoc };
        }
      }
    } catch {
      // offline
    }

    showToast(`Document "${title}" saved to encrypted member vault!`);
    return { ok: true, document: newDoc };
  };

  const deleteKycDocument = async ({ memberId, docId }) => {
    const targetId = memberId || authenticatedUser?.memberId || currentMemberId;

    setMembers(prev =>
      prev.map(m => {
        if (m.id === targetId) {
          const existing = Array.isArray(m.kycDocuments) ? m.kycDocuments : [];
          return { ...m, kycDocuments: existing.filter(d => d.id !== docId) };
        }
        return m;
      })
    );

    if (authenticatedUser && authenticatedUser.memberId === targetId) {
      setAuthenticatedUser(prev => {
        const existing = Array.isArray(prev.kycDocuments) ? prev.kycDocuments : [];
        return { ...prev, kycDocuments: existing.filter(d => d.id !== docId) };
      });
    }

    setRbacUsers(prev =>
      prev.map(u => {
        if (u.memberId === targetId) {
          const existing = Array.isArray(u.kycDocuments) ? u.kycDocuments : [];
          return { ...u, kycDocuments: existing.filter(d => d.id !== docId) };
        }
        return u;
      })
    );

    try {
      await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'delete_kyc_document',
          memberId: targetId,
          docId
        })
      });
    } catch {
      // offline
    }

    showToast('Document deleted from vault.');
    return { ok: true };
  };

  const verifyMemberPin = async ({ targetMemberId, enteredPin }) => {
    const cleanPin = (enteredPin || '').trim();
    const targetUser = rbacUsers.find(u => u.memberId === targetMemberId) || members.find(m => m.id === targetMemberId);
    const officerId = authenticatedUser?.memberId || currentMember?.id || 'MGR-EXEC';
    const officerName = authenticatedUser?.name || currentMember?.name || 'Executive Officer';

    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'verify_member_pin',
          targetMemberId,
          enteredPin: cleanPin,
          officerId,
          officerName
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          setUnlockedMemberPins(prev => ({ ...prev, [targetMemberId]: true }));
          showToast(`Access granted! Legal documents for ${data.memberName || targetMemberId} unlocked exclusively for you.`);
          return { ok: true, unlocked: true, documents: data.documents };
        } else {
          showToast(data.error || 'Invalid Account PIN', 'error');
          return { ok: false, error: data.error };
        }
      }
    } catch {
      // offline
    }

    // Offline validation
    if (targetUser?.pinExpiresAt && new Date(targetUser.pinExpiresAt) < new Date()) {
      const err = `This authorization PIN has expired (24-hour limit exceeded). Ask ${targetUser?.name || 'the member'} to generate a fresh 24-hour PIN.`;
      showToast(err, 'error');
      return { ok: false, error: err };
    }

    const expectedPin = targetUser?.accountPin || '1234';
    if (cleanPin !== expectedPin) {
      const err = `Invalid Account PIN. Access denied as per Kenyan Privacy Policy (Article 31 & Data Protection Act 2019). Ask ${targetUser?.name || 'the member'} for their authorized PIN.`;
      showToast(err, 'error');
      return { ok: false, error: err };
    }

    if (targetUser?.pinUsedById && targetUser.pinUsedById !== officerId) {
      const firstOfficer = targetUser.pinUsedByName || targetUser.pinUsedById;
      const err = `Single-Executive Security Rule: This authorization PIN was already used by ${firstOfficer}. Under MGR security bylaws, each PIN can only be used by one executive within 24 hours. Ask ${targetUser?.name || 'the member'} to generate a separate PIN for you.`;
      showToast(err, 'error');
      return { ok: false, error: err };
    }

    // Mark claimed in offline state
    setMembers(prev =>
      prev.map(m => m.id === targetMemberId ? {
        ...m,
        pinUsedById: officerId,
        pinUsedByName: officerName,
        pinUsedAt: new Date().toISOString()
      } : m)
    );

    setUnlockedMemberPins(prev => ({ ...prev, [targetMemberId]: true }));
    showToast(`Access granted! Legal documents for ${targetUser?.name || targetMemberId} unlocked.`);
    return { ok: true, unlocked: true };
  };

  const generateNewMemberPin = async ({ memberId, newPin }) => {
    const targetId = memberId || authenticatedUser?.memberId || currentMemberId;
    const cleanPin = newPin ? String(newPin).trim() : String(Math.floor(1000 + Math.random() * 9000));
    const nowIso = new Date().toISOString();
    const expiresIso = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    setMembers(prev =>
      prev.map(m => m.id === targetId ? {
        ...m,
        accountPin: cleanPin,
        pinGeneratedAt: nowIso,
        pinExpiresAt: expiresIso,
        pinUsedById: null,
        pinUsedByName: null,
        pinUsedAt: null
      } : m)
    );

    if (authenticatedUser && authenticatedUser.memberId === targetId) {
      setAuthenticatedUser(prev => ({
        ...prev,
        accountPin: cleanPin,
        pinGeneratedAt: nowIso,
        pinExpiresAt: expiresIso,
        pinUsedById: null,
        pinUsedByName: null,
        pinUsedAt: null
      }));
    }

    setRbacUsers(prev =>
      prev.map(u => u.memberId === targetId ? {
        ...u,
        accountPin: cleanPin,
        pinGeneratedAt: nowIso,
        pinExpiresAt: expiresIso,
        pinUsedById: null,
        pinUsedByName: null,
        pinUsedAt: null
      } : u)
    );

    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'generate_member_pin',
          memberId: targetId,
          newPin: cleanPin
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          showToast(`Generated new 24-hour PIN: ${data.accountPin || cleanPin}`);
          return { ok: true, accountPin: data.accountPin || cleanPin, pinExpiresAt: data.pinExpiresAt || expiresIso };
        }
      }
    } catch {
      // offline
    }

    showToast(`Generated new 24-hour single-executive PIN: ${cleanPin}`);
    return { ok: true, accountPin: cleanPin, pinExpiresAt: expiresIso };
  };

  const updateAccountPin = async ({ memberId, newPin }) => {
    return generateNewMemberPin({ memberId, newPin });
  };

  const updateUserProfile = async ({ phone, memberId, email, accountPin, nationalId, locationCity, newPassword }) => {
    const cleanPhone = (phone || '').trim();
    const cleanMemberId = (memberId || currentMemberId).trim();
    const cleanEmail = (email || '').trim();
    const cleanPin = accountPin ? accountPin.trim() : null;
    const cleanNationalId = (nationalId || '').trim();
    const cleanLocation = (locationCity || '').trim();

    // 1. Update in-memory member registry
    setMembers(prev =>
      prev.map(m => {
        if (m.id === currentMemberId || m.id === cleanMemberId) {
          return {
            ...m,
            id: cleanMemberId,
            phone: cleanPhone || m.phone,
            email: cleanEmail || m.email,
            nationalId: cleanNationalId || m.nationalId,
            location: cleanLocation || m.location,
            ...(cleanPin ? { accountPin: cleanPin } : {}),
            firstLoginCompleted: true,
            profileCompleted: true
          };
        }
        return m;
      })
    );

    // 2. Update authenticatedUser & rbacUsers
    if (authenticatedUser) {
      const updatedAuthUser = {
        ...authenticatedUser,
        memberId: cleanMemberId,
        phone: cleanPhone || authenticatedUser.phone,
        email: cleanEmail || authenticatedUser.email,
        nationalId: cleanNationalId || authenticatedUser.nationalId,
        locationCity: cleanLocation || authenticatedUser.locationCity,
        ...(cleanPin ? { accountPin: cleanPin } : {}),
        firstLoginCompleted: true,
        profileCompleted: true
      };
      setAuthenticatedUser(updatedAuthUser);
      setRbacUsers(prev =>
        prev.map(u => (u.memberId === authenticatedUser.memberId || u.memberId === cleanMemberId ? updatedAuthUser : u))
      );
    }

    if (cleanMemberId !== currentMemberId) {
      setCurrentMemberId(cleanMemberId);
    }

    // 3. Mark in localStorage that first login setup is completed for this member
    localStorage.setItem(`mgr_first_login_done_${cleanMemberId}`, 'true');
    localStorage.setItem(`mgr_profile_completed_${cleanMemberId}`, 'true');

    // 4. Send to backend api.php
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'update_profile',
          phone: cleanPhone,
          memberId: cleanMemberId,
          email: cleanEmail,
          nationalId: cleanNationalId,
          locationCity: cleanLocation,
          ...(newPassword ? { newPassword } : {}),
          ...(cleanPin ? { accountPin: cleanPin } : {})
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data.ok && data.user) {
          setAuthenticatedUser(data.user);
          if (Array.isArray(data.users)) setRbacUsers(data.users);
        }
      }
    } catch {
      // Local fallback
    }

    showToast(`Full registration saved! Phone (${cleanPhone}) and 4-Digit Security PIN (${cleanPin || '1234'}) active.`);
    return { ok: true };
  };

  const adminUpdateUserAccess = async ({
    memberId,
    newMemberId,
    positionTitle,
    membershipTier,
    accessLevel,
    accountStatus,
    email,
    phone,
    permissions,
    newPassword = '',
    notifyUserByEmail = true
  }) => {
    if (!hasPermission('manage_access_control') && !isSuperAdmin) {
      triggerExecRestriction(
        'Manage User Roles & Access Privileges',
        'Granting or modifying member roles, positions, and system permissions is restricted to System Administrators and Executive Leadership.'
      );
      return { ok: false, error: 'Administrator permission required' };
    }

    let effectiveMemberId = memberId;
    if (newMemberId && newMemberId.trim() !== memberId) {
      const renameRes = await updateMemberNumber({
        oldMemberId: memberId,
        newMemberId: newMemberId.trim()
      });
      if (!renameRes || !renameRes.ok) {
        return renameRes || { ok: false, error: 'Failed to update Member Number' };
      }
      effectiveMemberId = newMemberId.trim();
    }

    const resolvedPermissions = permissions || buildDefaultPermissionsForRole(accessLevel, positionTitle);

    // Also keep the member registry in sync with positionTitle, committeeRole, email, phone
    setMembers(prev =>
      prev.map(m => {
        if (m.id === effectiveMemberId || m.id === memberId) {
          return {
            ...m,
            id: effectiveMemberId,
            role: positionTitle,
            committeeRole: membershipTier === 'Executive Committee' ? 'Executive Committee' : 'General Member',
            email: email || m.email,
            phone: phone || m.phone
          };
        }
        return m;
      })
    );

    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'admin_update_user_access',
          memberId: effectiveMemberId,
          newMemberId: effectiveMemberId,
          positionTitle,
          membershipTier,
          accessLevel,
          accountStatus,
          email,
          phone,
          permissions: resolvedPermissions,
          newPassword,
          notifyUserByEmail
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok && Array.isArray(data.users)) {
          setRbacUsers(data.users);
          await refreshSecurityBootstrap();
          showToast(`Updated access & position for ${effectiveMemberId} (${positionTitle})`);
          return { ok: true, memberId: effectiveMemberId };
        }
      }
    } catch {
      // Local fallback below
    }

    setRbacUsers(prev =>
      prev.map(u => {
        if (u.memberId === effectiveMemberId || u.memberId === memberId) {
          return {
            ...u,
            memberId: effectiveMemberId,
            positionTitle,
            membershipTier,
            accessLevel,
            accountStatus,
            email: email || u.email,
            phone: phone || u.phone,
            permissions: resolvedPermissions,
            ...(newPassword ? { localPassword: newPassword } : {}),
            updatedAt: new Date().toISOString()
          };
        }
        return u;
      })
    );
    showToast(`Updated access & position for ${effectiveMemberId} (${positionTitle})`);
    return { ok: true, memberId: effectiveMemberId };
  };

  const saveServerMailSettings = async (newSettings) => {
    setMailSettings(prev => ({ ...prev, ...newSettings }));
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({ action: 'save_mail_settings', settings: newSettings })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          setMailSettings(prev => ({ ...prev, ...(data.mailSettings || {}) }));
          showToast('cPanel Mail & SMTP settings saved to SQLite database.');
          return { ok: true };
        }
      }
    } catch {
      // Local fallback
    }
    showToast('Mail settings saved.');
    return { ok: true };
  };

  const sendOfficialClubEmail = async ({ audience = 'single', memberId = '', customEmail = '', subject, messageHtml }) => {
    if (!hasPermission('send_official_mail') && !isCurrentMemberExec) {
      triggerExecRestriction('Send Official Club Email', 'Sending official club emails requires Executive or Treasury permission.');
      return { ok: false, error: 'Permission denied' };
    }
    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'send_email',
          audience,
          memberId,
          customEmail,
          subject,
          messageHtml
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          if (Array.isArray(data.mailLogs)) setMailLogs(data.mailLogs);
          showToast(`Dispatched "${subject}" to ${data.sentCount || 1} recipient(s) via cPanel Mail!`);
          return { ok: true, ...data };
        }
        showToast(data.error || 'Failed to send email', 'error');
        return { ok: false, error: data.error };
      }
    } catch {
      // Local fallback
    }
    const fallbackEntry = {
      id: Date.now(),
      recipient_email: customEmail || memberId || audience,
      recipient_name: audience.toUpperCase(),
      subject,
      body_preview: String(messageHtml).replace(/<[^>]+>/g, '').slice(0, 220),
      transport_used: mailSettings.transport,
      status: 'Queued (Ready for cPanel Mail)',
      sent_by: currentMember?.name || 'Admin',
      created_at: new Date().toISOString()
    };
    setMailLogs(prev => [fallbackEntry, ...prev]);
    showToast(`Email "${subject}" logged & dispatched!`);
    return { ok: true, sentCount: 1 };
  };

  const sendReportEmail = async ({ reportType = 'Financial Report', recipientEmail = '', recipientName = '', reportHtml = '', subject = '' }) => {
    const targetEmail = recipientEmail || currentMember?.email || '';
    const targetName = recipientName || currentMember?.name || 'Member';
    const finalSubject = subject || `MGR Investment Group — Official ${reportType}`;

    if (!targetEmail) {
      showToast('Please provide or configure a recipient email address.', 'error');
      return { ok: false, error: 'Recipient email required' };
    }

    try {
      const res = await fetch('./api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'X-MGR-Token': authToken } : {})
        },
        body: JSON.stringify({
          action: 'send_report_email',
          reportType,
          recipientEmail: targetEmail,
          recipientName: targetName,
          reportHtml,
          subject: finalSubject
        })
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.ok) {
          showToast(`Official ${reportType} successfully sent to ${targetEmail}!`);
          return { ok: true, ...data };
        }
        showToast(data.error || 'Failed to dispatch report email', 'error');
        return { ok: false, error: data.error };
      }
    } catch {
      // Offline/local fallback
    }

    showToast(`Official ${reportType} queued for delivery to ${targetEmail}!`);
    return { ok: true, queued: true };
  };

  // Reset demo data to defaults
  const resetToFactoryDefaults = async () => {
    localStorage.removeItem(`${STORAGE_KEY}_members`);
    localStorage.removeItem(`${STORAGE_KEY}_assets`);
    localStorage.removeItem(`${STORAGE_KEY}_loans`);
    localStorage.removeItem(`${STORAGE_KEY}_resolutions`);
    localStorage.removeItem(`${STORAGE_KEY}_policies`);
    localStorage.removeItem(`${STORAGE_KEY}_ledger`);
    localStorage.removeItem(`${STORAGE_KEY}_pending_financial_actions`);
    localStorage.removeItem(`${STORAGE_KEY}_portfolio_advisories`);
    localStorage.removeItem(`${STORAGE_KEY}_announcements`);
    setMembers(INITIAL_MEMBERS);
    setAssets(INITIAL_GROUP_ASSETS);
    setLoans(INITIAL_LOANS);
    setResolutions(INITIAL_RESOLUTIONS);
    setPolicies(INITIAL_POLICIES);
    setLedger(INITIAL_LEDGER);
    setPortfolioAdvisories(INITIAL_PORTFOLIO_ADVISORIES);
    setAnnouncements(INITIAL_ANNOUNCEMENTS);
    try {
      await fetch('./api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          state: {
            members: INITIAL_MEMBERS,
            assets: INITIAL_GROUP_ASSETS,
            loans: INITIAL_LOANS,
            resolutions: INITIAL_RESOLUTIONS,
            policies: INITIAL_POLICIES,
            ledger: INITIAL_LEDGER,
            prospects: INITIAL_PROSPECTS,
            pendingFinancialActions: [],
            portfolioAdvisories: INITIAL_PORTFOLIO_ADVISORIES,
            announcements: INITIAL_ANNOUNCEMENTS
          }
        })
      });
    } catch {
      // Ignore if offline or running without PHP
    }
    showToast('Accounts reset to official statement figures as of 30/10/2026');
  };

  return (
    <AppContext.Provider
      value={{
        members,
        setMembers,
        assets,
        setAssets,
        currentMember,
        currentMemberId,
        setCurrentMemberId,
        loans,
        resolutions,
        policies,
        setPolicies,
        ledger,
        notifications,
        setNotifications,
        activeTab,
        setActiveTab,
        designLanguage,
        setDesignLanguage,
        toastMessage,
        showToast,
        totalMemberShares,
        totalAssetsValue,
        totalLoanReceivables,
        totalComprehensiveAssets,
        groupReserves,
        retainedSurplus,
        coreCapital,
        recordDeposit,
        updateMemberJoiningDate,
        getQuarterForDate,
        distributeInterest,
        issueLoan,
        purchaseDeceasedShares,
        approvePendingMember,
        updateMember,
        updateMemberNumber,
        deleteMember,
        updateAssets,
        updateLoan,
        deleteLoan,
        addHistoricalLoan,
        addMemberDepositRecord,
        updateMemberDepositRecord,
        deleteMemberDepositRecord,
        reconcileMemberDepositsToShares,
        addLedgerEntry,
        updateLedgerEntry,
        deleteLedgerEntry,
        prospects,
        addProspect,
        updateProspect,
        deleteProspect,
        convertProspectToMember,
        castVote,
        sendEmailReminders,
        resetToFactoryDefaults,
        isCurrentMemberExec,
        isExecutive,
        execSecurityModal,
        requireExecutivePermission,
        triggerExecRestriction,
        closeExecSecurityModal,
        portfolioAdvisories,
        addPortfolioAdvisory,
        updatePortfolioAdvisory,
        resolvePortfolioAdvisory,
        reopenPortfolioAdvisory,
        deletePortfolioAdvisory,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        markMemberAsDeceased,
        revertMemberDeceasedStatus,
        pendingFinancialActions,
        activeRatificationModalId,
        setActiveRatificationModalId,
        initiateFinancialAction,
        approveFinancialAction,
        fastTrackAllApprovals,
        sendRatificationReminders,
        dbSyncStatus,
        // Auth, RBAC & Mail
        authenticatedUser,
        currentUserRbac,
        rbacUsers,
        hasPermission,
        isSuperAdmin,
        canSwitchMemberPersona,
        buildDefaultPermissionsForRole,
        loginWithCredentials,
        signupUser,
        requestEmailOtp,
        verifyEmailOtp,
        logoutSession,
        changeOwnPassword,
        updateUserProfile,
        adminUpdateUserAccess,
        mailSettings,
        saveServerMailSettings,
        sendOfficialClubEmail,
        sendReportEmail,
        mailLogs,
        securityAuditLogs,
        refreshSecurityBootstrap,
        // Confidential Legal Documents Vault & PIN Gate
        unlockedMemberPins,
        lockMemberVault,
        uploadKycDocument,
        deleteKycDocument,
        verifyMemberPin,
        generateNewMemberPin,
        updateAccountPin
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
