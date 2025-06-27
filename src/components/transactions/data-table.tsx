"use client"

import * as React from "react"
import {
  type ColumnDef,
  type Row,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter, usePathname } from "next/navigation"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Account, Category, Transaction } from "@/lib/definitions"
import { X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSettings } from "@/contexts/settings-context"
import { Card, CardContent } from "../ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "../ui/badge"
import { DataTableRowActions } from "./data-table-row-actions"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  accounts: Account[]
  categories: Category[]
  initialFilters?: ColumnFiltersState
}

export function DataTable<TData, TValue>({
  columns,
  data,
  accounts,
  categories,
  initialFilters = [],
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const { currency, dateFormat } = useSettings()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialFilters)
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [date, setDate] = React.useState<DateRange | undefined>()

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
    meta: {
      accounts,
      categories,
    },
  })

  React.useEffect(() => {
    table.getColumn("transactionDate")?.setFilterValue(date ? [date.from, date.to] : undefined)
  }, [date, table])

  const isFiltered = table.getState().columnFilters.length > 0 || date

  const resetFilters = () => {
    table.resetColumnFilters()
    setDate(undefined)
    router.push(pathname, { scroll: false })
  }

  const filters = (
    <div className="flex items-center gap-2 flex-wrap">
      <Input
        placeholder="Filter descriptions..."
        value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
        onChange={(event) => table.getColumn("description")?.setFilterValue(event.target.value)}
        className="max-w-xs"
      />
      <DatePickerWithRange date={date} setDate={setDate} />
      <Select
        value={(table.getColumn("accountId")?.getFilterValue() as string) ?? "all"}
        onValueChange={(value) => {
          const account = accounts.find((acc) => acc.accountName === value)
          table.getColumn("accountId")?.setFilterValue(value === "all" ? undefined : account?.accountName)
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.accountId} value={account.accountName}>
              {account.accountName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={(table.getColumn("categoryName")?.getFilterValue() as string) ?? "all"}
        onValueChange={(value) => table.getColumn("categoryName")?.setFilterValue(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.categoryId} value={category.categoryName}>
              {category.categoryName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={(table.getColumn("transactionType")?.getFilterValue() as string) ?? "all"}
        onValueChange={(value) =>
          table.getColumn("transactionType")?.setFilterValue(value === "all" ? undefined : value)
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
      {isFiltered && (
        <Button variant="ghost" onClick={resetFilters} className="h-8 px-2 lg:px-3">
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )

  const pagination = (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
        Previous
      </Button>
      <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
        Next
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <div className="space-y-4">
        {filters}
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const transaction = row.original as TData & Transaction
              const account = accounts.find((a) => a.accountId === transaction.accountId)
              const category = categories.find((c) => c.categoryName === transaction.categoryName)
              const formattedAmount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: currency,
              }).format(transaction.amount)

              return (
                <Card key={row.id}>
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 w-2/3">
                        <p className="font-medium leading-tight truncate">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{account?.accountName}</p>
                      </div>
                      <div
                        className={cn(
                          "text-right font-bold text-md",
                          transaction.transactionType === "income" ? "text-green-500" : "text-destructive",
                        )}
                      >
                        {transaction.transactionType === "income" ? "+" : "-"}
                        {formattedAmount}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-2">
                        {category && <Badge variant="outline">{category.categoryName}</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>{format(new Date(transaction.transactionDate), dateFormat)}</span>
                        <DataTableRowActions row={row as Row<TData>} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="h-24 text-center flex items-center justify-center text-muted-foreground">
                No results.
              </CardContent>
            </Card>
          )}
        </div>
        {pagination}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filters}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination}
    </div>
  )
}
