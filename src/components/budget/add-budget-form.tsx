"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Budget, Category } from "@/lib/definitions"
import { postData, putData } from "@/lib/api"
import useSWR, { useSWRConfig } from "swr"
import { fetcher } from "@/lib/api"
import { getIcon } from "@/lib/icon-map"
import React from "react"
import { handleApiCall } from "@/lib/error-handler"

const formSchema = z
  .object({
    categoryId: z.string().min(1, {
      message: "Please select a category.",
    }),
    amount: z.coerce.number().positive({
      message: "Budget amount must be a positive number.",
    }),
    period: z.enum(["weekly", "monthly", "quarterly", "yearly"], {
      required_error: "Please select a period.",
    }),
    startDate: z.date({
      required_error: "Start date is required.",
    }),
    endDate: z.date({
      required_error: "End date is required.",
    }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })

type AddBudgetFormProps = {
  budget?: Budget
  onFinished?: () => void
}

export function AddBudgetForm({ budget, onFinished }: AddBudgetFormProps) {
  const { mutate } = useSWRConfig()
  const { data: categories, error } = useSWR<Category[]>("/categories", fetcher)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: budget?.categoryId?.toString() ?? "",
      amount: budget?.amount ?? 0,
      period: budget?.period ?? "monthly",
      startDate: budget?.startDate ? new Date(budget.startDate) : new Date(),
      endDate: budget?.endDate ? new Date(budget.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  })

  React.useEffect(() => {
    if (budget) {
      form.reset({
        categoryId: budget.categoryId.toString(),
        amount: budget.amount,
        period: budget.period,
        startDate: new Date(budget.startDate),
        endDate: new Date(budget.endDate),
      })
    }
  }, [budget, form])

  // Auto-calculate end date based on period and start date
  const watchPeriod = form.watch("period")
  const watchStartDate = form.watch("startDate")

  React.useEffect(() => {
    if (watchStartDate && watchPeriod && !budget) {
      const startDate = new Date(watchStartDate)
      const endDate = new Date(startDate)

      switch (watchPeriod) {
        case "weekly":
          endDate.setDate(startDate.getDate() + 7)
          break
        case "monthly":
          endDate.setMonth(startDate.getMonth() + 1)
          break
        case "quarterly":
          endDate.setMonth(startDate.getMonth() + 3)
          break
        case "yearly":
          endDate.setFullYear(startDate.getFullYear() + 1)
          break
      }

      form.setValue("endDate", endDate)
    }
  }, [watchPeriod, watchStartDate, form, budget])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      ...values,
      categoryId: Number.parseInt(values.categoryId),
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    }

    const result = await handleApiCall(
      () => (budget ? putData(`/budgets/${budget.budgetId}`, payload) : postData("/budgets", payload)),
      budget ? "BUDGET_UPDATED" : "BUDGET_CREATED",
    )

    if (result) {
      mutate("/budgets")
      onFinished?.()
    }
  }

  const expenseCategories = categories?.filter((cat) => cat.categoryType === "expense") || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!budget}>
                <FormControl>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((cat) => {
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
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" className="h-9" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Period</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full h-9 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "MMM dd") : <span>Start date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
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
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full h-9 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "MMM dd") : <span>End date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full h-9">
          {budget ? "Update Budget" : "Create Budget"}
        </Button>
      </form>
    </Form>
  )
}
