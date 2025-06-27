
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
  Banknote,
  DollarSign,
  type LucideIcon,
  HelpCircle,
} from 'lucide-react';

export const iconMap: { [key: string]: LucideIcon } = {
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
  Salary: DollarSign,
  Freelance: DollarSign,
  default: HelpCircle,
};

export const getIcon = (iconName: string | undefined): LucideIcon => {
  if (!iconName || !iconMap[iconName]) {
    return iconMap.default;
  }
  return iconMap[iconName];
};


export const accountIconMap: { [key: string]: LucideIcon } = {
  "Bank Account": Landmark,
  // "Savings": Landmark,
  "Credit Card": CreditCard,
  "Debit Card": CreditCard,
  "E-Wallet": Wallet,
  "Cash": Banknote,
  "default": HelpCircle,
}

export const getAccountIcon = (accountType: string | undefined): LucideIcon => {
  if (!accountType || !accountIconMap[accountType]) {
    return accountIconMap.default;
  }
  return accountIconMap[accountType];
}
