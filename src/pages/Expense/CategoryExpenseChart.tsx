import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Tag } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryExpenseData {
  category_id?: number;
  category_name: string;
  count: number;
  total_amount: number | string;
  approved_amount: number | string;
  pending_amount: number | string;
  rejected_amount: number | string;
}

interface ChartItem extends CategoryExpenseData {
  total_amount: number;
  approved_amount: number;
  pending_amount: number;
  rejected_amount: number;
  percentage: number;
  color: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fullINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const formatINR = (value: number): string => {
  if (value >= 10_00_000) return `₹${(value / 10_00_000).toFixed(1)}L`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${Number(value).toFixed(0)}`;
};

const DONUT_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899',
  '#0ea5e9', '#f97316', '#6366f1', '#14b8a6', '#a855f7',
  '#ef4444', '#84cc16',
];

const getColor = (i: number): string => DONUT_COLORS[i % DONUT_COLORS.length];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: { active: boolean; payload: { payload: ChartItem }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = d.percentage?.toFixed(1) ?? '0.0';

  return (
    <div className="min-w-[210px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-boxdark">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{d.category_name}</p>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Amount</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{fullINR(d.total_amount)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Share</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{pct}%</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Entries</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{d.count}</span>
        </div>
        {d.approved_amount > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-emerald-600">Approved</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">{fullINR(d.approved_amount)}</span>
          </div>
        )}
        {d.pending_amount > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-amber-600">Pending</span>
            <span className="font-medium text-amber-700 dark:text-amber-400">{fullINR(d.pending_amount)}</span>
          </div>
        )}
        {d.rejected_amount > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-red-500">Rejected</span>
            <span className="font-medium text-red-600 dark:text-red-400">{fullINR(d.rejected_amount)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Center Label ─────────────────────────────────────────────────────────────

const CenterLabel = ({
  cx, cy, total, activeIndex, data,
}: {
  cx: number; cy: number; total: number; activeIndex: number | null; data: ChartItem[];
}) => {
  const active = activeIndex !== null ? data[activeIndex] : null;

  return (
    <g>
      {active ? (
        <>
          <text x={cx} y={cy - 12} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#9ca3af">
            {active.category_name.length > 14 ? `${active.category_name.slice(0, 14)}…` : active.category_name}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize={15} fontWeight={700} fill="#1f2937" className="dark:fill-white">
            {formatINR(active.total_amount)}
          </text>
          <text x={cx} y={cy + 28} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#6b7280">
            {active.percentage?.toFixed(1)}%
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#9ca3af">
            Total
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={700} fill="#1f2937" className="dark:fill-white">
            {formatINR(total)}
          </text>
        </>
      )}
    </g>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ChartSkeleton = () => (
  <div className="flex animate-pulse flex-col items-center gap-6 px-6 py-8 lg:flex-row">
    <div className="h-48 w-48 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="w-full space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 flex-1 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
      <Tag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No category expense data found.</p>
    <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">Try adjusting the date range or status filter.</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface CategoryExpenseChartProps {
  data?: CategoryExpenseData[];
  loading?: boolean;
  title?: string;
}

const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({
  data = [],
  loading = false,
  title = 'Expense by Category',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + Number(d.total_amount), 0);

  const chartData: ChartItem[] = data.map((d, i) => ({
    ...d,
    total_amount:    Number(d.total_amount),
    approved_amount: Number(d.approved_amount),
    pending_amount:  Number(d.pending_amount),
    rejected_amount: Number(d.rejected_amount),
    percentage:      total > 0 ? (Number(d.total_amount) / total) * 100 : 0,
    color:           getColor(i),
  }));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-boxdark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <Tag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{data.length} categor{data.length !== 1 ? 'ies' : 'y'}</span>
            <span>
              Total:{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">{fullINR(total)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-4 pb-6 pt-4">
          {/* Donut */}
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-start">
            <div className="w-full max-w-xs lg:max-w-[260px] flex-shrink-0">
              {/* @ts-ignore — recharts bundles its own @types/react; add skipLibCheck:true to tsconfig to remove this */}
              <ResponsiveContainer width="100%" height={240}>
                {/* @ts-ignore */}
                <PieChart>
                  {/* @ts-ignore */}
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={108}
                    dataKey="total_amount"
                    paddingAngle={2}
                    onMouseEnter={(_: unknown, index: number) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onClick={(_: unknown, index: number) =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {chartData.map((entry, index) => (
                      // @ts-ignore
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        fillOpacity={activeIndex === null || activeIndex === index ? 0.9 : 0.35}
                        stroke={activeIndex === index ? entry.color : 'transparent'}
                        strokeWidth={activeIndex === index ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  {/* @ts-ignore */}
                  <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    <CenterLabel
                      cx={0}
                      cy={0}
                      total={total}
                      activeIndex={activeIndex}
                      data={chartData}
                    />
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {chartData.slice(0, 10).map((d, i) => (
                  <button
                    key={d.category_id ?? i}
                    onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ${
                      activeIndex === i
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">
                      {d.category_name}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {d.percentage.toFixed(1)}%
                    </span>
                  </button>
                ))}
              </div>
              {chartData.length > 10 && (
                <p className="mt-2 pl-1 text-xs text-gray-400">
                  +{chartData.length - 10} more categories in table below
                </p>
              )}
            </div>
          </div>

          {/* Full detail table */}
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="py-2.5 pl-4 text-left font-medium text-gray-500">#</th>
                  <th className="py-2.5 text-left font-medium text-gray-500">Category</th>
                  <th className="py-2.5 text-right font-medium text-gray-500">Entries</th>
                  <th className="py-2.5 text-right font-medium text-gray-500">Approved</th>
                  <th className="py-2.5 text-right font-medium text-gray-500">Pending</th>
                  <th className="py-2.5 pr-4 text-right font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, i) => (
                  <tr
                    key={d.category_id ?? i}
                    className="border-t border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    onMouseEnter={() => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <td className="py-2.5 pl-4">
                      <span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: d.color }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-2.5 font-medium text-gray-700 dark:text-gray-300">{d.category_name}</td>
                    <td className="py-2.5 text-right text-gray-500">{d.count}</td>
                    <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400">{fullINR(d.approved_amount)}</td>
                    <td className="py-2.5 text-right text-amber-600 dark:text-amber-400">{fullINR(d.pending_amount)}</td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-gray-800 dark:text-gray-200">{fullINR(d.total_amount)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40">
                  <td colSpan={2} className="py-2.5 pl-4 font-bold text-gray-700 dark:text-gray-300">Grand Total</td>
                  <td className="py-2.5 text-right font-bold text-gray-700 dark:text-gray-300">
                    {chartData.reduce((s, d) => s + d.count, 0)}
                  </td>
                  <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {fullINR(chartData.reduce((s, d) => s + d.approved_amount, 0))}
                  </td>
                  <td className="py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">
                    {fullINR(chartData.reduce((s, d) => s + d.pending_amount, 0))}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-bold text-blue-600 dark:text-blue-400">
                    {fullINR(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryExpenseChart;
