'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { locales, useI18n, type Locale } from '@/i18n';

export function LanguageSelector() {
  const { locale, setLocale, t, locales: labels } = useI18n();

  return (
    <div className='flex items-center gap-2'>
      <Label htmlFor='language-selector' className='sr-only'>
        {t('common.language')}
      </Label>
      <Select
        items={locales.map((code) => ({
          value: code,
          label: labels[code].native
        }))}
        value={locale}
        onValueChange={(value) => {
          if (value !== null && locales.includes(value as Locale)) {
            setLocale(value as Locale);
          }
        }}
      >
        <SelectTrigger
          id='language-selector'
          className='justify-start *:data-[slot=select-value]:w-20'
          aria-label={t('common.language')}
        >
          <span className='text-muted-foreground hidden sm:block'>
            <Icons.language />
          </span>
          <SelectValue placeholder={t('common.language')} />
        </SelectTrigger>
        <SelectContent align='end'>
          <SelectGroup>
            <SelectLabel>{t('common.language')}</SelectLabel>
            {locales.map((code) => (
              <SelectItem key={code} value={code}>
                <span className='flex items-center gap-2'>
                  <span className='text-muted-foreground w-6 text-xs font-medium'>
                    {labels[code].short}
                  </span>
                  {labels[code].native}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
