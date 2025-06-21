
'use client';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import type { Account } from '@/lib/definitions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { useSettings } from '@/contexts/settings-context';
import { fetcher, deleteData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getAccountIcon } from '@/lib/icon-map';

function AccountsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-24 mt-2" />
            <Skeleton className="h-4 w-16 mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AccountsPage() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: accounts, error } = useSWR<Account[]>('/accounts', fetcher);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(
    null
  );
  const { currency } = useSettings();

  const handleDelete = async (accountId: string) => {
    try {
      await deleteData(`/accounts/${accountId}`);
      mutate('/accounts');
      toast({ title: 'Account deleted successfully' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error deleting account',
        description: 'Please try again.',
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected bank accounts and cards.
          </p>
        </div>
        <AddAccountDialog
          open={addDialogOpen || !!editingAccount}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setAddDialogOpen(false);
              setEditingAccount(null);
            } else {
              setAddDialogOpen(true);
            }
          }}
          account={editingAccount ?? undefined}
        >
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </AddAccountDialog>
      </div>

      {error && (
        <div className="text-red-500">Failed to load accounts.</div>
      )}
      {!accounts && !error && <AccountsSkeleton />}
      {accounts && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            return (
              <Card key={account.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {account.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setEditingAccount(account)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => handleDelete(account.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency,
                    }).format(account.balance)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {account.type}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
