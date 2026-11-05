'use client';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { monthlyTrend2026 } from '@/constants/mock-uzex';

const chartConfig = {
  valueTrn: {
    label: 'Qiymat (tn so‘m)',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-wrap items-center gap-2'>
          2026 savdo dinamikasi
          <Badge variant='outline'>
            <Icons.trendingUp />
            YTD
          </Badge>
        </CardTitle>
        <CardDescription>Yanvar — oktyabr, trillion so‘m</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <AreaChart data={[...monthlyTrend2026]} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id='fillValue' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='var(--color-valueTrn)' stopOpacity={0.8} />
                <stop offset='95%' stopColor='var(--color-valueTrn)' stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey='valueTrn'
              type='natural'
              fill='url(#fillValue)'
              stroke='var(--color-valueTrn)'
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
