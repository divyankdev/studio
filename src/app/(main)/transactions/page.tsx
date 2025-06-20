import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { columns } from '@/components/transactions/columns';
import { DataTable } from '@/components/transactions/data-table';
import { AddExpenseForm } from '@/components/transactions/add-expense-form';
import { expenses } from '@/lib/data';
import { PlusCircle } from 'lucide-react';

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your expenses and track your spending.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add a New Expense</SheetTitle>
              <SheetDescription>
                Fill in the details of your expense below. Use the magic wand to
                get an AI-powered category suggestion!
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              <AddExpenseForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={expenses} />
    </div>
  );
}
