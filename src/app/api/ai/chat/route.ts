import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  analyzeProductPrices,
  compareYears,
  detectDeliveryRisk,
  getMarketOverview
} from '@/lib/uzex-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_market_overview',
      description: 'Get total deals, contracts, participants, brokers, amounts and yearly stats'
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_product_prices',
      description: 'Analyze average unit prices by region for a product name hint and year',
      parameters: {
        type: 'object',
        properties: {
          productHint: {
            type: 'string',
            description: 'Product keyword, e.g. хлопок, пахта, пшеница, bug‘doy'
          },
          year: { type: 'integer', description: 'Year, default 2026' }
        },
        required: ['productHint']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'detect_delivery_risk',
      description: 'Detect cancelled/partial deals and sample risky deals'
    }
  },
  {
    type: 'function',
    function: {
      name: 'compare_years',
      description: 'Compare deal counts and prices for a product between two years',
      parameters: {
        type: 'object',
        properties: {
          productHint: { type: 'string' },
          yearA: { type: 'integer' },
          yearB: { type: 'integer' }
        },
        required: ['productHint']
      }
    }
  }
];

async function runTool(name: string, argsJson: string) {
  const args = argsJson ? (JSON.parse(argsJson) as Record<string, unknown>) : {};
  switch (name) {
    case 'get_market_overview':
      return getMarketOverview();
    case 'analyze_product_prices':
      return analyzeProductPrices(
        String(args.productHint ?? ''),
        args.year ? Number(args.year) : 2026
      );
    case 'detect_delivery_risk':
      return detectDeliveryRisk();
    case 'compare_years':
      return compareYears(
        String(args.productHint ?? ''),
        args.yearA ? Number(args.yearA) : 2025,
        args.yearB ? Number(args.yearB) : 2026
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY missing' }, { status: 500 });
    }

    const body = (await req.json()) as {
      message?: string;
      locale?: string;
      mode?: string;
      history?: Array<{ role?: string; content?: string }>;
    };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ ok: false, error: 'message required' }, { status: 400 });
    }

    const uiLocale = body.locale || 'uz';
    const uiLanguageFallback =
      uiLocale === 'ru' ? 'Russian' : uiLocale === 'en' ? 'English' : 'Uzbek (Latin script)';

    const history = (body.history ?? [])
      .filter(
        (turn): turn is { role: 'user' | 'assistant'; content: string } =>
          (turn.role === 'user' || turn.role === 'assistant') &&
          typeof turn.content === 'string' &&
          turn.content.trim().length > 0
      )
      .slice(-24)
      .map((turn) => ({
        role: turn.role,
        content: turn.content.trim().slice(0, 4000)
      }));

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are UZEX Insight AI — a specialized commodity exchange market analyst for the Uzbekistan Republican Commodity Exchange (UZEX) synthetic deal dataset in this app.

LANGUAGE (highest priority — overrides UI locale and chat history language):
- Always reply in the language of the user's LATEST message. Detect it from that message text itself.
- Do NOT lock to the app/UI language. Do NOT keep answering in the previous reply's language if the latest user message switched language.
- Examples: Uzbek prompt → Uzbek reply; Russian prompt → Russian reply; English prompt → English reply — even if the sidebar/UI is in another language.
- Only if the latest message language is truly ambiguous, fall back to ${uiLanguageFallback}.

SCOPE:
- Answer questions about UZEX market data in this product: deals, contracts, products, prices, regions, brokers, participants, delivery risk, year comparisons.
- Also answer product questions about this UZEX Insight AI dashboard itself: what it is for, what problems it helps solve, benefits for brokers/analysts/traders, and how to use its pages/features. Be concrete and helpful — do not refuse these.
- If the user asks about unrelated topics (coding, politics, general knowledge, other companies, homework, jokes, medical/legal advice, etc.), politely refuse in 1–2 short sentences and redirect them to UZEX market analytics or this product. Do not answer the off-topic request.
- Follow-up questions may omit product names — use prior conversation context for facts, but still match the latest message language.

DATA RULES:
- Use tools for any numbers. Never invent statistics.
- Product names in the DB are mostly Russian (e.g. хлопок-сырец for paxta/cotton raw). Pass Russian keywords to tools when useful.
- For prices prefer avg_unit_price_mln_ton (mln so'm per ton; kg units are normalized ×1000). avg_unit_price is raw so'm per deal unit — do not call it "mln" unless converted.
- Amount totals: divide by 1e12 for trillion so'm (tn), by 1e6 for million so'm (mln).
- Dataset is synthetic test data in PostgreSQL (not live UZEX secrets). Mention that briefly once per conversation if relevant.
- 2026 may be year-to-date (through late October in the dataset) — say so when comparing to full 2025.

STYLE:
- Be concise and human-readable.
- Use short paragraphs and bullet lists with - when listing.
- Never paste raw JSON, code blocks, or tool payloads in the reply — only natural language with key figures.
${
  body.mode === 'deep'
    ? `
DEEP ANALYSIS MODE (user enabled):
- Be more thorough: structure the answer, compare dimensions, call out risks/caveats, and end with a short actionable takeaway.
- Still stay within scope and use tools for numbers.`
    : ''
}`
      },
      ...history.map((turn) => ({
        role: turn.role,
        content: turn.content
      })),
      { role: 'user', content: message }
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(sse(event, data)));
        };

        try {
          send('status', { phase: 'analyzing' });

          let completion = await client.chat.completions.create({
            model,
            messages,
            tools,
            tool_choice: 'auto',
            temperature: 0.2
          });

          let choice = completion.choices[0]?.message;
          const toolTraces: Array<{ name: string }> = [];

          for (let i = 0; i < 3; i++) {
            const toolCalls = choice?.tool_calls;
            if (!toolCalls?.length) break;

            messages.push(choice as OpenAI.Chat.Completions.ChatCompletionMessageParam);

            for (const call of toolCalls) {
              if (call.type !== 'function') continue;
              send('status', { phase: 'tool', name: call.function.name });
              const result = await runTool(
                call.function.name,
                call.function.arguments || '{}'
              );
              toolTraces.push({ name: call.function.name });
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify(result)
              });
            }

            completion = await client.chat.completions.create({
              model,
              messages,
              tools,
              temperature: 0.2
            });
            choice = completion.choices[0]?.message;
          }

          send('meta', { tools: toolTraces });

          if (choice?.content) {
            const text = choice.content;
            const chunkSize = 16;
            for (let i = 0; i < text.length; i += chunkSize) {
              send('token', { t: text.slice(i, i + chunkSize) });
            }
          } else {
            if (choice) {
              messages.push(choice as OpenAI.Chat.Completions.ChatCompletionMessageParam);
            }
            const finalStream = await client.chat.completions.create({
              model,
              messages,
              tool_choice: 'none',
              temperature: 0.2,
              stream: true
            });
            for await (const part of finalStream) {
              const t = part.choices[0]?.delta?.content;
              if (t) send('token', { t });
            }
          }

          send('done', { ok: true });
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          send('error', { message: msg });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
