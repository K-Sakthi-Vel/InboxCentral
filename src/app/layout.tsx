'use client';

import React, { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';

interface RootLayoutProps {
  children: ReactNode;
}

function AuthWrapper({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading application...</div>;
  }

  if (!isAuthenticated && !['/login', '/signup', '/auth'].includes(pathname)) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="w-full px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">InboxCentral</h1>
          <div className="flex items-center">
            {isAuthenticated && user && (
              <span className="text-sm text-gray-700 mr-4">Welcome, {user.name || user.email}!</span>
            )}
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full p-6 bg-gray-50 rounded-none shadow-none">{children}</main>
      <Toaster />
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <head />
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthWrapper>{children}</AuthWrapper>
        </QueryClientProvider>
      </body>
    </html>
  );
}
