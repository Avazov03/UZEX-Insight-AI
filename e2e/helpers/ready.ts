import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/** Wait until client components have hydrated (React handlers attached). */
export async function waitForHydrated(page: Page, testId: string) {
  await expect(page.getByTestId(testId)).toHaveAttribute('data-hydrated', 'true', {
    timeout: 30_000
  });
}
