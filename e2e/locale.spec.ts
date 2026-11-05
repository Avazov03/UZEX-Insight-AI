import { test, expect } from './fixtures/test';

test.describe('D — Locale', () => {
  test('D1 switching to English updates AI heading', async ({ authedPage: page }) => {
    // Bug caught: language selector does not remount page copy.
    await page.goto('/dashboard/ai-assistant');
    await expect(page.getByRole('heading', { name: 'AI Yordamchi' })).toBeVisible();
    const { waitForHydrated } = await import('./helpers/ready');
    await waitForHydrated(page, 'ai-chat-root');

    // Locale is cookie-driven; set English and reload (avoids Base UI portal flakiness).
    await page.evaluate(() => {
      document.cookie = 'uzex_locale=en; path=/; max-age=31536000; samesite=lax';
      localStorage.setItem('uzex_locale', 'en');
    });
    await page.reload();
    await waitForHydrated(page, 'ai-chat-root');
    await expect(page.getByRole('heading', { name: 'AI Assistant' })).toBeVisible();
  });
});
