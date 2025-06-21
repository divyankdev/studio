
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
import { accounts, transactions } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  format,
  startOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  getYear,
  startOfMonth,
  min,
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
  const [accountId, setAccountId] = React.useState('all');
  const [period, setPeriod] = React.useState<'month' | 'year' | 'all'>(
    'month'
  );

  const analyticsData = React.useMemo(() => {
    const accountFilteredTransactions =
      accountId === 'all'
        ? transactions
        : transactions.filter((t) => t.accountId === accountId);

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    let trendInterval: 'day' | 'month' | 'year';
    let rangeDescription: string;

    if (period === 'month') {
      startDate = startOfMonth(now);
      trendInterval = 'day';
      rangeDescription = `in ${format(now, 'MMMM yyyy')}`;
    } else if (period === 'year') {
      startDate = startOfYear(now);
      trendInterval = 'month';
      rangeDescription = `in ${format(now, 'yyyy')}`;
    } else {
      // 'all'
      const allDates = transactions.map((t) => new Date(t.date));
      startDate = allDates.length > 0 ? min(allDates) : startOfYear(now);
      trendInterval = 'year';
      rangeDescription = 'of all time';
    }

    const periodTransactions = accountFilteredTransactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
    );

    const expenses = periodTransactions.filter((t) => t.type === 'expense');
    const income = periodTransactions.filter((t) => t.type === 'income');

    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

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

    if (trendInterval === 'day') {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      trendData = days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayExpenses = expenses
          .filter((t) => format(new Date(t.date), 'yyyy-MM-dd') === dayStr)
          .reduce((sum, t) => sum + t.amount, 0);
        const dayIncome = income
          .filter((t) => format(new Date(t.date), 'yyyy-MM-dd') === dayStr)
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: format(day, 'd'), expense: dayExpenses, income: dayIncome };
      });
    } else if (trendInterval === 'month') {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      trendData = months.map((month) => {
        const monthStr = format(month, 'yyyy-MM');
        const monthExpenses = expenses
          .filter((t) => format(new Date(t.date), 'yyyy-MM') === monthStr)
          .reduce((sum, t) => sum + t.amount, 0);
        const monthIncome = income
          .filter((t) => format(new Date(t.date), 'yyyy-MM') === monthStr)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: format(month, 'MMM'),
          expense: monthExpenses,
          income: monthIncome,
        };
      });
    } else if (trendInterval === 'year') {
      const startYear = getYear(startDate);
      const endYear = getYear(endDate);
      const years = Array.from(
        { length: endYear - startYear + 1 },
        (_, i) => startYear + i
      );
      trendData = years.map((year) => {
        const yearExpenses = expenses
          .filter((t) => getYear(new Date(t.date)) === year)
          .reduce((sum, t) => sum + t.amount, 0);
        const yearIncome = income
          .filter((t) => getYear(new Date(t.date)) === year)
          .reduce((sum, t) => sum + t.amount, 0);
        return {
          name: String(year),
          expense: yearExpenses,
          income: yearIncome,
        };
      });
    }

    return {
      totalSpent,
      totalIncome,
      expensePieData,
      incomePieData,
      trendData,
      rangeDescription,
    };
  }, [period, accountId]);

  const {
    totalSpent,
    totalIncome,
    expensePieData,
    incomePieData,
    trendData,
    rangeDescription,
  } = analyticsData;

  return (
    <Tabs
      defaultValue="month"
      className="space-y-4"
      onValueChange={(value) => setPeriod(value as 'month' | 'year' | 'all')}
    >
      <div className="flex flex-wrap gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Get a detailed view of your finances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TabsList>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total spending {rangeDescription}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ${totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total income {rangeDescription}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalIncome - totalSpent >= 0
                    ? 'text-green-500'
                    : 'text-destructive'
                }`}
              >
                ${(totalIncome - totalSpent).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Income vs. Expenses {rangeDescription}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense Trend</CardTitle>
              <CardDescription>
                A comparison of your income and expenses {rangeDescription}.
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
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="expense"
                      name="Expense"
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                    />
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
                Spending by category {rangeDescription}.
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
                    <Tooltip
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
              <CardDescription>
                Earnings by category {rangeDescription}.
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
                          fill={COLORS.slice(2)[index % (COLORS.length - 2)]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                    <Legend />
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
