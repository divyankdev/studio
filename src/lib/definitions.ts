import type { LucideIcon } from "lucide-react";

// Enum types
export type AccountType = 'bank_account' | 'credit_card' | 'cash' | 'debit_card' | 'e_wallet';
export type CategoryType = 'income' | 'expense';
export type FrequencyType = 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'quarterly' | 'yearly';
export type PeriodType = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type TransactionType = 'income' | 'expense' | 'transfer';

// User types
export type User = {
  userId: number;
  email: string;
  firstName: string;
  lastName?: string;
  name: string;
  dateOfBirth?: string; // ISO date string
  profilePictureUrl?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastLogin?: string; // ISO timestamp
};

// Account types
export type Account = {
  accountId: number;
  userId: number;
  parentAccountId?: number;
  accountName: string;
  accountType: AccountType;
  currentBalance: number;
  lastTransactionDate?: string; // ISO date string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Category types
export type Category = {
  categoryId: number;
  userId: number;
  parentCategoryId?: number;
  categoryName: string;
  categoryType: CategoryType;
  color: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
};

// Transaction types
export type Transaction = {
  transactionId: number;
  userId: number;
  accountId: number;
  accountName?: string;
  categoryId?: number;
  categoryName?: string;
  amount: number;
  transactionType: TransactionType;
  description?: string;
  transactionDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
};

// Recurring transaction types
export type RecurringTransaction = {
  recurringId: number;
  userId: number;
  accountId: number;
  accountName?: string;
  categoryId?: number;
  categoryName?: string;
  amount: number;
  frequency: FrequencyType;
  nextDueDate: string;
  description?: string;
  isActive: boolean;
  transactionType: TransactionType; // Derived from amount or explicit
  createdAt: string;
  updatedAt: string;
};

// Budget types
export type Budget = {
  budgetId: number;
  userId: number;
  categoryId: number;
  categoryName?: string;
  amount: number;
  spent: number;
  remaining: number;
  period: PeriodType;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  isActive: boolean;
  percentageUsed: number;
  createdAt: string;
  updatedAt: string;
};

// Attachment types
export type Attachment = {
  attachmentId: number;
  transactionId: number;
  filePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
};

// Settings types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'CAD' | 'AUD';
export type DateFormat = 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'dd-MM-yyyy';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';

export interface Settings {
  currency: Currency;
  dateFormat: DateFormat;
  language: Language;
  timezone?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    transactionAlerts: boolean;
  };
}

// Form types for creating/updating
export type CreateUserRequest = Omit<User, 'userId' | 'createdAt' | 'updatedAt' | 'lastLogin'>;

export type CreateAccountRequest = Omit<Account, 'accountId' | 'balance' | 'lastTransactionDate' | 'createdAt' | 'updatedAt'>;

export type CreateTransactionRequest = Omit<Transaction, 'transactionId' | 'accountName' | 'categoryName' | 'createdAt' | 'updatedAt'>;

export type CreateCategoryRequest = Omit<Category, 'categoryId' | 'createdAt' | 'updatedAt'>;

export type CreateBudgetRequest = Omit<Budget, 'budgetId' | 'categoryName' | 'spent' | 'remaining' | 'percentageUsed' | 'createdAt' | 'updatedAt'>;

export type CreateRecurringTransactionRequest = Omit<RecurringTransaction, 'recurringId' | 'accountName' | 'categoryName' | 'createdAt' | 'updatedAt'>;

// Update types (all fields optional except ID)
export type UpdateUserRequest = Partial<Omit<User, 'userId' | 'createdAt'>> & { userId: number };

export type UpdateAccountRequest = Partial<Omit<Account, 'accountId' | 'createdAt'>> & { accountId: number };

export type UpdateTransactionRequest = Partial<Omit<Transaction, 'transactionId' | 'createdAt'>> & { transactionId: number };

export type UpdateCategoryRequest = Partial<Omit<Category, 'categoryId' | 'createdAt'>> & { categoryId: number };

export type UpdateBudgetRequest = Partial<Omit<Budget, 'budgetId' | 'createdAt'>> & { budgetId: number };

export type UpdateRecurringTransactionRequest = Partial<Omit<RecurringTransaction, 'recurringId' | 'createdAt'>> & { recurringId: number };

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Dashboard/Analytics types
export type AccountSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  accountBreakdown: {
    accountType: AccountType;
    balance: number;
    count: number;
  }[];
};

export type CategorySummary = {
  categoryId: number;
  categoryName: string;
  totalSpent: number;
  transactionCount: number;
  percentage: number;
};

export type MonthlySpending = {
  month: string; // YYYY-MM format
  income: number;
  expenses: number;
  net: number;
};

// Filter types for queries
export type TransactionFilters = {
  accountId?: number;
  categoryId?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Export LucideIcon type
export type { LucideIcon };