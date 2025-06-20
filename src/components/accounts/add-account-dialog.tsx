
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddAccountForm } from './add-account-form';
import type { Account } from '@/lib/definitions';

type AddAccountDialogProps = {
  account?: Account;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddAccountDialog({
  account,
  children,
  open,
  onOpenChange,
}: AddAccountDialogProps) {
  const handleFinished = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add a New Account'}</DialogTitle>
          <DialogDescription>
            {account
              ? "Update your account details."
              : "Fill in the details to add a new account."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddAccountForm account={account} onFinished={handleFinished} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
