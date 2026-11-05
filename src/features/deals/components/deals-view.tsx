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
import { marketKpis, recentDeals } from '@/constants/mock-uzex';
import { formatInt, formatMln } from '@/lib/uzex-format';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status.includes('Bekor') || status.includes('kechik')) return 'destructive';
  if (status.includes('To‘liq') || status.includes('To‘langan')) return 'default';
  return 'secondary';
}

export function DealsView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
        <KpiCard label='Jami bitimlar' value={formatInt(marketKpis.totalDeals)} hint='Unikal ID' />
        <KpiCard
          label='Bekor qilingan'
          value={formatInt(marketKpis.cancelledDeals)}
          hint='Risk monitoring'
        />
        <KpiCard
          label='Qisman bajarilgan'
          value={formatInt(marketKpis.partialDeals)}
          hint='O‘rtacha ~60.9% yetkazilgan'
        />
        <KpiCard
          label='Kechikish'
          value={formatInt(marketKpis.delayedDeals)}
          hint={`${marketKpis.delayRatePct}% muddat buzilishi`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bitimlar va shartnomalar</CardTitle>
          <CardDescription>So‘nggi namuna bitimlar</CardDescription>
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
