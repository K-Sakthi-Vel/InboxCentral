'use client';

import React, { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import '@/app/globals.css';
import { AuthProvider } from '@/lib/useAuth';
import { AuthWrapper } from '@/components/AuthWrapper';
import Sidebar from '@/components/Sidebar';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [activeTabName, setActiveTabName] = useState('');
  const pathname = usePathname();

  const handleTabChange = (tabName: string) => {
    setActiveTabName(tabName);
  };

  const noSidebarPaths = ['/login', '/signup', '/verify-twilio', '/auth'];
  const showSidebar = !noSidebarPaths.includes(pathname);

  return (
    <html lang="en">
      <head>
        <title>Inbox Central</title>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {showSidebar ? (
              <Sidebar onTabChange={handleTabChange}>
                <AuthWrapper activeTabName={activeTabName}>{children}</AuthWrapper>
              </Sidebar>
            ) : (
              <AuthWrapper activeTabName={activeTabName}>{children}</AuthWrapper>
            )}
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
