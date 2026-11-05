import { auth } from '@clerk/nextjs/server';
import { isDevAuthBypass } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';

export default async function Page() {
  if (isDevAuthBypass()) {
    redirect('/dashboard/ai-assistant');
  }

  const { userId } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  }

  redirect('/dashboard/ai-assistant');
}
