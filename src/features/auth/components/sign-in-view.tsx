import { isDevAuthBypass } from '@/lib/auth-guard';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import { DevBypassSignIn } from './dev-bypass-sign-in';
import { SignInBrandPanel } from './sign-in-brand-panel';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in to UZEX Insight AI'
};

export default function SignInViewPage() {
  const bypass = isDevAuthBypass();

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <SignInBrandPanel />
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          {bypass ? <DevBypassSignIn /> : <ClerkSignInForm />}
        </div>
      </div>
    </div>
  );
}
