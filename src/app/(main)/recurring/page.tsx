
'use client';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';
import type { RecurringTransaction, Account, Transaction } from '@/lib/definitions';
import { fetcher, deleteData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAccountIcon } from '@/lib/icon-map';

function RecurringSkeleton() {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default function RecurringPage() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: recurring, error: rError } = useSWR<RecurringTransaction[]>('/recurring-transactions', fetcher);
  const { data: accounts, error: aError } = useSWR<Account[]>('/accounts', fetcher);
  
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
  const [accountId, setAccountId] = React.useState('all');
  const { currency, dateFormat } = useSettings();

  const handleDelete = async (id: string) => {
    try {
      await deleteData(`/recurring-transactions/${id}`);
      mutate('/recurring-transactions');
      toast({ title: 'Recurring transaction deleted' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error deleting recurring transaction',
      });
    }
  };

  const filteredRecurring = React.useMemo(() => {
    if (!recurring) return [];
    if (accountId === 'all') {
      return recurring;
    }
    return recurring.filter((r) => r.accountId === accountId);
  }, [accountId, recurring]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);

  if (rError || aError) return <div>Failed to load data.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground">
            Manage your recurring bills and subscriptions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[200px]">
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map((account) => {
                   const Icon = getAccountIcon(account.type);
                   return (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {account.name}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <AddTransactionDialog
            open={addDialogOpen || !!editingTransaction}
            onOpenChange={(isOpen) => {
              if(!isOpen) {
                setAddDialogOpen(false);
                setEditingTransaction(null);
              } else {
                setAddDialogOpen(true);
              }
            }}
            transaction={editingTransaction || undefined}
          >
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Recurring
            </Button>
          </AddTransactionDialog>
        </div>
      </div>
      {!recurring || !accounts ? <RecurringSkeleton /> : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecurring.map((item) => {
                const account = accounts.find((acc) => acc.id === item.accountId);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{account?.name || 'N/A'}</TableCell>
                    <TableCell>{item.frequency}</TableCell>
                    <TableCell>
                      {format(new Date(item.nextDate), dateFormat)}
                    </TableCell>
                    <TableCell>
                      {item.endDate
                        ? format(new Date(item.endDate), dateFormat)
                        : 'N/A'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        item.type === 'income'
                          ? 'text-green-500'
                          : 'text-destructive'
                      )}
                    >
                      {item.type === 'income' ? '+' : ''}
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              // This is a rough conversion, might need adjustment based on API
                              const transaction: Transaction = {
                                ...item,
                                description: item.name,
                                date: item.nextDate,
                                isRecurring: true,
                              };
                              setEditingTransaction(transaction)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>Pause</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onSelect={() => handleDelete(item.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
