
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { accounts, transactions } from '@/lib/data';
import type { Category } from '@/lib/definitions';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type CategoryTransactionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  accountId: string;
};

export function CategoryTransactionsDialog({
  open,
  onOpenChange,
  category,
  accountId,
}: CategoryTransactionsDialogProps) {
  const { currency, dateFormat } = useSettings();

  const filteredTransactions = React.useMemo(() => {
    if (!category) return [];

    const accountFiltered =
      accountId === 'all'
        ? transactions
        : transactions.filter((t) => t.accountId === accountId);

    return accountFiltered
      .filter((t) => t.category === category.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [category, accountId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);

  const accountName =
    accountId === 'all'
      ? 'All Accounts'
      : accounts.find((a) => a.id === accountId)?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transactions for {category?.name}</DialogTitle>
          <DialogDescription>
            Showing transactions from the "{accountName}" account.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
          <div className="pr-4">
            {filteredTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => {
                    const account = accounts.find(
                      (acc) => acc.id === transaction.accountId
                    );
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="font-medium">
                            {transaction.description}
                          </div>
                          {accountId === 'all' && (
                             <div className="text-sm text-muted-foreground">
                                {account?.name}
                             </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.date), dateFormat)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            transaction.type === 'income'
                              ? 'text-green-500'
                              : 'text-destructive'
                          )}
                        >
                          {transaction.type === 'income' ? '+' : ''}{' '}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
                No transactions found for this category.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
