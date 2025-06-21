

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import type { Transaction, Account, User } from '@/lib/definitions';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';

export function RecentTransactions({ transactions, accounts, accountId }: { transactions: Transaction[], accounts: Account[], accountId: string }) {
  const { currency } = useSettings();
  const { data: user, error } = useSWR<User>('/profile', fetcher);
  
  const recentTransactions = React.useMemo(() => {
     const filtered = accountId === 'all'
      ? transactions
      : transactions.filter((t) => t.accountId === accountId);
    
    return filtered
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [accountId, transactions]);

  if (!user) return null; // or a skeleton

  return (
    <div className="space-y-8">
      {recentTransactions.map((transaction, index) => {
        if (!transaction) return null;
        const account = accounts.find((acc) => acc.id === transaction.accountId);
        return (
          <div className="flex items-center" key={transaction.id ? `${transaction.id}-${index}`: index}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl} alt="Avatar" data-ai-hint="person avatar" />
              <AvatarFallback>{(user.name || 'A').charAt(0)}</AvatarFallback>
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
              {transaction.type === 'income' ? '+' : '-'}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(transaction.amount)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

    