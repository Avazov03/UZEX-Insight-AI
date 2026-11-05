import { cn } from '@/lib/utils';
import { isDevAuthBypass } from '@/lib/auth-guard';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import { InteractiveGridPattern } from './interactive-grid';
import { DevBypassSignIn } from './dev-bypass-sign-in';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in to UZEX Insight AI'
};

export default function SignInViewPage() {
  const bypass = isDevAuthBypass();

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='bg-sidebar absolute inset-0' />
        <div className='text-sidebar-foreground relative z-20 flex items-center gap-2 text-lg font-medium'>
          <Icons.sparkles className='size-5' />
          UZEX Insight AI
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;AI-powered commodity market intelligence — birja bitimlarini tahlil qiling,
              riskni ko‘ring, qaror qabul qiling.&rdquo;
            </p>
            <footer className='text-sidebar-foreground/70 text-sm'>UZEX Hackathon</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          {bypass ? <DevBypassSignIn /> : <ClerkSignInForm />}
        </div>
      </div>
    </div>
  );
}
