

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { RecurringTransaction, Account } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';

export function UpcomingRecurring({ accountId, accounts }: Readonly<{ accountId: string, accounts: Account[] }>) {
  const { currency, dateFormat } = useSettings();
  const { data: recurring, error } = useSWR<RecurringTransaction[]>('/recurring-transactions', fetcher);

  const upcoming = React.useMemo(() => {
    // console.log('🔍 Debug: recurring from SWR =', recurring);
    // console.log('📦 Type of recurring:', typeof recurring);
    // console.log('🧪 Is recurring an array?', Array.isArray(recurring));
  
    if (!Array.isArray(recurring)) return [];
    if (!recurring) return [];
    
    const filtered = accountId === 'all'
      ? recurring
      : recurring.filter((r) => r.accountId === Number(accountId));
    console.log(filtered);
    return filtered
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 5);
  }, [accountId, recurring]);

  if (error) return <div>Failed to load upcoming transactions.</div>
  if (!recurring) return (
     <div className="space-y-4">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {upcoming.filter(Boolean).map((item, index) => {
        const account = accounts.find(acc => acc.accountId === item.accountId);
        const nextDate = new Date(item.nextDueDate);
        const isNextDateValid = !isNaN(nextDate.getTime());
        
        return (
          <div className="flex items-center" key={item.recurringId ? `${item.recurringId}-${index}`: index}>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{item.description}</p>
              <p className="text-sm text-muted-foreground">{item?.accountName}</p>
            </div>
            <div className="ml-auto text-right">
              <div
                className={cn(
                  'font-medium',
                  item.transactionType === 'income' ? 'text-green-500' : ''
                )}
              >
                {item.transactionType === 'income' ? '+' : '-'}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(item.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Next: {isNextDateValid ? format(nextDate, dateFormat) : 'N/A'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
