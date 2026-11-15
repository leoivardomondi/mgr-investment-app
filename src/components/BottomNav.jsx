import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  HandCoins, 
  TrendingUp, 
  Vote, 
  Scale,
  ShoppingBag,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function BottomNav() {
  const { activeTab, setActiveTab, pendingFinancialActions } = useApp();

  const pendingRatificationsCount = (pendingFinancialActions || []).filter(a => a.status === 'Pending Member Ratification').length;

  const navItems = [
    { id: 'dashboard', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Members', shortLabel: 'Members', icon: Users },
    { id: 'loans', label: 'Loans', shortLabel: 'Loans', icon: HandCoins, badge: '80%' },
    { id: 'mmf', label: 'MMF & Dividends', shortLabel: 'MMF', icon: TrendingUp },
    { id: 'marketplace', label: 'Estate Buyout', shortLabel: 'Estate', icon: ShoppingBag, badge: 'Deceased' },
    { 
      id: 'governance', 
      label: 'Voting & Policy', 
      shortLabel: 'Voting', 
      icon: Vote, 
      badge: pendingRatificationsCount > 0 ? `${pendingRatificationsCount}` : null,
      badgeType: 'alert'
    },
    { id: 'ledger', label: 'Ledger & P&L', shortLabel: 'Ledger', icon: Scale },
    { id: 'documents', label: 'Documents & Charters', shortLabel: 'Docs', icon: FileText, badge: 'PDF' },
    { id: 'admin', label: 'Admin, Access & Mail', shortLabel: 'Admin', icon: ShieldCheck, badge: 'RBAC' },
  ];

  return (
    <>
      {/* Desktop Sub-navigation Header (Hairline border & tactile pills) */}
      <nav className="hidden md:flex bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-hairline)] px-3 sm:px-6 lg:px-10 py-1.5 sticky top-[54px] z-30 w-full">
        <div className="w-full flex items-center justify-start lg:justify-between gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`mgr-nav-pill h-9 flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? 'bg-[var(--brand-primary)] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--accent-gold-light)]' : ''}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`font-mono-num text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : item.badgeType === 'alert'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-hairline)] px-1 py-1 z-50 shadow-lg">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-1 py-0.5 scroll-smooth">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center shrink-0 min-w-[62px] min-h-[44px] py-1 px-1.5 rounded-xl transition cursor-pointer ${
                  isActive
                    ? 'text-[var(--brand-primary)] font-bold bg-[var(--brand-tint)]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className={`p-1 rounded-md transition ${isActive ? 'bg-[var(--brand-primary)] text-white shadow-xs' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9.5px] font-semibold tracking-tight leading-tight mt-0.5 whitespace-nowrap text-center">
                  {item.shortLabel}
                </span>
                {item.badge && (
                  <span className={`absolute top-1 right-2 w-2 h-2 rounded-full ${
                    item.badgeType === 'alert' ? 'bg-amber-500 animate-ping' : 'bg-[var(--accent-gold)]'
                  }`}></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
