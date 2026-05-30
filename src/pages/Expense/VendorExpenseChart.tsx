import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { ShoppingBag } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (value) => {
  if (value >= 10_00_000) return `₹${(value / 10_00_000).toFixed(1)}L`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${Number(value).toFixed(0)}`;
};

const fullINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

const STATUS_COLORS = {
  approved: '#10b981',
  pending: '#f59e0b',
  rejected: '#ef4444',
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="min-w-[220px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-boxdark">
      <p className="mb-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
        {d.vendor_name}
      </p>
      {d.unique_employees != null && (
        <p className="mb-2 text-xs text-gray-400 dark:text-gray-500">
          {d.unique_employees} employee{d.unique_employees !== 1 ? 's' : ''}
        </p>
      )}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{fullINR(d.total_amount)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-500">Entries</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">{d.count}</span>
        </div>
        {Number(d.approved_amount) > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-emerald-600">Approved</span>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">{fullINR(d.approved_amount)}</span>
          </div>
        )}
        {Number(d.pending_amount) > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-amber-600">Pending</span>
            <span className="font-medium text-amber-700 dark:text-amber-400">{fullINR(d.pending_amount)}</span>
          </div>
        )}
        {Number(d.rejected_amount) > 0 && (
          <div className="flex justify-between gap-6">
            <span className="text-red-500">Rejected</span>
            <span className="font-medium text-red-600 dark:text-red-400">{fullINR(d.rejected_amount)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const ChartSkeleton = ({ rows = 6 }) => (
  <div className="animate-pulse space-y-3 px-6 py-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="h-3 w-28 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div
          className="h-6 rounded-md bg-gray-200 dark:bg-gray-700"
          style={{ width: `${30 + Math.random() * 50}%`, animationDelay: `${i * 60}ms` }}
        />
      </div>
    ))}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
      <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
    </div>
    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No vendor expense data found.</p>
    <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">Try adjusting the date range or status filter.</p>
  </div>
);

// ─── Custom Y-Axis Tick ───────────────────────────────────────────────────────

const YAxisTick = ({ x, y, payload }) => {
  const label = payload.value;
  const maxChars = 18;
  const display = label.length > maxChars ? `${label.slice(0, maxChars)}…` : label;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-6}
        y={0}
        dy={4}
        textAnchor="end"
        fontSize={11}
        fill="currentColor"
        className="fill-gray-600 dark:fill-gray-400"
      >
        {display}
      </text>
    </g>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * VendorExpenseChart
 *
 * Horizontal stacked bar chart — one bar per vendor, stacked by
 * approved / pending / rejected amounts.
 *
 * @param {{ data: Array, loading: boolean, title?: string }} props
 */
const VendorExpenseChart = ({
  data = [],
  loading = false,
  title = 'Expense by Vendor',
}) => {
  const chartData = [...data]
    .sort((a, b) => Number(b.total_amount) - Number(a.total_amount))
    .map((d) => ({
      ...d,
      total_amount:    Number(d.total_amount),
      approved_amount: Number(d.approved_amount),
      pending_amount:  Number(d.pending_amount),
      rejected_amount: Number(d.rejected_amount),
    }));

  const totalGrand = chartData.reduce((s, d) => s + d.total_amount, 0);
  const chartHeight = Math.max(300, chartData.length * 44);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-boxdark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/40">
            <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
        {!loading && data.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{data.length} vendor{data.length !== 1 ? 's' : ''}</span>
            <span>
              Total:{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {fullINR(totalGrand)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <ChartSkeleton rows={6} />
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-2 pb-4 pt-4">
          {/* Legend */}
          <div className="mb-3 flex flex-wrap gap-4 px-4">
            {[
              { key: 'approved_amount', label: 'Approved', color: STATUS_COLORS.approved },
              { key: 'pending_amount',  label: 'Pending',  color: STATUS_COLORS.pending  },
              { key: 'rejected_amount', label: 'Rejected', color: STATUS_COLORS.rejected  },
            ].map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 80, left: 150, bottom: 4 }}
              barSize={22}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis
                type="number"
                tickFormatter={formatINR}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="vendor_name"
                tick={<YAxisTick />}
                axisLine={false}
                tickLine={false}
                width={146}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251,146,60,0.05)' }} />

              <Bar dataKey="approved_amount" name="Approved" stackId="a" fill={STATUS_COLORS.approved} radius={[0,0,0,0]} />
              <Bar dataKey="pending_amount"  name="Pending"  stackId="a" fill={STATUS_COLORS.pending}  radius={[0,0,0,0]} />
              <Bar dataKey="rejected_amount" name="Rejected" stackId="a" fill={STATUS_COLORS.rejected} radius={[4,4,4,4]}>
                <LabelList
                  dataKey="total_amount"
                  position="right"
                  formatter={formatINR}
                  style={{ fontSize: 10, fill: '#6b7280', fontWeight: 500 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Summary table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 pl-4 text-left font-medium text-gray-400">#</th>
                  <th className="pb-2 text-left font-medium text-gray-400">Vendor</th>
                  <th className="pb-2 text-right font-medium text-gray-400">Employees</th>
                  <th className="pb-2 text-right font-medium text-gray-400">Entries</th>
                  <th className="pb-2 text-right font-medium text-gray-400">Approved</th>
                  <th className="pb-2 text-right font-medium text-gray-400">Pending</th>
                  <th className="pb-2 pr-4 text-right font-medium text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((d, i) => (
                  <tr
                    key={d.vendor_id ?? i}
                    className="border-b border-gray-50 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="py-2 pl-4 text-gray-400">{i + 1}</td>
                    <td className="py-2 font-medium text-gray-700 dark:text-gray-300">{d.vendor_name}</td>
                    <td className="py-2 text-right text-gray-500">{d.unique_employees ?? '-'}</td>
                    <td className="py-2 text-right text-gray-500">{d.count}</td>
                    <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">{fullINR(d.approved_amount)}</td>
                    <td className="py-2 text-right text-amber-600 dark:text-amber-400">{fullINR(d.pending_amount)}</td>
                    <td className="py-2 pr-4 text-right font-semibold text-gray-800 dark:text-gray-200">
                      {fullINR(d.total_amount)}
                    </td>
                  </tr>
                ))}
                {/* Grand total row */}
                <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/40">
                  <td colSpan={3} className="py-2.5 pl-4 font-bold text-gray-700 dark:text-gray-300">Grand Total</td>
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
                    {fullINR(totalGrand)}
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

export default VendorExpenseChart;