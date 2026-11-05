'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DatasetBanner } from '@/features/shared/components/dataset-banner';
import { KpiCard } from '@/features/shared/components/kpi-card';
import { categoryShare, dealStatusShare, marketKpis } from '@/constants/mock-uzex';
import { formatInt, formatTrn } from '@/lib/uzex-format';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartConfig = {
  value: { label: 'Ulush %', color: 'var(--chart-1)' }
} satisfies ChartConfig;

export function MarketAnalyticsView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Qishloq xo‘jaligi ulushi'
          value='51.77%'
          hint='Qiymat bo‘yicha eng katta kategoriya'
        />
        <KpiCard
          label='2026 YTD qiymat'
          value={formatTrn(52.05)}
          hint='2025 shu davrga nisbatan +21.1%'
          trend={{ value: '+21.1%', up: true }}
        />
        <KpiCard
          label='Shartnomalar'
          value={formatInt(marketKpis.contracts)}
          hint='Faol savdo zanjiri'
        />
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Kategoriyalar bo‘yicha qiymat</CardTitle>
            <CardDescription>Ulush (%) va taxminiy trillion so‘m</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className='aspect-auto h-[280px] w-full'>
              <BarChart
                data={[...categoryShare]}
                layout='vertical'
                margin={{ left: 16, right: 16 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey='name'
                  type='category'
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <XAxis type='number' hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='value' fill='var(--color-value)' radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bitim holatlari</CardTitle>
            <CardDescription>30.10.2026 holati</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holat</TableHead>
                  <TableHead className='text-right'>Soni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dealStatusShare.map((row) => (
                  <TableRow key={row.status}>
                    <TableCell className='font-medium'>{row.status}</TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatInt(row.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
