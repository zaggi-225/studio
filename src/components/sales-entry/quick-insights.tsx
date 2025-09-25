
'use client';
import { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { SalesEntry } from '@/lib/types';
import { isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

export function QuickInsights() {
  const { firestore } = useFirebase();
  const salesEntriesRef = useMemoFirebase(() => firestore ? collection(firestore, 'sales_entries') : null, [firestore]);
  const { data: salesEntries, isLoading } = useCollection<SalesEntry>(salesEntriesRef);

  const insights = useMemo(() => {
    if (!salesEntries) {
      return {
        thisMonthSales: 0,
        weeklyComparison: 'loading...',
      };
    }

    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);
    const startOfLastWeek = startOfWeek(subWeeks(now, 1));
    const endOfLastWeek = endOfWeek(subWeeks(now, 1));

    let thisMonthSales = 0;
    let thisWeekSales = 0;
    let lastWeekSales = 0;

    salesEntries.forEach(entry => {
      const entryDate = (entry.date as any)?.toDate ? (entry.date as any).toDate() : new Date(entry.date);
      
      if (isWithinInterval(entryDate, { start: startOfThisMonth, end: endOfThisMonth })) {
        thisMonthSales += entry.amount;
      }
      if (isWithinInterval(entryDate, { start: startOfThisWeek, end: endOfThisWeek })) {
        thisWeekSales += entry.amount;
      }
      if (isWithinInterval(entryDate, { start: startOfLastWeek, end: endOfLastWeek })) {
        lastWeekSales += entry.amount;
      }
    });
    
    let weeklyComparisonText = "No sales last week to compare.";
    if (lastWeekSales > 0) {
      const percentageChange = ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100;
      if (percentageChange > 0) {
        weeklyComparisonText = `Sales this week are ${percentageChange.toFixed(0)}% higher than last week.`;
      } else if (percentageChange < 0) {
        weeklyComparisonText = `Sales this week are ${Math.abs(percentageChange).toFixed(0)}% lower than last week.`;
      } else {
        weeklyComparisonText = "Sales this week are the same as last week.";
      }
    } else if (thisWeekSales > 0) {
        weeklyComparisonText = "Great start! No sales recorded last week.";
    }


    return {
      thisMonthSales,
      weeklyComparison: weeklyComparisonText,
    };
  }, [salesEntries]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">{formatCurrency(insights.thisMonthSales)}</div>
            <p className="text-xs text-muted-foreground">This Month's Sales</p>
            <p className="text-sm mt-2">{insights.weeklyComparison}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
