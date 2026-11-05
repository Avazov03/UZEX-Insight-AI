import { NextResponse } from 'next/server';
import { getMarketDashboard } from '@/lib/uzex-dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getMarketDashboard();
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          // Browser/CDN may reuse briefly; server also has 10m in-memory TTL
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
