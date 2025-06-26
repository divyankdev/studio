
'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format, subMonths } from 'date-fns';
import type { Transaction } from '@/lib/definitions';

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
};

export function Overview({ transactions }: { transactions: Transaction[] }) {
  const data = React.useMemo(() => {
    const now = new Date();
    // Get data for the last 12 months
    const monthlyData: { [key: string]: number } = {};
    
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthKey = format(month, 'yyyy-MM');
      monthlyData[monthKey] = 0;
    }

    transactions.forEach(transaction => {
      if (transaction.transactionType === 'expense') {
        const monthKey = format(new Date(transaction.transactionDate), 'yyyy-MM');
        if (monthKey in monthlyData) {
          monthlyData[monthKey] += transaction.amount;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, total]) => ({
      name: format(new Date(month + '-02'), 'MMM'), // Use day 2 to avoid timezone issues
      total
    }));
  }, [transactions]);

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
           <Tooltip cursor={{ fill: 'hsl(var(--card))' }} content={<ChartTooltipContent />} />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
