
'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { accounts } from '@/lib/data';
import type { Account } from '@/lib/definitions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';

export default function AccountsPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingAccount, setEditingAccount] = React.useState<Account | null>(
    null
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected bank accounts and cards.
          </p>
        </div>
        <AddAccountDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <Button onClick={() => setAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Account
          </Button>
        </AddAccountDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {account.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <account.icon className="h-5 w-5 text-muted-foreground" />
                <div onClick={(e) => e.preventDefault()}>
                  <AddAccountDialog
                    account={account}
                    open={editingAccount?.id === account.id}
                    onOpenChange={(isOpen) =>
                      setEditingAccount(isOpen ? account : null)
                    }
                  >
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
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </AddAccountDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {account.balance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground">{account.type}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
