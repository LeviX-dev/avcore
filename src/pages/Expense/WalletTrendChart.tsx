import React from 'react';
import { Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Wallet } from 'lucide-react';

const formatINR = (value: number) => {
  const absoluteValue = Math.abs(value);
  const prefix = value < 0 ? '-₹' : '₹';

  if (absoluteValue >= 1_00_000) return `${prefix}${(absoluteValue / 1_00_000).toFixed(1)}L`;
  if (absoluteValue >= 1_000) return `${prefix}${(absoluteValue / 1_000).toFixed(1)}K`;
  return `${prefix}${absoluteValue}`;
};

const formatTooltipValue = (value: unknown) => formatINR(Number(value || 0));

export const WalletTrendChart = ({ data, loading }: { data: any[]; loading: boolean }) => {
  if (loading) return <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;
  if (!data.length) return <div className="py-12 text-center text-gray-400">No wallet transactions</div>;

  const chartData = data.map((item) => {
    const totalCredit = Number(item.total_credit || 0);
    const totalDebit = Number(item.total_debit || 0);

    return {
      ...item,
      total_credit: totalCredit,
      total_debit: totalDebit,
      net_change: totalCredit - totalDebit,
    };
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-boxdark">
      <div className="mb-3 flex items-center gap-2">
        <Wallet className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-semibold">Wallet Usage with Net Change</h3>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={formatINR} width={60} />
          <Tooltip
            formatter={(value: unknown, name: string) => {
              if (name === 'Net Change') return [formatTooltipValue(value), name];
              if (name === 'Credits (Top‑up)') return [formatTooltipValue(value), name];
              if (name === 'Debits (Expenses)') return [formatTooltipValue(value), name];
              return [formatTooltipValue(value), name];
            }}
          />
          <Legend />
          <Bar dataKey="total_credit" name="Credits (Top‑up)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="total_debit" name="Debits (Expenses)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="net_change" name="Net Change" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};