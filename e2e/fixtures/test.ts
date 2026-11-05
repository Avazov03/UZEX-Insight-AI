import { test as base, expect } from '@playwright/test';

type Fixtures = {
  /** Authenticated page with Uzbek locale (skips UI login). */
  authedPage: import('@playwright/test').Page;
};

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    const email = `e2e-${crypto.randomUUID()}@uzex.local`;
    await page.addInitScript(
      ({ email, at }) => {
        window.localStorage.setItem(
          'uzex-dev-session',
          JSON.stringify({ email, at })
        );
        document.cookie = 'uzex_locale=uz; path=/';
        // Force first-visit sidebar open (no prior collapsed cookie)
        document.cookie = 'sidebar_state=; path=/; max-age=0';
      },
      { email, at: Date.now() }
    );
    await use(page);
  }
});

export { expect };
