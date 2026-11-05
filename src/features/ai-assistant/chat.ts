import { createChat } from '@shadcn/helpers/ai-sdk';
import type { UIMessage } from 'ai';

type Tools = {
  analyzeCottonPrices: {
    input: { year: number; product: string };
    output: {
      year: number;
      product: string;
      avgPriceUzs: number;
      changePct: number;
      topRegion: string;
      dealCount: number;
    };
  };
  detectDeliveryRisk: {
    input: { asOf: string };
    output: {
      delayedDeals: number;
      delayRatePct: number;
      topCategory: string;
      sampleDealIds: string[];
    };
  };
};

/** Message shape for the UZEX scripted assistant demo. */
export type DemoUIMessage = UIMessage<unknown, Record<string, never>, Tools>;

/**
 * Scripted UZEX market analysis conversation.
 * Streams through useChat with no live LLM — demo for UI / hackathon preview.
 */
export const demoChat = createChat<DemoUIMessage>()
  .user(
    '2026-yil yanvar–oktabr oralig‘ida paxta xomashyosi savdosini tahlil qil. 2025-yilning shu davri bilan taqqosla.'
  )
  .sleep(500)
  .assistant(({ writer }) => {
    writer.reasoning(
      'Savol mahsulot (paxta xomashyosi), davr (2026 YTD vs 2025 YTD) va taqqoslashni so‘rayapti. Avval narx va hajm ko‘rsatkichlarini olaman.'
    );
    writer
      .tool('analyzeCottonPrices', {
        title: 'Paxta xomashyosi narx tahlili',
        input: { year: 2026, product: 'Paxta xomashyosi' }
      })
      .sleep(900)
      .output({
        year: 2026,
        product: 'Paxta xomashyosi',
        avgPriceUzs: 18_450_000,
        changePct: 8.4,
        topRegion: 'Qashqadaryo',
        dealCount: 12_480
      });
    writer.text(
      '2026-yil yanvar–oktabrda paxta xomashyosi bo‘yicha 12 480 ta bitim qayd etilgan. O‘rtacha narx ~18,45 mln so‘m — 2025-yilning shu davriga nisbatan +8,4%.'
    );
    writer.text(
      ' Eng yuqori o‘rtacha narx Qashqadaryo hududida kuzatilgan. Bu raqamlar berilgan test dataset asosida hisoblangan.'
    );
  })
  .user('Yetkazib berish muddati buzilgan bitimlarni aniqlab, eng ko‘p kechikish bo‘lgan kategoriyani ko‘rsat.')
  .sleep(500)
  .assistant(({ writer }) => {
    writer.reasoning(
      'Risk Intelligence: yetkazib berish sanasi shartnoma muddatidan oshgan bitimlarni filtrlayman va kategoriya bo‘yicha guruhlayman.'
    );
    writer
      .tool('detectDeliveryRisk', {
        title: 'Yetkazib berish riskini aniqlash',
        input: { asOf: '2026-10-30' }
      })
      .sleep(900)
      .output({
        delayedDeals: 17_805,
        delayRatePct: 3.92,
        topCategory: 'Qishloq xo‘jaligi',
        sampleDealIds: ['D-2026-88421', 'D-2026-90112', 'D-2026-91205']
      });
    writer.text(
      '30.10.2026 holatiga ko‘ra 17 805 ta bitimda yetkazib berish muddati buzilgan (~3,92%). Eng ko‘p kechikish «Qishloq xo‘jaligi» kategoriyasida.'
    );
    writer.text(
      ' Namuna bitimlar: D-2026-88421, D-2026-90112, D-2026-91205. Keyingi qadamda broker va ishtirokchi kesimida chuqurroq tahlil qilish mumkin.'
    );
  });

export const initialMessages = demoChat.get(0);

export const chatTransport = demoChat.transport({ delayMs: 30 });

export const suggestedPrompts = [
  '2026-yilda paxta xomashyosi narxi qaysi hududda yuqori?',
  'Yetkazib berish muddati buzilgan bitimlarni ko‘rsat',
  '2025 vs 2026 savdo hajmini taqqosla',
  'Bekor qilingan bitimlar eng ko‘p qaysi brokerda?'
] as const;
