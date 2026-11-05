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
import { brokerStats, marketKpis } from '@/constants/mock-uzex';
import { formatInt } from '@/lib/uzex-format';

export function BrokersView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard label='Brokerlar' value={String(marketKpis.brokers)} hint='Ro‘yxatdagi brokerlar' />
        <KpiCard
          label='Eng yuqori bekor'
          value='Broker Gamma'
          hint='1 450 bekor qilingan bitim'
        />
        <KpiCard label='Eng past kechikish' value='Broker Delta' hint='2.4% delay rate' />
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
