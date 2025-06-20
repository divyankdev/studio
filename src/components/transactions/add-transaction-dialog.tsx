
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddExpenseForm } from './add-expense-form';
import type { Expense } from '@/lib/definitions';

type AddTransactionDialogProps = {
  expense?: Expense;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddTransactionDialog({
  expense,
  children,
  open,
  onOpenChange,
}: AddTransactionDialogProps) {
  const handleFinished = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add a New Expense'}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Update the details of your expense below."
              : "Fill in the details of your expense below. Use the magic wand to get an AI-powered category suggestion!"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddExpenseForm expense={expense} onFinished={handleFinished} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
