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

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO 8601 format
};

export type Account = {
  name: string;
  type: "Checking" | "Savings" | "Credit Card" | "Wallet";
  balance: number;
  icon: LucideIcon;
};
