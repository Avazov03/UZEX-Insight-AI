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
import { formatInt } from '@/lib/uzex-format';

export function BrokersView() {
  const { data } = useMarketDashboard();
  const { kpis, brokerStats, brokerHighlights, datasetNote } = data;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard label='Brokerlar' value={String(kpis.brokers)} hint='Ro‘yxatdagi brokerlar' />
        <KpiCard
          label='Eng yuqori bekor'
          value={brokerHighlights.highestCancelName}
          hint={`${formatInt(brokerHighlights.highestCancelCount)} bekor qilingan bitim`}
        />
        <KpiCard
          label='Eng past kechikish'
          value={brokerHighlights.lowestDelayName}
          hint={`${brokerHighlights.lowestDelayPct.toFixed(1)}% delay rate`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brokerlar reytingi</CardTitle>
          <CardDescription>Hajm, bekor qilish va kechikish</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broker</TableHead>
                <TableHead className='text-right'>Bitimlar</TableHead>
                <TableHead className='text-right'>Bekor</TableHead>
                <TableHead className='text-right'>Kechikish %</TableHead>
                <TableHead className='text-right'>Ulush %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brokerStats.map((b) => (
                <TableRow key={b.name}>
                  <TableCell className='font-medium'>{b.name}</TableCell>
                  <TableCell className='text-right tabular-nums'>{formatInt(b.deals)}</TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {formatInt(b.cancelled)}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>{b.delayPct.toFixed(1)}</TableCell>
                  <TableCell className='text-right tabular-nums'>{b.sharePct.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
