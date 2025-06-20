'use client';
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

const COLORS = ['#4780FF', '#9447FF', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

const pieData = {
  monthly: [
    { name: 'Food', value: 400 },
    { name: 'Shopping', value: 300 },
    { name: 'Transport', value: 300 },
    { name: 'Housing', value: 200 },
    { name: 'Entertainment', value: 278 },
    { name: 'Health', value: 189 },
  ],
  weekly: [
    { name: 'Food', value: 100 },
    { name: 'Shopping', value: 50 },
    { name: 'Transport', value: 70 },
    { name: 'Housing', value: 50 },
    { name: 'Entertainment', value: 80 },
    { name: 'Health', value: 20 },
  ],
  yearly: [
    { name: 'Food', value: 4800 },
    { name: 'Shopping', value: 3600 },
    { name: 'Transport', value: 3600 },
    { name: 'Housing', value: 2400 },
    { name: 'Entertainment', value: 3336 },
    { name: 'Health', value: 2268 },
  ]
};

const lineData = {
    monthly: [
      { name: 'Week 1', spent: 400 },
      { name: 'Week 2', spent: 300 },
      { name: 'Week 3', spent: 500 },
      { name: 'Week 4', spent: 450 },
    ],
     weekly: [
      { name: 'Mon', spent: 50 },
      { name: 'Tue', spent: 70 },
      { name: 'Wed', spent: 30 },
      { name: 'Thu', spent: 90 },
      { name: 'Fri', spent: 120 },
      { name: 'Sat', spent: 60 },
      { name: 'Sun', spent: 40 },
    ],
    yearly: [
      { name: 'Jan', spent: 1800 },
      { name: 'Feb', spent: 2200 },
      { name: 'Mar', spent: 2500 },
      { name: 'Apr', spent: 2100 },
      { name: 'May', spent: 2700 },
      { name: 'Jun', spent: 3000 },
      { name: 'Jul', spent: 3200 },
    ]
}

const accountSpendingData = [
    { name: "Checking", value: 2500 },
    { name: "Savings", value: 500 },
    { name: "Credit Card", value: 4500 },
    { name: "Wallet", value: 800 },
]

export default function AnalyticsPage() {
  return (
    <Tabs defaultValue="monthly" className="space-y-4">
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
      <TabsContent value="weekly" className="space-y-6">
        {renderContent('weekly')}
      </TabsContent>
      <TabsContent value="monthly" className="space-y-6">
        {renderContent('monthly')}
      </TabsContent>
      <TabsContent value="yearly" className="space-y-6">
        {renderContent('yearly')}
      </TabsContent>
    </Tabs>
  );
}

const renderContent = (period: 'weekly' | 'monthly' | 'yearly') => {
    return (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,687.34</div>
                <p className="text-xs text-muted-foreground">
                  Total for this {period}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45.67</div>
                 <p className="text-xs text-muted-foreground">
                  Average for this {period}
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Monthly Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,345.12</div>
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
                <CardDescription>Spending by category this {period}.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData[period]}
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
                        {pieData[period].map((entry, index) => (
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
                <CardDescription>Your spending over the {period}.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={lineData[period]}
                      margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                        }}
                      />
                      <Line type="monotone" dataKey="spent" stroke="hsl(var(--primary))" strokeWidth={2} />
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
      </>
    );
}
