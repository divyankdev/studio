'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { PlusCircle, ScanLine } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';

import { fetcher, postData } from '@/lib/api';
import type { Transaction, Account, Category } from '@/lib/definitions';

const POLL_INTERVAL = 3000;

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

// const pollJobStatus = async (jobId: string) => {
//   try {
//     const url = `/attachments/receipt-status?jobId=${jobId}`;
//     const res = await fetcher(url);
//     return res;
//   } catch (error) {
//     console.error('Poll request failed:', error);
//     throw error;
//   }
// };

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

  const pollJobStatus = async (jobId: string) => {
    try {
      const url = `/attachments/receipt-status?jobId=${jobId}`;
      const res = await fetcher(url);
      console.log('Poll response:', res); // Add logging to debug
      return res;
    } catch (error) {
      console.error('Poll request failed:', error);
      throw error;
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const { id: toastId, update, dismiss } = toast({
      title: 'Preparing Upload...',
      description: 'Getting ready to upload your receipt.',
    });
  
    try {
      const signedUrlRes = await postData('/attachments/signed-url', {
        fileName: file.name,
        fileType: file.type,
      });
  
      if (!signedUrlRes || signedUrlRes.status !== 'success') {
        throw new Error(signedUrlRes?.message || 'Failed to get signed URL.');
      }
  
      const { signedUrl: uploadUrl, filePath } = signedUrlRes.data;
  
      update({
        id: toastId,
        title: 'Uploading Receipt...',
        description: 'Please wait while we upload your receipt.',
      });
  
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
  
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload receipt. ${errorText}`);
      }
  
      update({
        id: toastId,
        title: 'Processing Receipt...',
        description: 'Please wait while we extract the details.',
      });
  
      const processRes = await postData('/attachments/process-receipt', { filePath });
      console.log('Process response:', processRes); // Add logging
  
      // Fix: Check for consistent response structure
      if (!processRes || (processRes.status !== 'success' && !processRes.success)) {
        throw new Error(processRes?.message || 'Failed to process receipt.');
      }
  
      // Handle both possible response structures
      const jobId = processRes.data?.jobId || processRes.jobId;
      if (!jobId) throw new Error('No job ID returned.');
  
      let jobStatus = null;
      let attempts = 0;
      const maxAttempts = 40;
  
      while (attempts < maxAttempts) {
        await new Promise(res => setTimeout(res, POLL_INTERVAL));
        attempts++;
  
        try {
          const statusRes = await pollJobStatus(jobId);
          console.log('Status response:', statusRes); // Add logging
          
          // Fix: Handle different possible response structures
          const currentStatus = statusRes?.status || statusRes?.data?.status;
          
          if (!currentStatus) {
            console.warn('Invalid status response:', statusRes);
            continue; // Continue polling instead of throwing error
          }
  
          if (currentStatus === 'complete' || currentStatus === 'error') {
            jobStatus = statusRes;
            break;
          }
  
          update({
            id: toastId,
            title: 'Processing Receipt...',
            description: `Still processing... (${attempts * 3}s) - Status: ${currentStatus}`,
          });
        } catch (pollError: any) {
          console.error('Polling error:', pollError);
          if (attempts < 3) continue; // Give it a few more tries
          throw new Error(`Polling failed: ${pollError.message}`);
        }
      }
  
      if (attempts >= maxAttempts) throw new Error('Processing timed out.');
  
      dismiss();
  
      // Fix: Handle different response structures for final status
      const finalStatus = jobStatus?.status || jobStatus?.data?.status;
      const errorMessage = jobStatus?.error || jobStatus?.data?.error;
      let extractedData = jobStatus?.extractedData || jobStatus?.data?.extractedData || {};
  
      if (finalStatus === 'error') {
        throw new Error(errorMessage || 'Receipt processing failed.');
      }
  
      // Parse extractedData if it's a string
      // if (typeof extractedData === 'string') {
      //   try {
      //     extractedData = JSON.parse(extractedData);
      //   } catch (parseError) {
      //     console.error('Failed to parse extracted data:', parseError);
      //     extractedData = {};
      //   }
      // }
  
      // Helper function to create a valid date or undefined
      const createValidDate = (dateValue: any): Date | undefined => {
        if (!dateValue) return undefined;
        try {
          const date = new Date(dateValue);
          return isNaN(date.getTime()) ? undefined : date;
        } catch {
          return undefined;
        }
      };
  
      const newTransactionData: Partial<Transaction> = {
        description: extractedData.description || extractedData.merchantName || '',
        amount: extractedData.amount || extractedData.total || undefined,
        transactionDate: createValidDate(extractedData.transactionDate || extractedData.date),
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
    } catch (error: any) {
      console.error('Receipt processing error:', error);
      update({
        id: toastId,
        variant: 'destructive',
        title: 'Scan Failed',
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      if (event.target) {
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
          <p className="text-muted-foreground">Manage your income and expenses.</p>
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
          if (!open) setActiveTransaction(undefined);
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
