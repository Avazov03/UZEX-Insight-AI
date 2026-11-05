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
import { formatInt, formatTrn } from '@/lib/uzex-format';

export function ParticipantsView() {
  const { data } = useMarketDashboard();
  const { kpis, topParticipants, topSeller, topBuyer, datasetNote } = data;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Ishtirokchilar'
          value={formatInt(kpis.participants)}
          hint='Sotuvchi va xaridor STIRlar'
        />
        <KpiCard
          label='Top sotuvchi'
          value={topSeller?.name ?? '—'}
          hint={topSeller ? `${formatTrn(topSeller.valueTrn)} savdo` : '—'}
        />
        <KpiCard
          label='Top xaridor'
          value={topBuyer?.name ?? '—'}
          hint={topBuyer ? `${formatTrn(topBuyer.valueTrn)} savdo` : '—'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ishtirokchilar tahlili</CardTitle>
          <CardDescription>Eng faol sotuvchi / xaridorlar (Postgres)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomi</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Hudud</TableHead>
                <TableHead className='text-right'>Bitimlar</TableHead>
                <TableHead className='text-right'>Qiymat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topParticipants.map((p) => (
                <TableRow key={`${p.role}-${p.name}`}>
                  <TableCell className='font-medium'>{p.name}</TableCell>
                  <TableCell>
                    <Badge variant={p.role === 'Sotuvchi' ? 'default' : 'secondary'}>
                      {p.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.region}</TableCell>
                  <TableCell className='text-right tabular-nums'>{formatInt(p.deals)}</TableCell>
                  <TableCell className='text-right tabular-nums'>{formatTrn(p.valueTrn)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
