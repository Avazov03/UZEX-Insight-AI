import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures/test';

test.describe('E — Accessibility smoke', () => {
  for (const path of ['/dashboard/ai-assistant', '/dashboard/overview'] as const) {
    test(`E1 no critical/serious axe violations on ${path}`, async ({ authedPage: page }) => {
      // Bug caught: obvious a11y regressions on core surfaces.
      // `list` disabled: known shadcn breadcrumb ol>span[role=link] structure.
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['list'])
        .analyze();

      const severe = results.violations.filter((v) =>
        ['critical', 'serious'].includes(v.impact || '')
      );

      expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
    });
  }
});
