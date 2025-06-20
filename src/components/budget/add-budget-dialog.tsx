
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddBudgetForm } from './add-budget-form';

type Budget = {
    category: string;
    spent: number;
    budget: number;
}

type AddBudgetDialogProps = {
  budget?: Budget;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddBudgetDialog({
  budget,
  children,
  open,
  onOpenChange,
}: AddBudgetDialogProps) {
  const handleFinished = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Create a New Budget'}</DialogTitle>
          <DialogDescription>
            {budget
              ? "Update your budget details."
              : "Set a new spending goal for a category."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddBudgetForm budget={budget} onFinished={handleFinished} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
