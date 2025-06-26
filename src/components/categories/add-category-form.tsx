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
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/definitions';
import { postData, putData } from '@/lib/api';
import { useSWRConfig } from 'swr';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { iconMap, getIcon } from '@/lib/icon-map';

const formSchema = z.object({
  categoryName: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
  icon: z.string().min(1, {
    message: 'Please select an icon.'
  }),
  categoryType: z.enum(['income', 'expense'])
});

type AddCategoryFormProps = {
  category?: Category;
  onFinished?: () => void;
};

export function AddCategoryForm({ category, onFinished }: AddCategoryFormProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: category?.categoryName ?? '',
      icon: category?.icon ?? '',
      categoryType: category?.categoryType ?? 'expense',
    },
  });
  
  React.useEffect(() => {
    if (category) {
      form.reset({
        categoryName: category.categoryName ?? '',
        icon: category.icon ?? '',
        categoryType: category.categoryType ?? '',
      });
    }
  }, [category, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // const payload = {
      //   category_name: values.categoryType, // send as category_name
      //   name: values.name,
      //   icon: values.icon,
      // };
      if (category) {
        await putData(`/categories/${category.categoryId}`, values);
      } else {
        await postData('/categories', values);
      }
      mutate('/categories');
      toast({
        title: category ? 'Category Updated!' : 'Category Added!',
        description: `Saved category "${values.categoryName}".`,
      });
      onFinished?.();
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save category.' });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="categoryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(iconMap).filter(key => key !== 'default').map((iconName) => {
                      const Icon = getIcon(iconName);
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {iconName}
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
        <Button type="submit" className="w-full">
          {category ? 'Save Changes' : 'Add Category'}
        </Button>
      </form>
    </Form>
  );
}
