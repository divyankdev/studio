

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { RecurringTransaction, Account } from '@/lib/definitions';
import { Skeleton } from '../ui/skeleton';

export function UpcomingRecurring({ accountId, accounts }: { accountId: string, accounts: Account[] }) {
  const { currency, dateFormat } = useSettings();
  const { data: recurring, error } = useSWR<RecurringTransaction[]>('/recurring-transactions', fetcher);

  const upcoming = React.useMemo(() => {
    if (!recurring) return [];
    
    const filtered = accountId === 'all'
      ? recurring
      : recurring.filter((r) => r.accountId === accountId);

    return filtered
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
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
      {upcoming.map((item, index) => {
        if (!item) return null;
        const account = accounts.find(acc => acc.id === item.accountId);
        const nextDate = new Date(item.nextDate);
        const isNextDateValid = !isNaN(nextDate.getTime());
        
        return (
          <div className="flex items-center" key={item.id ? `${item.id}-${index}`: index}>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{item.name}</p>
              <p className="text-sm text-muted-foreground">{account?.name}</p>
            </div>
            <div className="ml-auto text-right">
              <div
                className={cn(
                  'font-medium',
                  item.type === 'income' ? 'text-green-500' : ''
                )}
              >
                {item.type === 'income' ? '+' : '-'}
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
