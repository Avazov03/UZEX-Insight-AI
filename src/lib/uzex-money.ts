/**
 * Shared UZEX money + delivery SQL fragments.
 * Requires aliases: d = deals, c = contracts, fx = LATERAL usd_rates row.
 */

export const DATASET_SNAPSHOT_DATE = '2026-10-30';

/** contracts.currency values that mean deal.amount is in USD. */
export const USD_CURRENCY_SQL = `(
  c.currency LIKE '%США%'
  OR c.currency LIKE '%оллар%'
  OR lower(COALESCE(c.currency, '')) LIKE '%usd%'
)`;

/**
 * Deal total in UZS. USD deals × rate on/before deal_date; UZS left as-is.
 * NEVER SUM(d.amount) across currencies without this.
 */
export const AMOUNT_UZS_SQL = `
  CASE
    WHEN c.currency IS NOT NULL AND ${USD_CURRENCY_SQL}
      THEN d.amount * COALESCE(fx.rate, 0)
    ELSE d.amount
  END
`;

export const FX_LATERAL_JOIN = `
  LEFT JOIN LATERAL (
    SELECT rate
    FROM usd_rates ur
    WHERE ur.rate_date <= d.deal_date
    ORDER BY ur.rate_date DESC
    LIMIT 1
  ) fx ON true
`;

export const DEALS_WITH_FX_FROM = `
  FROM deals d
  LEFT JOIN contracts c ON c.contract_no = d.contract_no
  ${FX_LATERAL_JOIN}
`;

/** Delivered after D_delivery = payment_date + delivery_days (README). */
export const DELIVERY_LATE_ACTUAL_SQL = `
  d.payment_date IS NOT NULL
  AND c.delivery_days IS NOT NULL
  AND d.delivery_date IS NOT NULL
  AND d.delivery_date > d.payment_date + (c.delivery_days || ' days')::interval
`;

/** Paid, not delivered, due before dataset snapshot. */
export const DELIVERY_OVERDUE_OPEN_SQL = `
  d.payment_date IS NOT NULL
  AND c.delivery_days IS NOT NULL
  AND d.delivery_date IS NULL
  AND d.payment_date + (c.delivery_days || ' days')::interval < DATE '${DATASET_SNAPSHOT_DATE}'
`;

export const MONEY_METHODOLOGY = {
  currency:
    'Export (USD) deals converted to UZS with usd_rates on/before deal_date; UZS deals unchanged. Never mix raw amount across currencies.',
  delivery:
    `D_delivery = payment_date + contracts.delivery_days. Late = delivered after due; overdue-open = unpaid delivery by ${DATASET_SNAPSHOT_DATE}.`,
  yearCompare:
    '2026 is partial through 2026-10-30 — compare same calendar cut (Jan 1–Oct 30) vs full-year totals.',
  snapshotDate: DATASET_SNAPSHOT_DATE
} as const;
