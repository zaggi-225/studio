'use client';

import { useRole } from '@/hooks/use-role';
import { NotAuthorized } from '@/components/not-authorized';
import { Skeleton } from '@/components/ui/skeleton';
import { PurchaseEntryForm } from '@/components/purchase-entry/purchase-entry-form';

export default function PurchaseEntryPage() {
  const { isAdmin, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <NotAuthorized />;
  }

  return (
    <div className="container mx-auto py-6 md:py-10">
       <div className="flex-1 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">New Purchase Entry</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Log new tarpaulin stock purchases and costs.
          </p>
        </div>
      <PurchaseEntryForm />
    </div>
  );
}
