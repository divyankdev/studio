
'use client';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, ArrowDown, ArrowUp } from 'lucide-react';
import { useGlobalFilter } from '@/context/global-filter-context';
import { transactions } from '@/lib/data';
import {
  subDays,
  subMonths,
  subYears,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
} from 'date-fns';

const COLORS = [
  '#4780FF',
  '#9447FF',
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
];

export default function AnalyticsPage() {
  const { accountId } = useGlobalFilter();
  const [period, setPeriod] = React.useState<'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  );

  const filteredTransactions = React.useMemo(() => {
    if (accountId === 'all') {
      return transactions;
    }
    return transactions.filter((t) => t.accountId === accountId);
  }, [accountId]);

  const analyticsData = React.useMemo(() => {
    const now = new Date();
    let startDate: Date;
    if (period === 'weekly') {
      startDate = subDays(now, 6);
    } else if (period === 'monthly') {
      startDate = subDays(now, 29);
    } else {
      startDate = subYears(now, 1);
      startDate.setDate(1);
      startDate.setMonth(0);
    }

    const periodTransactions = filteredTransactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= now
    );

    const expenses = periodTransactions.filter((t) => t.type === 'expense');
    const income = periodTransactions.filter((t) => t.type === 'income');

    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction =
      expenses.length > 0 ? totalSpent / expenses.length : 0;

    const expenseCategoryBreakdown = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const incomeCategoryBreakdown = income.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const expensePieData = Object.entries(expenseCategoryBreakdown).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
    const incomePieData = Object.entries(incomeCategoryBreakdown).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    let trendData: { name: string; expense: number; income: number }[] = [];

    if (period === 'weekly') {
      const days = eachDayOfInterval({ start: startDate, end: now });
      trendData = days.map((day) => {
        const dayStr = format(day, 'EEE');
        const dayExpenses = expenses
          .filter((t) => format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
          .reduce((sum, t) => sum + t.amount, 0);
        const dayIncome = income
          .filter((t) => format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: dayStr, expense: dayExpenses, income: dayIncome };
      });
    } else if (period === 'monthly') {
      const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });
       trendData = weeks.map((week, index) => {
         const weekStart = week;
         const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
         const weekExpenses = expenses.filter(t => new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd).reduce((sum, t) => sum + t.amount, 0);
         const weekIncome = income.filter(t => new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd).reduce((sum, t) => sum + t.amount, 0);
         return { name: `Week ${index + 1}`, expense: weekExpenses, income: weekIncome };
       });
    } else if (period === 'yearly') {
       const months = eachMonthOfInterval({ start: startDate, end: now });
       trendData = months.map(month => {
         const monthName = format(month, 'MMM');
         const monthExpenses = expenses.filter(t => format(new Date(t.date), 'yyyy-MM') === format(month, 'yyyy-MM')).reduce((sum, t) => sum + t.amount, 0);
         const monthIncome = income.filter(t => format(new Date(t.date), 'yyyy-MM') === format(month, 'yyyy-MM')).reduce((sum, t) => sum + t.amount, 0);
         return { name: monthName, expense: monthExpenses, income: monthIncome };
       });
    }

    return { totalSpent, totalIncome, avgTransaction, expensePieData, incomePieData, trendData };
  }, [period, filteredTransactions]);

  const { totalSpent, totalIncome, avgTransaction, expensePieData, incomePieData, trendData } = analyticsData;

  return (
    <Tabs
      defaultValue="monthly"
      className="space-y-4"
      onValueChange={(value) => setPeriod(value as 'weekly' | 'monthly' | 'yearly')}
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Get a detailed view of your finances.
          </p>
        </div>
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                In the last {period}
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">${totalIncome.toFixed(2)}</div>
               <p className="text-xs text-muted-foreground">
                In the last {period}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Net Flow
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalIncome - totalSpent >= 0 ? 'text-green-500' : 'text-destructive'}`}>${(totalIncome - totalSpent).toFixed(2)}</div>
               <p className="text-xs text-muted-foreground">
                Income vs. Expenses
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
           <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense Trend</CardTitle>
              <CardDescription>
                Your financial flow over the {period}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <ComposedChart
                    data={trendData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="expense" name="Expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>
                Spending by category this {period}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
              <CardDescription>
                Earnings by category this {period}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {incomePieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS.slice(2)[index % (COLORS.length-2)]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Tabs>
  );
}
