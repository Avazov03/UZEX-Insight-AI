'use client';

import { Badge } from '@/components/ui/badge';
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
import { formatInt, formatMln } from '@/lib/uzex-format';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (/bekor|kechik|аннул|отмен|cancel/i.test(status)) return 'destructive';
  if (/to‘liq|to'liq|to‘langan|to'langan|исполн|paid|выполнен/i.test(status)) return 'default';
  return 'secondary';
}

export function DealsView() {
  const { data } = useMarketDashboard();
  const { kpis, recentDeals, datasetNote } = data;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <KpiCard label='Jami bitimlar' value={formatInt(kpis.totalDeals)} hint='Unikal deal_no' />
        <KpiCard
          label='Bekor qilingan'
          value={formatInt(kpis.cancelledDeals)}
          hint='Status: Аннулирован'
        />
        <KpiCard
          label='Qisman bajarilgan'
          value={formatInt(kpis.partialDeals)}
          hint={`O‘rtacha ~${kpis.avgDeliveredPct}% yetkazilgan`}
        />
        <KpiCard
          label='Kechikish'
          value={formatInt(kpis.delayedDeals)}
          hint={`${kpis.delayRatePct}% muddat buzilishi`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bitimlar va shartnomalar</CardTitle>
          <CardDescription>So‘nggi bitimlar (Postgres)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bitim</TableHead>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Hudud</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead>Holat</TableHead>
                <TableHead className='text-right'>Qiymat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentDeals.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className='font-mono text-xs'>{d.id}</TableCell>
                  <TableCell className='font-medium'>{d.product}</TableCell>
                  <TableCell>{d.region}</TableCell>
                  <TableCell className='tabular-nums'>{d.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>{formatMln(d.valueMln)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
