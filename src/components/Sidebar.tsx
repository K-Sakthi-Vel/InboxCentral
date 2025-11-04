'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HomeIcon, InboxIcon } from '@heroicons/react/24/outline'; // Using Heroicons for icons

interface SidebarProps {
  children: React.ReactNode;
  onTabChange: (tabName: string) => void;
}

export default function Sidebar({ children, onTabChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/dashboard') {
      onTabChange('Dashboard');
    } else if (pathname === '/inbox') {
      onTabChange('Unified Inbox');
    } else {
      onTabChange(''); // Clear tab name for other pages
    }
  }, [pathname, onTabChange]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`flex flex-col ${
          isExpanded ? 'w-64' : 'w-20'
        } bg-gray-800 text-white shadow-lg transition-all duration-300 ease-in-out`}
      >
        {/* Logo and App Name */}
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <Image src="/logo.png" alt="App Logo" width={32} height={32} className="mr-2" />
          {isExpanded && <span className="text-xl font-semibold">Inbox Central</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link href="/dashboard" className={`flex items-center px-4 py-2 rounded-md ${pathname === '/dashboard' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors duration-200`}>
              <HomeIcon className="h-6 w-6 mr-3" />
              {isExpanded && <span className="text-sm font-medium">Dashboard</span>}
          </Link>
          <Link href="/inbox" className={`flex items-center px-4 py-2 rounded-md ${pathname === '/inbox' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'} transition-colors duration-200`}>
              <InboxIcon className="h-6 w-6 mr-3" />
              {isExpanded && <span className="text-sm font-medium">Unified Inbox</span>}
          </Link>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-200"
          >
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
