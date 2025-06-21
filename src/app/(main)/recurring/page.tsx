
'use client';
import React from 'react';
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
import { recurring, accounts } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import { format } from 'date-fns';

export default function RecurringPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [accountId, setAccountId] = React.useState('all');
  const { currency, dateFormat } = useSettings();

  // This is a placeholder for an expense object to pass to the edit dialog
  const mockTransactionForEdit = {
    id: 'rec-1',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    date: new Date().toISOString(),
    type: 'expense' as const,
    accountId: 'acc-3',
  };

  const filteredRecurring = React.useMemo(() => {
    if (accountId === 'all') {
      return recurring;
    }
    return recurring.filter((r) => r.accountId === accountId);
  }, [accountId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);

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
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <account.icon className="h-4 w-4" />
                      {account.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AddTransactionDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Recurring
            </Button>
          </AddTransactionDialog>
        </div>
      </div>
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
                    <AddTransactionDialog
                      transaction={mockTransactionForEdit}
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setEditDialogOpen(true)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>Pause</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </AddTransactionDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
