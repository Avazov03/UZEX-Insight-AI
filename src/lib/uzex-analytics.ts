import { query } from '@/lib/db';
import { normalizeProductHint } from '@/lib/product-hint';
import {
  AMOUNT_UZS_SQL,
  DATASET_SNAPSHOT_DATE,
  DEALS_WITH_FX_FROM,
  DELIVERY_LATE_ACTUAL_SQL,
  DELIVERY_OVERDUE_OPEN_SQL,
  MONEY_METHODOLOGY
} from '@/lib/uzex-money';

export { normalizeProductHint, DATASET_SNAPSHOT_DATE, MONEY_METHODOLOGY };

export async function getMarketOverview() {
  const [totals] = await query<{
    deals: string;
    contracts: string;
    participants: string;
    brokers: string;
    amount_sum_uzs: string;
    amount_sum_raw_mixed: string;
    usd_deals: string;
    uzs_deals: string;
  }>(`
    SELECT
      (SELECT COUNT(*)::text FROM deals) AS deals,
      (SELECT COUNT(*)::text FROM contracts) AS contracts,
      (SELECT COUNT(*)::text FROM participants) AS participants,
      (SELECT COUNT(*)::text FROM brokers) AS brokers,
      (SELECT COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text ${DEALS_WITH_FX_FROM}) AS amount_sum_uzs,
      (SELECT COALESCE(SUM(amount),0)::text FROM deals) AS amount_sum_raw_mixed,
      (SELECT COUNT(*)::text ${DEALS_WITH_FX_FROM}
        WHERE c.currency LIKE '%США%' OR c.currency LIKE '%оллар%' OR lower(COALESCE(c.currency,'')) LIKE '%usd%') AS usd_deals,
      (SELECT COUNT(*)::text ${DEALS_WITH_FX_FROM}
        WHERE c.currency IS NULL OR NOT (
          c.currency LIKE '%США%' OR c.currency LIKE '%оллар%' OR lower(COALESCE(c.currency,'')) LIKE '%usd%'
        )) AS uzs_deals
  `);

  const byStatus = await query<{ status: string; count: string }>(`
    SELECT status, COUNT(*)::text AS count
    FROM deals
    GROUP BY status
    ORDER BY COUNT(*) DESC
  `);

  const byCategory = await query<{
    category: string;
    deals: string;
    amount_uzs: string;
  }>(`
    SELECT COALESCE(NULLIF(c.category, ''), NULLIF(c.industry, ''), '—') AS category,
           COUNT(*)::text AS deals,
           COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount_uzs
    ${DEALS_WITH_FX_FROM}
    GROUP BY 1
    ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
  `);

  const byYear = await query<{ year: string; deals: string; amount_uzs: string }>(`
    SELECT EXTRACT(YEAR FROM d.deal_date)::int::text AS year,
           COUNT(*)::text AS deals,
           COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount_uzs
    ${DEALS_WITH_FX_FROM}
    WHERE d.deal_date IS NOT NULL
    GROUP BY 1
    ORDER BY 1
  `);

  const byYearThroughOct30 = await query<{
    year: string;
    deals: string;
    amount_uzs: string;
  }>(`
    SELECT EXTRACT(YEAR FROM d.deal_date)::int::text AS year,
           COUNT(*)::text AS deals,
           COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount_uzs
    ${DEALS_WITH_FX_FROM}
    WHERE d.deal_date IS NOT NULL
      AND (
        EXTRACT(MONTH FROM d.deal_date) < 10
        OR (EXTRACT(MONTH FROM d.deal_date) = 10 AND EXTRACT(DAY FROM d.deal_date) <= 30)
      )
    GROUP BY 1
    ORDER BY 1
  `);

  const amountUzs = Number(totals.amount_sum_uzs || 0);
  const categories = byCategory.map((row) => {
    const amount = Number(row.amount_uzs || 0);
    return {
      category: row.category,
      deals: Number(row.deals),
      amount_uzs: row.amount_uzs,
      amount_trn_uzs: Math.round((amount / 1e12) * 100) / 100,
      share_pct:
        amountUzs > 0 ? Math.round((amount / amountUzs) * 10000) / 100 : 0
    };
  });

  const y2025 = byYearThroughOct30.find((y) => y.year === '2025');
  const y2026 = byYearThroughOct30.find((y) => y.year === '2026');
  const a = Number(y2025?.amount_uzs || 0);
  const b = Number(y2026?.amount_uzs || 0);
  const yoySamePeriodPct = a > 0 ? Math.round(((b - a) / a) * 1000) / 10 : null;

  return {
    totals: {
      ...totals,
      amount_trn_uzs: Math.round((amountUzs / 1e12) * 1000) / 1000,
      amount_sum: totals.amount_sum_uzs,
      note: 'amount_sum / amount_sum_uzs are FX-normalized UZS. amount_sum_raw_mixed is unsafe (USD+UZS added raw).'
    },
    byStatus,
    byCategory: categories,
    byYear: byYear.map((y) => ({
      ...y,
      amount: y.amount_uzs,
      amount_trn_uzs: Math.round((Number(y.amount_uzs) / 1e12) * 100) / 100,
      partial_year: y.year === '2026'
    })),
    byYearThroughOct30: byYearThroughOct30.map((y) => ({
      ...y,
      amount_trn_uzs: Math.round((Number(y.amount_uzs) / 1e12) * 100) / 100
    })),
    yoySamePeriodPct,
    methodology: MONEY_METHODOLOGY
  };
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
    delayed_actual: string;
    delayed_overdue_open: string;
    delayed: string;
    cancelled: string;
    partial: string;
    total: string;
    with_both_dates: string;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE ${DELIVERY_LATE_ACTUAL_SQL})::text AS delayed_actual,
      COUNT(*) FILTER (WHERE ${DELIVERY_OVERDUE_OPEN_SQL})::text AS delayed_overdue_open,
      (
        COUNT(*) FILTER (WHERE ${DELIVERY_LATE_ACTUAL_SQL})
        + COUNT(*) FILTER (WHERE ${DELIVERY_OVERDUE_OPEN_SQL})
      )::text AS delayed,
      COUNT(*) FILTER (WHERE d.status ILIKE '%Аннулирован%')::text AS cancelled,
      COUNT(*) FILTER (WHERE d.status ILIKE '%Частично%')::text AS partial,
      COUNT(*)::text AS total,
      COUNT(*) FILTER (
        WHERE d.payment_date IS NOT NULL AND d.delivery_date IS NOT NULL
      )::text AS with_both_dates
    FROM deals d
    LEFT JOIN contracts c ON c.contract_no = d.contract_no
  `);

  const samples = await query<{
    deal_no: string;
    product_name: string;
    region: string;
    status: string;
    delivery_date: string;
  }>(`
    SELECT d.deal_no, d.product_name, d.region, d.status, d.delivery_date::text
    FROM deals d
    LEFT JOIN contracts c ON c.contract_no = d.contract_no
    WHERE ${DELIVERY_LATE_ACTUAL_SQL}
       OR ${DELIVERY_OVERDUE_OPEN_SQL}
       OR d.status ILIKE '%Аннулирован%'
       OR d.status ILIKE '%Частично%'
    ORDER BY d.deal_date DESC NULLS LAST
    LIMIT 10
  `);

  return {
    summary: {
      ...summary,
      // Back-compat: delayed = late delivered + overdue open (README)
      note: MONEY_METHODOLOGY.delivery
    },
    samples,
    methodology: MONEY_METHODOLOGY
  };
}

/** Region × category trade stats with FX-normalized UZS totals. */
export async function analyzeRegionTrade(opts: {
  year?: number;
  categoryHint?: string;
  limit?: number;
}) {
  const year = opts.year ?? 2024;
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const hint = (opts.categoryHint || '').trim();
  const agriDefault =
    !hint || /qishloq|сельск|agri|agro|пахта|хлоп|пшениц/i.test(hint);

  const categorySql = agriDefault
    ? `(c.category ILIKE '%Сельск%' OR c.category ILIKE '%сельск%' OR c.industry ILIKE '%Сельск%')`
    : `(c.category ILIKE '%' || $2 || '%' OR c.industry ILIKE '%' || $2 || '%' OR d.product_name ILIKE '%' || $2 || '%')`;

  const params: Array<string | number> = [year];
  if (!agriDefault) params.push(hint);
  params.push(limit);
  const limitParam = agriDefault ? '$2' : '$3';

  const rows = await query<{
    region: string;
    deals: string;
    amount_uzs: string;
    quantity: string;
  }>(
    `
    SELECT COALESCE(NULLIF(d.region, ''), '—') AS region,
           COUNT(*)::text AS deals,
           COALESCE(SUM(${AMOUNT_UZS_SQL}),0)::text AS amount_uzs,
           COALESCE(SUM(d.quantity * COALESCE(d.lot, 1)),0)::text AS quantity
    ${DEALS_WITH_FX_FROM}
    WHERE EXTRACT(YEAR FROM d.deal_date) = $1
      AND ${categorySql}
    GROUP BY 1
    ORDER BY SUM(${AMOUNT_UZS_SQL}) DESC NULLS LAST
    LIMIT ${limitParam}
    `,
    params
  );

  const mapped = rows.map((r) => ({
    region: r.region,
    deals: Number(r.deals),
    amount_uzs: r.amount_uzs,
    amount_trn_uzs: Math.round((Number(r.amount_uzs) / 1e12) * 1000) / 1000,
    quantity: r.quantity
  }));

  const top5 = mapped.slice(0, 5);
  const bottom5 = mapped.length <= 5 ? mapped : mapped.slice(-5);

  return {
    year,
    categoryHint: agriDefault ? 'Сельскохозяйственная продукция (default/match)' : hint,
    unit: 'amount_uzs = FX-normalized so‘m; quantity = quantity*lot',
    regions: mapped,
    top5,
    bottom5,
    methodology: MONEY_METHODOLOGY
  };
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

function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D+/g, '');
}

/**
 * Exact deal lookup by Номер сделки (deal_no).
 * Joins contracts, seller/buyer participants and brokers.
 * Computes final unit price = amount / (quantity * lot); never confuse columns.
 */
export async function getDealByNumber(dealNumber: string) {
  const dealNo = digitsOnly(dealNumber);
  if (!dealNo) {
    return { found: false, error: 'deal_number_required' };
  }

  const rows = await query<{
    deal_no: string;
    deal_date: string;
    deal_time: string;
    trade_type: string;
    quantity: string;
    amount: string;
    start_price: string;
    contract_no: string;
    product_name: string;
    lot: string;
    unit: string;
    region: string;
    contract_type: string;
    contract_form: string;
    status: string;
    seller_inn: string;
    buyer_inn: string;
    seller_broker: string;
    buyer_broker: string;
    payment_date: string;
    delivery_date: string;
    delivered: string;
    volume: string;
    final_unit_price: string;
    price_delta: string;
    price_delta_pct: string;
    remaining_qty: string;
    seller_name: string;
    seller_region: string;
    seller_activity: string;
    seller_role: string;
    buyer_name: string;
    buyer_region: string;
    buyer_activity: string;
    buyer_role: string;
    seller_broker_name: string;
    seller_broker_region: string;
    buyer_broker_name: string;
    buyer_broker_region: string;
    payment_days: string;
    delivery_days: string;
    currency: string;
    base_price: string;
    delivery_basis: string;
    payment_due_date: string;
    delivery_due_date: string;
    payment_overdue: string;
    delivery_overdue: string;
  }>(
    `
    SELECT
      d.deal_no,
      d.deal_date::text,
      d.deal_time::text,
      d.trade_type,
      d.quantity::text,
      d.amount::text,
      d.start_price::text,
      d.contract_no,
      d.product_name,
      d.lot::text,
      d.unit,
      d.region,
      d.contract_type,
      d.contract_form,
      d.status,
      d.seller_inn,
      d.buyer_inn,
      d.seller_broker,
      d.buyer_broker,
      d.payment_date::text,
      d.delivery_date::text,
      d.delivered::text,
      (d.quantity * COALESCE(d.lot, 1))::text AS volume,
      ROUND((d.amount / NULLIF(d.quantity * COALESCE(d.lot, 1), 0))::numeric, 2)::text AS final_unit_price,
      ROUND((
        (d.amount / NULLIF(d.quantity * COALESCE(d.lot, 1), 0)) - d.start_price
      )::numeric, 2)::text AS price_delta,
      ROUND((
        ((d.amount / NULLIF(d.quantity * COALESCE(d.lot, 1), 0)) - d.start_price)
        / NULLIF(d.start_price, 0) * 100
      )::numeric, 3)::text AS price_delta_pct,
      ROUND((COALESCE(d.quantity, 0) - COALESCE(d.delivered, 0))::numeric, 4)::text AS remaining_qty,
      sp.name AS seller_name,
      sp.region AS seller_region,
      sp.activity AS seller_activity,
      sp.role AS seller_role,
      bp.name AS buyer_name,
      bp.region AS buyer_region,
      bp.activity AS buyer_activity,
      bp.role AS buyer_role,
      sb.name AS seller_broker_name,
      sb.region AS seller_broker_region,
      bb.name AS buyer_broker_name,
      bb.region AS buyer_broker_region,
      c.payment_days::text,
      c.delivery_days::text,
      c.currency,
      c.base_price::text,
      c.delivery_basis,
      (d.deal_date + (COALESCE(c.payment_days, 0) || ' days')::interval)::date::text AS payment_due_date,
      CASE
        WHEN d.payment_date IS NULL THEN NULL
        ELSE (d.payment_date + (COALESCE(c.delivery_days, 0) || ' days')::interval)::date::text
      END AS delivery_due_date,
      CASE
        WHEN d.payment_date IS NULL
          AND c.payment_days IS NOT NULL
          AND d.deal_date + (c.payment_days || ' days')::interval < DATE '${DATASET_SNAPSHOT_DATE}'
          THEN 'true'
        WHEN d.payment_date IS NOT NULL
          AND c.payment_days IS NOT NULL
          AND d.payment_date > d.deal_date + (c.payment_days || ' days')::interval
          THEN 'true'
        ELSE 'false'
      END AS payment_overdue,
      CASE
        WHEN d.payment_date IS NOT NULL
          AND c.delivery_days IS NOT NULL
          AND (
            (d.delivery_date IS NOT NULL AND d.delivery_date > d.payment_date + (c.delivery_days || ' days')::interval)
            OR (
              d.delivery_date IS NULL
              AND COALESCE(d.delivered, 0) < COALESCE(d.quantity, 0)
              AND d.payment_date + (c.delivery_days || ' days')::interval < DATE '${DATASET_SNAPSHOT_DATE}'
            )
          )
          THEN 'true'
        ELSE 'false'
      END AS delivery_overdue
    FROM deals d
    LEFT JOIN contracts c ON c.contract_no = d.contract_no
    LEFT JOIN participants sp ON sp.inn = d.seller_inn
    LEFT JOIN participants bp ON bp.inn = d.buyer_inn
    LEFT JOIN brokers sb ON sb.code = d.seller_broker
    LEFT JOIN brokers bb ON bb.code = d.buyer_broker
    WHERE d.deal_no = $1
    LIMIT 1
    `,
    [dealNo]
  );

  if (!rows[0]) {
    return {
      found: false,
      deal_no: dealNo,
      message: 'Deal not found in deals table',
      field_map: {
        deal_no: 'Номер сделки',
        trade_type: 'Тип торгов (NOT product)',
        start_price: 'Стартовая цена (per unit)',
        amount: 'Сумма сделки (total)',
        quantity: 'Количество',
        lot: 'Лот',
        contract_no: 'Номер контракта',
        product_name: 'Наименование товара',
        final_unit_price: 'amount / (quantity * lot)'
      }
    };
  }

  const d = rows[0];
  return {
    found: true,
    snapshot_date: DATASET_SNAPSHOT_DATE,
    field_map: {
      deal_no: 'Номер сделки / deals.deal_no',
      trade_type: 'Тип торгов / deals.trade_type',
      product_name: 'Наименование товара / deals.product_name',
      quantity: 'Количество / deals.quantity',
      lot: 'Лот / deals.lot',
      unit: 'Единица измерения / deals.unit',
      start_price: 'Стартовая цена (per unit) / deals.start_price',
      amount: 'Сумма сделки / deals.amount',
      final_unit_price: 'amount / (quantity * lot)',
      contract_no: 'Номер контракта / deals.contract_no',
      status: 'Состояние сделки / deals.status',
      seller: 'participants via ИНН продавца',
      buyer: 'participants via ИНН покупателя',
      seller_broker: 'brokers via Брокер продавца',
      buyer_broker: 'brokers via Брокер покупателя',
      payment_days: 'contracts.Срок оплаты (calendar days from deal_date)',
      delivery_days: 'contracts.Срок поставки (calendar days from actual payment_date)'
    },
    deal: {
      deal_no: d.deal_no,
      deal_date: d.deal_date,
      deal_time: d.deal_time,
      auction_type: d.trade_type,
      product_name: d.product_name,
      quantity: d.quantity,
      lot: d.lot,
      volume: d.volume,
      unit: d.unit,
      start_price_per_unit: d.start_price,
      final_unit_price: d.final_unit_price,
      price_delta: d.price_delta,
      price_delta_pct: d.price_delta_pct,
      amount_total: d.amount,
      region: d.region,
      market_scope: d.contract_type,
      contract_form: d.contract_form,
      status: d.status,
      contract_no: d.contract_no,
      payment_date: d.payment_date,
      delivery_date: d.delivery_date,
      delivered: d.delivered,
      remaining_qty: d.remaining_qty,
      payment_days: d.payment_days,
      delivery_days: d.delivery_days,
      payment_due_date: d.payment_due_date,
      delivery_due_date: d.delivery_due_date,
      payment_overdue: d.payment_overdue === 'true',
      delivery_overdue: d.delivery_overdue === 'true',
      currency: d.currency,
      delivery_basis: d.delivery_basis,
      base_price: d.base_price
    },
    seller: {
      inn: d.seller_inn,
      name: d.seller_name,
      region: d.seller_region,
      activity: d.seller_activity,
      role: d.seller_role
    },
    buyer: {
      inn: d.buyer_inn,
      name: d.buyer_name,
      region: d.buyer_region,
      activity: d.buyer_activity,
      role: d.buyer_role
    },
    brokers: {
      seller: {
        code: d.seller_broker,
        name: d.seller_broker_name,
        region: d.seller_broker_region
      },
      buyer: {
        code: d.buyer_broker,
        name: d.buyer_broker_name,
        region: d.buyer_broker_region
      }
    }
  };
}

export async function getContractByNumber(contractNumber: string) {
  const contractNo = digitsOnly(contractNumber);
  if (!contractNo) return { found: false, error: 'contract_number_required' };

  const rows = await query<Record<string, string>>(
    `
    SELECT
      c.contract_no,
      c.product_name,
      c.brand,
      c.size,
      c.grade,
      c.product_type,
      c.product_class,
      c.tnved,
      c.product_group,
      c.category,
      c.industry,
      c.unit,
      c.lot::text AS lot,
      c.currency,
      c.base_price::text AS base_price,
      c.deposit_pct,
      c.delivery_basis,
      c.region,
      c.warehouse_address,
      c.trade_type,
      c.contract_type,
      c.contract_form,
      c.payment_days::text AS payment_days,
      c.delivery_days::text AS delivery_days,
      c.packaging,
      c.seller_inn,
      c.registered_at::text AS registered_at,
      c.valid_until::text AS valid_until,
      sp.name AS seller_name
    FROM contracts c
    LEFT JOIN participants sp ON sp.inn = c.seller_inn
    WHERE c.contract_no = $1
    LIMIT 1
    `,
    [contractNo]
  );

  if (!rows[0]) {
    return { found: false, contract_no: contractNo };
  }

  const dealCount = await query<{ deals: string; amount: string }>(
    `
    SELECT COUNT(*)::text AS deals, COALESCE(SUM(amount),0)::text AS amount
    FROM deals WHERE contract_no = $1
    `,
    [contractNo]
  );

  return {
    found: true,
    contract: rows[0],
    linked_deals: dealCount[0],
    formulas: {
      payment_due: 'D_payment = D_deal + payment_days (calendar days)',
      delivery_due: 'D_delivery = D_payment_actual + delivery_days (calendar days)'
    }
  };
}

export async function lookupParticipant(queryText: string) {
  const q = String(queryText ?? '').trim();
  if (!q) return { found: false, error: 'query_required' };
  const inn = digitsOnly(q);

  const byInn =
    inn.length >= 9
      ? await query<Record<string, string>>(
          `
          SELECT inn, name, region, activity, role, vat_payer
          FROM participants
          WHERE inn = $1
          LIMIT 1
          `,
          [inn]
        )
      : [];

  const byName = await query<Record<string, string>>(
    `
    SELECT inn, name, region, activity, role, vat_payer
    FROM participants
    WHERE name ILIKE '%' || $1 || '%'
    ORDER BY name
    LIMIT 10
    `,
    [q]
  );

  const participant = byInn[0];
  let asSeller = null;
  let asBuyer = null;
  if (participant) {
    const [sellerStats] = await query<{ deals: string; amount: string }>(
      `
      SELECT COUNT(*)::text AS deals, COALESCE(SUM(amount),0)::text AS amount
      FROM deals WHERE seller_inn = $1
      `,
      [participant.inn]
    );
    const [buyerStats] = await query<{ deals: string; amount: string }>(
      `
      SELECT COUNT(*)::text AS deals, COALESCE(SUM(amount),0)::text AS amount
      FROM deals WHERE buyer_inn = $1
      `,
      [participant.inn]
    );
    asSeller = sellerStats;
    asBuyer = buyerStats;
  }

  return {
    found: Boolean(participant) || byName.length > 0,
    exact: participant ?? null,
    name_matches: byName,
    role_note:
      'Role on a specific deal is determined by whether INN appears as seller_inn or buyer_inn — not only by participants.role',
    deal_stats: participant ? { as_seller: asSeller, as_buyer: asBuyer } : null
  };
}

export async function lookupBroker(queryText: string) {
  const q = String(queryText ?? '').trim();
  if (!q) return { found: false, error: 'query_required' };
  const code = q.toUpperCase().replace(/\s+/g, '');

  const byCode = await query<Record<string, string>>(
    `
    SELECT code, name, inn, region
    FROM brokers
    WHERE code = $1 OR code ILIKE $1
    LIMIT 1
    `,
    [code]
  );

  const byName = await query<Record<string, string>>(
    `
    SELECT code, name, inn, region
    FROM brokers
    WHERE name ILIKE '%' || $1 || '%' OR code ILIKE '%' || $1 || '%'
    ORDER BY code
    LIMIT 10
    `,
    [q]
  );

  const broker = byCode[0] ?? byName[0] ?? null;
  let stats = null;
  if (broker) {
    const [s] = await query<{ as_seller_broker: string; as_buyer_broker: string; amount: string }>(
      `
      SELECT
        COUNT(*) FILTER (WHERE seller_broker = $1)::text AS as_seller_broker,
        COUNT(*) FILTER (WHERE buyer_broker = $1)::text AS as_buyer_broker,
        COALESCE(SUM(amount) FILTER (WHERE seller_broker = $1 OR buyer_broker = $1), 0)::text AS amount
      FROM deals
      `,
      [broker.code]
    );
    stats = s;
  }

  return {
    found: Boolean(broker),
    broker,
    matches: byName,
    stats,
    note: 'Broker is an intermediary (brokers table). Trading participant is in participants and linked via INN on deals.'
  };
}

export async function getTradeTypeStats(year?: number) {
  const y = year ?? null;
  const rows = await query<{
    trade_type: string;
    deals: string;
    amount: string;
    avg_start_price: string;
    avg_final_unit_price: string;
    avg_price_delta_pct: string;
  }>(
    `
    SELECT
      trade_type,
      COUNT(*)::text AS deals,
      COALESCE(SUM(amount),0)::text AS amount,
      ROUND(AVG(start_price)::numeric, 2)::text AS avg_start_price,
      ROUND(AVG(amount / NULLIF(quantity * COALESCE(lot, 1), 0))::numeric, 2)::text AS avg_final_unit_price,
      ROUND(AVG(
        ((amount / NULLIF(quantity * COALESCE(lot, 1), 0)) - start_price)
        / NULLIF(start_price, 0) * 100
      )::numeric, 3)::text AS avg_price_delta_pct
    FROM deals
    WHERE trade_type IS NOT NULL
      AND ($1::int IS NULL OR EXTRACT(YEAR FROM deal_date) = $1)
    GROUP BY trade_type
    ORDER BY COUNT(*) DESC
    `,
    [y]
  );

  return {
    year: y,
    snapshot_date: DATASET_SNAPSHOT_DATE,
    note: 'Compare start_price (per unit) with final_unit_price = amount/(quantity*lot). Do NOT compare start_price to amount directly.',
    auction_types: {
      'Английский аукцион': 'English/ascending — buyers raise bids; final unit price typically >= start',
      'Обратный аукцион': 'Reverse — sellers compete down; final unit price typically <= start',
      'Двусторонний аукцион': 'Two-sided — buyers and sellers post simultaneously; README does not detail matching algorithm'
    },
    by_type: rows
  };
}

export async function getStatusGlossary() {
  const counts = await query<{ status: string; count: string }>(`
    SELECT status, COUNT(*)::text AS count
    FROM deals
    GROUP BY status
    ORDER BY COUNT(*) DESC
  `);

  return {
    snapshot_date: DATASET_SNAPSHOT_DATE,
    note: 'All statuses reflect the state as of 2026-10-30 end-of-day (README). Not live realtime.',
    glossary: [
      {
        status: 'Новый',
        meaning: 'Deal created on 2026-10-30 (export day) — new, not "failed"',
        bucket: 'in_progress'
      },
      {
        status: 'Не подписан',
        meaning: 'Contract not yet signed by parties',
        bucket: 'in_progress'
      },
      {
        status: 'Заключен',
        meaning: 'Signed Forward/Futures; payment deadline not yet passed',
        bucket: 'in_progress'
      },
      {
        status: 'Ждёт оплату',
        meaning: 'Signed Spot; payment deadline not yet passed',
        bucket: 'in_progress'
      },
      {
        status: 'Оплачен',
        meaning: 'Paid, but product not yet fully delivered',
        bucket: 'in_progress'
      },
      {
        status: 'Исполнен',
        meaning: 'Paid and fully delivered — successfully completed',
        bucket: 'completed'
      },
      {
        status: 'Исполнен(Частично)',
        meaning: 'Paid, only part of product delivered — NOT fully completed',
        bucket: 'partial'
      },
      {
        status: 'Аннулирован(Не оплачен)',
        meaning: 'Cancelled because not paid on time — not fulfilled',
        bucket: 'failed'
      }
    ],
    counts,
    classification: {
      fully_completed: ['Исполнен'],
      in_progress_or_partial: [
        'Новый',
        'Не подписан',
        'Заключен',
        'Ждёт оплату',
        'Оплачен',
        'Исполнен(Частично)'
      ],
      not_fulfilled: ['Аннулирован(Не оплачен)']
    }
  };
}

export async function analyzeDeadlineBreaches(limit = 10) {
  const lim = Math.min(Math.max(Number(limit) || 10, 1), 30);
  const [summary] = await query<{
    payment_late: string;
    delivery_late: string;
    unpaid_past_due: string;
  }>(`
    SELECT
      COUNT(*) FILTER (
        WHERE d.payment_date IS NOT NULL
          AND c.payment_days IS NOT NULL
          AND d.payment_date > d.deal_date + (c.payment_days || ' days')::interval
      )::text AS payment_late,
      COUNT(*) FILTER (
        WHERE d.payment_date IS NOT NULL
          AND c.delivery_days IS NOT NULL
          AND d.delivery_date IS NOT NULL
          AND d.delivery_date > d.payment_date + (c.delivery_days || ' days')::interval
      )::text AS delivery_late,
      COUNT(*) FILTER (
        WHERE d.payment_date IS NULL
          AND c.payment_days IS NOT NULL
          AND d.deal_date + (c.payment_days || ' days')::interval < DATE '${DATASET_SNAPSHOT_DATE}'
          AND d.status ILIKE '%Аннулирован%'
      )::text AS unpaid_past_due
    FROM deals d
    LEFT JOIN contracts c ON c.contract_no = d.contract_no
  `);

  const samples = await query<{
    deal_no: string;
    product_name: string;
    contract_form: string;
    status: string;
    deal_date: string;
    payment_date: string;
    delivery_date: string;
    payment_days: string;
    delivery_days: string;
    issue: string;
  }>(
    `
    SELECT
      d.deal_no,
      d.product_name,
      d.contract_form,
      d.status,
      d.deal_date::text,
      d.payment_date::text,
      d.delivery_date::text,
      c.payment_days::text,
      c.delivery_days::text,
      CASE
        WHEN d.payment_date IS NOT NULL
          AND c.payment_days IS NOT NULL
          AND d.payment_date > d.deal_date + (c.payment_days || ' days')::interval
          THEN 'payment_late'
        WHEN d.payment_date IS NOT NULL
          AND c.delivery_days IS NOT NULL
          AND d.delivery_date IS NOT NULL
          AND d.delivery_date > d.payment_date + (c.delivery_days || ' days')::interval
          THEN 'delivery_late'
        ELSE 'other'
      END AS issue
    FROM deals d
    JOIN contracts c ON c.contract_no = d.contract_no
    WHERE
      (
        d.payment_date IS NOT NULL
        AND c.payment_days IS NOT NULL
        AND d.payment_date > d.deal_date + (c.payment_days || ' days')::interval
      )
      OR (
        d.payment_date IS NOT NULL
        AND c.delivery_days IS NOT NULL
        AND d.delivery_date IS NOT NULL
        AND d.delivery_date > d.payment_date + (c.delivery_days || ' days')::interval
      )
    ORDER BY d.deal_date DESC NULLS LAST
    LIMIT $1
    `,
    [lim]
  );

  return {
    snapshot_date: DATASET_SNAPSHOT_DATE,
    formulas: {
      payment_due: 'D_payment = D_deal + Срок оплаты (calendar days)',
      delivery_due: 'D_delivery = D_payment_actual + Срок поставки (calendar days)',
      spot_vs_forward:
        'Ждёт оплату = signed Spot awaiting payment; Заключен = signed Forward/Futures awaiting payment (README)'
    },
    summary,
    samples
  };
}

export async function getUsdRate(date?: string) {
  const d = date?.trim() || DATASET_SNAPSHOT_DATE;
  const rows = await query<{ rate_date: string; rate: string }>(
    `
    SELECT rate_date::text, rate::text
    FROM usd_rates
    WHERE rate_date <= $1::date
    ORDER BY rate_date DESC
    LIMIT 1
    `,
    [d]
  );
  if (!rows[0]) return { found: false, date: d };
  return { found: true, requested_date: d, ...rows[0], source: 'usd_rates' };
}
