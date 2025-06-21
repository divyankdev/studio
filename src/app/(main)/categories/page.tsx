
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { accounts, categories, transactions } from '@/lib/data';
import type { Category } from '@/lib/definitions';
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

export default function CategoriesPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [accountId, setAccountId] = React.useState('all');
  const [transactionsModalOpen, setTransactionsModalOpen] =
    React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  const categoryTransactionCounts = React.useMemo(() => {
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
  }, [accountId]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setTransactionsModalOpen(true);
  };

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
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <account.icon className="h-4 w-4" />
                      {account.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AddCategoryDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
          >
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </AddCategoryDialog>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categoryTransactionCounts.map((category) => (
          <Card
            key={category.id}
            className="h-full hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => handleCategoryClick(category)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.name}
                </CardTitle>
                <div onClick={(e) => e.stopPropagation()}>
                  <AddCategoryDialog
                    category={category}
                    open={editingCategory?.id === category.id}
                    onOpenChange={(isOpen) =>
                      setEditingCategory(isOpen ? category : null)
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
                          onSelect={() => setEditingCategory(category)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </AddCategoryDialog>
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
        ))}
      </div>
      <CategoryTransactionsDialog
        open={transactionsModalOpen}
        onOpenChange={setTransactionsModalOpen}
        category={selectedCategory}
        accountId={accountId}
      />
    </div>
  );
}
