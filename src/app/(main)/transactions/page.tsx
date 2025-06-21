
'use client';

import { Button } from '@/components/ui/button';
import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { transactions, accounts, categories } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useGlobalFilter } from '@/context/global-filter-context';

export default function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { accountId } = useGlobalFilter();

  const filteredTransactions = React.useMemo(() => {
    if (accountId === 'all') {
      return transactions;
    }
    return transactions.filter((t) => t.accountId === accountId);
  }, [accountId]);

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
        data={filteredTransactions}
        accounts={accounts}
        categories={categories}
      />
    </div>
  );
}
