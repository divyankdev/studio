
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
  icon: string;
};

export type Transaction = {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO 8601 format
  type: 'income' | 'expense';
  isRecurring?: boolean;
  frequency?: string;
  endDate?: string;
};

export type Account = {
  id: string;
  name: string;
  type: "Checking" | "Savings" | "Credit Card" | "Wallet";
  balance: number;
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
  frequency: 'Daily' | 'Weekly' |'Monthly' | 'Yearly';
  nextDate: string;
  endDate?: string;
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
