import { test, expect } from './fixtures/test';
import { FIXED_REPLY, mockAiChat } from './helpers/mock-ai';
import { typeAiMessage } from './helpers/chat';

async function openAiAssistant(page: import('@playwright/test').Page) {
  await page.goto('/dashboard/ai-assistant');
  const { waitForHydrated } = await import('./helpers/ready');
  await waitForHydrated(page, 'ai-chat-root');
  await expect(page.getByTestId('ai-chat-input')).toBeEditable();
  await expect(page.getByRole('button', { name: 'Bozor umumiy holati qanday?' })).toBeVisible();
}

test.describe('C — AI assistant (mocked LLM)', () => {
  test('C1 happy path streams mocked reply', async ({ authedPage: page }) => {
    // Bug caught: send broken, SSE parser broken, or tool badge missing.
    await mockAiChat(page, 'ok');
    await openAiAssistant(page);

    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/ai/chat') && res.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Bozor umumiy holati qanday?' }).click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.getByText(FIXED_REPLY)).toBeVisible();
    await expect(page.getByText(/Vositalar:/i)).toBeVisible();
  });

  test('C2 API 500 shows error without crash', async ({ authedPage: page }) => {
    // Bug caught: unhandled fetch error blanks the page.
    await mockAiChat(page, 'error');
    await openAiAssistant(page);

    await typeAiMessage(page, 'Xato testi');

    await expect(page.getByText(/E2E mock failure|AI request failed|Error/i)).toBeVisible();
    await expect(page.getByTestId('ai-chat-input')).toBeVisible();
  });

  test('C3 empty stream shows fallback copy', async ({ authedPage: page }) => {
    // Bug caught: infinite pending skeleton when model returns no tokens.
    await mockAiChat(page, 'empty');
    await openAiAssistant(page);

    await typeAiMessage(page, 'Bosh javob');

    await expect(page.getByText(/Javob olinmadi|No reply|Ответ не получен/i)).toBeVisible();
  });

  test('C4 XSS payload does not execute script', async ({ authedPage: page }) => {
    // Bug caught: HTML injection / alert dialog from chat content.
    await mockAiChat(page, 'ok');
    await openAiAssistant(page);

    let dialogOpened = false;
    page.on('dialog', async (dialog) => {
      dialogOpened = true;
      await dialog.dismiss();
    });

    const payload = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    await typeAiMessage(page, payload);

    await expect(page.getByText(FIXED_REPLY)).toBeVisible();
    await expect(page.getByText(payload)).toBeVisible();
    expect(dialogOpened).toBe(false);
  });

  test('new chat clears the thread', async ({ authedPage: page }) => {
    // Bug caught: new chat button does not reset conversation state.
    await mockAiChat(page, 'ok');
    await openAiAssistant(page);

    await page.getByRole('button', { name: 'Bozor umumiy holati qanday?' }).click();
    await expect(page.getByText(FIXED_REPLY)).toBeVisible();

    await page.getByTestId('ai-new-chat').click();
    await expect(page.getByText(FIXED_REPLY)).toHaveCount(0);
    await expect(page.getByTestId('ai-suggested-prompts')).toBeVisible();
  });

  test('follow-up sends prior turns as history', async ({ authedPage: page }) => {
    // Bug caught: API gets only the latest message — multi-turn context lost.
    await mockAiChat(page, 'ok');
    await openAiAssistant(page);

    await page.getByRole('button', { name: 'Bozor umumiy holati qanday?' }).click();
    await expect(page.getByText(FIXED_REPLY)).toBeVisible();

    await expect(page.getByTestId('ai-history')).toBeVisible();

    const secondRequest = page.waitForRequest(
      (req) => req.url().includes('/api/ai/chat') && req.method() === 'POST'
    );
    await typeAiMessage(page, 'Yana batafsil');
    const req = await secondRequest;
    const body = req.postDataJSON() as {
      message?: string;
      history?: Array<{ role: string; content: string }>;
    };
    expect(body.message).toBe('Yana batafsil');
    expect(body.history?.length).toBeGreaterThanOrEqual(2);
    expect(body.history?.[0]?.role).toBe('user');
    expect(body.history?.some((t) => t.role === 'assistant')).toBeTruthy();
  });

  test('sidebar shows recent chats under AI Yordamchi', async ({ authedPage: page }) => {
    // Bug caught: history lives inside chat pane instead of sidebar nav.
    await mockAiChat(page, 'ok');
    await openAiAssistant(page);

    await page.getByRole('button', { name: 'Bozor umumiy holati qanday?' }).click();
    await expect(page.getByText(FIXED_REPLY)).toBeVisible();

    const history = page.getByTestId('ai-history');
    await expect(history).toBeVisible();
    await expect(history.getByText(/Bozor umumiy holati/i)).toBeVisible();
    await expect(page.getByTestId('ai-chat-root').getByTestId('ai-history')).toHaveCount(0);
  });
});
