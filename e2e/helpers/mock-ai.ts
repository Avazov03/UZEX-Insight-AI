import type { Page, Route } from '@playwright/test';

export type AiMockScenario = 'ok' | 'error' | 'empty' | 'slow';

const FIXED_REPLY = 'Jami bitimlar 500 000 ta. (E2E mock)';

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function fulfillSse(route: Route, body: string, delayMs = 0) {
  if (delayMs > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
  }
  await route.fulfill({
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache'
    },
    body
  });
}

/** Deterministic AI chat mock — never hits OpenAI. */
export async function mockAiChat(page: Page, scenario: AiMockScenario = 'ok') {
  await page.route('**/api/ai/chat', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    if (scenario === 'error') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'E2E mock failure' })
      });
      return;
    }

    if (scenario === 'empty') {
      await fulfillSse(
        route,
        [
          sse('meta', { tools: [{ name: 'get_market_overview' }] }),
          sse('done', { ok: true })
        ].join('')
      );
      return;
    }

    const delayMs = scenario === 'slow' ? 800 : 0;
    await fulfillSse(
      route,
      [
        sse('meta', { tools: [{ name: 'get_market_overview' }] }),
        sse('token', { t: FIXED_REPLY }),
        sse('done', { ok: true })
      ].join(''),
      delayMs
    );
  });
}

export { FIXED_REPLY };
