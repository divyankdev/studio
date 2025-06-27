"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { suggestCategoryAction } from "@/lib/actions"
import React from "react"
import type { Transaction, Account, Category, RecurringTransaction } from "@/lib/definitions"
import { Checkbox } from "../ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import useSWR, { useSWRConfig } from "swr"
import { fetcher, postData, putData } from "@/lib/api"
import { getIcon, getAccountIcon } from "@/lib/icon-map"
import { handleError, handleSuccess, handleApiCall } from "@/lib/error-handler"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { ChevronDown } from "lucide-react"

const formSchema = z
  .object({
    description: z.string().min(2, {
      message: "Description must be at least 2 characters.",
    }),
    amount: z.coerce.number().positive({
      message: "Amount must be a positive number.",
    }),
    date: z.date(),
    categoryId: z.coerce.number().min(1, { message: "Please select a category." }),
    accountId: z.coerce.number().min(1, { message: "Please select an account." }),
    transactionType: z.enum(["expense", "income"]),
    isRecurring: z.boolean().default(false),
    frequency: z.enum(["daily", "weekly", "bi_weekly", "monthly", "quarterly", "yearly"]).optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.isRecurring) {
        return !!data.frequency
      }
      return true
    },
    {
      message: "Frequency is required for recurring transactions.",
      path: ["frequency"],
    },
  )

type AddTransactionFormProps = {
  transaction?: Partial<Transaction & RecurringTransaction>
  onFinished?: () => void
}

export function AddTransactionForm({ transaction, onFinished }: AddTransactionFormProps) {
  const { mutate } = useSWRConfig()
  const [isSuggesting, setIsSuggesting] = React.useState(false)
  const [isRecurringOpen, setIsRecurringOpen] = React.useState(false)

  const { data: categories, error: cError } = useSWR<Category[]>("/categories", fetcher)
  const { data: accounts, error: aError } = useSWR<Account[]>("/accounts", fetcher)

  const isRecurringTransaction = transaction && "recurringId" in transaction
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction?.description ?? "",
      amount: transaction?.amount ?? undefined,
      date: isRecurringTransaction
        ? new Date((transaction as RecurringTransaction).nextDueDate)
        : transaction
          ? new Date((transaction as Transaction).transactionDate)
          : new Date(),
      categoryId: transaction?.categoryId ?? undefined,
      accountId: transaction?.accountId ?? undefined,
      transactionType: transaction?.transactionType ?? "expense",
      isRecurring: isRecurringTransaction ?? false,
      frequency: isRecurringTransaction ? (transaction as RecurringTransaction).frequency : undefined,
    },
  })

  React.useEffect(() => {
    if (transaction) {
      form.reset({
        description: transaction?.description ?? "",
        amount: transaction?.amount ?? undefined,
        date: transaction?.transactionDate ? new Date(transaction.transactionDate) : new Date(),
        categoryId: transaction?.categoryId ?? undefined,
        accountId: transaction?.accountId ?? undefined,
        transactionType: transaction?.transactionType ?? "expense",
        isRecurring: isRecurringTransaction ?? false,
        frequency: transaction?.frequency ?? undefined,
        endDate: transaction?.endDate ? new Date(transaction.endDate) : undefined,
      })
    }
  }, [transaction, form])

  const isRecurring = form.watch("isRecurring")

  React.useEffect(() => {
    setIsRecurringOpen(isRecurring)
  }, [isRecurring])

  const handleSuggestCategory = async () => {
    const description = form.getValues("description")
    if (!description) {
      handleError(null, "Please enter a description first.")
      return
    }
    setIsSuggesting(true)
    try {
      const result = await suggestCategoryAction(description)
      if (result.category) {
        const matchedCategory = categories?.find((c) => c.categoryName.toLowerCase() === result.category.toLowerCase())
        if (matchedCategory) {
          form.setValue("categoryId", matchedCategory.categoryId)
          handleSuccess("Suggestion applied!", `We've set the category to "${matchedCategory.categoryName}".`)
        } else {
          handleError(null, `AI suggested "${result.category}", but it's not in your categories list.`)
        }
      } else if (result.error) {
        handleError(null, result.error)
      }
    } catch (error) {
      handleError(error, "Failed to get category suggestion.")
    } finally {
      setIsSuggesting(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const isEdit = transaction?.transactionId || transaction?.recurringId

    if (values.isRecurring) {
      // For recurring transactions
      const recurringData = {
        accountId: values.accountId,
        categoryId: values.categoryId,
        amount: values.amount,
        frequency: values.frequency!,
        nextDueDate: values.date.toISOString().split("T")[0],
        description: values.description,
        isActive: true,
        transactionType: values.transactionType,
        ...(values.endDate && { endDate: values.endDate.toISOString().split("T")[0] }),
      }

      const result = await handleApiCall(
        () =>
          transaction?.recurringId
            ? putData(`/recurring-transactions/${transaction.recurringId}`, recurringData)
            : postData("/recurring-transactions", recurringData),
        isEdit ? "Recurring transaction updated!" : "Recurring transaction added!",
        "Failed to save recurring transaction.",
      )

      if (result) {
        mutate("/recurring-transactions")
        onFinished?.()
      }
    } else {
      // For regular transactions
      const transactionData = {
        accountId: values.accountId,
        categoryId: values.categoryId,
        amount: values.amount,
        transactionType: values.transactionType,
        description: values.description,
        transactionDate: values.date.toISOString().split("T")[0],
      }

      const result = await handleApiCall(
        () =>
          transaction?.transactionId
            ? putData(`/transactions/${transaction.transactionId}`, transactionData)
            : postData("/transactions", transactionData),
        isEdit ? "Transaction updated!" : "Transaction added!",
        "Failed to save transaction.",
      )

      if (result) {
        mutate("/transactions")
        onFinished?.()
      }
    }
  }

  // Handle loading and error states
  if (cError || aError) {
    handleError(cError || aError, "Failed to load form data.")
    return <div className="p-4 text-center text-muted-foreground">Failed to load form data</div>
  }

  if (!categories || !accounts) {
    return <div className="p-4 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm">Type</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">Income</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Description</FormLabel>
                <FormControl>
                  <Input placeholder="Coffee, groceries..." {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Account</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((acc) => {
                      const Icon = getAccountIcon(acc.accountType)
                      return (
                        <SelectItem key={acc.accountId} value={acc.accountId.toString()}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="truncate">{acc.accountName}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">{isRecurring ? "Start Date" : "Date"}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("h-9 w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "MMM dd") : <span>Pick date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Category</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => {
                      const Icon = getIcon(cat.icon)
                      return (
                        <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="truncate">{cat.categoryName}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestCategory}
                  disabled={isSuggesting}
                  className="h-9 px-3 bg-transparent"
                >
                  <Sparkles className={cn("h-4 w-4", isSuggesting && "animate-spin")} />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Collapsible open={isRecurringOpen} onOpenChange={setIsRecurringOpen}>
          <CollapsibleTrigger asChild>
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">Recurring Transaction</FormLabel>
                    <FormDescription className="text-xs">Set up automatic recurring payments</FormDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked)
                          setIsRecurringOpen(!!checked)
                        }}
                      />
                    </FormControl>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isRecurringOpen && "rotate-180")} />
                  </div>
                </FormItem>
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-9 w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? format(field.value, "MMM dd, yyyy") : <span>No end date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button type="submit" className="w-full h-9">
          {transaction?.transactionId || transaction?.recurringId ? "Update" : "Add"} Transaction
        </Button>
      </form>
    </Form>
  )
}
