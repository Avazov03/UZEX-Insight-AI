/** Synthetic UZEX spot dataset aggregates for frontend demo (not live exchange stats). */

export const DATASET_NOTE =
  'Sunʼiy test dataset (2022–30.10.2026). Natijalar real UZEX bozor statistikasi emas.';

export const marketKpis = {
  totalValueTrn: 220.48,
  totalDeals: 500_000,
  contracts: 6_616,
  participants: 14_392,
  brokers: 120,
  delayedDeals: 17_805,
  delayRatePct: 3.92,
  cancelledDeals: 33_719,
  partialDeals: 22_648,
  yoyValueGrowthPct: 21.1
} as const;

export const yearlyVolume = [
  { year: '2022', deals: 84_299, valueTrn: 32.1 },
  { year: '2023', deals: 93_985, valueTrn: 38.4 },
  { year: '2024', deals: 106_647, valueTrn: 45.2 },
  { year: '2025', deals: 115_763, valueTrn: 52.7 },
  { year: '2026*', deals: 99_306, valueTrn: 52.05 }
] as const;

export const categoryShare = [
  { name: 'Qishloq xo‘jaligi', value: 51.77, tonnage: 114.1 },
  { name: 'Oziq-ovqat', value: 12.4, tonnage: 27.3 },
  { name: 'Neft mahsulotlari', value: 9.8, tonnage: 21.6 },
  { name: 'Metall', value: 8.2, tonnage: 18.1 },
  { name: 'Polimer', value: 6.1, tonnage: 13.4 },
  { name: 'Kimyo', value: 5.4, tonnage: 11.9 },
  { name: 'Qurilish', value: 3.8, tonnage: 8.4 },
  { name: 'Sanoat', value: 2.53, tonnage: 5.6 }
] as const;

export const monthlyTrend2026 = [
  { month: 'Yan', valueTrn: 4.8, deals: 9_120 },
  { month: 'Fev', valueTrn: 4.6, deals: 8_840 },
  { month: 'Mar', valueTrn: 5.1, deals: 9_610 },
  { month: 'Apr', valueTrn: 5.0, deals: 9_450 },
  { month: 'May', valueTrn: 5.3, deals: 10_020 },
  { month: 'Iyn', valueTrn: 5.4, deals: 10_180 },
  { month: 'Iyl', valueTrn: 5.6, deals: 10_540 },
  { month: 'Avg', valueTrn: 5.5, deals: 10_310 },
  { month: 'Sen', valueTrn: 5.4, deals: 10_190 },
  { month: 'Okt', valueTrn: 5.35, deals: 11_046 }
] as const;

export const dealStatusShare = [
  { status: 'To‘liq bajarilgan', count: 286_420, tone: 'success' },
  { status: 'To‘langan', count: 62_180, tone: 'success' },
  { status: 'Shartnoma tuzilgan', count: 41_250, tone: 'neutral' },
  { status: 'To‘lov kutilmoqda', count: 28_940, tone: 'warning' },
  { status: 'Qisman bajarilgan', count: 22_648, tone: 'warning' },
  { status: 'Bekor qilingan', count: 33_719, tone: 'danger' },
  { status: 'Imzolanmagan', count: 14_210, tone: 'danger' },
  { status: 'Yangi', count: 10_633, tone: 'neutral' }
] as const;

export const priceSeries = [
  { month: '2025-01', cotton: 16.2, wheat: 3.8, diesel: 9.1 },
  { month: '2025-04', cotton: 16.8, wheat: 3.9, diesel: 9.3 },
  { month: '2025-07', cotton: 17.1, wheat: 4.0, diesel: 9.0 },
  { month: '2025-10', cotton: 17.4, wheat: 4.1, diesel: 9.2 },
  { month: '2026-01', cotton: 17.8, wheat: 4.2, diesel: 9.4 },
  { month: '2026-04', cotton: 18.1, wheat: 4.3, diesel: 9.5 },
  { month: '2026-07', cotton: 18.3, wheat: 4.25, diesel: 9.6 },
  { month: '2026-10', cotton: 18.45, wheat: 4.35, diesel: 9.7 }
] as const;

export const regionalPrices = [
  { region: 'Qashqadaryo', product: 'Paxta xomashyosi', avgMln: 19.2, deals: 2_140 },
  { region: 'Buxoro', product: 'Paxta xomashyosi', avgMln: 18.9, deals: 1_980 },
  { region: 'Samarqand', product: 'Paxta xomashyosi', avgMln: 18.4, deals: 1_650 },
  { region: 'Toshkent', product: 'Bug‘doy', avgMln: 4.5, deals: 1_220 },
  { region: 'Andijon', product: 'Bug‘doy', avgMln: 4.3, deals: 980 },
  { region: 'Farg‘ona', product: 'Dizel yoqilg‘isi', avgMln: 9.8, deals: 760 }
] as const;

