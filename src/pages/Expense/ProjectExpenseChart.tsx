// @ts-nocheck

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectExpenseData {
  project?: string;
  project_name?: string;
  amount?: number | string;
  total_amount?: number | string;
  count: number;
  approved?: number | string;
  pending?: number | string;
  rejected?: number | string;
}

interface ChartItem extends ProjectExpenseData {
  amount: number;
  approved: number;
  pending: number;
  rejected: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (value: number): string => {
  if (value >= 10_00_000) return `₹${(value / 10_00_000).toFixed(1)}L`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
};

const fullINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const BAR_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#0ea5e9', '#f97316', '#14b8a6', '#a855f7',
];

const getBarColor = (index: number): string => BAR_COLORS[index % BAR_COLORS.length];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: { active: boolean; payload: { payload: ChartItem }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-boxdark">
      <p className="mb-2 truncate text-sm font-semibold text-gray-900 dark:text-white">{d.project}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-6">
          <span className="text-gray-500 dark:text-gray-400">Total Amount</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{fullINR(d.amount)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-500 dark:text-gray-400">Entries</span>
          <span className="font-medium text-gray-800 dark:text-gray-200">{d.count} expense{d.count !== 1 ? 's' : ''}</span>
        </div>
        {d.approved > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-green-600 dark:text-green-400">Approved</span>
            <span className="font-medium text-green-700 dark:text-green-300">{fullINR(d.approved)}</span>
          </div>
        )}
        {d.pending > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-amber-600 dark:text-amber-400">Pending</span>
            <span className="font-medium text-amber-700 dark:text-amber-300">{fullINR(d.pending)}</span>
          </div>
        )}
        {d.rejected > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-red-500 dark:text-red-400">Rejected</span>
            <span className="font-medium text-red-600 dark:text-red-300">{fullINR(d.rejected)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Custom X-Axis Tick ───────────────────────────────────────────────────────

const CustomXAxisTick = ({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
  const label = payload.value;
  const maxChars = 12;
  const display = label.length > maxChars ? `${label.slice(0, maxChars)}…` : label;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="end" fill="currentColor" fontSize={11} transform="rotate(-35)" className="fill-gray-500 dark:fill-gray-400">
        {display}
      </text>
    </g>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ message = 'No expense data for selected filters.' }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
      <BarChart2 className="h-8 w-8 text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{message}</p>
    <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">Try adjusting the date range or status filter.</p>
  </div>
);

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex h-[340px] items-end gap-3 px-6 pt-6">
      {[70, 90, 55, 100, 65, 80, 45, 75].map((h, i) => (
        <div key={i} className="flex-1 rounded-t-md bg-gray-200 dark:bg-gray-700" style={{ height: `${h}%` }} />
      ))}
    </div>
    <div className="mt-3 flex gap-3 px-6 pb-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-2.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
      ))}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProjectExpenseChartProps {
  data?: ProjectExpenseData[];
  loading?: boolean;
  yAxisLabel?: string;
  title?: string;
}

const ProjectExpenseChart: React.FC<ProjectExpenseChartProps> = ({
  data = [],
  loading = false,
  yAxisLabel = 'Expense Amount (₹)',
  title = 'Expenses by Project',
}) => {
  const chartData: ChartItem[] = data.map((d) => ({
    ...d,
    project: String(d.project ?? d.project_name ?? 'No Project'),
    amount:   Number(d.amount ?? d.total_amount ?? 0),
    approved: Number(d.approved ?? 0),
    pending:  Number(d.pending ?? 0),
    rejected: Number(d.rejected ?? 0),
  }));

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-boxdark">
        <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <div className="h-5 w-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-boxdark">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        {chartData.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{chartData.length} project{chartData.length !== 1 ? 's' : ''}</span>
            <span>
              Total:{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {fullINR(chartData.reduce((s, d) => s + d.amount, 0))}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Chart Body */}
      {chartData.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-2 pb-4 pt-6">
          {/* @ts-ignore — recharts bundles its own @types/react; add skipLibCheck:true to tsconfig to remove this */}
          <ResponsiveContainer width="100%" height={360}>
            {/* @ts-ignore */}
            <BarChart data={chartData} margin={{ top: 20, right: 24, left: 20, bottom: 70 }} barSize={chartData.length > 10 ? 20 : chartData.length > 6 ? 28 : 40}>
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.6} vertical={false} />
              {/* @ts-ignore */}
              <XAxis dataKey="project" tick={<CustomXAxisTick x={0} y={0} payload={{ value: '' }} />} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} interval={0} />
              {/* @ts-ignore */}
              <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -8, style: { fontSize: 11, fill: '#9ca3af', textAnchor: 'middle' } }} width={70} />
              {/* @ts-ignore */}
              <Tooltip content={(props: any) => <CustomTooltip {...props} />} cursor={{ fill: 'rgba(59,130,246,0.06)' }} />
              {/* @ts-ignore */}
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  // @ts-ignore
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} fillOpacity={0.88} />
                ))}
                {chartData.length <= 8 && (
                  // @ts-ignore
                  <LabelList dataKey="amount" position="top" formatter={formatINR} style={{ fontSize: 10, fill: '#6b7280', fontWeight: 500 }} />
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend strip */}
          <div className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-2 px-4">
            {chartData.slice(0, 8).map((d, i) => (
              <div key={d.project} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: getBarColor(i) }} />
                <span className="max-w-[100px] truncate text-xs text-gray-500 dark:text-gray-400">{d.project}</span>
              </div>
            ))}
            {chartData.length > 8 && (
              <span className="text-xs text-gray-400">+{chartData.length - 8} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectExpenseChart;
