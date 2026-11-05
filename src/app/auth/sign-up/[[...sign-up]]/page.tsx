import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isDevAuthBypass } from '@/lib/auth-guard';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default function Page() {
  if (isDevAuthBypass()) {
    redirect('/dashboard/ai-assistant');
  }

  return <SignUpViewPage />;
}
