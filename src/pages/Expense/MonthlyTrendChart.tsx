import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const formatINR = (value: number) => {
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-white p-3 shadow-lg dark:bg-boxdark">
      <p className="text-xs font-semibold">{payload[0].payload.month}</p>
      <p className="text-sm text-blue-600">Amount: {formatINR(payload[0].value)}</p>
    </div>
  );
};

export const MonthlyTrendChart = ({ data, loading }: { data: any[]; loading: boolean }) => {
  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
  if (!data.length) return <div className="py-12 text-center text-gray-400">No monthly data</div>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-boxdark">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold">Monthly Expense Trend</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={formatINR} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="total_amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};