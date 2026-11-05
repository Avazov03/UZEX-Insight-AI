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

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY missing' }, { status: 500 });
    }

    const body = (await req.json()) as { message?: string; locale?: string };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ ok: false, error: 'message required' }, { status: 400 });
    }

    const locale = body.locale || 'uz';
    const language =
      locale === 'ru' ? 'Russian' : locale === 'en' ? 'English' : 'Uzbek (Latin script)';

    const client = new OpenAI({ apiKey });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are UZEX Insight AI, a commodity exchange market analyst.
Use tools for any numbers. Never invent statistics.
Dataset is synthetic test data (not live UZEX secrets). Always mention that briefly once.
Answer in ${language}. Be concise, structured, and cite tool results.`
      },
      { role: 'user', content: message }
    ];

    let completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.2
    });

    let choice = completion.choices[0]?.message;
    const toolTraces: Array<{ name: string; result: unknown }> = [];

    // Allow up to 3 tool rounds
    for (let i = 0; i < 3; i++) {
      const toolCalls = choice?.tool_calls;
      if (!toolCalls?.length) break;

      messages.push(choice as OpenAI.Chat.Completions.ChatCompletionMessageParam);

      for (const call of toolCalls) {
        if (call.type !== 'function') continue;
        const result = await runTool(call.function.name, call.function.arguments || '{}');
        toolTraces.push({ name: call.function.name, result });
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result)
        });
      }

      completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        tools,
        temperature: 0.2
      });
      choice = completion.choices[0]?.message;
    }

    return NextResponse.json({
      ok: true,
      reply: choice?.content ?? '',
      tools: toolTraces
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
