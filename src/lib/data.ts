import type { User, Category, Transaction, Account, RecurringTransaction } from './definitions';
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
  DollarSign,
} from 'lucide-react';

export const users: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatarUrl: 'https://placehold.co/100x100.png' },
];

export const accounts: Account[] = [
  { id: 'acc-1', name: "Checking Account", type: "Checking", balance: 5420.78, icon: Landmark },
  { id: 'acc-2', name: "Savings Account", type: "Savings", balance: 12850.21, icon: Landmark },
  { id: 'acc-3', name: "Venture Card", type: "Credit Card", balance: -750.43, icon: CreditCard },
  { id: 'acc-4', name: "Digital Wallet", type: "Wallet", balance: 345.67, icon: Wallet },
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
  { id: 'cat-10', name: 'Salary', icon: DollarSign },
  { id: 'cat-11', name: 'Freelance', icon: DollarSign },
];

export const transactions: Transaction[] = [
  { id: 'txn-1', accountId: 'acc-1', description: 'Weekly groceries', amount: 75.4, category: 'Food', date: '2024-07-20T10:00:00Z', type: 'expense' },
  { id: 'txn-2', accountId: 'acc-3', description: 'New sneakers', amount: 120.0, category: 'Shopping', date: '2024-07-19T15:30:00Z', type: 'expense' },
  { id: 'txn-3', accountId: 'acc-1', description: 'Monthly metro pass', amount: 55.0, category: 'Transport', date: '2024-07-01T08:00:00Z', type: 'expense' },
  { id: 'txn-4', accountId: 'acc-4', description: 'Movie tickets', amount: 25.0, category: 'Entertainment', date: '2024-07-18T20:00:00Z', type: 'expense' },
  { id: 'txn-5', accountId: 'acc-1', description: 'Doctor appointment', amount: 150.0, category: 'Health', date: '2024-07-15T11:00:00Z', type: 'expense' },
  { id: 'txn-6', accountId: 'acc-3', description: 'Dinner with friends', amount: 60.25, category: 'Food', date: '2024-07-21T19:00:00Z', type: 'expense' },
  { id: 'txn-7', accountId: 'acc-2', description: 'Online course subscription', amount: 15.0, category: 'Education', date: '2024-07-10T12:00:00Z', type: 'expense' },
  { id: 'txn-8', accountId: 'acc-1', description: 'Electricity bill', amount: 85.5, category: 'Housing', date: '2024-07-05T09:00:00Z', type: 'expense' },
  { id: 'txn-9', accountId: 'acc-1', description: 'Monthly Salary', amount: 3500, category: 'Salary', date: '2024-07-01T09:00:00Z', type: 'income' },
  { id: 'txn-10', accountId: 'acc-2', description: 'Freelance Project', amount: 750, category: 'Freelance', date: '2024-07-15T18:00:00Z', type: 'income' },
];


export const recurring: RecurringTransaction[] = [
  {
    id: 'rec-1',
    name: 'Netflix Subscription',
    accountId: 'acc-3',
    category: 'Entertainment',
    amount: 15.99,
    frequency: 'Monthly',
    nextDate: '2024-08-01',
    endDate: '2025-07-01',
    type: 'expense',
  },
  {
    id: 'rec-2',
    name: 'Gym Membership',
    accountId: 'acc-1',
    category: 'Health',
    amount: 40.0,
    frequency: 'Monthly',
    nextDate: '2024-08-05',
    endDate: '2025-01-05',
    type: 'expense',
  },
  {
    id: 'rec-3',
    name: 'Internet Bill',
    accountId: 'acc-1',
    category: 'Housing',
    amount: 65.0,
    frequency: 'Monthly',
    nextDate: '2024-08-10',
    endDate: '2025-07-10',
    type: 'expense',
  },
  {
    id: 'rec-4',
    name: 'Music Streaming',
    accountId: 'acc-3',
    category: 'Entertainment',
    amount: 9.99,
    frequency: 'Monthly',
    nextDate: '2024-08-15',
    endDate: '2024-12-15',
    type: 'expense',
  },
   {
    id: 'rec-5',
    name: 'Consulting Retainer',
    accountId: 'acc-2',
    category: 'Salary',
    amount: 1000.00,
    frequency: 'Monthly',
    nextDate: '2024-08-20',
    endDate: '2025-07-20',
    type: 'income',
  },
];
