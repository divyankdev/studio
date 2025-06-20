
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddCategoryForm } from './add-category-form';
import type { Category } from '@/lib/definitions';

type AddCategoryDialogProps = {
  category?: Category;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddCategoryDialog({
  category,
  children,
  open,
  onOpenChange,
}: AddCategoryDialogProps) {
  const handleFinished = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add a New Category'}</DialogTitle>
          <DialogDescription>
            {category
              ? "Update your category details."
              : "Fill in the details to add a new category."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddCategoryForm category={category} onFinished={handleFinished} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
