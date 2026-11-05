export const locales = ['uz', 'ru', 'en'] as const;

export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = 'uz';

export const LOCALE_COOKIE = 'uzex_locale';

export const localeLabels: Record<
  Locale,
  { native: string; short: string; english: string }
> = {
  uz: { native: 'O‘zbekcha', short: 'UZ', english: 'Uzbek' },
  ru: { native: 'Русский', short: 'RU', english: 'Russian' },
  en: { native: 'English', short: 'EN', english: 'English' }
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
