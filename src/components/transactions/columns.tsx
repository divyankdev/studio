
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Transaction } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { DataTableRowActions } from './data-table-row-actions';
import { categories, accounts } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const categoryName = row.getValue('category') as string;
      const category = categories.find((c) => c.name === categoryName);
      
      return <Badge variant="outline">{category ? category.name : 'N/A'}</Badge>;
    },
     filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
   {
    accessorKey: 'accountId',
    header: 'Account',
    cell: ({ row }) => {
      const accountId = row.getValue('accountId') as string;
      const account = accounts.find((a) => a.id === accountId);
      
      return <div>{account ? account.name : 'N/A'}</div>;
    },
     filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const isIncome = type === 'income';
      return (
         <Badge variant={isIncome ? 'default' : 'secondary'} className={cn(isIncome && 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30')}>
           <div className="flex items-center gap-1">
             {isIncome ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
             {type.charAt(0).toUpperCase() + type.slice(1)}
           </div>
         </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return new Intl.DateTimeFormat('en-US').format(date);
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      const date = new Date(row.getValue(id) as string);
      const [from, to] = value as [string, string];
      if (!from && !to) return true;
      if (from && !to) return date >= new Date(from);
      if (!from && to) return date <= new Date(to);
      const toDate = new Date(to);
      toDate.setDate(toDate.getDate() + 1); // include the end date
      return date >= new Date(from) && date <= toDate;
    },
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('amount'));
      const type = row.getValue('type') as string;
      
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);

      return <div className={cn("text-right font-medium", type === 'income' ? 'text-green-600' : 'text-foreground')}>{formatted}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
