import type { User, Category, Expense, Account } from './definitions';
import {
  ShoppingBag,
  HeartPulse,
  Utensils,
  Car,
  Home,
  Film,
  GraduationCap,
  Plane,
  Gift,
  Landmark,
  CreditCard,
  Wallet,
} from 'lucide-react';

export const users: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatarUrl: 'https://placehold.co/100x100.png' },
];

export const accounts: Account[] = [
  { name: "Checking Account", type: "Checking", balance: 5420.78, icon: Landmark },
  { name: "Savings Account", type: "Savings", balance: 12850.21, icon: Landmark },
  { name: "Venture Card", type: "Credit Card", balance: -750.43, icon: CreditCard },
  { name: "Digital Wallet", type: "Wallet", balance: 345.67, icon: Wallet },
]

export const categories: Category[] = [
  { id: 'cat-1', name: 'Shopping', icon: ShoppingBag },
  { id: 'cat-2', name: 'Health', icon: HeartPulse },
  { id: 'cat-3', name: 'Food', icon: Utensils },
  { id: 'cat-4', name: 'Transport', icon: Car },
  { id: 'cat-5', name: 'Housing', icon: Home },
  { id: 'cat-6', name: 'Entertainment', icon: Film },
  { id: 'cat-7', name: 'Education', icon: GraduationCap },
  { id: 'cat-8', name: 'Travel', icon: Plane },
  { id: 'cat-9', name: 'Gifts', icon: Gift },
];

export const expenses: Expense[] = [
  { id: 'exp-1', description: 'Weekly groceries', amount: 75.4, category: 'Food', date: '2024-07-20T10:00:00Z' },
  { id: 'exp-2', description: 'New sneakers', amount: 120.0, category: 'Shopping', date: '2024-07-19T15:30:00Z' },
  { id: 'exp-3', description: 'Monthly metro pass', amount: 55.0, category: 'Transport', date: '2024-07-01T08:00:00Z' },
  { id: 'exp-4', description: 'Movie tickets', amount: 25.0, category: 'Entertainment', date: '2024-07-18T20:00:00Z' },
  { id: 'exp-5', description: 'Doctor appointment', amount: 150.0, category: 'Health', date: '2024-07-15T11:00:00Z' },
  { id: 'exp-6', description: 'Dinner with friends', amount: 60.25, category: 'Food', date: '2024-07-21T19:00:00Z' },
  { id: 'exp-7', description: 'Online course subscription', amount: 15.0, category: 'Education', date: '2024-07-10T12:00:00Z' },
  { id: 'exp-8', description: 'Electricity bill', amount: 85.5, category: 'Housing', date: '2024-07-05T09:00:00Z' },
];
