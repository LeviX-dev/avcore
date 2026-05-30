import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../../public/config.js';
import SummaryCards from '../../components/dashboard/SummaryCards';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSession {
  role: string;
  userId: number;
  name?: string;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_ROLES = ['admin', 'sub_admin'] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

const isAdminRole = (role: string): role is AdminRole =>
  ADMIN_ROLES.includes(role as AdminRole);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.log('[ExpenseDashboard]', ...args);
};

const warn = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.warn('[ExpenseDashboard]', ...args);
};

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatLastRefreshed = (date: Date): string =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ───────────────────────────────────────────────────────────

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const isAdmin = isAdminRole(role);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
        isAdmin
          ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-violet-500' : 'bg-blue-500'}`}
      />
      {role.replace('_', ' ')}
    </span>
  );
};

const QuickActions: React.FC<{ role: string }> = ({ role }) => {
  const navigate = useNavigate();
  const isAdmin = isAdminRole(role);

  const actions = [
    {
      label: 'New Expense',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      onClick: () => navigate('/expense/prototype'),
      variant: 'primary',
    },
   
    ...(isAdmin
      ? [
          {
            label: 'Pending Approvals',
            icon: (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            ),
            onClick: () => navigate('/expense/prototype'),
            variant: 'warning',
          },
        ]
      : []),
  ];

  const variantClass: Record<string, string> = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700',
    warning:
      'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/40',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${variantClass[action.variant]}`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header skeleton */}
    <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-72 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-96 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
    {/* Cards skeleton */}
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-white shadow-sm dark:bg-gray-800"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/signin')}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ExpenseDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [session, setSession] = useState<UserSession | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchUserSession = useCallback(async () => {
    setLoadingState('loading');
    setError(null);

    try {
      log('Checking session…');
      const { data: sessionData } = await axios.get(`${BASE_URL}auth/check-session`, {
        withCredentials: true,
      });

      if (!sessionData?.isAuthenticated) {
        warn('Session not authenticated — redirecting');
        navigate('/signin');
        return;
      }

      log('Fetching expense options…');
      const { data: optionsData } = await axios.get(`${BASE_URL}api/v1/expense/options`, {
        withCredentials: true,
      });

      const currentUser = optionsData?.data?.currentUser;
      if (!currentUser?.id) {
        throw new Error('Unable to retrieve current user details.');
      }

      setSession({
        role: currentUser.role || sessionData.role || '',
        userId: currentUser.id,
        name: currentUser.name,
      });

      setLastRefreshed(new Date());
      setLoadingState('success');
      log('Session loaded', { userId: currentUser.id, role: currentUser.role });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Session expired. Please log in again.';
      setError(msg);
      setLoadingState('error');
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserSession();
  }, [fetchUserSession]);

  // ── Render states ──────────────────────────────────────────────────────────

  if (loadingState === 'loading') return <DashboardSkeleton />;

  if (loadingState === 'error' && error) {
    return <ErrorState message={error} onRetry={fetchUserSession} />;
  }

  if (!session) return null;

  const { role, userId, name } = session;
  const isAdmin = isAdminRole(role);

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb pageName="Expense Dashboard" />

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left — Greeting + description */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  {getGreeting()}
                  {name ? `, ${name.split(' ')[0]}` : ''}
                </h1>
                <RoleBadge role={role} />
              </div>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                {isAdmin
                  ? ''
                  : 'Track your expense submissions, approvals, and reimbursements.'}
              </p>
            </div>

            {/* Right — Last refreshed + refresh button */}
            <div className="flex shrink-0 flex-col items-end gap-1">
              <button
                onClick={fetchUserSession}
                disabled={loadingState === 'loading'}
                title="Refresh dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <svg
                  className={`h-3.5 w-3.5 ${loadingState === 'loading' ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-600">
                Updated {formatLastRefreshed(lastRefreshed)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700/50">
            <QuickActions role={role} />
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
       

        {/* Summary Cards */}
        <SummaryCards userRole={role} userId={userId} />
      </div>
    </div>
  );
};

export default ExpenseDashboard;