'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import AuthForm from '@/components/auth/auth-form';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      redirect('/dashboard');
    }
  }, [status]);

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
            Sign in to your account to continue
          </p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
} 