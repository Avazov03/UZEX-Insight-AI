import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isDevAuthBypass } from '@/lib/auth-guard';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  // Selection / demo: no login wall — jump straight into the product.
  // Full sign-in UI stays in code (features/auth) + preserved/ for later.
  if (isDevAuthBypass()) {
    redirect('/dashboard/ai-assistant');
  }

  return <SignInViewPage />;
}
