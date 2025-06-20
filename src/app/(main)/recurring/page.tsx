'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
} from '@/components/ui/card';
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
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';

const recurring = [
  {
    name: 'Netflix Subscription',
    category: 'Entertainment',
    amount: 15.99,
    frequency: 'Monthly',
    nextDate: '2024-08-01',
  },
  {
    name: 'Gym Membership',
    category: 'Health',
    amount: 40.0,
    frequency: 'Monthly',
    nextDate: '2024-08-05',
  },
  {
    name: 'Internet Bill',
    category: 'Housing',
    amount: 65.0,
    frequency: 'Monthly',
    nextDate: '2024-08-10',
  },
  {
    name: 'Music Streaming',
    category: 'Entertainment',
    amount: 9.99,
    frequency: 'Monthly',
    nextDate: '2024-08-15',
  },
];

export default function RecurringPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  // This is a placeholder for an expense object to pass to the edit dialog
  const mockExpenseForEdit = {
    id: 'rec-1',
    description: 'Netflix Subscription',
    amount: 15.99,
    category: 'Entertainment',
    date: new Date().toISOString(),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground">
            Manage your recurring bills and subscriptions.
          </p>
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
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurring.map((item) => (
              <TableRow key={item.name}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.category}</Badge>
                </TableCell>
                <TableCell>{item.frequency}</TableCell>
                <TableCell>
                  {new Date(item.nextDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  ${item.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <AddTransactionDialog
                    expense={mockExpenseForEdit}
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
                        <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
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
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
