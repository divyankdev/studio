
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
import { categories, transactions } from '@/lib/data';
import { MoreHorizontal, PlusCircle, AlertTriangle } from 'lucide-react';
import { AddBudgetDialog } from '@/components/budget/add-budget-dialog';
import type { Budget } from '@/lib/definitions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, getDaysInMonth, getDate, isSameMonth } from 'date-fns';

// Mock data for budgets. In a real app, this would come from a database.
const userBudgets: Omit<Budget, 'spent' | 'id'>[] = [
  { category: 'Food', amount: 500 },
  { category: 'Shopping', amount: 400 },
  { category: 'Transport', amount: 100 },
  { category: 'Entertainment', amount: 150 },
  { category: 'Housing', amount: 1200 },
];

export default function BudgetPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(
    null
  );

  const monthlyBudgetData = React.useMemo(() => {
    const now = new Date();
    const currentMonthTransactions = transactions.filter(
      (t) => isSameMonth(new Date(t.date), now) && t.type === 'expense'
    );

    const spendingByCategory = currentMonthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return userBudgets.map((b, index) => {
      const spent = spendingByCategory[b.category] || 0;
      return {
        id: `budget-${index}`,
        ...b,
        spent,
      };
    });
  }, []);

  const totalBudget = monthlyBudgetData.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = monthlyBudgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const daysInMonth = getDaysInMonth(new Date());
  const today = getDate(new Date());
  const daysRemaining = Math.max(1, daysInMonth - today);
  const overallDailyBudget = (totalBudget - totalSpent) / daysRemaining;

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Month's Budget Overview</CardTitle>
          <CardDescription>{format(new Date(), 'MMMM yyyy')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-base font-medium">Total Spent</span>
              <span className="text-base font-medium">
                ${totalSpent.toFixed(2)} / ${totalBudget.toFixed(2)}
              </span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <p className="text-xl font-bold">
                ${(totalBudget - totalSpent).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommended Daily</p>
              <p
                className={`text-xl font-bold ${
                  overallDailyBudget < 0 ? 'text-destructive' : ''
                }`}
              >
                ${overallDailyBudget.toFixed(2)}/day
              </p>
            </div>
          </div>
          {totalProgress > 90 && (
            <div className="flex items-center p-3 rounded-md bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5 mr-3" />
              <p className="text-sm font-medium">
                You've used over 90% of your budget this month. Be mindful!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {monthlyBudgetData.map((item) => {
          const categoryDetails = categories.find(
            (c) => c.name === item.category
          );
          const progress = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
          const isOverBudget = item.spent > item.amount;

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
                        isOverBudget ? 'text-destructive' : ''
                      }`}
                    >
                      ${item.spent.toFixed(2)}
                    </span>
                    <div onClick={(e) => e.preventDefault()}>
                      <AddBudgetDialog
                        budget={item}
                        open={editingBudget?.id === item.id}
                        onOpenChange={(isOpen) =>
                          setEditingBudget(isOpen ? item : null)
                        }
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
                              onSelect={() => setEditingBudget(item)}
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
                </div>
                <CardDescription>
                  of ${item.amount.toFixed(2)} budget
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={progress}
                  className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                />
                <p
                  className={`text-xs mt-2 ${
                    isOverBudget
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                  }`}
                >
                  {isOverBudget
                    ? `$${(item.spent - item.amount).toFixed(2)} over budget`
                    : `$${(item.amount - item.spent).toFixed(2)} left`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
