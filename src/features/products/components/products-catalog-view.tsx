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
import { topProducts } from '@/constants/mock-uzex';
import { formatInt, formatTrn } from '@/lib/uzex-format';

export function ProductsCatalogView() {
  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard label='Asosiy mahsulotlar' value='229' hint='Standart nomlar (normalizatsiya)' />
        <KpiCard
          label='Yozuv variantlari'
          value='697'
          hint='Bitimlarda uchraydigan nomlar xilma-xilligi'
        />
        <KpiCard
          label='Top kategoriya'
          value='Qishloq xo‘jaligi'
          hint='Qiymatning ~52% ulushi'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mahsulotlar katalogi</CardTitle>
          <CardDescription>
            Nom normalizatsiyasi: marka / sort / o‘lcham farqi saqlanadi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead className='text-right'>Variantlar</TableHead>
                <TableHead className='text-right'>Bitimlar</TableHead>
                <TableHead className='text-right'>Qiymat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className='font-medium'>{p.name}</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{p.category}</Badge>
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>{p.variants}</TableCell>
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
