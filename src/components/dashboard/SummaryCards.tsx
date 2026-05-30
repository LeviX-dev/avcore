import React, { useState, useEffect, FC, ComponentType } from 'react';
import axios from 'axios';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  RefreshCw,
  Wallet,
  CalendarCheck,
} from 'lucide-react';
import { BASE_URL } from '../../../public/config.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type CardColor = 'blue' | 'amber' | 'green' | 'red' | 'violet' | 'teal';

interface StatCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subText?: string;
  color?: CardColor;
  isLoading?: boolean;
}

interface Expense {
  expense_id: number;
  employee_id: number;
  created_by: number;
  status: string;
  amount: string | number;
  created_at: string;
}

interface PersonalStats {
  totalExpenses: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalAmountClaimed: number;
  totalAmountReimbursed: number;
}

interface AdminStats {
  totalExpenses: number;
  pendingApproval: number;
  rejected: number;
  totalAmountClaimed: number;
  totalAmountReimbursed: number;
  submittedToday: number;
  activeEmployees: number;
}

interface SummaryCardsProps {
  userRole: string;
  userId: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_ROLES = ['admin', 'sub_admin'];
const isAdmin = (role: string) => ADMIN_ROLES.includes(role);

const COLOR_MAP: Record<CardColor, { bg: string; border: string; icon: string; iconBg: string; accent: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/60',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    accent: 'bg-blue-600',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    accent: 'bg-amber-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800/60',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    accent: 'bg-green-600',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/60',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    accent: 'bg-red-500',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800/60',
    icon: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    accent: 'bg-violet-600',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-200 dark:border-teal-800/60',
    icon: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    accent: 'bg-teal-600',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log('[SummaryCards]', ...args);
};

const warn = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.warn('[SummaryCards]', ...args);
};

