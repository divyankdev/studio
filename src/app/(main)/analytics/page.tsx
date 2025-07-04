"use client"
import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
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
} from "recharts"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  format,
  startOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  getYear,
  startOfMonth,
  min,
  endOfMonth,
  endOfYear,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isAfter,
} from "date-fns"
import { useSettings } from "@/contexts/settings-context"
import type { Account, Transaction } from "@/lib/definitions"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

const COLORS = ["#4780FF", "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9447FF", "#FF9F40", "#FF6384"]

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-[180px]" />
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-9 w-9" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}

// Custom label component for pie chart
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.02) return null // Don't show labels for very small segments

  return (
    <text
      x={x}
      y={y}
      fill="#666"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function AnalyticsPage() {
  const { data: transactions, error: tError } = useSWR("/transactions", fetcher)
  const { data: accounts, error: aError } = useSWR("/accounts", fetcher)
  const { data: recurring, error: rError } = useSWR("/recurring-transactions", fetcher)

  const [accountId, setAccountId] = useState("all")
  const [period, setPeriod] = useState<"month" | "year" | "all">("month")
  const [displayDate, setDisplayDate] = useState(new Date())

  const { currency, dateFormat } = useSettings()

  const latestTransactionDate = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return new Date()
    }
    const dates = transactions
      .map((t: Transaction) => new Date(t.transactionDate))
      .filter((d: Date) => !isNaN(d.getTime()))

    if (dates.length === 0) {
      return new Date()
    }

    return new Date(Math.max(...dates.map((d: Date) => d.getTime())))
  }, [transactions])

  const hasSetInitialDate = useRef(false)

  useEffect(() => {
    if (!hasSetInitialDate.current) {
      setDisplayDate(latestTransactionDate)
      hasSetInitialDate.current = true
    }
  }, [latestTransactionDate])

  const handlePrev = useCallback(() => {
    if (period === "month") {
      setDisplayDate((prev) => subMonths(prev, 1))
    } else if (period === "year") {
      setDisplayDate((prev) => subYears(prev, 1))
    }
  }, [period])

  const handleNext = useCallback(() => {
    if (period === "month") {
      setDisplayDate((prev) => addMonths(prev, 1))
    } else if (period === "year") {
      setDisplayDate((prev) => addYears(prev, 1))
    }
  }, [period])

  const isFutureDisabled = useMemo(() => {
    const now = new Date()
    if (period === "month") {
      return isAfter(startOfMonth(displayDate), startOfMonth(now))
    }
    if (period === "year") {
      return isAfter(startOfYear(displayDate), startOfYear(now))
    }
    return false
  }, [displayDate, period])

  const analyticsData = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return {
        totalSpent: 0,
        totalIncome: 0,
        expensePieData: [],
        incomePieData: [],
        trendData: [],
        rangeDescription: "",
      }
    }

    const validTransactions = transactions.filter(
      (t: Transaction) =>
        t &&
        t.transactionDate &&
        !isNaN(new Date(t.transactionDate).getTime()) &&
        t.transactionType &&
        !isNaN(Number(t.amount)) &&
        t.categoryName,
    )

    const accountFilteredTransactions =
      accountId === "all"
        ? validTransactions
        : validTransactions.filter((t: Transaction) => t.accountId === Number.parseInt(accountId))
    // console.log('Account transaction', accountFilteredTransactions)
    let startDate: Date
    let endDate: Date
    let trendInterval: "day" | "month" | "year"
    let rangeDescription: string
    const now = new Date()

    if (period === "month") {
      startDate = startOfMonth(displayDate)
      endDate = endOfMonth(displayDate)
      if (isAfter(endDate, now)) endDate = now
      trendInterval = "day"
      rangeDescription = `in ${format(displayDate, "MMMM yyyy")}`
    } else if (period === "year") {
      startDate = startOfYear(displayDate)
      endDate = endOfYear(displayDate)
      if (isAfter(endDate, now)) endDate = now
      trendInterval = "month"
      rangeDescription = `in ${format(displayDate, "yyyy")}`
    } else {
      const allDates = validTransactions.map((t: Transaction) => new Date(t.transactionDate))
      startDate = allDates.length > 0 ? min(allDates) : startOfYear(now)
      endDate = now
      trendInterval = "year"
      rangeDescription = "of all time"
    }

    const periodTransactions = accountFilteredTransactions.filter(
      (t: Transaction) => new Date(t.transactionDate) >= startDate && new Date(t.transactionDate) <= endDate,
    )

    const expenses = periodTransactions.filter((t: Transaction) => t.transactionType === "expense")
    const income = periodTransactions.filter((t: Transaction) => t.transactionType === "income")
    console.log('Expenses', expenses)
    const totalSpent = expenses.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
    const totalIncome = income.reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
    // console.log('Totoal Income' , totalIncome)
    const expenseCategoryBreakdown = expenses.reduce(
      (acc: Record<string, number>, t: Transaction) => {
        const categoryName = t.categoryName || "Other"
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

    const incomeCategoryBreakdown = income.reduce(
      (acc: Record<string, number>, t: Transaction) => {
        const categoryName = t.categoryName || "Other"
        acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount)
        return acc
      },
      {} as Record<string, number>,
    )

    const expensePieData = Object.entries(expenseCategoryBreakdown)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)

    const incomePieData = Object.entries(incomeCategoryBreakdown)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)

    let trendData: { name: string; expense: number; income: number }[] = []

    if (trendInterval === "day") {
      const days = eachDayOfInterval({ start: startDate, end: endOfMonth(startDate) })
      trendData = days.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd")
        const dayExpenses = expenses
          .filter((t: Transaction) => format(new Date(t.transactionDate), "yyyy-MM-dd") === dayStr)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        const dayIncome = income
          .filter((t: Transaction) => format(new Date(t.transactionDate), "yyyy-MM-dd") === dayStr)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        return {
          name: format(day, "d"),
          expense: dayExpenses,
          income: dayIncome,
        }
      })
    } else if (trendInterval === "month") {
      const months = eachMonthOfInterval({ start: startDate, end: endDate })
      trendData = months.map((month) => {
        const monthStr = format(month, "yyyy-MM")
        const monthExpenses = expenses
          .filter((t: Transaction) => format(new Date(t.transactionDate), "yyyy-MM") === monthStr)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        const monthIncome = income
          .filter((t: Transaction) => format(new Date(t.transactionDate), "yyyy-MM") === monthStr)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        return {
          name: format(month, "MMM"),
          expense: monthExpenses,
          income: monthIncome,
        }
      })
    } else if (trendInterval === "year") {
      const startYear = getYear(startDate)
      const endYear = getYear(endDate)
      const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
      trendData = years.map((year) => {
        const yearExpenses = expenses
          .filter((t: Transaction) => getYear(new Date(t.transactionDate)) === year)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        const yearIncome = income
          .filter((t: Transaction) => getYear(new Date(t.transactionDate)) === year)
          .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0)
        return {
          name: String(year),
          expense: yearExpenses,
          income: yearIncome,
        }
      })
    }

    return {
      totalSpent,
      totalIncome,
      expensePieData,
      incomePieData,
      trendData,
      rangeDescription,
    }
  }, [period, accountId, displayDate, transactions])

  const { totalSpent, totalIncome, expensePieData, incomePieData, trendData, rangeDescription } = analyticsData

  const formatCurrency = useCallback(
    (value: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(value),
    [currency],
  )

  if (aError || tError) return <div>Failed to load data.</div>
  if (!transactions || !accounts) return <AnalyticsSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Get a detailed view of your finances.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account: Account) => (
                <SelectItem key={account.accountId} value={account.accountId.toString()}>
                  {account.accountName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "month" | "year" | "all")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {period !== "all" && (
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold tabular-nums">
            {period === "month" ? format(displayDate, "MMMM yyyy") : format(displayDate, "yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={handleNext} disabled={isFutureDisabled}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <ArrowDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">Total spending {rangeDescription}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">Total income {rangeDescription}</p>
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
                  totalIncome - totalSpent >= 0 ? "text-green-500" : "text-destructive"
                }`}
              >
                {formatCurrency(totalIncome - totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">Income vs. Expenses {rangeDescription}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expense Trend</CardTitle>
              <CardDescription>A comparison of your income and expenses {rangeDescription}.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: currency,
                          notation: "compact",
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="expense" name="Expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="income" name="Income" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Spending by category {rangeDescription}.</CardDescription>
            </CardHeader>
            <CardContent>
              {expensePieData.length > 0 ? (
                <ChartContainer config={{}} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`expense-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        content={<ChartTooltipContent hideLabel nameKey="name" />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No expense data available for this period
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Income Breakdown</CardTitle>
              <CardDescription>Earnings by category {rangeDescription}.</CardDescription>
            </CardHeader>
            <CardContent>
              {incomePieData.length > 0 ? (
                <ChartContainer config={{}} className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                      <Pie
                        data={incomePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {incomePieData.map((entry, index) => (
                          <Cell key={`income-cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        content={<ChartTooltipContent hideLabel nameKey="name" />}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  No income data available for this period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
