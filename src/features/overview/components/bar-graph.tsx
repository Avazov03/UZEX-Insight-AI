'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { yearlyVolume } from '@/constants/mock-uzex';

const chartConfig = {
  deals: {
    label: 'Bitimlar',
    color: 'var(--chart-1)'
  },
  valueTrn: {
    label: 'Qiymat (tn)',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-wrap items-center gap-2'>
          Yillik hajm
          <Badge variant='outline'>
            <Icons.chartBar />
            2022–2026
          </Badge>
        </CardTitle>
        <CardDescription>Bitimlar soni va qiymat (trillion so‘m)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <BarChart data={[...yearlyVolume]} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey='year' tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey='deals' fill='var(--color-deals)' radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
