import { query } from '@/lib/db';
import { normalizeProductHint } from '@/lib/product-hint';

export { normalizeProductHint };

export async function getMarketOverview() {
  const [totals] = await query<{
    deals: string;
    contracts: string;
    participants: string;
    brokers: string;
    amount_sum: string;
  }>(`
    SELECT
      (SELECT COUNT(*)::text FROM deals) AS deals,
      (SELECT COUNT(*)::text FROM contracts) AS contracts,
      (SELECT COUNT(*)::text FROM participants) AS participants,
      (SELECT COUNT(*)::text FROM brokers) AS brokers,
      (SELECT COALESCE(SUM(amount),0)::text FROM deals) AS amount_sum
  `);

  const byStatus = await query<{ status: string; count: string }>(`
    SELECT status, COUNT(*)::text AS count
    FROM deals
    GROUP BY status
    ORDER BY COUNT(*) DESC
  `);

  const byYear = await query<{ year: string; deals: string; amount: string }>(`
    SELECT EXTRACT(YEAR FROM deal_date)::int::text AS year,
           COUNT(*)::text AS deals,
           COALESCE(SUM(amount),0)::text AS amount
    FROM deals
    WHERE deal_date IS NOT NULL
    GROUP BY 1
    ORDER BY 1
  `);

  return { totals, byStatus, byYear };
}

export async function analyzeProductPrices(productHint: string, year?: number) {
  const y = year ?? 2026;
  const hint = normalizeProductHint(productHint);
  // Unit price as mln so'm / ton (normalize kg → ton)
  const unitMlnTon = `
    (amount / NULLIF(quantity * lot, 0))
    * CASE
        WHEN unit ILIKE '%килограмм%' OR unit ILIKE '%кг%' OR lower(unit) IN ('kg', 'килограмм')
          THEN 1000
        ELSE 1
      END
    / 1000000
  `;

  const rows = await query<{
    region: string;
    deals: string;
    avg_unit_price: string;
    avg_unit_price_mln_ton: string;
    total_amount: string;
  }>(
    `
    SELECT region,
           COUNT(*)::text AS deals,
           ROUND(AVG(amount / NULLIF(quantity * lot, 0))::numeric, 2)::text AS avg_unit_price,
           ROUND(AVG(${unitMlnTon})::numeric, 2)::text AS avg_unit_price_mln_ton,
           COALESCE(SUM(amount),0)::text AS total_amount
    FROM deals
    WHERE EXTRACT(YEAR FROM deal_date) = $1
      AND product_name ILIKE '%' || $2 || '%'
    GROUP BY region
    ORDER BY AVG(${unitMlnTon}) DESC NULLS LAST
    LIMIT 15
    `,
    [y, hint]
  );

  const [summary] = await query<{
    deals: string;
    avg_unit_price: string;
    avg_unit_price_mln_ton: string;
    total_amount: string;
  }>(
    `
    SELECT COUNT(*)::text AS deals,
           ROUND(AVG(amount / NULLIF(quantity * lot, 0))::numeric, 2)::text AS avg_unit_price,
           ROUND(AVG(${unitMlnTon})::numeric, 2)::text AS avg_unit_price_mln_ton,
           COALESCE(SUM(amount),0)::text AS total_amount
    FROM deals
    WHERE EXTRACT(YEAR FROM deal_date) = $1
      AND product_name ILIKE '%' || $2 || '%'
    `,
    [y, hint]
  );

  return {
    year: y,
    productHint: hint,
    originalHint: productHint,
    unit: 'mln_soum_per_ton',
    summary,
    byRegion: rows
  };
}

export async function detectDeliveryRisk() {
  const [summary] = await query<{
    delayed: string;
    cancelled: string;
    partial: string;
    total: string;
  }>(`
    SELECT
      COUNT(*) FILTER (
        WHERE delivery_date IS NOT NULL
          AND payment_date IS NOT NULL
          AND delivery_date > payment_date + INTERVAL '30 days'
      )::text AS delayed,
      COUNT(*) FILTER (WHERE status ILIKE '%Аннулирован%')::text AS cancelled,
      COUNT(*) FILTER (WHERE status ILIKE '%Частично%')::text AS partial,
      COUNT(*)::text AS total
    FROM deals
  `);

  const samples = await query<{
    deal_no: string;
    product_name: string;
    region: string;
    status: string;
    delivery_date: string;
  }>(`
    SELECT deal_no, product_name, region, status, delivery_date::text
    FROM deals
    WHERE status ILIKE '%Аннулирован%'
       OR status ILIKE '%Частично%'
    ORDER BY deal_date DESC NULLS LAST
    LIMIT 10
  `);

  return { summary, samples };
}

export async function compareYears(productHint: string, yearA = 2025, yearB = 2026) {
  const hint = normalizeProductHint(productHint);
  const unitMlnTon = `
    (amount / NULLIF(quantity * lot, 0))
    * CASE
        WHEN unit ILIKE '%килограмм%' OR unit ILIKE '%кг%' OR lower(unit) IN ('kg', 'килограмм')
          THEN 1000
        ELSE 1
      END
    / 1000000
  `;
  const rows = await query<{
    year: string;
    deals: string;
    avg_unit_price: string;
    avg_unit_price_mln_ton: string;
    total_amount: string;
  }>(
    `
    SELECT EXTRACT(YEAR FROM deal_date)::int::text AS year,
           COUNT(*)::text AS deals,
           ROUND(AVG(amount / NULLIF(quantity * lot, 0))::numeric, 2)::text AS avg_unit_price,
           ROUND(AVG(${unitMlnTon})::numeric, 2)::text AS avg_unit_price_mln_ton,
           COALESCE(SUM(amount),0)::text AS total_amount
    FROM deals
    WHERE EXTRACT(YEAR FROM deal_date) IN ($1, $2)
      AND product_name ILIKE '%' || $3 || '%'
    GROUP BY 1
    ORDER BY 1
    `,
    [yearA, yearB, hint]
  );
  return {
    productHint: hint,
    originalHint: productHint,
    unit: 'mln_soum_per_ton',
    years: rows
  };
}
