'use client';

import React, { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';

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
          <div className="min-h-screen">
            <header className="bg-white border-b p-3">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <h1 className="text-xl font-semibold">Unified Inbox</h1>
                <div className="text-sm text-gray-600">Team · Demo</div>
              </div>
            </header>
            <main className="max-w-6xl mx-auto p-4">{children}</main>
            <Toaster />
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
