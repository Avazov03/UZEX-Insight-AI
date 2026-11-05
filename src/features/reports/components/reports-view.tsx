'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatasetBanner } from '@/features/shared/components/dataset-banner';
import { useMarketDashboard } from '@/features/market/hooks/use-market-dashboard';
import { Icons } from '@/components/icons';

export function ReportsView() {
  const { data } = useMarketDashboard();

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DatasetBanner note={data.datasetNote} />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {data.reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className='flex items-center justify-between gap-2'>
                <CardTitle className='text-base'>{report.title}</CardTitle>
                <Badge variant='outline'>{report.type}</Badge>
              </div>
              <CardDescription>
                {report.id} · {report.period}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex gap-2'>
              <Button size='sm' variant='outline'>
                <Icons.post className='size-4' />
                Ko‘rish
              </Button>
              <Button size='sm' variant='secondary'>
                <Icons.fileTypePdf className='size-4' />
                PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
