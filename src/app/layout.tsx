import { ClerkProvider } from '@clerk/nextjs';
import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/i18n/config';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL) }
    : {}),
  title: {
    default: 'UZEX Insight AI',
    template: '%s | UZEX Insight AI'
  },
  description:
    'AI-powered commodity market intelligence platform for UZEX exchange analytics, pricing, and risk.',
  openGraph: {
    title: 'UZEX Insight AI',
    description:
      'AI-powered commodity market intelligence platform for UZEX exchange analytics, pricing, and risk.',
    siteName: 'UZEX Insight AI',
    type: 'website',
    images: [
      {
        url: '/shadcn-dashboard.png',
        width: 3200,
        height: 1600,
        alt: 'UZEX Insight AI'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UZEX Insight AI',
    description:
      'AI-powered commodity market intelligence platform for UZEX exchange analytics, pricing, and risk.',
    images: ['/shadcn-dashboard.png']
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  const initialLocale = isLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return (
    <html lang={initialLocale} suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set meta theme color
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <ClerkProvider>
          <NextTopLoader color='var(--primary)' showSpinner={false} />
          <NuqsAdapter>
          <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
          enableColorScheme
          >
          <Providers activeThemeValue={themeToApply} initialLocale={initialLocale}>
          <Toaster />
          {children}
          </Providers>
          </ThemeProvider>
          </NuqsAdapter>
        </ClerkProvider>
      </body>
    </html>
  );
}