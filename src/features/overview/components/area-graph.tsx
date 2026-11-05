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
import { useMarketDashboard } from '@/features/market/hooks/use-market-dashboard';
import { useI18n } from '@/i18n';

const chartConfig = {
  valueTrn: {
    label: 'Value',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  const { t } = useI18n();
  const { data } = useMarketDashboard();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex flex-wrap items-center gap-2'>
          {t('overview.trend2026')}
          <Badge variant='outline'>
            <Icons.trendingUp />
            YTD
          </Badge>
        </CardTitle>
        <CardDescription>{t('overview.trendDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='aspect-auto h-[250px] w-full'>
          <AreaChart data={data.monthlyTrend} margin={{ left: 12, right: 12 }}>
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
