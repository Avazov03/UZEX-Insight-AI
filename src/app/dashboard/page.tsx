import { auth } from '@clerk/nextjs/server';
import { isDevAuthBypass } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  if (!isDevAuthBypass()) {
    const { userId } = await auth();
    if (!userId) {
      return redirect('/auth/sign-in');
    }
  }

  redirect('/dashboard/ai-assistant');
}
