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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add a New Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction
              ? "Update the details of your transaction below."
              : "Fill in the details of your transaction below. Use the magic wand to get an AI-powered category suggestion!"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddTransactionForm transaction={transaction} onFinished={handleFinished} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
