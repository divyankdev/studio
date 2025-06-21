
import type { LucideIcon } from "lucide-react";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type Transaction = {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO 8601 format
  type: 'income' | 'expense';
};

export type Account = {
  id: string;
  name: string;
  type: "Checking" | "Savings" | "Credit Card" | "Wallet";
  balance: number;
  icon: LucideIcon;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
}

export type RecurringTransaction = {
  id: string;
  name: string;
  accountId: string;
  category: string;
  amount: number;
  frequency: 'Monthly' | 'Weekly' | 'Yearly';
  nextDate: string;
  endDate: string;
  type: 'income' | 'expense';
};

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';
export type DateFormat = 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
export type Language = 'en' | 'es' | 'fr';

export interface Settings {
  currency: Currency;
  dateFormat: DateFormat;
  language: Language;
}
