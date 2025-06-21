
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
  subDays,
  subMonths,
  subYears,
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  getYear,
} from 'date-fns';

const COLORS = [
  '#4780FF',
  '#9447FF',
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
];

const availableYears = Array.from(new Set(transactions.map(t => getYear(new Date(t.date))))).sort((a,b) => b-a);

export default function AnalyticsPage() {
  const [accountId, setAccountId] = React.useState('all');
  const [period, setPeriod] = React.useState<'weekly' | 'monthly' | 'yearly'>(
    'monthly'
  );
  const [selectedYear, setSelectedYear] = React.useState<number>(availableYears[0] || new Date().getFullYear());

  const analyticsData = React.useMemo(() => {
    const accountFilteredTransactions = accountId === 'all'
      ? transactions
      : transactions.filter((t) => t.accountId === accountId);
    
    const yearFilteredTransactions = accountFilteredTransactions.filter(t => getYear(new Date(t.date)) === selectedYear);

    const now = new Date();
    const currentYear = getYear(now);
    const effectiveEndDate = selectedYear === currentYear ? now : endOfYear(new Date(selectedYear, 11, 31));

    let startDate: Date;
    let trendInterval: 'day' | 'week' | 'month';

    if (period === 'weekly') {
      startDate = startOfYear(new Date(selectedYear, 0, 1));
      trendInterval = 'week';
    } else if (period === 'monthly') {
      startDate = startOfYear(new Date(selectedYear, 0, 1));
      trendInterval = 'month';
    } else { // yearly
      startDate = startOfYear(new Date(selectedYear, 0, 1));
      trendInterval = 'month'; // Treat yearly as a monthly breakdown for the chart
    }

    const periodTransactions = yearFilteredTransactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= effectiveEndDate
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
    
    if (trendInterval === 'week') {
      const weeks = eachWeekOfInterval({ start: startDate, end: effectiveEndDate }, { weekStartsOn: 1 });
       trendData = weeks.map((week, index) => {
         const weekStart = week;
         const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
         const weekExpenses = expenses.filter(t => new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd).reduce((sum, t) => sum + t.amount, 0);
         const weekIncome = income.filter(t => new Date(t.date) >= weekStart && new Date(t.date) <= weekEnd).reduce((sum, t) => sum + t.amount, 0);
         return { name: `W${index + 1}`, expense: weekExpenses, income: weekIncome };
       });
    } else if (trendInterval === 'month') {
       const months = eachMonthOfInterval({ start: startDate, end: effectiveEndDate });
       trendData = months.map(month => {
         const monthName = format(month, 'MMM');
         const monthExpenses = expenses.filter(t => format(new Date(t.date), 'yyyy-MM') === format(month, 'yyyy-MM')).reduce((sum, t) => sum + t.amount, 0);
         const monthIncome = income.filter(t => format(new Date(t.date), 'yyyy-MM') === format(month, 'yyyy-MM')).reduce((sum, t) => sum + t.amount, 0);
         return { name: monthName, expense: monthExpenses, income: monthIncome };
       });
    }

    return { totalSpent, totalIncome, expensePieData, incomePieData, trendData };
  }, [period, accountId, selectedYear]);

  const { totalSpent, totalIncome, expensePieData, incomePieData, trendData } = analyticsData;

  return (
    <Tabs
      defaultValue="monthly"
      className="space-y-4"
      onValueChange={(value) => setPeriod(value as 'weekly' | 'monthly' | 'yearly')}
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
            <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TabsList>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
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
              <div className="text-2xl font-bold text-destructive">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                In {selectedYear}
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
                In {selectedYear}
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
                Income vs. Expenses in {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
           <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense Trend</CardTitle>
              <CardDescription>
                Your financial flow over {period} view for {selectedYear}.
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
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${value}`} />
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
                Spending by category in {selectedYear}.
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
                Earnings by category in {selectedYear}.
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
