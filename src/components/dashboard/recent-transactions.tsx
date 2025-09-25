import { mockTransactions } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const typeToEmojiMap = {
  sale: '💰',
  purchase: '🛒',
  expense: '💸',
};

const typeToColorMap = {
    sale: 'bg-green-500/20 text-green-700 dark:text-green-400',
    purchase: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
    expense: 'bg-red-500/20 text-red-700 dark:text-red-400',
}

export function RecentTransactions() {
  const recentTransactions = mockTransactions.slice(0, 6);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>You have {mockTransactions.length} transactions this month.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-4">
            <Avatar className={`flex h-9 w-9 items-center justify-center space-y-0 border rounded-full ${typeToColorMap[transaction.type]}`}>
               <span className="text-lg" role="img" aria-label={transaction.type}>{typeToEmojiMap[transaction.type]}</span>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">{transaction.category}</p>
            </div>
            <div className={`text-sm font-medium text-right ${transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'sale' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
