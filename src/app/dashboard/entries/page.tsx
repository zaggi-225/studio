'use client';
import { useMemo } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { AddEntrySheet } from '@/components/entries/add-entry-sheet';
import { CollapsibleDataTable } from '@/components/entries/collapsible-data-table';

export default function EntriesPage() {
  const { firestore } = useFirebase();
  const transactionsRef = useMemoFirebase(
    () => (firestore ? collection(firestore, 'transactions') : null),
    [firestore]
  );
  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsRef);

  const tableData = useMemo(() => {
    if (!transactions) return [];
    return transactions.map(t => ({
      ...t,
      date: (t.date as any)?.toDate ? (t.date as any).toDate().toISOString() : t.date,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);


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
      <CollapsibleDataTable data={isLoading ? [] : tableData} />
    </div>
  );
}

    