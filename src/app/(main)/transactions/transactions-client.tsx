
'use client';

import { Button } from '@/components/ui/button';
import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { transactions, accounts, categories } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function TransactionsClientPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const accountFilter = searchParams.get('accountId');

  const initialFilters = React.useMemo(() => {
    const filters = [];
    if (categoryFilter) {
      filters.push({ id: 'category', value: categoryFilter });
    }
    if (accountFilter && accountFilter !== 'all') {
      const account = accounts.find(acc => acc.id === accountFilter);
      if (account) {
        filters.push({ id: 'accountId', value: account.name });
      }
    }
    return filters;
  }, [categoryFilter, accountFilter]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses.
          </p>
        </div>
        <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </AddTransactionDialog>
      </div>
      <DataTable
        columns={columns}
        data={transactions}
        accounts={accounts}
        categories={categories}
        initialFilters={initialFilters}
      />
    </div>
  );
}
