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
import { priceSeries, regionalPrices } from '@/constants/mock-uzex';
import { formatInt } from '@/lib/uzex-format';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';

const chartConfig = {
  cotton: { label: 'Paxta (mln)', color: 'var(--chart-1)' },
  wheat: { label: 'Bug‘doy (mln)', color: 'var(--chart-2)' },
  diesel: { label: 'Dizel (mln)', color: 'var(--chart-3)' }
} satisfies ChartConfig;

export function PriceIntelligenceView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard label='Paxta o‘rtacha' value='18.45 mln' hint='2026 oktabr · so‘m/tonna ekv.' />
        <KpiCard
          label='YoY o‘sish'
          value='+8.4%'
          hint='Paxta xomashyosi · 2025 YTD ga nisbatan'
          trend={{ value: '+8.4%', up: true }}
        />
        <KpiCard label='Eng qimmat hudud' value='Qashqadaryo' hint='Paxta o‘rtacha 19.2 mln' />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Narx dinamikasi</CardTitle>
          <CardDescription>Asosiy tovarlar · mln so‘m (indeks)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='aspect-auto h-[280px] w-full'>
            <LineChart data={[...priceSeries]} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type='monotone'
                dataKey='cotton'
                stroke='var(--color-cotton)'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='wheat'
                stroke='var(--color-wheat)'
                strokeWidth={2}
                dot={false}
              />
              <Line
                type='monotone'
                dataKey='diesel'
                stroke='var(--color-diesel)'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hududiy narxlar</CardTitle>
          <CardDescription>O‘rtacha narx va bitimlar soni</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hudud</TableHead>
                <TableHead>Mahsulot</TableHead>
                <TableHead className='text-right'>O‘rtacha (mln)</TableHead>
                <TableHead className='text-right'>Bitimlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionalPrices.map((row) => (
                <TableRow key={`${row.region}-${row.product}`}>
                  <TableCell className='font-medium'>{row.region}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell className='text-right tabular-nums'>{row.avgMln.toFixed(1)}</TableCell>
                  <TableCell className='text-right tabular-nums'>{formatInt(row.deals)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
