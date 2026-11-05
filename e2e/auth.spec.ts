import { test, expect } from './fixtures/test';

test.describe('A1 — Dev bypass login', () => {
  test('submitting bypass form opens AI assistant', async ({ page }) => {
    // Bug caught: broken sign-in redirect or missing bypass form when DEV bypass is on.
    await page.goto('/auth/sign-in');

    await expect(page.getByRole('heading', { name: /UZEX Insight AI/i })).toBeVisible();
    const { waitForHydrated } = await import('./helpers/ready');
    await waitForHydrated(page, 'dev-bypass-form');
    await expect(page.getByTestId('dev-bypass-submit')).toBeEnabled();

    const email = `login-${crypto.randomUUID()}@uzex.local`;
    await page.getByRole('textbox', { name: /email/i }).fill(email);
    await page.getByRole('textbox', { name: /parol|password|пароль/i }).fill('demo');

    await Promise.all([
      page.waitForURL(/\/dashboard\/ai-assistant/),
      page.getByTestId('dev-bypass-submit').click()
    ]);

    await expect(page.getByRole('heading', { name: 'AI Yordamchi' })).toBeVisible();
  });
});
