'use client';
import { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { AddEntrySheet } from '@/components/entries/add-entry-sheet';
import { CollapsibleDataTable } from '@/components/entries/collapsible-data-table';
import { useRole } from '@/hooks/use-role';
import { NotAuthorized } from '@/components/not-authorized';
import { Skeleton } from '@/components/ui/skeleton';

export default function EntriesPage() {
  const { firestore } = useFirebase();
  const { isAdmin, isLoading: isRoleLoading } = useRole();

  const transactionsRef = useMemoFirebase(
    () => (firestore && isAdmin ? collection(firestore, 'transactions') : null),
    [firestore, isAdmin]
  );
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsRef);

  const tableData = useMemo(() => {
    if (!transactions) return [];
    return transactions.map(t => ({
      ...t,
      date: (t.date as any)?.toDate ? (t.date as any).toDate().toISOString() : t.date,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);
  
  const isLoading = isRoleLoading || isTransactionsLoading;

  if (isLoading) {
    return (
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-80" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      );
  }

  if (!isAdmin) {
    return <NotAuthorized />;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">All Entries</h1>
          <p className="text-muted-foreground">
            View and manage all your business transactions.
          </p>
        </div>
        <AddEntrySheet />
      </div>
      <CollapsibleDataTable data={tableData} />
    </div>
  );
}
