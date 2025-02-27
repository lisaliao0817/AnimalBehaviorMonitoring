'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './auth-provider';
import { ConvexClientProvider } from './convex-provider';
import { ThemeProvider } from './theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ConvexClientProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ConvexClientProvider>
    </AuthProvider>
  );
} 