/** Format number as Indian Rupee with compact notation for large values */
const formatCurrency = (amount: number): string => {
  if (amount >= 100_000)
    return `₹${(amount / 100_000).toFixed(2)}L`;
  if (amount >= 1_000)
    return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount.toFixed(2)}`;
};

const safeParseFloat = (val: string | number): number =>
  parseFloat(String(val)) || 0;

const isToday = (dateStr: string): boolean => {
  const d = new Date(dateStr);
  const t = new Date();
  return (
    d.getDate() === t.getDate() &&
    d.getMonth() === t.getMonth() &&
    d.getFullYear() === t.getFullYear()
  );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCardSkeleton: FC<{ color: CardColor }> = ({ color }) => {
  const c = COLOR_MAP[color];
  return (
    <div className={`relative overflow-hidden rounded-xl border ${c.border} ${c.bg} p-5 shadow-sm`}>
      <div className={`absolute left-0 top-0 h-1 w-full ${c.accent} opacity-50`} />
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-3.5 w-28 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-7 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className={`h-10 w-10 animate-pulse rounded-lg ${c.iconBg}`} />
      </div>
    </div>
  );
};

const StatCard: FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  subText,
  color = 'blue',
  isLoading = false,
}) => {
  if (isLoading) return <StatCardSkeleton color={color} />;

  const c = COLOR_MAP[color];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border ${c.border} ${c.bg} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-boxdark`}
    >
      {/* Top color accent bar */}
      <div className={`absolute left-0 top-0 h-1 w-full ${c.accent}`} />

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </h3>
          {subText && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subText}</p>
          )}
        </div>
        <div className={`shrink-0 rounded-lg ${c.iconBg} p-2.5 transition-transform duration-200 group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: FC<{ title: string; badge?: string; badgeColor?: string }> = ({
  title,
  badge,
  badgeColor = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}) => (
  <div className="mb-4 flex items-center gap-3">
    <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
    {badge && (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
        {badge}
      </span>
    )}
    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: FC = () => (
  <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center dark:border-gray-700 dark:bg-gray-900/20">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
      <FileText className="h-7 w-7 text-gray-400 dark:text-gray-500" />
    </div>
    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
      No expenses submitted yet
    </p>
    <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
      Create your first expense to see stats here
    </p>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorBanner: FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-900/20">
    <div className="flex items-center gap-2.5">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-900/30"
    >
      <RefreshCw className="h-3 w-3" />
      Retry
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PERSONAL_DEFAULTS: PersonalStats = {
  totalExpenses: 0,
  pendingApproval: 0,
  approved: 0,
  rejected: 0,
  totalAmountClaimed: 0,
  totalAmountReimbursed: 0,
};

const ADMIN_DEFAULTS: AdminStats = {
  totalExpenses: 0,
  pendingApproval: 0,
  rejected: 0,
  totalAmountClaimed: 0,
  totalAmountReimbursed: 0,
  submittedToday: 0,
  activeEmployees: 0,
};

const SummaryCards: FC<SummaryCardsProps> = ({ userRole, userId }) => {
  const [personalStats, setPersonalStats] = useState<PersonalStats>(PERSONAL_DEFAULTS);
  const [adminStats, setAdminStats] = useState<AdminStats>(ADMIN_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adminView = isAdmin(userRole);

  const fetchAllStats = async () => {
    setLoading(true);
    setError(null);

    try {
      log('Fetching expenses…');
      const { data } = await axios.get(`${BASE_URL}api/v1/expense`, {
        withCredentials: true,
      });

      const expenses: Expense[] = data?.data ?? [];
      log(`Received ${expenses.length} expense records`);

      // ── Personal stats ──────────────────────────────────────────────────
      const personal = expenses.filter(
        (e) => e.employee_id === userId || e.created_by === userId
      );

      const personalClaimed = personal.reduce((sum, e) => sum + safeParseFloat(e.amount), 0);
      const personalReimbursed = personal
        .filter((e) => e.status === 'approved')
        .reduce((sum, e) => sum + safeParseFloat(e.amount), 0);

      setPersonalStats({
        totalExpenses: personal.length,
        pendingApproval: personal.filter((e) => e.status === 'pending').length,
        approved: personal.filter((e) => e.status === 'approved').length,
        rejected: personal.filter((e) => e.status === 'rejected').length,
        totalAmountClaimed: personalClaimed,
        totalAmountReimbursed: personalReimbursed,
      });

      // ── Admin stats ─────────────────────────────────────────────────────
      if (adminView) {
        let activeEmployeeCount = 0;

        try {
          log('Fetching employee count via expense/options…');
          const { data: optData } = await axios.get(`${BASE_URL}api/v1/expense/options`, {
            withCredentials: true,
          });
          activeEmployeeCount = optData?.data?.employees?.length ?? 0;
          log(`Active employees: ${activeEmployeeCount}`);
        } catch (optErr) {
          warn('Could not fetch employee count', optErr);
        }

        const adminClaimed = expenses.reduce((sum, e) => sum + safeParseFloat(e.amount), 0);
        const adminReimbursed = expenses
          .filter((e) => e.status === 'approved')
          .reduce((sum, e) => sum + safeParseFloat(e.amount), 0);

        setAdminStats({
          totalExpenses: expenses.length,
          pendingApproval: expenses.filter((e) => e.status === 'pending').length,
          rejected: expenses.filter((e) => e.status === 'rejected').length,
          totalAmountClaimed: adminClaimed,
          totalAmountReimbursed: adminReimbursed,
          submittedToday: expenses.filter((e) => isToday(e.created_at)).length,
          activeEmployees: activeEmployeeCount,
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Failed to load statistics. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userRole]);

  // ── Derived sub-texts ────────────────────────────────────────────────────

  const approvalRate =
    personalStats.totalExpenses > 0
      ? Math.round((personalStats.approved / personalStats.totalExpenses) * 100)
      : null;

  const pendingPct =
    adminStats.totalExpenses > 0
      ? Math.round((adminStats.pendingApproval / adminStats.totalExpenses) * 100)
      : null;

  // ── Render ───────────────────────────────────────────────────────────────

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchAllStats} />;
  }

  return (
    <div className="space-y-10">
      {/* ── Personal Stats ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Your Expenses" badge="Personal" badgeColor="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" />

        {!loading && personalStats.totalExpenses === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={FileText}
              label="Total Submitted"
              value={personalStats.totalExpenses}
              subText={approvalRate !== null ? `${approvalRate}% approval rate` : undefined}
              color="blue"
              isLoading={loading}
            />
            <StatCard
              icon={Clock}
              label="Pending Approval"
              value={personalStats.pendingApproval}
              subText={personalStats.pendingApproval > 0 ? 'Awaiting review' : 'All caught up'}
              color="amber"
              isLoading={loading}
            />
            <StatCard
              icon={CheckCircle}
              label="Approved"
              value={personalStats.approved}
              color="green"
              isLoading={loading}
            />
            <StatCard
              icon={XCircle}
              label="Rejected"
              value={personalStats.rejected}
              subText={personalStats.rejected > 0 ? 'Review rejection notes' : undefined}
              color="red"
              isLoading={loading}
            />
            <StatCard
              icon={DollarSign}
              label="Total Amount Claimed"
              value={formatCurrency(personalStats.totalAmountClaimed)}
              subText="Across all submissions"
              color="blue"
              isLoading={loading}
            />
            <StatCard
              icon={Wallet}
              label="Total Reimbursed"
              value={formatCurrency(personalStats.totalAmountReimbursed)}
              subText={
                personalStats.totalAmountClaimed > 0
                  ? `${Math.round((personalStats.totalAmountReimbursed / personalStats.totalAmountClaimed) * 100)}% of claimed`
                  : undefined
              }
              color="green"
              isLoading={loading}
            />
          </div>
        )}
      </section>

      {/* ── Admin Stats ────────────────────────────────────────────────────── */}
      {adminView && (
        <section>
          <SectionHeader
            title="Company-Wide Overview"
            badge="Admin"
            badgeColor="bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={Users}
              label="Active Employees"
              value={adminStats.activeEmployees}
              subText="Currently enrolled"
              color="violet"
              isLoading={loading}
            />
            <StatCard
              icon={Clock}
              label="Pending Approvals"
              value={adminStats.pendingApproval}
              subText={pendingPct !== null ? `${pendingPct}% of all expenses` : undefined}
              color="amber"
              isLoading={loading}
            />
            <StatCard
              icon={XCircle}
              label="Rejected Expenses"
              value={adminStats.rejected}
              color="red"
              isLoading={loading}
            />
            <StatCard
              icon={DollarSign}
              label="Total Claimed"
              value={formatCurrency(adminStats.totalAmountClaimed)}
              subText="Company-wide"
              color="blue"
              isLoading={loading}
            />
            <StatCard
              icon={TrendingUp}
              label="Total Reimbursed"
              value={formatCurrency(adminStats.totalAmountReimbursed)}
              subText="Company-wide"
              color="teal"
              isLoading={loading}
            />
            <StatCard
              icon={CalendarCheck}
              label="Submitted Today"
              value={adminStats.submittedToday}
              subText={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              color="green"
              isLoading={loading}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default SummaryCards;