'use client';

import React, { useEffect } from 'react';
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
import { useRouter } from 'next/navigation';

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
  const { data: categories, error: cError } = useSWR('/categories', fetcher);
  const { data: accounts, error: aError } = useSWR('/accounts', fetcher);
  const { data: transactions, error: tError } = useSWR('/transactions', fetcher);
  const router = useRouter();

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [accountId, setAccountId] = React.useState('all');
  const [transactionsModalOpen, setTransactionsModalOpen] =
    React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  // const categories = categoriesData?.data || [];
  // const accounts = accountsData?.data || [];
  // const transactions = transactionsData?.data || [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login');
      }
    }
  }, [router]);

  const handleDelete = async (categoryId: number) => {
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
        : transactions.filter((t: Transaction) => t.accountId === parseInt(accountId));

    return categories.map((category: Category) => {
      const count = filteredTransactions.filter(
        (t: Transaction) => t.categoryId === category.categoryId
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
                {accounts?.map((account: Account) => {
                  const Icon = getAccountIcon(account.accountType);
                  return (
                    <SelectItem key={account.accountId} value={account.accountId.toString()}>
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
          {categoryTransactionCounts.map((category: Category & { transactionCount: number }) => {
              const Icon = getIcon(category.icon);
              console.log(category.icon);
              return (
                <Card
                  key={category.categoryId}
                  className="h-full hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5 text-primary" />
                        {category.categoryName}
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
                              onSelect={() => handleDelete(category.categoryId)}
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
