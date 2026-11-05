import type { Page } from '@playwright/test';

/** Type into AI chat in a React-friendly way (controlled textarea). */
export async function typeAiMessage(page: Page, message: string) {
  const input = page.getByTestId('ai-chat-input');
  await input.click();
  await input.fill('');
  await input.pressSequentially(message, { delay: 5 });
  await page.getByTestId('ai-chat-send').click();
}
