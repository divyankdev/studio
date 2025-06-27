"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type React from "react"

import { AddTransactionForm } from "./add-expense-form"
import type { Transaction } from "@/lib/definitions"

type AddTransactionDialogProps = {
  transaction?: Transaction
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTransactionDialog({ transaction, children, open, onOpenChange }: AddTransactionDialogProps) {
  const handleFinished = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add a New Transaction"}</DialogTitle>
          <DialogDescription>
          {transaction ? "Update your transaction details." : "Add a new income or expense transaction."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <AddTransactionForm transaction={transaction} onFinished={handleFinished} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
