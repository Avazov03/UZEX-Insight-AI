'use client';

import { Icons } from '@/components/icons';
import { useI18n } from '@/i18n';

export function DatasetBanner({ note }: { note?: string }) {
  const { t } = useI18n();

  return (
    <div className='bg-muted/50 text-muted-foreground flex items-start gap-2 rounded-lg border px-3 py-2 text-xs'>
      <Icons.info className='text-primary mt-0.5 size-3.5 shrink-0' />
      <p>{note ?? t('common.datasetNote')}</p>
    </div>
  );
}
