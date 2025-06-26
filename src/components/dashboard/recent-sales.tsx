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
    console.log(transactions);
    const filtered: Transaction[] = Array.isArray(transactions)
      ? (accountId === 'all'
        ? transactions
        : transactions.filter((t: Transaction) => t.accountId === Number(accountId)))
      : [];
    return filtered
      .slice() // copy to avoid mutating original
      .sort((a: Transaction, b: Transaction) => {
        const dateA = new Date( a.transactionDate || 0);
        const dateB = new Date( b.transactionDate ||  0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [accountId, transactions]);

  if (!user) return null; // or a skeleton

  return (
    <div className="space-y-8">
      {recentTransactions.filter(Boolean).map((transaction: Transaction) => {
        // const account = accounts.find((acc: Account) => acc.accountId === transaction.accountId );
        return (
          <div className="flex items-center" key={transaction.transactionId ?? transaction.transactionId}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.profilePictureUrl} alt="Avatar" data-ai-hint="person avatar" />
              <AvatarFallback>{(user.firstName || 'A').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {transaction.description}
              </p>
              <p className="text-sm text-muted-foreground">
                {transaction.categoryName ?? ''} &bull; {transaction?.accountName}
              </p>
            </div>
            <div
              className={cn(
                'ml-auto font-medium',
                transaction.transactionType === 'income'  ? 'text-green-500' : 'text-foreground'
              )}
            >
              {(transaction.transactionType === 'income') ? '+' : '-'}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
              }).format(Number(transaction.amount))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

    
