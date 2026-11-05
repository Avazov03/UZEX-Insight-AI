import { NextResponse } from 'next/server';
import { fetchMarketDashboard } from '@/features/market/api/service';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await fetchMarketDashboard();
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
