'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import AuthForm from '@/components/auth/auth-form';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const showSignup = searchParams.get('signup') === 'true';
  const inviteCode = searchParams.get('invite') || '';
  const shouldLogout = searchParams.get('logout') === 'true';

  useEffect(() => {
    // If logout parameter is present and user is authenticated, sign out
    if (shouldLogout && status === 'authenticated') {
      signOut({ redirect: false });
      return;
    }

    // Only redirect to dashboard if user is authenticated and not trying to logout
    if (status === 'authenticated' && !shouldLogout) {
      redirect('/dashboard');
    }
  }, [status, shouldLogout]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Animal Behavior Monitoring
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {showSignup 
              ? "Create an account to join the organization" 
              : "Sign in to your account to continue"}
          </p>
        </div>
        <AuthForm defaultTab={showSignup ? 'signup' : 'login'} inviteCode={inviteCode} />
      </div>
    </main>
  );
} 