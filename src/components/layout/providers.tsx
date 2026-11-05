'use client';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import { LanguageProvider, type Locale } from '@/i18n';

export default function Providers({
  activeThemeValue,
  initialLocale,
  children
}: {
  activeThemeValue: string;
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <LanguageProvider initialLocale={initialLocale}>
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: 'var(--primary)',
                colorPrimaryForeground: 'var(--primary-foreground)',
                colorDanger: 'var(--destructive)',
                colorBackground: 'var(--card)',
                colorForeground: 'var(--foreground)',
                colorMuted: 'var(--muted)',
                colorMutedForeground: 'var(--muted-foreground)',
                colorInput: 'var(--input)',
                colorInputForeground: 'var(--foreground)',
                colorBorder: 'var(--border)',
                colorRing: 'var(--ring)',
                fontFamily: 'var(--font-sans)'
              }
            }}
          >
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        </LanguageProvider>
      </ActiveThemeProvider>
    </>
  );
}
