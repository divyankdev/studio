'use client';

import { Button } from '@/components/ui/button';
import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { PlusCircle, ScanLine } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher, postData } from '@/lib/api';
import type { Transaction, Account, Category } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

const POLL_INTERVAL = 3000; // 3 seconds

const pollJobStatus = async (jobId: string) => {
  const res = await fetcher(`/attachments/receipt-status?jobId=${jobId}`);
  return res;
};

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
  
    console.log("Selected file:", file.name, file.type, file.size);
  
    const { id: toastId, update, dismiss } = toast({
      title: 'Preparing Upload...',
      description: 'Getting ready to upload your receipt.',
    });
  
    try {
      console.log("Requesting signed URL...");
      // 1. Get signed URL from backend
      const signedUrlRes = await postData('/attachments/signed-url', { fileName: file.name, fileType: file.type });
      console.log("Signed URL response:", signedUrlRes);
      console.log("Signed URL data:", signedUrlRes.data);
      
      if (!signedUrlRes || signedUrlRes.status !== 'success') {
        throw new Error(signedUrlRes?.message || 'Failed to get signed URL.');
      }
      const { signedUrl: uploadUrl, filePath, token } = signedUrlRes.data;
      // const { signedUrl: uploadUrl, filePath, token } = signedUrlRes.data;
      console.log("Destructured values - uploadUrl:", uploadUrl);
      console.log("Destructured values - filePath:", filePath);
      console.log("Destructured values - token:", token ? "Present" : "Missing");

      console.log("About to call update...");
      try {
        update({
          id: toastId,
          title: 'Uploading Receipt...',
          description: 'Please wait while we upload your receipt.',
        });
        console.log("Update call successful");
      } catch (updateError) {
        console.error("Update failed:", updateError);
      }

      console.log("Starting file upload...");
// 2. Upload file to Supabase
      try {
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });
        
        console.log("Upload response status:", uploadResponse.status, uploadResponse.statusText);
        console.log("Upload response headers:", Object.fromEntries(uploadResponse.headers.entries()));
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Upload error details:", errorText);
          throw new Error(`Failed to upload receipt. Status: ${uploadResponse.status} - ${errorText}`);
        }
        
        console.log("Upload successful!");
      } catch (uploadError) {
        console.error("Upload fetch error:", uploadError);
        throw uploadError;
      }
          // console.log('Uploaded res', uploadResponse)
      update({
        id: toastId,
        title: 'Processing Receipt...',
        description: 'Please wait while we extract the details.',
      });

      // 3. Process the receipt
      const processRes = await postData('/attachments/process-receipt', { filePath });
      dismiss();
      if (!processRes || !processRes.success) {
        throw new Error(processRes?.message || 'Failed to process receipt.');
      }
      const { jobId } = processRes.data;

      // 4. Poll for job status
      let jobStatus = null;
      let attempts = 0;
      while (true) {
        await new Promise(res => setTimeout(res, POLL_INTERVAL));
        attempts++;
        const statusRes = await pollJobStatus(jobId);
        if (!statusRes || !statusRes.status) throw new Error('Failed to get job status.');
        if (statusRes.status === 'completed' || statusRes.status === 'failed') {
          jobStatus = statusRes;
          break;
        }
        if (attempts > 40) throw new Error('Processing timed out.');
        update({ id: toastId, title: 'Processing Receipt...', description: `Still processing... (${attempts * 3}s)` });
      }

      if (jobStatus.status === 'failed') {
        throw new Error(jobStatus.error || 'Receipt processing failed.');
      }

      const receiptData = jobStatus.extractedData;
      const newTransactionData: Partial<Transaction> = {
        description: receiptData.merchantName || receiptData.description,
        amount: receiptData.total || receiptData.amount,
        transactionDate: receiptData.transactionDate || receiptData.date,
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
      update({
        id: toastId,
        variant: 'destructive',
        title: 'Scan Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
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
