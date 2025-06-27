"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Transaction, Account } from "@/lib/definitions"
import { Badge } from "@/components/ui/badge"
import { DataTableRowActions } from "./data-table-row-actions"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { format } from "date-fns"

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => {
      const categoryName = row.getValue("categoryName") as string
      return <Badge variant="outline">{categoryName}</Badge>
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
  {
    accessorKey: "accountId",
    header: "Account",
    cell: ({ row, table }) => {
      const accounts = ((table.options.meta as any)?.accounts as Account[]) || []
      const accountId = row.getValue("accountId") as string
      const account = accounts.find((a) => a.accountId === Number.parseInt(accountId))

      return <div>{account ? account.accountName : "N/A"}</div>
    },
    filterFn: (row, id, value, addMeta) => {
      const accounts = ((addMeta as any)?.accounts as Account[]) || []
      const account = accounts.find((a) => a.accountId === row.getValue(id))
      return value === account?.accountName
    },
  },
  {
    accessorKey: "transactionType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("transactionType") as string
      const isIncome = type === "income"
      const typeLabel =
        typeof type === "string" && type.length > 0 ? type.charAt(0).toUpperCase() + type.slice(1) : "N/A"
      return (
        <Badge
          variant={isIncome ? "default" : "secondary"}
          className={cn(isIncome && "bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30")}
        >
          <div className="flex items-center gap-1">
            {isIncome ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {typeLabel}
          </div>
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value === row.getValue(id)
    },
  },
  {
    accessorKey: "transactionDate",
    header: "Date",
    cell: ({ row }) => {
      const { dateFormat } = useSettings()
      const date = new Date(row.getValue("transactionDate"))
      return format(date, dateFormat)
    },
    filterFn: (row, id, value) => {
      if (!value) return true
      const date = new Date(row.getValue(id) as string)
      const [from, to] = value as [Date, Date]
      if (!from && !to) return true
      if (from && !to) return date >= from
      if (!from && to) return date <= to
      const toDate = new Date(to)
      toDate.setDate(toDate.getDate() + 1) // include the end date
      return date >= from && date < toDate
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const { currency } = useSettings()
      const amount = Number.parseFloat(row.getValue("amount"))
      const type = row.getValue("transactionType") as string

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount)

      return (
        <div className={cn("text-right font-medium", type === "income" ? "text-green-600" : "text-foreground")}>
          {formatted}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
