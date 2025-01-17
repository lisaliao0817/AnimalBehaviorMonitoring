'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.user) {
      router.push('/login');
    }
  }, [auth.user, router]);

  // Show nothing while checking authentication
  if (!auth.user) {
    return null;
  }

  return children;
} 