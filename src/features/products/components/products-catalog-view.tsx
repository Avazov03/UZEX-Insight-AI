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

export function ProductsCatalogView() {
  const { data } = useMarketDashboard();
  const { productKpis, topProducts, datasetNote } = data;

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <KpiCard
          label='Distinct mahsulotlar'
          value={formatInt(productKpis.distinctProducts)}
          hint='deals.product_name bo‘yicha'
        />
        <KpiCard
          label='Top kategoriya'
          value={productKpis.topCategory}
          hint={`Qiymatning ~${productKpis.topCategorySharePct.toFixed(1)}% ulushi`}
        />
        <KpiCard
          label='Top mahsulot bitimlari'
          value={formatInt(topProducts[0]?.deals ?? 0)}
          hint={topProducts[0]?.name ?? '—'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mahsulotlar katalogi</CardTitle>
          <CardDescription>Eng ko‘p bitimga ega mahsulotlar (Postgres)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Kategoriya</TableHead>
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
