/**
 * Rebuild FX-correct MarketDashboard JSON for chart pages.
 * Run on VPS (with DB): npx tsx scripts/export-dashboard-snapshot.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(path: string) {
  try {
    const raw = readFileSync(path, 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 1) continue;
      const key = t.slice(0, i).trim();
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

loadEnvFile(resolve(process.cwd(), '.env.production'));
loadEnvFile(resolve(process.cwd(), '.env.local'));

async function main() {
  const { rebuildMarketDashboardFromDb } = await import('../src/lib/uzex-dashboard');
  const data = await rebuildMarketDashboardFromDb();
  const snapshot = {
    ...data,
    source: 'snapshot' as const,
    datasetNote:
      'PostgreSQL UZEX test datasetidan FX-normalizatsiya bilan hisoblangan snapshot (diagrammalar). AI chat jonli DB orqali ishlaydi.'
  };
  const out = resolve(process.cwd(), 'src/constants/market-dashboard-snapshot.json');
  writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  // eslint-disable-next-line no-console
  console.log(
    `Wrote ${out} · deals=${snapshot.kpis.totalDeals} · valueTrn=${snapshot.kpis.totalValueTrn} · delayed=${snapshot.kpis.delayedDeals}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
