
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
import type { Category, Account, Transaction } from '@/lib/definitions';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { AddCategoryDialog } from '@/components/categories/add-category-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CategoryTransactionsDialog } from '@/components/categories/category-transactions-dialog';
import { fetcher, deleteData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { getIcon, getAccountIcon } from '@/lib/icon-map';
import { useToast } from '@/hooks/use-toast';

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const { mutate } = useSWRConfig();
  const { data: categories, error: cError } = useSWR<Category[]>('/categories', fetcher);
  const { data: accounts, error: aError } = useSWR<Account[]>('/accounts', fetcher);
  const { data: transactions, error: tError } = useSWR<Transaction[]>('/transactions', fetcher);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [accountId, setAccountId] = React.useState('all');
  const [transactionsModalOpen, setTransactionsModalOpen] =
    React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteData(`/categories/${categoryId}`);
      mutate('/categories');
      toast({ title: 'Category deleted successfully' });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error deleting category',
        description: 'Please try again.',
      });
    }
  };
  
  const categoryTransactionCounts = React.useMemo(() => {
    if (!categories || !transactions) return [];

    const filteredTransactions =
      accountId === 'all'
        ? transactions
        : transactions.filter((t) => t.accountId === accountId);

    return categories.map((category) => {
      const count = filteredTransactions.filter(
        (t) => t.category === category.name
      ).length;
      return { ...category, transactionCount: count };
    });
  }, [accountId, categories, transactions]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setTransactionsModalOpen(true);
  };

  if (cError || aError || tError) return <div>Failed to load data</div>;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your expense categories.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[200px]">
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map((account) => {
                  const Icon = getAccountIcon(account.type);
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {account.name}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <AddCategoryDialog
            open={addDialogOpen || !!editingCategory}
            onOpenChange={(isOpen) => {
              if(!isOpen) {
                setAddDialogOpen(false)
                setEditingCategory(null)
              } else {
                setAddDialogOpen(true)
              }
            }}
            category={editingCategory ?? undefined}
          >
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </AddCategoryDialog>
        </div>
      </div>
      {!categories ? <CategoriesSkeleton /> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categoryTransactionCounts.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Card
                  key={category.id}
                  className="h-full hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        {category.name}
                      </CardTitle>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => setEditingCategory(category)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onSelect={() => handleDelete(category.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.transactionCount} transaction
                      {category.transactionCount !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>
              )
            }
          )}
        </div>
      )}
      <CategoryTransactionsDialog
        open={transactionsModalOpen}
        onOpenChange={setTransactionsModalOpen}
        category={selectedCategory}
        accountId={accountId}
      />
    </div>
  );
}
