'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { useMarketDashboard } from '@/features/market/hooks/use-market-dashboard';
import { useI18n } from '@/i18n';

const chartConfig = {
  value: { label: '%' },
  agri: { label: 'Agri', color: 'var(--chart-1)' },
  food: { label: 'Food', color: 'var(--chart-2)' },
  oil: { label: 'Oil', color: 'var(--chart-3)' },
  metal: { label: 'Metal', color: 'var(--chart-4)' },
  other: { label: 'Other', color: 'var(--chart-5)' }
} satisfies ChartConfig;

const colors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)'
];

export function PieGraph() {
  const { t } = useI18n();
  const { data } = useMarketDashboard();
  const chartData = data.categoryShare.map((c, i) => ({
    name: c.name,
    value: c.value,
    fill: colors[i % colors.length]
  }));

  return (
    <Card className='flex flex-col'>
      <CardHeader>
        <CardTitle>{t('overview.categoryShare')}</CardTitle>
        <CardDescription>{t('overview.categoryDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='flex-1'>
        <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[250px]'>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey='name' />} />
            <Pie data={chartData} dataKey='value' nameKey='name' innerRadius={50}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey='name' />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
