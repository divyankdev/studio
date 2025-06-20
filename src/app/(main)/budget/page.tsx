'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { categories } from '@/lib/data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { AddBudgetDialog } from '@/components/budget/add-budget-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const budgets = [
  { category: 'Food', spent: 350.75, budget: 500 },
  { category: 'Shopping', spent: 210.5, budget: 400 },
  { category: 'Transport', spent: 80.0, budget: 100 },
  { category: 'Entertainment', spent: 150.0, budget: 150 },
];

export default function BudgetPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground">
            Set and track your spending goals for this month.
          </p>
        </div>
        <AddBudgetDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> New Budget
          </Button>
        </AddBudgetDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets.map((item) => {
          const categoryDetails = categories.find((c) => c.name === item.category);
          const progress = (item.spent / item.budget) * 100;

          return (
            <Card key={item.category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {categoryDetails && (
                      <categoryDetails.icon className="h-6 w-6 text-primary" />
                    )}
                    <CardTitle>{item.category}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        progress > 100 ? 'text-destructive' : ''
                      }`}
                    >
                      ${item.spent.toFixed(2)}
                    </span>
                    <AddBudgetDialog
                      budget={item}
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => setEditDialogOpen(true)}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </AddBudgetDialog>
                  </div>
                </div>
                <CardDescription>
                  of ${item.budget.toFixed(2)} budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progress > 100
                    ? `$${(item.spent - item.budget).toFixed(2)} over budget`
                    : `$${(item.budget - item.spent).toFixed(2)} left`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
