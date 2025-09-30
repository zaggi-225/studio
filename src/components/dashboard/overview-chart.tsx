
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';

const processChartData = (transactions: Transaction[] | null) => {
  const data: { [key: string]: { sales: number; expenses: number } } = {};
  if (!transactions) return [];

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  transactions.forEach((t) => {
    const transactionDate = new Date(t.createdAt as Date);
    if (transactionDate >= sixMonthsAgo) {
      const month = transactionDate.toLocaleString('default', { month: 'short' });
      if (!data[month]) {
        data[month] = { sales: 0, expenses: 0 };
      }
      if (t.type === 'sale') {
        data[month].sales += t.amount;
      } else {
        data[month].expenses += t.amount;
      }
    }
  });

  const monthOrder = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();

  return monthOrder.map((month) => ({
    name: month,
    sales: data[month]?.sales || 0,
    expenses: data[month]?.expenses || 0,
  }));
};

export function OverviewChart() {
  const { firestore } = useFirebase();
  const transactionsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'transactions') : null),
    [firestore]
  );
  const { data: transactions } = useCollection<Transaction>(transactionsRef);

  const chartData = useMemo(() => processChartData(transactions), [transactions]);
  
  const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
    if (value > 1000) return `${formatter.format(value / 1000)}k`;
    return formatter.format(value);
  }

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Sales and expenses over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              stroke="hsl(var(--foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                }}
                 formatter={(value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)}
            />
            <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
            <Bar dataKey="sales" fill="hsl(var(--chart-1))" name="Sales" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
