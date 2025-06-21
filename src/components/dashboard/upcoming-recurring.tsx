
import { recurring, accounts } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';

export function UpcomingRecurring({ accountId }: { accountId: string }) {
  const { currency, dateFormat } = useSettings();

  const upcoming = React.useMemo(() => {
    const filtered = accountId === 'all'
      ? recurring
      : recurring.filter((r) => r.accountId === accountId);

    return filtered
      .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
      .slice(0, 5);
  }, [accountId]);


  return (
    <div className="space-y-4">
      {upcoming.map((item) => {
        const account = accounts.find(acc => acc.id === item.accountId);
        return (
          <div className="flex items-center" key={item.id}>
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
                Next: {format(new Date(item.nextDate), dateFormat)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
