'use client';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { isSameMonth, subMonths, isWithinInterval } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

export function StatsCards() {
  const { firestore } = useFirebase();
  
  // DEV-NOTE: This hook reads the entire 'transactions' collection for client-side aggregation.
  // For production, this should be replaced with a hook that reads a single 'aggregates/summary' document
  // and the last two 'aggregates/monthly/{YYYY-MM}' documents to calculate percentage changes.
  const transactionsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'transactions') : null),
    [firestore]
  );
  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsRef);

  const stats = useMemo(() => {
    if (!transactions) {
      return {
        totalSales: 0,
        totalExpenses: 0,
        grossProfit: 0,
        netProfit: 0,
        salesChange: 0,
        expensesChange: 0,
        profitChange: 0
      };
    }
    
    const now = new Date();
    const lastMonth = subMonths(now, 1);

    let totalSales = 0;
    let totalExpenses = 0;
    let grossProfit = 0;
    let netProfit = 0;
    
    let currentMonthSales = 0;
    let currentMonthExpenses = 0;
    let currentMonthGrossProfit = 0;
    
    let previousMonthSales = 0;
    let previousMonthExpenses = 0;
    let previousMonthGrossProfit = 0;


    transactions.forEach((t) => {
        const tDate = new Date(t.date);

        // Overall totals
        if (t.type === 'sale') {
            totalSales += t.amount;
            grossProfit += t.grossProfit || 0;
            netProfit += t.netProfit || 0;
        } else {
            totalExpenses += t.amount;
        }

        // Monthly comparison data
        if (isSameMonth(tDate, now)) {
            if (t.type === 'sale') {
                currentMonthSales += t.amount;
                currentMonthGrossProfit += t.grossProfit || 0;
            } else {
                currentMonthExpenses += t.amount;
            }
        } else if (isSameMonth(tDate, lastMonth)) {
             if (t.type === 'sale') {
                previousMonthSales += t.amount;
                previousMonthGrossProfit += t.grossProfit || 0;
            } else {
                previousMonthExpenses += t.amount;
            }
        }
    });

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    return { 
        totalSales, 
        totalExpenses, 
        grossProfit, 
        netProfit,
        salesChange: calculateChange(currentMonthSales, previousMonthSales),
        expensesChange: calculateChange(currentMonthExpenses, previousMonthExpenses),
        profitChange: calculateChange(currentMonthGrossProfit, previousMonthGrossProfit)
    };
  }, [transactions]);


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatPercentage = (value: number) => {
      if (value === 0) return "No change";
      const prefix = value > 0 ? '+' : '';
      return `${prefix}${value.toFixed(1)}% from last month`;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>}
          <p className="text-xs text-muted-foreground">{formatPercentage(stats.salesChange)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>}
          <p className="text-xs text-muted-foreground">{formatPercentage(stats.expensesChange)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.grossProfit)}</div>}
          <p className="text-xs text-muted-foreground">{formatPercentage(stats.profitChange)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
           {isLoading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{formatCurrency(stats.netProfit)}</div>}
          <p className="text-xs text-muted-foreground">Updated in real-time</p>
        </CardContent>
      </Card>
    </div>
  );
}
