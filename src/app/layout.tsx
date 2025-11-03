'use client';

import React, { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/app/globals.css';
import { AuthProvider } from '@/lib/useAuth'; // Import the new AuthProvider
import { AuthWrapper } from '@/components/AuthWrapper'; // Import the new AuthWrapper component

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <head />
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider> {/* Wrap AuthWrapper with AuthProvider */}
            <AuthWrapper>{children}</AuthWrapper>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
