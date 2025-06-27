import { AccountType, CategoryType, TransactionType } from '@/lib/definitions'; 

export const accountTypeMap: Record<AccountType, string> = {
  bank_account: 'Bank Account',
  credit_card: 'Credit Card',
  cash: 'Cash',
  debit_card: 'Debit Card',
  e_wallet: 'E-Wallet',
};

export const categoryTypeMap: Record<CategoryType, string> = {
  income: 'Income',
  expense: 'Expense',
};

export const transactionTypeMap: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
};
