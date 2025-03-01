'use client';

import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from 'convex/react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexClientProviderProps {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
} 