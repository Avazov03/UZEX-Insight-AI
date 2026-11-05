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

/** Conservative gate: only block clearly non-UZEX requests. */
function isClearlyOffTopic(message: string): boolean {
  const t = message.toLowerCase();
  const uzexCue =
    /uzex|бирж|bitim|sdelk|deal|kontrakt|shartnoma|broker|paxta|хлоп|пшениц|сахар|narx|цена|risk|yetkaz|постав|auction|аукцион|ishtirok|участник|inn|stir|bk\d{2,}|dashboard|bozor|рынок|insight/i.test(
      message
    );
  if (uzexCue) return false;

  return (
    /\b(python|javascript|typescript|java|c\+\+|golang|sql query yoz|quicksort|bubblesort|leetcode|homework|домашн|рецепт|recipe|joke|анекдот|погода|weather|крипт|bitcoin|nft|chatgpt|напиши код|kod yoz|write (a )?code|функция|function\s*\()/i.test(
      t
    ) ||
    /\b(medical|диагноз|симптом|president|политика|выборы)\b/i.test(t)
  );
}

function offTopicRefusal(message: string, fallbackLang: string): string {
  const hasCyrillic = /[А-Яа-яЁё]/.test(message);
  if (hasCyrillic) {
    return 'Я отвечаю только по данным биржи UZEX (сделки, цены, участники, брокеры, риски) и по этому дашборду. Пожалуйста, задайте вопрос по рынку UZEX.';
  }
  if (fallbackLang.startsWith('English') || /\b(the|please|write|code)\b/i.test(message)) {
    return 'I only answer UZEX market questions (deals, prices, participants, brokers, risk) and questions about this dashboard. Please ask something about the UZEX dataset.';
  }
  return 'Men faqat UZEX bozor ma’lumotlari (bitimlar, narxlar, ishtirokchilar, brokerlar, risk) va shu dashboard bo‘yicha javob beraman. Iltimos, UZEX bozoriga oid savol bering.';
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
        content: `You are UZEX Insight AI — a strict data analyst for the UZEX synthetic exchange dataset in PostgreSQL (~500k deals). You are NOT a general chatbot.

LANGUAGE (highest priority):
- Reply in the language of the user's LATEST message (UZ/RU/EN).
- If ambiguous, fall back to ${uiLanguageFallback}.

HARD SCOPE (do not break):
- ONLY: UZEX deals/contracts/products/prices/regions/brokers/participants/risk/deadlines/auction types/USD rates in THIS dataset, OR how to use this UZEX Insight AI dashboard.
- REFUSE off-topic in 1–2 short sentences and redirect to UZEX market questions. Examples to refuse: programming/code, homework, politics, medicine, recipes, jokes, crypto trading advice, general knowledge.
- Do NOT write code, essays, or tutorials for unrelated topics — even if the user insists.

NO HALLUCINATION (do not break):
- Every number, name, INN, broker code, date, status, and product MUST come from a tool result (or the prefetched deal JSON).
- If tools return found:false / empty / no rows: say clearly that this is NOT in the dataset. Do not guess.
- If the year/product/region is outside the data: say so. Do not invent prices or companies.
- Prefer "ma'lumot yo'q / нет в данных / not in dataset" over a plausible-sounding answer.
- Never fill gaps with world knowledge about real UZEX, gold prices, or future years.

LOOKUP RULES:
- Deal/lot number → get_deal_by_number FIRST. Never claim missing without that tool.
- Contract number → get_contract_by_number.
- Broker code (BK…) → lookup_broker. INN/company → lookup_participant.
- Status meanings → get_status_glossary. Auctions → get_trade_type_stats. Deadline breaches → analyze_deadline_breaches.
- Totals/KPIs → get_market_overview. Product prices → analyze_product_prices. Year compare → compare_years.

COLUMN MAPPING (never confuse):
- trade_type = Тип торгов (auction) — NOT product
- product_name = Наименование товара
- start_price = per-unit start; amount = total; final unit = amount/(quantity*lot)
- contract_no is NOT a price

DEADLINES / STATUS (README snapshot 2026-10-30):
- Payment due = deal_date + payment_days; delivery due = payment_date + delivery_days
- Fully completed ONLY: Исполнен. Оплачен ≠ completed. Исполнен(Частично) = partial. Аннулирован = not fulfilled.

STYLE:
- Concise, human, bullets for lists. No raw JSON. No code blocks unless the user asks how this product works and a tiny example is essential (almost never).
${dealHint ? `\nHINT: Latest message likely refers to deal_no=${dealHint} — use prefetched get_deal_by_number result.` : ''}
${
  body.mode === 'deep'
    ? `
DEEP MODE: structured analysis + risks + short takeaway; still 100% tool-grounded.`
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

          if (isClearlyOffTopic(message)) {
            const refusal = offTopicRefusal(message, uiLanguageFallback);
            const chunkSize = 24;
            for (let i = 0; i < refusal.length; i += chunkSize) {
              send('token', { t: refusal.slice(i, i + chunkSize) });
            }
            send('meta', { tools: [] });
            send('done', { ok: true, refused: true });
            return;
          }

          // If deal number is obvious, prefetch so the model always has facts
          if (dealHint) {
            send('status', { phase: 'tool', name: 'get_deal_by_number' });
            const prefetched = await getDealByNumber(dealHint);
            messages.push({
              role: 'system',
              content: `Prefetched get_deal_by_number(${dealHint}) result (authoritative):\n${JSON.stringify(prefetched)}\nIf found:false, tell the user the deal is not in the dataset — do not invent.`
            });
          }

          let completion = await client.chat.completions.create({
            model,
            messages,
            tools,
            tool_choice: 'auto',
            temperature: 0
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
              temperature: 0
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
              temperature: 0,
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
