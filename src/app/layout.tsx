import './globals.css';
import type { Metadata } from 'next';
import { ConvexClientProvider } from './ConvexClientProvider';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Animal Behavior Monitoring',
  description: 'Monitor and track animal behavior at rescue centers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