export const topProducts = [
  {
    name: 'Paxta xomashyosi',
    category: 'Qishloq xo‘jaligi',
    variants: 48,
    deals: 62_400,
    valueTrn: 48.2
  },
  {
    name: 'Bug‘doy',
    category: 'Qishloq xo‘jaligi',
    variants: 22,
    deals: 41_200,
    valueTrn: 18.6
  },
  {
    name: 'Dizel yoqilg‘isi',
    category: 'Neft mahsulotlari',
    variants: 12,
    deals: 28_100,
    valueTrn: 14.1
  },
  {
    name: 'Armatura',
    category: 'Metall',
    variants: 35,
    deals: 19_800,
    valueTrn: 9.4
  },
  {
    name: 'Polietilen',
    category: 'Polimer',
    variants: 18,
    deals: 15_600,
    valueTrn: 7.2
  },
  {
    name: 'Sement',
    category: 'Qurilish',
    variants: 9,
    deals: 12_400,
    valueTrn: 5.1
  }
] as const;

export const recentDeals = [
  {
    id: 'D-2026-91205',
    product: 'Paxta xomashyosi',
    valueMln: 842,
    status: 'Qisman bajarilgan',
    region: 'Qashqadaryo',
    date: '2026-10-28'
  },
  {
    id: 'D-2026-90112',
    product: 'Bug‘doy',
    valueMln: 312,
    status: 'To‘liq bajarilgan',
    region: 'Toshkent',
    date: '2026-10-27'
  },
  {
    id: 'D-2026-88421',
    product: 'Dizel yoqilg‘isi',
    valueMln: 198,
    status: 'Yetkazib berish kechikdi',
    region: 'Farg‘ona',
    date: '2026-10-25'
  },
  {
    id: 'D-2026-87990',
    product: 'Armatura',
    valueMln: 456,
    status: 'To‘langan',
    region: 'Samarqand',
    date: '2026-10-24'
  },
  {
    id: 'D-2026-87102',
    product: 'Polietilen',
    valueMln: 127,
    status: 'Bekor qilingan',
    region: 'Buxoro',
    date: '2026-10-22'
  },
  {
    id: 'D-2026-86551',
    product: 'Sement',
    valueMln: 89,
    status: 'To‘liq bajarilgan',
    region: 'Andijon',
    date: '2026-10-21'
  }
] as const;

export const topParticipants = [
  { name: 'Agro Trade LLC', role: 'Sotuvchi', deals: 4_820, valueTrn: 6.4, region: 'Buxoro' },
  { name: 'Grain Market JSC', role: 'Xaridor', deals: 3_910, valueTrn: 5.1, region: 'Toshkent' },
  { name: 'Metal Supply Co', role: 'Sotuvchi', deals: 2_740, valueTrn: 3.8, region: 'Samarqand' },
  { name: 'Energy Fuels Ltd', role: 'Xaridor', deals: 2_510, valueTrn: 3.2, region: 'Farg‘ona' },
  { name: 'Polymer Hub', role: 'Sotuvchi', deals: 1_980, valueTrn: 2.6, region: 'Navoiy' }
] as const;

export const brokerStats = [
  { name: 'Broker Alpha', deals: 18_400, cancelled: 1_120, delayPct: 4.8, sharePct: 3.7 },
  { name: 'Broker Beta', deals: 15_200, cancelled: 890, delayPct: 3.1, sharePct: 3.0 },
  { name: 'Broker Gamma', deals: 12_860, cancelled: 1_450, delayPct: 5.6, sharePct: 2.6 },
  { name: 'Broker Delta', deals: 11_100, cancelled: 620, delayPct: 2.4, sharePct: 2.2 },
  { name: 'Broker Epsilon', deals: 9_840, cancelled: 710, delayPct: 3.9, sharePct: 2.0 }
] as const;

export const riskAlerts = [
  {
    id: 'R-01',
    title: 'Yetkazib berish kechikishi',
    detail: '17 805 bitim (~3,92%) shartnoma muddatidan oshgan',
    severity: 'high',
    category: 'Qishloq xo‘jaligi'
  },
  {
    id: 'R-02',
    title: 'Bekor qilingan bitimlar',
    detail: '33 719 bekor — broker Gamma konsentratsiyasi yuqori',
    severity: 'high',
    category: 'Broker'
  },
  {
    id: 'R-03',
    title: 'Qisman bajarilish',
    detail: '22 648 bitimda o‘rtacha yetkazilgan miqdor ~60,9%',
    severity: 'medium',
    category: 'Ijro'
  },
  {
    id: 'R-04',
    title: 'Narx anomaliyasi',
    detail: 'Paxta xomashyosi ayrim lotlarda median dan ±18%',
    severity: 'medium',
    category: 'Narx'
  }
] as const;

export const reportTemplates = [
  {
    id: 'REP-01',
    title: 'Haftalik bozor xulosasi',
    period: '2026-10-24 — 2026-10-30',
    type: 'Market'
  },
  {
    id: 'REP-02',
    title: 'Paxta narx intelligence',
    period: '2026 YTD',
    type: 'Price'
  },
  {
    id: 'REP-03',
    title: 'Yetkazib berish riski',
    period: '30.10.2026 holati',
    type: 'Risk'
  },
  {
    id: 'REP-04',
    title: 'Broker performance',
    period: '2026 Q3–Q4',
    type: 'Broker'
  }
] as const;
