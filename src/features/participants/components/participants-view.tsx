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
import { marketKpis, topParticipants } from '@/constants/mock-uzex';
import { formatInt, formatTrn } from '@/lib/uzex-format';

export function ParticipantsView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Ishtirokchilar'
          value={formatInt(marketKpis.participants)}
          hint='Sotuvchi va xaridor STIRlar'
        />
        <KpiCard label='Top sotuvchi' value='Agro Trade LLC' hint='6.4 tn savdo qiymati' />
        <KpiCard label='Top xaridor' value='Grain Market JSC' hint='5.1 tn savdo qiymati' />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ishtirokchilar tahlili</CardTitle>
          <CardDescription>Eng faol ishtirokchilar (namuna)</CardDescription>
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
                <TableRow key={p.name}>
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
