'use client';

import * as React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
};

export function Overview() {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    const generatedData = [
      { name: 'Jan', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Feb', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Mar', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Apr', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'May', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Jun', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Jul', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Aug', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Sep', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Oct', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Nov', total: Math.floor(Math.random() * 2000) + 500 },
      { name: 'Dec', total: Math.floor(Math.random() * 2000) + 500 },
    ];
    setData(generatedData);
  }, []);

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
