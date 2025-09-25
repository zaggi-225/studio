
'use client';

import { SalesEntryForm } from '@/components/sales-entry/sales-entry-form';
import { SalesEntriesTable } from '@/components/sales-entry/sales-entries-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SalesEntryPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline flex items-center justify-center gap-2">
            <span>💰</span>
            <span>Daily Sales Entry</span>
          </CardTitle>
          <CardDescription>
            Enter the details for each tarpaulin sale below. Your saved entries will appear in the table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesEntryForm />
        </CardContent>
      </Card>

      <SalesEntriesTable />
      
    </div>
  );
}
