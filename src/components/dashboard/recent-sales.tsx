import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { transactions, users, accounts } from '@/lib/data';
import { cn } from '@/lib/utils';

const user = users[0];

export function RecentTransactions() {
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {recentTransactions.map((transaction) => {
        const account = accounts.find((acc) => acc.id === transaction.accountId);
        return (
          <div className="flex items-center" key={transaction.id}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt="Avatar" data-ai-hint="person avatar" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {transaction.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.category} &bull; {account?.name}
              </p>
            </div>
            <div
              className={cn(
                'ml-auto font-medium',
                transaction.type === 'income' ? 'text-green-500' : 'text-foreground'
              )}
            >
              {transaction.type === 'income' ? '+' : '-'}$
              {transaction.amount.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
