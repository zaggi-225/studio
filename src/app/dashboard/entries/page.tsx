import { mockTransactions } from '@/lib/data';
import { columns } from '@/components/entries/columns';
import { DataTable } from '@/components/entries/data-table';
import { AddEntrySheet } from '@/components/entries/add-entry-sheet';

export default function EntriesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-headline">Transactions</h1>
          <p className="text-muted-foreground">
            View and manage all your business transactions.
          </p>
        </div>
        <AddEntrySheet />
      </div>
      <DataTable columns={columns} data={mockTransactions} />
    </div>
  );
}
