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
          <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm p-4">
              <div className="w-full px-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">InboxCentral</h1>
                <div className="text-sm text-gray-500">Team · Demo</div>
              </div>
            </header>
            <main className="flex-1 w-full p-6 bg-gray-50 rounded-none shadow-none">{children}</main>
            <Toaster />
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
