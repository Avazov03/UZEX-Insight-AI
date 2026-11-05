import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  analyzeDeadlineBreaches,
  analyzeProductPrices,
  compareYears,
  detectDeliveryRisk,
  getContractByNumber,
  getDealByNumber,
  getMarketOverview,
  getStatusGlossary,
  getTradeTypeStats,
  getUsdRate,
  lookupBroker,
  lookupParticipant
} from '@/lib/uzex-analytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_deal_by_number',
      description:
        'REQUIRED for any question about a specific deal/lot/transaction number (Номер сделки). Returns full deal with product, prices, parties, brokers, deadlines. Example: 280097.',
      parameters: {
        type: 'object',
        properties: {
          dealNumber: {
            type: 'string',
            description: 'Deal number digits, e.g. "280097" or "280096"'
          }
        },
        required: ['dealNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_contract_by_number',
      description:
        'Lookup a contract by Номер контракта including payment_days and delivery_days.',
      parameters: {
        type: 'object',
        properties: {
          contractNumber: { type: 'string' }
        },
        required: ['contractNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'lookup_participant',
      description: 'Find a trading participant by INN or company name; include seller/buyer deal stats.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'INN or name fragment' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'lookup_broker',
      description: 'Find a broker by code (e.g. BK042) or name; include deal counts.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_status_glossary',
      description:
        'Explain deal statuses (Новый, Не подписан, Заключен, Ждёт оплату, Оплачен, Исполнен, Исполнен(Частично), Аннулирован) with README meanings and live counts.'
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_trade_type_stats',
      description:
        'Stats by auction/trade type (Английский / Обратный / Двусторонний) with start vs final unit price.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'integer' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_deadline_breaches',
      description:
        'Find payment/delivery deadline breaches using contracts.payment_days and delivery_days formulas from README.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'integer' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_usd_rate',
      description: 'Get USD/UZS rate on or before a date from usd_rates.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD' }
        }
      }
    }
  },
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
            description: 'Product keyword, e.g. хлопок, пахта, пшеница, сахар'
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
    case 'get_deal_by_number':
      return getDealByNumber(String(args.dealNumber ?? args.deal_no ?? ''));
    case 'get_contract_by_number':
      return getContractByNumber(String(args.contractNumber ?? args.contract_no ?? ''));
    case 'lookup_participant':
      return lookupParticipant(String(args.query ?? ''));
    case 'lookup_broker':
      return lookupBroker(String(args.query ?? ''));
    case 'get_status_glossary':
      return getStatusGlossary();
    case 'get_trade_type_stats':
      return getTradeTypeStats(args.year ? Number(args.year) : undefined);
    case 'analyze_deadline_breaches':
      return analyzeDeadlineBreaches(args.limit ? Number(args.limit) : 10);
    case 'get_usd_rate':
      return getUsdRate(args.date ? String(args.date) : undefined);
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

function extractDealNumberHint(message: string): string | null {
  const m = message.match(/(?:^|\D)(\d{5,8})(?:\D|$)/);
  return m?.[1] ?? null;
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

    const dealHint = extractDealNumberHint(message);

    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are UZEX Insight AI — analyst for the UZEX synthetic exchange dataset in PostgreSQL (500k deals).

LANGUAGE (highest priority):
- Reply in the language of the user's LATEST message (UZ/RU/EN). Ignore UI locale and prior reply language if the latest message switched.
- If ambiguous, fall back to ${uiLanguageFallback}.

CRITICAL LOOKUP RULES:
- If the user mentions a deal/lot/transaction number (e.g. 280097), ALWAYS call get_deal_by_number FIRST. Never say "not found" without that tool.
- If they mention a contract number, call get_contract_by_number.
- If they mention broker code like BK042, call lookup_broker.
- If they mention INN or company name, call lookup_participant.
- Status meanings → get_status_glossary. Auction types → get_trade_type_stats. Deadline breaches → analyze_deadline_breaches.
- Never invent numbers, company names, products, or dates. If a tool returns found:false, say clearly that it is not in the dataset.

COLUMN MAPPING (never confuse):
- trade_type = Тип торгов (auction type) — NOT the product
- product_name = Наименование товара
- start_price = Стартовая цена PER UNIT
- amount = Сумма сделки TOTAL
- final unit price = amount / (quantity * lot)
- contract_no = Номер контракта — NOT a price
- quantity = Количество; lot = Лот; delivered compared to quantity

DEADLINES (README):
- Payment due = deal_date + payment_days (calendar days)
- Delivery due = actual payment_date + delivery_days (calendar days)
- Status snapshot date = 2026-10-30 (not live realtime)
- Ждёт оплату = signed Spot awaiting payment; Заключен = signed Forward/Futures awaiting payment
- Fully completed ONLY: Исполнен. Оплачен is paid but not fully delivered. Исполнен(Частично) is partial.

SCOPE:
- UZEX market data + this product's features.
- Off-topic → short refuse + redirect.

STYLE:
- Concise, human, bullets when listing.
- Cite key figures from tools; mention source tables when useful (deals/contracts/participants/brokers).
- Never paste raw JSON.
${dealHint ? `\nHINT: Latest message likely refers to deal_no=${dealHint} — call get_deal_by_number.` : ''}
${
  body.mode === 'deep'
    ? `
DEEP MODE: more structured analysis, risks, short takeaway; still tool-grounded.`
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

          // If deal number is obvious, prefetch so the model always has facts
          if (dealHint) {
            send('status', { phase: 'tool', name: 'get_deal_by_number' });
            const prefetched = await getDealByNumber(dealHint);
            messages.push({
              role: 'system',
              content: `Prefetched get_deal_by_number(${dealHint}) result (authoritative):\n${JSON.stringify(prefetched)}`
            });
          }

          let completion = await client.chat.completions.create({
            model,
            messages,
            tools,
            tool_choice: 'auto',
            temperature: 0.1
          });

          let choice = completion.choices[0]?.message;
          const toolTraces: Array<{ name: string }> = [];
          if (dealHint) toolTraces.push({ name: 'get_deal_by_number' });

          for (let i = 0; i < 5; i++) {
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
              temperature: 0.1
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
              temperature: 0.1,
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
