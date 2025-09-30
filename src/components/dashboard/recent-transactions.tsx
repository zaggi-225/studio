'use client';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const typeToEmojiMap: {[key: string]: string} = {
  sale: '💰',
  purchase: '🛒',
  expense: '💸',
};

const typeToColorMap: {[key: string]: string} = {
    sale: 'bg-green-500/20 text-green-700 dark:text-green-400',
    purchase: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    expense: 'bg-red-500/20 text-red-700 dark:text-red-400',
}

const syncStatusMap = {
    synced: { icon: CheckCircle2, color: 'text-green-500', tooltip: 'Synced' },
    pending: { icon: Clock, color: 'text-yellow-500', tooltip: 'Pending Sync' },
    failed: { icon: AlertCircle, color: 'text-red-500', tooltip: 'Sync Failed' },
}

export function RecentTransactions() {
  const { firestore } = useFirebase();
  
  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'transactions'), orderBy('date', 'desc'), limit(6));
  }, [firestore]);

  const { data: recentTransactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your last 6 transactions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          ))
        ) : recentTransactions && recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => {
            const status = transaction.syncStatus || 'synced'; // Default to synced
            const StatusIcon = syncStatusMap[status].icon;
            
            return (
                <div key={transaction.id} className="flex items-center gap-4">
                <Avatar className={`flex h-9 w-9 items-center justify-center space-y-0 border rounded-full ${typeToColorMap[transaction.type]}`}>
                    <span className="text-lg" role="img" aria-label={transaction.type}>{typeToEmojiMap[transaction.type]}</span>
                </Avatar>
                <div className="grid gap-1 flex-1">
                    <p className="text-sm font-medium leading-none">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium text-right ${transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'sale' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <StatusIcon className={`h-4 w-4 ${syncStatusMap[status].color}`} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{syncStatusMap[status].tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                </div>
            );
          })
        ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No transactions found.</p>
        )}
      </CardContent>
    </Card>
  );
}
