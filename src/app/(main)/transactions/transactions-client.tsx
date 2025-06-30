
'use client';

import { Button } from '@/components/ui/button';
import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { PlusCircle, ScanLine } from 'lucide-react';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import type { Transaction, Account, Category } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { scanReceiptAction } from '@/lib/actions';

function TransactionsClientPageSkeleton() {
  return (
     <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-60 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-[260px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-96 w-full rounded-md border" />
        <div className="flex items-center justify-end space-x-2 py-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function TransactionsClientPage() {
  const { data: transactions, error: tError } = useSWR<Transaction[]>('/transactions', fetcher);
  const { data: accounts, error: aError } = useSWR<Account[]>('/accounts', fetcher);
  const { data: categories, error: cError } = useSWR<Category[]>('/categories', fetcher);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [activeTransaction, setActiveTransaction] = React.useState<Partial<Transaction> | undefined>(undefined);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const accountFilter = searchParams.get('accountId');

  const handleScanReceipt = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { id: toastId } = toast({
      title: 'Scanning Receipt...',
      description: 'Please wait while we extract the details.',
    });

    try {
      const formData = new FormData();
      formData.append('receipt', file);
      const result = await scanReceiptAction(formData);

      toast({ id: toastId, open: false });

      if (result.error) {
        throw new Error(result.error);
      }

      const receiptData = result.data!;
      
      const newTransactionData: Partial<Transaction> = {
        description: receiptData.description,
        amount: receiptData.amount,
        transactionDate: receiptData.date,
        transactionType: 'expense',
      };

      toast({
        title: 'Receipt Scanned!',
        description: 'Click here to create the transaction.',
        duration: Infinity,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTransaction(newTransactionData);
              setDialogOpen(true);
            }}
          >
            Create
          </Button>
        ),
      });

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
        if(event.target) {
            event.target.value = '';
        }
    }
  };
  
  const initialFilters = React.useMemo(() => {
    const filters = [];
    if (categoryFilter) {
      filters.push({ id: 'category', value: categoryFilter });
    }
    if (accountFilter && accountFilter !== 'all' && accounts) {
      const account = accounts.find(acc => acc.accountId === Number(accountFilter));
      if (account) {
        filters.push({ id: 'accountId', value: account.accountName });
      }
    }
    return filters;
  }, [categoryFilter, accountFilter, accounts]);

  if (tError || aError || cError) return <div>Failed to load transaction data.</div>;
  if (!transactions || !accounts || !categories) return <TransactionsClientPageSkeleton />;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button variant="outline" onClick={handleScanReceipt}>
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Receipt
          </Button>
          <Button onClick={() => {
              setActiveTransaction(undefined);
              setDialogOpen(true);
            }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>

       <AddTransactionDialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setActiveTransaction(undefined);
          }
        }}
        transaction={activeTransaction}
      />

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
