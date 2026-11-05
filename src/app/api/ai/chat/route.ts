import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import {
  analyzeDeadlineBreaches,
  analyzeProductPrices,
  compareYears,
  analyzeRegionTrade,
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
      description:
        'REQUIRED for market condition / bozor holati / overview / KPI / categories / yearly activity. Returns FX-normalized amount_sum_uzs, byCategory (Категория товара), byStatus, byYear, byYearThroughOct30, yoySamePeriodPct, methodology.'
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
      name: 'analyze_region_trade',
      description:
        'Region breakdown for a year and product category (default: agriculture). FX-normalized UZS totals, deal counts, quantity. Use for hududlar / regional agri questions.',
      parameters: {
        type: 'object',
        properties: {
          year: { type: 'integer', description: 'e.g. 2024' },
          categoryHint: {
            type: 'string',
            description: 'Category or product hint; empty/agri → Сельскохозяйственная'
          },
          limit: { type: 'integer', description: 'Max regions, default 20' }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'detect_delivery_risk',
      description:
        'Delivery discipline via README: payment_date + delivery_days. Returns delayed_actual, delayed_overdue_open, cancelled, partial.'
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
    case 'analyze_region_trade':
      return analyzeRegionTrade({
        year: args.year ? Number(args.year) : 2024,
        categoryHint: args.categoryHint ? String(args.categoryHint) : undefined,
        limit: args.limit ? Number(args.limit) : 20
      });
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

/** Broad market-condition / KPI questions → always answer with get_market_overview. */
function isMarketOverviewIntent(message: string): boolean {
  return /bozor\s*holat|holati\s*qanday|рынок.*(состоян|обзор|как)|market\s*(overview|condition|state|status)|umumiy\s*(tahlil|ko'?rsatkich|statistika)|jami\s*bitim|total\s*deal|savdo\s*hajm|объем\s*торг|kpi|dashboard\s*overview|bozor\s*(haqida|qanday)|как\s*(обстоит|обзор).*рынок|what.?s\s*(the\s*)?market/i.test(
    message
  );
}

/** Conservative gate: only block clearly non-UZEX requests. */
function isClearlyOffTopic(message: string): boolean {
  const t = message.toLowerCase();
  if (isMarketOverviewIntent(message)) return false;

  const uzexCue =
    /uzex|бирж|bitim|sdelk|deal|kontrakt|shartnoma|broker|paxta|хлоп|пшениц|сахар|narx|цена|risk|yetkaz|постав|auction|аукцион|ishtirok|участник|inn|stir|bk\d{2,}|dashboard|bozor|рынок|holat|обзор|insight/i.test(
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
- IN SCOPE (NEVER refuse): "bozor holati", "рынок как", "market overview/condition", umumiy tahlil, jami bitimlar, savdo hajmi, status mix, yearly activity — these ARE core product questions. Answer with tools.
- REFUSE only clearly unrelated topics in 1–2 short sentences: programming/code, homework, politics, medicine, recipes, jokes, crypto trading advice, general world knowledge.
- Do NOT write code, essays, or tutorials for unrelated topics — even if the user insists.
- Vague UZEX market questions are NOT off-topic. Call get_market_overview (and detect_delivery_risk if risk is implied) and give a short structured briefing.

NO HALLUCINATION (do not break):
- Every number, name, INN, broker code, date, status, and product MUST come from a tool result (or prefetched JSON).
- Use amount_sum_uzs / amount_trn_uzs (FX-normalized). NEVER use amount_sum_raw_mixed as "total market volume".
- Trillion so‘m = amount_uzs / 1e12 (≈2–3 decimals). Cite methodology briefly when giving totals.
- Categories come from get_market_overview.byCategory — NEVER say categories are missing if that array is present.
- Delivery late = detect_delivery_risk.summary.delayed_actual (+ overdue_open if relevant). Do not invent a flat "+30 days" rule.
- 2026 is partial through 2026-10-30 — for growth use yoySamePeriodPct / byYearThroughOct30, not full-year 2026 vs 2025.
- If tools return found:false / empty / no rows: say clearly that this is NOT in the dataset. Do not guess.
- Never present this as live official UZEX stats — synthetic/historical dataset through ~2026-10-30.

LOOKUP RULES:
- Deal/lot number → get_deal_by_number FIRST. Never claim missing without that tool.
- Contract number → get_contract_by_number.
- Broker code (BK…) → lookup_broker. INN/company → lookup_participant.
- Status meanings → get_status_glossary. Auctions → get_trade_type_stats. Deadline breaches → analyze_deadline_breaches.
- Market condition / KPIs / categories / "bozor holati" → get_market_overview FIRST (required) + detect_delivery_risk for discipline.
- Region × category (hududlar) → analyze_region_trade. Product prices → analyze_product_prices. Year compare → compare_years.

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
- For market overview: intro → KPIs (FX UZS) → byCategory top shares → statuses → delivery discipline → 3 problems / 3 positives when asked → same-period YoY → disclaimer + short methodology.
- If user asks for diagrams/charts/tables: emit a CLEAN GitHub-flavored markdown table (header row, |---| separator, data rows). The UI renders it as a real table. Never say you cannot show tables. For region questions always include BOTH top5 and bottom5 tables from analyze_region_trade (bottom5 is never "missing").
${dealHint ? `\nHINT: Latest message likely refers to deal_no=${dealHint} — use prefetched get_deal_by_number result.` : ''}
${
  isMarketOverviewIntent(message)
    ? `\nHINT: Latest message is a MARKET OVERVIEW question — you MUST answer using prefetched/tool get_market_overview. Do NOT refuse.`
    : ''
}
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

          // Broad "bozor holati" / market overview — never refuse; ground on overview KPIs
          if (isMarketOverviewIntent(message)) {
            send('status', { phase: 'tool', name: 'get_market_overview' });
            const overview = await getMarketOverview();
            const risk = await detectDeliveryRisk();
            messages.push({
              role: 'system',
              content: `Prefetched get_market_overview (authoritative). amount_sum is so'm; trillion = amount_sum/1e12.\n${JSON.stringify(overview)}\nPrefetched detect_delivery_risk summary (optional for takeaway):\n${JSON.stringify(risk.summary ?? risk)}\nAnswer the market-condition question with these numbers. Do NOT refuse. End with a short synthetic-dataset disclaimer.`
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
          if (isMarketOverviewIntent(message)) {
            toolTraces.push({ name: 'get_market_overview' }, { name: 'detect_delivery_risk' });
          }

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

          // Pace tokens so the UI types like a chat bot (instant dump felt broken).
          if (choice?.content && !choice.tool_calls?.length) {
            const text = choice.content;
            const chunkSize = 8;
            for (let i = 0; i < text.length; i += chunkSize) {
              send('token', { t: text.slice(i, i + chunkSize) });
              await new Promise((resolve) => setTimeout(resolve, 10));
            }
          } else {
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
