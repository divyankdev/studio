'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowRightLeft,
  Shapes,
  BarChart2,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { href: '/accounts', icon: Wallet, label: 'Accounts' },
  { href: '/categories', icon: Shapes, label: 'Categories' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border md:hidden">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted group"
          >
            <item.icon
              className={cn(
                'w-5 h-5 mb-1 text-muted-foreground group-hover:text-primary',
                pathname === item.href && 'text-primary'
              )}
            />
            <span
              className={cn(
                'text-xs text-muted-foreground group-hover:text-primary',
                pathname === item.href && 'text-primary'
              )}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
