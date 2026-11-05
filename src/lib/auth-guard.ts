import { auth } from '@clerk/nextjs/server';

/** Temporary local bypass — set NEXT_PUBLIC_DEV_AUTH_BYPASS=true in .env.local */
export function isDevAuthBypass(): boolean {
  return process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
}

/** Protects routes unless local bypass is enabled. */
export async function requireAuth(): Promise<void> {
  if (isDevAuthBypass()) return;
  await auth.protect();
}
