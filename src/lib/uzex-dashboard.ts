import snapshot from '@/constants/market-dashboard-snapshot.json';
import { query } from '@/lib/db';
import { detectDeliveryRisk, getMarketOverview } from '@/lib/uzex-analytics';
import {
  AMOUNT_UZS_SQL,
  DEALS_WITH_FX_FROM,
  DELIVERY_LATE_ACTUAL_SQL,
  MONEY_METHODOLOGY
} from '@/lib/uzex-money';

const SOUM_PER_TRN = 1_000_000_000_000;
const SOUM_PER_MLN = 1_000_000;

/** Unit price in mln so'm/ton using FX-normalized amount (kg → ton). */
const UNIT_PRICE_MLN_TON_SQL = `
  (${AMOUNT_UZS_SQL} / NULLIF(d.quantity * d.lot, 0))
  * CASE
      WHEN d.unit ILIKE '%килограмм%' OR d.unit ILIKE '%кг%' OR lower(d.unit) IN ('kg', 'килограмм')
        THEN 1000
      ELSE 1
    END
  / ${SOUM_PER_MLN}
`;

const COTTON_RAW_SQL = `(
  d.product_name ILIKE '%Хлопок-сырец%'
  OR d.product_name ILIKE '%Хлопок сырец%'
  OR d.product_name ILIKE '%хлопок-сырец%'
  OR d.product_name ILIKE '%хлопок сырец%'
)`;

const WHEAT_SQL = `(d.product_name ILIKE '%Пшениц%' OR d.product_name ILIKE '%пшениц%')`;

const DIESEL_SQL = `(
  d.product_name ILIKE '%дизел%'
  OR d.product_name ILIKE '%Дизельн%'
  OR d.product_name ILIKE '%дизельн%'
  OR d.product_name ILIKE '%Топливо дизель%'
)`;

