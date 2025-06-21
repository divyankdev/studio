
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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign } from 'lucide-react';
import { useGlobalFilter } from '@/context/global-filter-context';
import { transactions, accounts } from '@/lib/data';

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
    let periodTransactions = filteredTransactions;

    if (period === 'weekly') {
      const lastWeek = new Date(now.setDate(now.getDate() - 7));
      periodTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) >= lastWeek
      );
    } else if (period === 'monthly') {
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
      periodTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) >= lastMonth
      );
    } else if (period === 'yearly') {
       const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
        periodTransactions = filteredTransactions.filter(
        (t) => new Date(t.date) >= lastYear
      );
    }

    const expenses = periodTransactions.filter((t) => t.type === 'expense');

    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const avgTransaction =
      expenses.length > 0 ? totalSpent / expenses.length : 0;

    const categoryBreakdown = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value,
    }));
    
    const accountSpending = periodTransactions.reduce((acc, t) => {
        const account = accounts.find(a => a.id === t.accountId);
        if (account) {
            acc[account.name] = (acc[account.name] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const accountSpendingData = Object.entries(accountSpending).map(([name, value]) => ({ name, value }));


    // Note: Line data is still static as it requires more complex grouping by day/week/month
    const lineData = {
        monthly: [
          { name: 'Week 1', spent: Math.random() * 500 },
          { name: 'Week 2', spent: Math.random() * 500 },
          { name: 'Week 3', spent: Math.random() * 500 },
          { name: 'Week 4', spent: Math.random() * 500 },
        ],
         weekly: [
          { name: 'Mon', spent: Math.random() * 100 },
          { name: 'Tue', spent: Math.random() * 100 },
          { name: 'Wed', spent: Math.random() * 100 },
          { name: 'Thu', spent: Math.random() * 100 },
          { name: 'Fri', spent: Math.random() * 100 },
          { name: 'Sat', spent: Math.random() * 100 },
          { name: 'Sun', spent: Math.random() * 100 },
        ],
        yearly: [
          { name: 'Jan', spent: Math.random() * 3000 },
          { name: 'Feb', spent: Math.random() * 3000 },
          { name: 'Mar', spent: Math.random() * 3000 },
          { name: 'Apr', spent: Math.random() * 3000 },
          { name: 'May', spent: Math.random() * 3000 },
          { name: 'Jun', spent: Math.random() * 3000 },
          { name: 'Jul', spent: Math.random() * 3000 },
        ]
    }


    return { totalSpent, avgTransaction, pieData, lineData: lineData[period], accountSpendingData };
  }, [period, filteredTransactions]);

  const { totalSpent, avgTransaction, pieData, lineData, accountSpendingData } = analyticsData;

  const avgMonthlySpend = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 12;

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
            Get a detailed view of your spending.
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
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total for this {period}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Transaction
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgTransaction.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Average for this {period}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Monthly Spend
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgMonthlySpend.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Based on yearly data
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Spending by category this {period}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
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
                      {pieData.map((entry, index) => (
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
              <CardTitle>Spending Trend</CardTitle>
              <CardDescription>
                Your spending over the {period}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
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
                    <Line
                      type="monotone"
                      dataKey="spent"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
           <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Spending by Account</CardTitle>
                <CardDescription>Total spending from each account this {period}.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={accountSpendingData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                       <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                       <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={80}/>
                       <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      />
                       <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
        </div>
      </div>
    </Tabs>
  );
}
