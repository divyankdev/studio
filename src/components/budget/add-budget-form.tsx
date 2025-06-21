
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Budget, Category } from '@/lib/definitions';
import { postData, putData } from '@/lib/api';
import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '@/lib/api';
import { getIcon } from '@/lib/icon-map';
import React from 'react';

const formSchema = z.object({
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
  amount: z.coerce.number().positive({
    message: 'Budget amount must be a positive number.',
  }),
});

type AddBudgetFormProps = {
  budget?: Budget;
  onFinished?: () => void;
};

export function AddBudgetForm({ budget, onFinished }: AddBudgetFormProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: categories, error } = useSWR<Category[]>('/categories', fetcher);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: budget?.category ?? '',
      amount: budget?.amount ?? 0,
    },
  });

  React.useEffect(() => {
    if (budget) {
      form.reset({
        category: budget.category,
        amount: budget.amount,
      });
    }
  }, [budget, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (budget) {
        await putData(`/budgets/${budget.id}`, values);
      } else {
        await postData('/budgets', values);
      }
      mutate('/budgets');
      toast({
        title: budget ? 'Budget Updated!' : 'Budget Created!',
        description: `Budget for "${values.category}" has been saved.`,
      });
      onFinished?.();
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to save budget.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!budget}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                   {categories?.map((cat) => {
                      const Icon = getIcon(cat.icon);
                      return (
                        <SelectItem key={cat.id} value={cat.name}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {cat.name}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="500.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {budget ? 'Save Changes' : 'Create Budget'}
        </Button>
      </form>
    </Form>
  );
}
