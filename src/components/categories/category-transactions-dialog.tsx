
'use client';

import React from 'react';
import useSWR from 'swr';
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
import type { Category, Account, Transaction } from '@/lib/definitions';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { fetcher } from '@/lib/api';
import { Skeleton } from '../ui/skeleton';

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
  const { data: transactions, error: tError } = useSWR<Transaction[]>('/transactions', fetcher);
  const { data: accounts, error: aError } = useSWR<Account[]>('/accounts', fetcher);

  const filteredTransactions = React.useMemo(() => {
    if (!category || !transactions) return [];

    const accountFiltered =
      accountId === 'all'
        ? transactions
        : transactions.filter((t) => t.accountId === Number(accountId));

    return accountFiltered
      .filter((t) => t.categoryId === category.categoryId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [category, accountId, transactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);

  const accountName =
    accountId === 'all'
      ? 'All Accounts'
      : accounts?.find((a) => a.accountId === Number(accountId))?.accountName;
      

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transactions for {category?.categoryName}</DialogTitle>
              <DialogDescription>
                Showing transactions from the "{accountName}" account.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-96">
              <div className="pr-4">
                {(() => {
                  // Loading state
                  if (!transactions || !accounts) {
                    return (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                      </div>
                    );
                  }
      
                  // No transactions found
                  if (filteredTransactions.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-full py-10 text-muted-foreground">
                        No transactions found for this category.
                      </div>
                    );
                  }
      
                  // Transactions table
                  return (
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
                            (acc) => acc.accountId === transaction.accountId
                          );
                          return (
                            <TableRow key={transaction.transactionId}>
                              <TableCell>
                                <div className="font-medium">
                                  {transaction.description}
                                </div>
                                {accountId === 'all' && (
                                  <div className="text-sm text-muted-foreground">
                                    {account?.accountName}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {format(new Date(transaction.transactionDate), dateFormat)}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  'text-right font-medium',
                                  transaction.transactionType === 'income'
                                    ? 'text-green-500'
                                    : 'text-destructive'
                                )}
                              >
                                {transaction.transactionType === 'income' ? '+' : '-'}{' '}
                                {formatCurrency(transaction.amount)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  );
                })()}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      );
}
