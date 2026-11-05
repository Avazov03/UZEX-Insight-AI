'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/i18n/language-selector';
import { useI18n } from '@/i18n';

/**
 * Temporary local sign-in: any email/password continues to the dashboard.
 * Replace with Clerk Google/email when ready.
 */
export function DevBypassSignIn() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('analyst@uzex.local');
  const [password, setPassword] = useState('demo');
  const [loading, setLoading] = useState(false);

  function enter() {
    setLoading(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'uzex-dev-session',
        JSON.stringify({ email: email || 'analyst@uzex.local', at: Date.now() })
      );
    }
    router.push('/dashboard/ai-assistant');
  }

  return (
    <div className='bg-card w-full max-w-sm rounded-xl border p-6 shadow-sm'>
      <div className='mb-4 flex justify-end'>
        <LanguageSelector />
      </div>
      <div className='mb-6 space-y-2 text-center'>
        <h1 className='text-xl font-semibold tracking-tight'>{t('auth.signInTitle')}</h1>
        <p className='text-muted-foreground text-sm'>{t('auth.welcomeBack')}</p>
        <Badge variant='outline' className='text-amber-600 dark:text-amber-400'>
          {t('auth.bypassBadge')}
        </Badge>
      </div>

      <form
        className='space-y-4'
        onSubmit={(e) => {
          e.preventDefault();
          enter();
        }}
      >
        <div className='space-y-2'>
          <Label htmlFor='email'>{t('auth.email')}</Label>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='password'>{t('auth.password')}</Label>
          <Input
            id='password'
            type='password'
            autoComplete='current-password'
            placeholder={t('auth.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? <Icons.spinner className='size-4 animate-spin' /> : null}
          {t('common.continue')}
          <Icons.arrowRight className='size-4' />
        </Button>
      </form>

      <p className='text-muted-foreground mt-4 text-center text-xs'>{t('auth.bypassHint')}</p>
    </div>
  );
}