function n(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const x = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

function round(v: number, digits = 2): number {
  const p = 10 ** digits;
  return Math.round(v * p) / p;
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

export type MarketDashboard = {
  source: 'postgres' | 'snapshot';
  datasetNote: string;
  kpis: {
    totalValueTrn: number;
    totalDeals: number;
    contracts: number;
    participants: number;
    brokers: number;
    delayedDeals: number;
    delayRatePct: number;
    cancelledDeals: number;
    partialDeals: number;
    yoyValueGrowthPct: number;
    avgDeliveredPct: number;
  };
  yearlyVolume: Array<{ year: string; deals: number; valueTrn: number }>;
  monthlyTrend: Array<{ month: string; valueTrn: number; deals: number }>;
  categoryShare: Array<{ name: string; value: number; amountTrn: number }>;
  dealStatusShare: Array<{ status: string; count: number }>;
  topProducts: Array<{
    name: string;
    category: string;
    deals: number;
    valueTrn: number;
  }>;
  regionalPrices: Array<{
    region: string;
    product: string;
    avgMln: number;
    deals: number;
  }>;
  priceSeries: Array<{
    month: string;
    cotton: number;
    wheat: number;
    diesel: number;
  }>;
  priceKpis: {
    cottonAvgMln: number;
    cottonYoyPct: number;
    topRegion: string;
    topRegionAvgMln: number;
  };
  recentDeals: Array<{
    id: string;
    product: string;
    valueMln: number;
    status: string;
    region: string;
    date: string;
  }>;
  topParticipants: Array<{
    name: string;
    role: string;
    deals: number;
    valueTrn: number;
    region: string;
  }>;
  topSeller: { name: string; valueTrn: number; deals: number } | null;
  topBuyer: { name: string; valueTrn: number; deals: number } | null;
  brokerStats: Array<{
    name: string;
    deals: number;
    cancelled: number;
    delayPct: number;
    sharePct: number;
  }>;
  brokerHighlights: {
    highestCancelName: string;
    highestCancelCount: number;
    lowestDelayName: string;
    lowestDelayPct: number;
  };
  productKpis: {
    distinctProducts: number;
    topCategory: string;
    topCategorySharePct: number;
  };
  riskAlerts: Array<{
    id: string;
    title: string;
    detail: string;
    severity: 'high' | 'medium';
    category: string;
  }>;
  reports: Array<{
    id: string;
    title: string;
    period: string;
    type: string;
  }>;
  agriSharePct: number;
  ytdValueTrn: number;
};

const MONTH_UZ = [
  'Yan',
  'Fev',
  'Mar',
  'Apr',
  'May',
  'Iyn',
  'Iyl',
  'Avg',
  'Sen',
  'Okt',
  'Noy',
  'Dek'
];

/**
 * Chart/KPI pages read the frozen real-data snapshot (no Postgres).
 * AI chat does NOT use this — it queries via uzex-analytics tools.
 */
export async function getMarketDashboard(): Promise<MarketDashboard> {
  return snapshot as MarketDashboard;
}

/**
 * Rebuild aggregates from Postgres. Use only to refresh
 * `src/constants/market-dashboard-snapshot.json` — not at request time.
 */
export async function rebuildMarketDashboardFromDb(): Promise<MarketDashboard> {
  const [
    overview,
    risk,
    monthlyRows,
    categoryRows,
    productRows,
    productCountRows,
    regionalRows,
    seriesRows,
    recentRows,
    participantRows,
    topSellerRows,
    topBuyerRows,
    brokerRows,
    highestCancelBrokerRows,
    lowestDelayBrokerRows,
    deliveredRow
  ] = await Promise.all([
      getMarketOverview(),
      detectDeliveryRisk(),
      query<{ m: string; deals: string; amount: string }>(`
        SELECT EXTRACT(MONTH FROM d.deal_date)::int::text AS m,
               COUNT(*)::text AS deals,
               COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
        ${DEALS_WITH_FX_FROM}
        WHERE EXTRACT(YEAR FROM d.deal_date) = 2026
        GROUP BY 1
        ORDER BY 1
      `),
      query<{ name: string; deals: string; amount: string }>(`
        SELECT COALESCE(NULLIF(c.category, ''), NULLIF(c.industry, ''), 'Boshqa') AS name,
               COUNT(*)::text AS deals,
               COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
        ${DEALS_WITH_FX_FROM}
        GROUP BY 1
        ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
        LIMIT 10
      `),
      query<{ name: string; category: string; deals: string; amount: string }>(`
        SELECT d.product_name AS name,
               COALESCE(NULLIF(c.category, ''), NULLIF(c.industry, ''), '—') AS category,
               COUNT(*)::text AS deals,
               COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
        ${DEALS_WITH_FX_FROM}
        WHERE d.product_name IS NOT NULL AND d.product_name <> ''
        GROUP BY d.product_name, 2
        ORDER BY COUNT(*) DESC
        LIMIT 12
      `),
      query<{ distinct_products: string }>(`
        SELECT COUNT(DISTINCT product_name)::text AS distinct_products
        FROM deals
        WHERE product_name IS NOT NULL AND product_name <> ''
      `),
      query<{ region: string; product: string; deals: string; avg_mln: string }>(`
        SELECT d.region,
               'Paxta xomashyosi' AS product,
               COUNT(*)::text AS deals,
               ROUND(AVG(${UNIT_PRICE_MLN_TON_SQL})::numeric, 2)::text AS avg_mln
        ${DEALS_WITH_FX_FROM}
        WHERE ${COTTON_RAW_SQL}
          AND d.region IS NOT NULL AND d.region <> ''
        GROUP BY d.region
        ORDER BY AVG(${UNIT_PRICE_MLN_TON_SQL}) DESC NULLS LAST
        LIMIT 10
      `),
      query<{ month: string; cotton: string; wheat: string; diesel: string }>(`
        SELECT to_char(date_trunc('month', d.deal_date), 'YYYY-MM') AS month,
               ROUND(AVG(${UNIT_PRICE_MLN_TON_SQL}) FILTER (WHERE ${COTTON_RAW_SQL})::numeric, 2)::text AS cotton,
               ROUND(AVG(${UNIT_PRICE_MLN_TON_SQL}) FILTER (WHERE ${WHEAT_SQL})::numeric, 2)::text AS wheat,
               ROUND(AVG(${UNIT_PRICE_MLN_TON_SQL}) FILTER (WHERE ${DIESEL_SQL})::numeric, 2)::text AS diesel
        ${DEALS_WITH_FX_FROM}
        WHERE d.deal_date >= DATE '2025-01-01'
        GROUP BY 1
        ORDER BY 1
      `),
      query<{
        deal_no: string;
        product_name: string;
        region: string;
        status: string;
        deal_date: string;
        amount: string;
      }>(`
        SELECT d.deal_no, d.product_name, d.region, d.status, d.deal_date::text,
               (${AMOUNT_UZS_SQL})::text AS amount
        ${DEALS_WITH_FX_FROM}
        WHERE d.deal_date IS NOT NULL
        ORDER BY d.deal_date DESC, d.deal_no DESC
        LIMIT 25
      `),
      query<{
        name: string;
        role: string;
        region: string;
        deals: string;
        amount: string;
      }>(`
        (
          SELECT p.name,
                 'Sotuvchi' AS role,
                 COALESCE(p.region, '—') AS region,
                 COUNT(*)::text AS deals,
                 COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
          ${DEALS_WITH_FX_FROM}
          JOIN participants p ON p.inn = d.seller_inn
          GROUP BY p.name, p.region
          ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
          LIMIT 5
        )
        UNION ALL
        (
          SELECT p.name,
                 'Xaridor' AS role,
                 COALESCE(p.region, '—') AS region,
                 COUNT(*)::text AS deals,
                 COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
          ${DEALS_WITH_FX_FROM}
          JOIN participants p ON p.inn = d.buyer_inn
          GROUP BY p.name, p.region
          ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
          LIMIT 5
        )
      `),
      query<{ name: string; deals: string; amount: string }>(`
        SELECT p.name,
               COUNT(*)::text AS deals,
               COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
        ${DEALS_WITH_FX_FROM}
        JOIN participants p ON p.inn = d.seller_inn
        GROUP BY p.name
        ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
        LIMIT 1
      `),
      query<{ name: string; deals: string; amount: string }>(`
        SELECT p.name,
               COUNT(*)::text AS deals,
               COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount
        ${DEALS_WITH_FX_FROM}
        JOIN participants p ON p.inn = d.buyer_inn
        GROUP BY p.name
        ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
        LIMIT 1
      `),
      query<{
        name: string;
        deals: string;
        cancelled: string;
        delayed: string;
        total_deals: string;
      }>(`
        WITH broker_deals AS (
          SELECT COALESCE(NULLIF(d.seller_broker, ''), NULLIF(d.buyer_broker, ''), '—') AS code,
                 COUNT(*) AS deals,
                 COUNT(*) FILTER (WHERE d.status ILIKE '%Аннулирован%') AS cancelled,
                 COUNT(*) FILTER (WHERE ${DELIVERY_LATE_ACTUAL_SQL}) AS delayed
          FROM deals d
          LEFT JOIN contracts c ON c.contract_no = d.contract_no
          GROUP BY 1
        ),
        totals AS (
          SELECT COUNT(*)::text AS total_deals FROM deals
        )
        SELECT COALESCE(b.name, bd.code) AS name,
               bd.deals::text,
               bd.cancelled::text,
               bd.delayed::text,
               t.total_deals
        FROM broker_deals bd
        CROSS JOIN totals t
        LEFT JOIN brokers b ON b.code = bd.code
        WHERE bd.code <> '—'
        ORDER BY bd.deals DESC
        LIMIT 10
      `),
      query<{
        name: string;
        deals: string;
        cancelled: string;
        delayed: string;
      }>(`
        WITH broker_deals AS (
          SELECT COALESCE(NULLIF(d.seller_broker, ''), NULLIF(d.buyer_broker, ''), '—') AS code,
                 COUNT(*) AS deals,
                 COUNT(*) FILTER (WHERE d.status ILIKE '%Аннулирован%') AS cancelled,
                 COUNT(*) FILTER (WHERE ${DELIVERY_LATE_ACTUAL_SQL}) AS delayed
          FROM deals d
          LEFT JOIN contracts c ON c.contract_no = d.contract_no
          GROUP BY 1
        )
        SELECT COALESCE(b.name, bd.code) AS name,
               bd.deals::text,
               bd.cancelled::text,
               bd.delayed::text
        FROM broker_deals bd
        LEFT JOIN brokers b ON b.code = bd.code
        WHERE bd.code <> '—' AND bd.deals >= 100
        ORDER BY bd.cancelled DESC
        LIMIT 1
      `),
      query<{
        name: string;
        deals: string;
        cancelled: string;
        delayed: string;
      }>(`
        WITH broker_deals AS (
          SELECT COALESCE(NULLIF(d.seller_broker, ''), NULLIF(d.buyer_broker, ''), '—') AS code,
                 COUNT(*) AS deals,
                 COUNT(*) FILTER (WHERE d.status ILIKE '%Аннулирован%') AS cancelled,
                 COUNT(*) FILTER (WHERE ${DELIVERY_LATE_ACTUAL_SQL}) AS delayed
          FROM deals d
          LEFT JOIN contracts c ON c.contract_no = d.contract_no
          GROUP BY 1
        )
        SELECT COALESCE(b.name, bd.code) AS name,
               bd.deals::text,
               bd.cancelled::text,
               bd.delayed::text
        FROM broker_deals bd
        LEFT JOIN brokers b ON b.code = bd.code
        WHERE bd.code <> '—' AND bd.deals >= 1000
        ORDER BY (bd.delayed::numeric / NULLIF(bd.deals, 0)) ASC NULLS LAST
        LIMIT 1
      `),
      query<{ avg_delivered_pct: string }>(`
        SELECT ROUND(
          AVG(
            CASE
              WHEN quantity IS NULL OR quantity = 0 THEN NULL
              ELSE LEAST(GREATEST(delivered / NULLIF(quantity, 0) * 100, 0), 100)
            END
          )::numeric,
          1
        )::text AS avg_delivered_pct
        FROM deals
        WHERE status ILIKE '%Частично%'
      `)
    ]);

  const totalDeals = n(overview.totals.deals);
  const amountSum = n(overview.totals.amount_sum_uzs ?? overview.totals.amount_sum);
  const totalValueTrn = round(amountSum / SOUM_PER_TRN, 2);

  const byYear = overview.byYear.map((y) => ({
    year: y.year,
    deals: n(y.deals),
    amount: n(y.amount_uzs ?? y.amount)
  }));
  const y2025 = byYear.find((y) => y.year === '2025');
  const y2026 = byYear.find((y) => y.year === '2026');
  // Prefer same-period (Jan–Oct 30) YoY — 2026 is partial
  const yoyValueGrowthPct =
    overview.yoySamePeriodPct != null
      ? round(overview.yoySamePeriodPct, 1)
      : y2025 && y2025.amount > 0
        ? round((((y2026?.amount ?? 0) - y2025.amount) / y2025.amount) * 100, 1)
        : 0;

  const delayedDeals = n(risk.summary.delayed);
  const cancelledDeals = n(risk.summary.cancelled);
  const partialDeals = n(risk.summary.partial);
  const delayRatePct =
    totalDeals > 0 ? round((delayedDeals / totalDeals) * 100, 2) : 0;

  const categoryShare = categoryRows.map((r) => {
    const amount = n(r.amount);
    return {
      name: r.name,
      amountTrn: round(amount / SOUM_PER_TRN, 2),
      value: amountSum > 0 ? round((amount / amountSum) * 100, 2) : 0
    };
  });

  const agriSharePct =
    categoryShare.find((c) => /сельск|қишлоқ|qishloq|agro/i.test(c.name))?.value ??
    categoryShare[0]?.value ??
    0;

  const yearlyVolume = byYear.map((y) => ({
    year: y.year === '2026' ? '2026*' : y.year,
    deals: y.deals,
    valueTrn: round(y.amount / SOUM_PER_TRN, 2)
  }));

  const monthlyTrend = monthlyRows.map((r) => {
    const mi = Math.max(1, Math.min(12, n(r.m))) - 1;
    return {
      month: MONTH_UZ[mi] ?? r.m,
      deals: n(r.deals),
      valueTrn: round(n(r.amount) / SOUM_PER_TRN, 2)
    };
  });

  const dealStatusShare = overview.byStatus.map((s) => ({
    status: s.status,
    count: n(s.count)
  }));

  const topProducts = productRows.map((p) => ({
    name: p.name,
    category: p.category,
    deals: n(p.deals),
    valueTrn: round(n(p.amount) / SOUM_PER_TRN, 2)
  }));

  const regionalPrices = regionalRows.map((r) => ({
    region: r.region,
    product: r.product,
    deals: n(r.deals),
    avgMln: round(n(r.avg_mln), 2)
  }));

  const priceSeries = seriesRows.map((r) => ({
    month: r.month,
    cotton: n(r.cotton),
    wheat: n(r.wheat),
    diesel: n(r.diesel)
  }));

  const cotton2025 = priceSeries.filter((p) => p.month.startsWith('2025') && p.cotton > 0);
  const cotton2026 = priceSeries.filter((p) => p.month.startsWith('2026') && p.cotton > 0);
  const cottonAvg2025 = avg(cotton2025.map((p) => p.cotton));
  const cottonAvg2026 = avg(cotton2026.map((p) => p.cotton));
  const cottonYoyPct =
    cottonAvg2025 > 0 ? round(((cottonAvg2026 - cottonAvg2025) / cottonAvg2025) * 100, 1) : 0;
  const cottonAvgMln = round(cottonAvg2026 || avg(priceSeries.map((p) => p.cotton)), 2);

  const allDealsForShare = n(brokerRows[0]?.total_deals) || totalDeals || 1;
  const brokerStats = brokerRows.map((b) => {
    const deals = n(b.deals);
    const cancelled = n(b.cancelled);
    const delayed = n(b.delayed);
    return {
      name: b.name,
      deals,
      cancelled,
      delayPct: deals > 0 ? round((delayed / deals) * 100, 1) : 0,
      sharePct: round((deals / allDealsForShare) * 100, 1)
    };
  });

  const topParticipants = participantRows
    .map((p) => ({
      name: p.name,
      role: p.role,
      region: p.region,
      deals: n(p.deals),
      valueTrn: round(n(p.amount) / SOUM_PER_TRN, 2)
    }))
    .toSorted((a, b) => b.valueTrn - a.valueTrn)
    .slice(0, 10);

  const topSellerRow = topSellerRows[0];
  const topBuyerRow = topBuyerRows[0];
  const topSeller = topSellerRow
    ? {
        name: topSellerRow.name,
        deals: n(topSellerRow.deals),
        valueTrn: round(n(topSellerRow.amount) / SOUM_PER_TRN, 2)
      }
    : null;
  const topBuyer = topBuyerRow
    ? {
        name: topBuyerRow.name,
        deals: n(topBuyerRow.deals),
        valueTrn: round(n(topBuyerRow.amount) / SOUM_PER_TRN, 2)
      }
    : null;

  const recentDeals = recentRows.map((d) => ({
    id: d.deal_no,
    product: d.product_name || '—',
    region: d.region || '—',
    status: d.status || '—',
    date: d.deal_date?.slice(0, 10) || '—',
    valueMln: round(n(d.amount) / SOUM_PER_MLN, 1)
  }));

  const avgDeliveredPct = n(deliveredRow[0]?.avg_delivered_pct);
  const topRegion = regionalPrices[0];
  const distinctProducts = n(productCountRows[0]?.distinct_products);
  const topCategory = categoryShare[0]?.name ?? '—';
  const topCategorySharePct = categoryShare[0]?.value ?? 0;

  const highestCancelRow = highestCancelBrokerRows[0];
  const lowestDelayRow = lowestDelayBrokerRows[0];
  const highestCancelBroker = highestCancelRow
    ? {
        name: highestCancelRow.name,
        deals: n(highestCancelRow.deals),
        cancelled: n(highestCancelRow.cancelled),
        delayPct:
          n(highestCancelRow.deals) > 0
            ? round((n(highestCancelRow.delayed) / n(highestCancelRow.deals)) * 100, 1)
            : 0
      }
    : null;
  const lowestDelayBroker = lowestDelayRow
    ? {
        name: lowestDelayRow.name,
        deals: n(lowestDelayRow.deals),
        cancelled: n(lowestDelayRow.cancelled),
        delayPct:
          n(lowestDelayRow.deals) > 0
            ? round((n(lowestDelayRow.delayed) / n(lowestDelayRow.deals)) * 100, 1)
            : 0
      }
    : null;

  const riskAlerts: MarketDashboard['riskAlerts'] = [
    {
      id: 'R-01',
      title: 'Yetkazib berish kechikishi',
      detail: `${delayedDeals.toLocaleString('uz-UZ')} bitim (~${delayRatePct}%) — delivery_date payment_date+30 kundan keyin`,
      severity: delayedDeals > 0 ? 'high' : 'medium',
      category: 'Yetkazib berish'
    },
    {
      id: 'R-02',
      title: 'Bekor qilingan bitimlar',
      detail: `${cancelledDeals.toLocaleString('uz-UZ')} bitim statusida «Аннулирован»`,
      severity: 'high',
      category: 'Status'
    },
    {
      id: 'R-03',
      title: 'Qisman bajarilish',
      detail: `${partialDeals.toLocaleString('uz-UZ')} bitim · o‘rtacha yetkazilgan ~${avgDeliveredPct || 0}%`,
      severity: 'medium',
      category: 'Ijro'
    },
    {
      id: 'R-04',
      title: 'Broker konsentratsiya',
      detail: highestCancelBroker
        ? `${highestCancelBroker.name}: ${highestCancelBroker.deals.toLocaleString('uz-UZ')} bitim, bekor ${highestCancelBroker.cancelled.toLocaleString('uz-UZ')}`
        : 'Broker statistikasi yetarli emas',
      severity: 'medium',
      category: 'Broker'
    }
  ];

  const yearMin = byYear[0]?.year ?? '2022';
  const yearMax = byYear[byYear.length - 1]?.year ?? '2026';

  return {
    source: 'postgres',
    datasetNote:
      `PostgreSQL sunʼiy UZEX datasetidan hisoblangan (snapshot ${MONEY_METHODOLOGY.snapshotDate}). USD→UZS kunlik kurs bilan. Real birja yashirin statistikasi emas.`,
    kpis: {
      totalValueTrn,
      totalDeals,
      contracts: n(overview.totals.contracts),
      participants: n(overview.totals.participants),
      brokers: n(overview.totals.brokers),
      delayedDeals,
      delayRatePct,
      cancelledDeals,
      partialDeals,
      yoyValueGrowthPct,
      avgDeliveredPct
    },
    yearlyVolume,
    monthlyTrend,
    categoryShare,
    dealStatusShare,
    topProducts,
    regionalPrices,
    priceSeries,
    priceKpis: {
      cottonAvgMln,
      cottonYoyPct,
      topRegion: topRegion?.region ?? '—',
      topRegionAvgMln: topRegion?.avgMln ?? 0
    },
    recentDeals,
    topParticipants,
    topSeller,
    topBuyer,
    brokerStats,
    productKpis: {
      distinctProducts,
      topCategory,
      topCategorySharePct
    },
    riskAlerts,
    reports: [
      {
        id: 'REP-01',
        title: 'Bozor umumiy holati',
        period: `${yearMin}–${yearMax}`,
        type: 'Market'
      },
      {
        id: 'REP-02',
        title: 'Mahsulot narx intelligence',
        period: '2025–2026',
        type: 'Price'
      },
      {
        id: 'REP-03',
        title: 'Yetkazib berish riski',
        period: 'Joriy dataset',
        type: 'Risk'
      },
      {
        id: 'REP-04',
        title: 'Broker performance',
        period: 'Joriy dataset',
        type: 'Broker'
      }
    ],
    agriSharePct,
    ytdValueTrn: round((y2026?.amount ?? 0) / SOUM_PER_TRN, 2),
    brokerHighlights: {
      highestCancelName: highestCancelBroker?.name ?? '—',
      highestCancelCount: highestCancelBroker?.cancelled ?? 0,
      lowestDelayName: lowestDelayBroker?.name ?? '—',
      lowestDelayPct: lowestDelayBroker?.delayPct ?? 0
    }
  };
}
