
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
import type { Account } from '@/lib/definitions';
import { postData, putData } from '@/lib/api';
import { useSWRConfig } from 'swr';
import React from 'react';

const formSchema = z.object({
  accountName: z.string().min(2, {
    message: 'Account name must be at least 2 characters.',
  }),
  accountType: z.enum(['bank_account', 'credit_card', 'cash', 'debit_card', 'e_wallet']),
  currentBalance: z.coerce.number(),
});

type AddAccountFormProps = {
  account?: Account;
  onFinished?: () => void;
};

export function AddAccountForm({ account, onFinished }: AddAccountFormProps) {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountName: account?.accountName ?? '',
      accountType: account?.accountType ?? 'bank_account',
      currentBalance: account?.currentBalance ?? 0,
    },
  });

  React.useEffect(() => {
    if (account) {
      form.reset(account);
    }
  }, [account, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (account) {
        await putData(`/accounts/${account.accountId}`, values);
      } else {
        await postData('/accounts', values);
      }
      mutate('/accounts'); // Revalidate the accounts list
      toast({
        title: account ? 'Account Updated!' : 'Account Added!',
        description: `Saved account "${values.accountName}".`,
      });
      onFinished?.();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to save account. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Primary Checking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bank_account">Bank Account</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="eWallet">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currentBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {account ? 'Save Changes' : 'Add Account'}
        </Button>
      </form>
    </Form>
  );
}
