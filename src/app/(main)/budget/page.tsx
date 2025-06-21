
'use client';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, PlusCircle, AlertTriangle } from 'lucide-react';
import { AddBudgetDialog } from '@/components/budget/add-budget-dialog';
import type { Budget, Transaction, Category } from '@/lib/definitions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, getDaysInMonth, getDate, isSameMonth } from 'date-fns';
import { useSettings } from '@/contexts/settings-context';
import { fetcher, deleteData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { getIcon } from '@/lib/icon-map';
import { useToast } from '@/hooks/use-toast';

function BudgetSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: budgets, error: bError } = useSWR<Budget[]>('/budgets', fetcher);
  const { data: transactions, error: tError } = useSWR<Transaction[]>('/transactions', fetcher);
  const { data: categories, error: cError } = useSWR<Category[]>('/categories', fetcher);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<Budget | null>(null);
  const { currency } = useSettings();

  const handleDelete = async (budgetId: string) => {
    try {
      await deleteData(`/budgets/${budgetId}`);
      mutate('/budgets');
      toast({ title: 'Budget deleted successfully' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error deleting budget',
        description: 'Please try again.',
      });
    }
  };

  const monthlyBudgetData = React.useMemo(() => {
    if (!budgets || !transactions) return [];

    const now = new Date();
    const currentMonthTransactions = transactions.filter(
      (t) => isSameMonth(new Date(t.date), now) && t.type === 'expense'
    );

    const spendingByCategory = currentMonthTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return budgets.map((b) => {
      const spent = spendingByCategory[b.category] || 0;
      return {
        ...b,
        spent,
      };
    });
  }, [budgets, transactions]);

  const totalBudget = monthlyBudgetData.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = monthlyBudgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const daysInMonth = getDaysInMonth(new Date());
  const today = getDate(new Date());
  const daysRemaining = Math.max(1, daysInMonth - today);
  const overallDailyBudget = (totalBudget - totalSpent) / daysRemaining;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
    
  if (bError || tError || cError) return <div>Failed to load data.</div>;
  if (!budgets || !transactions || !categories) return <BudgetSkeleton />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground">
            Set and track your spending goals for this month.
          </p>
        </div>
        <AddBudgetDialog
          open={addDialogOpen || !!editingBudget}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setAddDialogOpen(false);
              setEditingBudget(null);
            } else {
               setAddDialogOpen(true)
            }
          }}
          budget={editingBudget ?? undefined}
        >
          <Button onClick={() => setAddDialogOpen(true)}>
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
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center pt-2">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <p className="text-xl font-bold">
                {formatCurrency(totalBudget - totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recommended Daily</p>
              <p
                className={`text-xl font-bold ${
                  overallDailyBudget < 0 ? 'text-destructive' : ''
                }`}
              >
                {formatCurrency(overallDailyBudget)}/day
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
          const Icon = getIcon(categoryDetails?.icon);
          const progress = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
          const isOverBudget = item.spent > item.amount;

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <Icon className="h-6 w-6 text-primary" />
                    )}
                    <CardTitle>{item.category}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        isOverBudget ? 'text-destructive' : ''
                      }`}
                    >
                      {formatCurrency(item.spent)}
                    </span>
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDelete(item.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardDescription>
                  of {formatCurrency(item.amount)} budget
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
                    ? `${formatCurrency(item.spent - item.amount)} over budget`
                    : `${formatCurrency(item.amount - item.spent)} left`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
