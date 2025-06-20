'use client';

import { Button } from '@/components/ui/button';
import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { expenses } from '@/lib/data';
import { PlusCircle } from 'lucide-react';
import React from 'react';

export default function TransactionsPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your expenses and track your spending.
          </p>
        </div>
        <AddTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </AddTransactionDialog>
      </div>
      <DataTable columns={columns} data={expenses} />
    </div>
  );
}
