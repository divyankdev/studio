"use client"

import React from "react"
import type { Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Transaction } from "@/lib/definitions"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { useSWRConfig } from "swr"
import { useToast } from "@/hooks/use-toast"
import { deleteData } from "@/lib/api"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData extends Transaction>({ row }: DataTableRowActionsProps<TData>) {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const transaction = row.original
  const { toast } = useToast()
  const { mutate } = useSWRConfig()

  const handleDelete = async () => {
    try {
      await deleteData(`/transactions/${transaction.transactionId}`)
      mutate("/transactions")
      toast({
        title: "Transaction deleted",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete transaction.",
      })
    }
  }

  const handleCopy = () => {
    const { transactionId, ...copiedTransaction } = transaction
    // Here you could open the dialog with the copied data
    // For now, we just log it
    console.log("Copied Transaction:", copiedTransaction)
    toast({
      title: "Transaction copied",
      description: "A new transaction has been created with the same details.",
    })
  }

  return (
    <>
      <AddTransactionDialog transaction={transaction} open={dialogOpen} onOpenChange={setDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onSelect={() => setDialogOpen(true)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>Make a copy</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onSelect={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </AddTransactionDialog>
    </>
  )
}
