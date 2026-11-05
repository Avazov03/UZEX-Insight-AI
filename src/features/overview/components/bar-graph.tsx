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
import { useMarketDashboard } from '@/features/market/hooks/use-market-dashboard';
import { useI18n } from '@/i18n';

const chartConfig = {
  deals: {
    label: 'Deals',
    color: 'var(--chart-1)'
  },
  valueTrn: {
    label: 'Value',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const { t } = useI18n();
  const { data } = useMarketDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-wrap items-center gap-2'>
          {t('overview.yearlyVolume')}
          <Badge variant='outline'>
            <Icons.chartBar />
            {data.yearlyVolume[0]?.year ?? '—'}–{data.yearlyVolume.at(-1)?.year ?? '—'}
          </Badge>
        </CardTitle>
        <CardDescription>{t('overview.yearlyDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <BarChart data={data.yearlyVolume} margin={{ left: 12, right: 12 }}>
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
