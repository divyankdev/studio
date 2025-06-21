
'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Account, Category } from '@/lib/definitions';
import { X } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  accounts: Account[];
  categories: Category[];
  initialFilters?: ColumnFiltersState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  accounts,
  categories,
  initialFilters = [],
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(initialFilters);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [date, setDate] = React.useState<DateRange | undefined>();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    enableRowSelection: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  React.useEffect(() => {
    table.getColumn('date')?.setFilterValue(date ? [date.from, date.to] : undefined);
  }, [date, table]);

  const isFiltered = table.getState().columnFilters.length > 0;

  const resetFilters = () => {
      table.resetColumnFilters();
      setDate(undefined);
      router.push(pathname, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Filter descriptions..."
          value={
            (table.getColumn('description')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('description')?.setFilterValue(event.target.value)
          }
          className="max-w-xs"
        />
        <DatePickerWithRange date={date} setDate={setDate} />
        <Select
          value={
            (table.getColumn('accountId')?.getFilterValue() as string) ?? 'all'
          }
          onValueChange={(value) => {
              const account = accounts.find(acc => acc.name === value);
              table
              .getColumn('accountId')
              ?.setFilterValue(value === 'all' ? undefined : account?.name)
            }
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Account"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.name}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={
            (table.getColumn('category')?.getFilterValue() as string) ?? 'all'
          }
          onValueChange={(value) =>
            table
              .getColumn('category')
              ?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={(table.getColumn('type')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table
              .getColumn('type')
              ?.setFilterValue(value === 'all' ? undefined : value)
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Filter by Type"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
