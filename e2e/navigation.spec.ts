import { test, expect } from './fixtures/test';
import { CORE_PAGES } from './helpers/nav';

test.describe('B — Sidebar and navigation', () => {
  test('B1 sidebar starts expanded on first visit', async ({ authedPage: page }) => {
    // Bug caught: sidebar defaults collapsed / AI nav hidden for first-time users.
    await page.goto('/dashboard/ai-assistant');

    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toBeVisible();
    await expect(page.getByRole('link', { name: 'AI Yordamchi' })).toBeVisible();
  });

  for (const route of CORE_PAGES) {
    test(`B2 loads ${route.path}`, async ({ authedPage: page }) => {
      // Bug caught: dead route or wrong page title/i18n on ${route.path}.
      await page.goto(route.path);
      await expect(page.getByRole('heading', { name: route.title })).toBeVisible();
    });
  }
});
