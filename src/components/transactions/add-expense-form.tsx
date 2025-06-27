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
import { CalendarIcon, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { suggestCategoryAction } from "@/lib/actions"
import React from "react"
import type { Transaction, Account, Category, RecurringTransaction } from "@/lib/definitions"
import { Checkbox } from "../ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import useSWR, { useSWRConfig } from "swr"
import { fetcher, postData, putData } from "@/lib/api"
import { getIcon, getAccountIcon } from "@/lib/icon-map"

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
  const { toast } = useToast()
  const { mutate } = useSWRConfig()
  const [isSuggesting, setIsSuggesting] = React.useState(false)

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

  const handleSuggestCategory = async () => {
    const description = form.getValues("description")
    if (!description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a description first.",
      })
      return
    }
    setIsSuggesting(true)
    try {
      const result = await suggestCategoryAction(description)
      if (result.category) {
        const matchedCategory = categories?.find((c) => c.categoryName.toLowerCase() === result.category.toLowerCase())
        if (matchedCategory) {
          form.setValue("categoryId", matchedCategory.categoryId)
          toast({
            title: "Suggestion applied!",
            description: `We've set the category to "${matchedCategory.categoryName}".`,
          })
        } else {
          toast({
            variant: "destructive",
            title: "Suggestion not found",
            description: `AI suggested "${result.category}", but it's not in your categories list.`,
          })
        }
      } else if (result.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsSuggesting(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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
        }

        if (transaction?.recurringId) {
          await putData(`/recurring-transactions/${transaction.recurringId}`, recurringData)
        } else {
          await postData("/recurring-transactions", recurringData)
        }

        mutate("/recurring-transactions")
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

        if (transaction?.transactionId) {
          await putData(`/transactions/${transaction.transactionId}`, transactionData)
        } else {
          await postData("/transactions", transactionData)
        }

        mutate("/transactions")
      }

      toast({
        title: transaction?.transactionId || transaction?.recurringId ? "Transaction Updated!" : "Transaction Added!",
        description: `Saved "${values.description}".`,
      })
      onFinished?.()
    } catch (e) {
      console.error(e)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save transaction.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="transactionType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">Expense</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">Income</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Coffee with friends" {...field} />
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
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts?.map((acc) => {
                    const Icon = getAccountIcon(acc.accountType)
                    return (
                      <SelectItem key={acc.accountId} value={acc.accountId.toString()}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {acc.accountName}
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
            <FormItem className="flex flex-col">
              <FormLabel>{isRecurring ? "Start Date" : "Date of Transaction"}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex gap-2">
                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => {
                      const Icon = getIcon(cat.icon)
                      return (
                        <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {cat.categoryName}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSuggestCategory}
                  disabled={isSuggesting}
                  aria-label="Suggest Category"
                >
                  <Sparkles className={cn("h-4 w-4", isSuggesting && "animate-spin")} />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Is this a recurring transaction?</FormLabel>
                <FormDescription>If checked, this will be added to your recurring payments.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {isRecurring && (
          <>
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick an end date</span>}
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
          </>
        )}

        <Button type="submit" className="w-full">
          {transaction?.transactionId ? "Save Changes" : "Add Transaction"}
        </Button>
      </form>
    </Form>
  )
}
