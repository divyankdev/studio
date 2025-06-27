"use client"

import React from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ArrowUp, ArrowDown, Repeat } from "lucide-react"
import { Overview } from "@/components/dashboard/overview"
import { RecentTransactions } from "@/components/dashboard/recent-sales"
import { UpcomingRecurring } from "@/components/dashboard/upcoming-recurring"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/contexts/settings-context"
import { fetcher } from "@/lib/api"
import type { Transaction, Account } from "@/lib/definitions"
import { Skeleton } from "@/components/ui/skeleton"
import { getAccountIcon } from "@/lib/icon-map"

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={`skeleton-card-${i}`} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="pl-2">
            <Skeleton className="h-[250px]" />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={`skeleton-transaction-${i}`} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={`skeleton-recurring-${i}`} className="flex items-center gap-4">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-16 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [accountId, setAccountId] = React.useState("all")
  const { currency } = useSettings()

  const { data: transactions, error: transactionsError } = useSWR("/transactions", fetcher)
  const { data: accounts, error: accountsError } = useSWR("/accounts", fetcher)

  const filteredTransactions = React.useMemo(() => {
    if (!Array.isArray(transactions)) {
      return []
    }

    if (accountId === "all") {
      return transactions
    }
    return transactions.filter((t: Transaction) => String(t.accountId) === String(accountId))
  }, [accountId, transactions])

  const totalIncome = filteredTransactions
    .filter((t: Transaction) => t.transactionType === "income")
    .reduce((acc: number, t: Transaction) => acc + Number(t.amount || 0), 0)
  const totalExpenses = filteredTransactions
    .filter((t: Transaction) => t.transactionType === "expense")
    .reduce((acc: number, t: Transaction) => acc + Number(t.amount || 0), 0)
  const netBalance = totalIncome - totalExpenses

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value)
  }

  if (transactionsError || accountsError) {
    console.error("API Error:", { transactionsError, accountsError })
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-6">
          <CardContent>
            <p className="text-destructive">Failed to load dashboard data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!transactions || !accounts) return <DashboardSkeleton />

  return (
    <div className="flex-1 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="w-[200px]">
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((account: Account) => {
                const Icon = getAccountIcon(account.accountType)
                return (
                  <SelectItem key={account.accountId} value={String(account.accountId)}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {account.accountName}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">In the current period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">In the current period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netBalance)}</div>
            <p className="text-xs text-muted-foreground">Balance for this month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview transactions={filteredTransactions} />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>You had {filteredTransactions.length} transactions this month.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions transactions={filteredTransactions} accounts={accounts} accountId={accountId} />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Upcoming Recurring Transactions
            </CardTitle>
            <CardDescription>A look at your upcoming bills and income.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingRecurring accountId={accountId} accounts={accounts} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
