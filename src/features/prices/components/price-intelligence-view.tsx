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
import { useMarketDashboard } from '@/features/market/hooks/use-market-dashboard';
import { formatInt, formatPct } from '@/lib/uzex-format';
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
  cotton: { label: 'Paxta (mln/t)', color: 'var(--chart-1)' },
  wheat: { label: 'Bug‘doy (mln/t)', color: 'var(--chart-2)' },
  diesel: { label: 'Dizel (mln/t)', color: 'var(--chart-3)' }
} satisfies ChartConfig;

export function PriceIntelligenceView() {
  const { data } = useMarketDashboard();
  const { priceKpis, priceSeries, regionalPrices, datasetNote } = data;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Paxta o‘rtacha'
          value={`${priceKpis.cottonAvgMln.toFixed(2)} mln/t`}
          hint='2026 · mln so‘m / tonna (kg→tonna normallashtirilgan)'
        />
        <KpiCard
          label='YoY o‘sish'
          value={formatPct(priceKpis.cottonYoyPct)}
          hint='Paxta xomashyosi · 2025 ga nisbatan'
          trend={{
            value: formatPct(priceKpis.cottonYoyPct),
            up: priceKpis.cottonYoyPct >= 0
          }}
        />
        <KpiCard
          label='Eng qimmat hudud'
          value={priceKpis.topRegion}
          hint={`Paxta o‘rtacha ${priceKpis.topRegionAvgMln.toFixed(2)} mln/t`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Narx dinamikasi</CardTitle>
          <CardDescription>Asosiy tovarlar · mln so‘m / tonna</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className='aspect-auto h-[280px] w-full'>
            <LineChart data={priceSeries} margin={{ left: 12, right: 12 }}>
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
                <TableHead className='text-right'>O‘rtacha (mln/t)</TableHead>
                <TableHead className='text-right'>Bitimlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionalPrices.map((row) => (
                <TableRow key={`${row.region}-${row.product}`}>
                  <TableCell className='font-medium'>{row.region}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell className='text-right tabular-nums'>{row.avgMln.toFixed(2)}</TableCell>
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
