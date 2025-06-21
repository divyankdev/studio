
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { categories } from '@/lib/data';
import type { Category } from '@/lib/definitions';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { AddCategoryDialog } from '@/components/categories/add-category-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function CategoriesPage() {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Manage your expense categories.
          </p>
        </div>
        <AddCategoryDialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </AddCategoryDialog>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Link
            href={`/transactions?category=${encodeURIComponent(category.name)}`}
            key={category.id}
            className="block"
          >
            <Card className="h-full hover:bg-muted/50 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <category.icon className="h-5 w-5 text-primary" />
                    {category.name}
                  </CardTitle>
                  <div onClick={(e) => e.preventDefault()}>
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
                  32 transactions
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
