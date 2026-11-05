'use client';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { InteractiveGridPattern } from './interactive-grid';
import { useI18n } from '@/i18n';

export function SignInBrandPanel() {
  const { t } = useI18n();

  return (
    <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
      <div className='bg-sidebar absolute inset-0' />
      <div className='text-sidebar-foreground relative z-20 flex items-center gap-2 text-lg font-medium'>
        <Icons.sparkles className='size-5' />
        {t('brand.name')}
      </div>
      <InteractiveGridPattern
        className={cn(
          'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
          'inset-x-0 inset-y-[0%] h-full skew-y-12'
        )}
      />
      <div className='text-sidebar-foreground relative z-20 mt-auto'>
        <blockquote className='space-y-2'>
          <p className='text-lg'>&ldquo;{t('brand.quote')}&rdquo;</p>
          <footer className='text-sidebar-foreground/70 text-sm'>{t('brand.hackathon')}</footer>
        </blockquote>
      </div>
    </div>
  );
}
