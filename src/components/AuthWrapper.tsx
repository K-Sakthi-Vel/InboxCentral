'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { TwilioVerificationModal } from '../components/TwilioVerificationModal'; // Will create this component
import { useAuth } from '@/lib/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTwilioModalOpen, setIsTwilioModalOpen] = useState(false); // State for Twilio modal
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = ['/login', '/signup', '/auth'].includes(pathname);
  const isVerifyTwilioPage = pathname === '/verify-twilio';
  const isAuthCallbackPage = pathname === '/auth';
  const isPublicPath = isAuthPage || isVerifyTwilioPage || isAuthCallbackPage;

  useEffect(() => {
    if (loading) {
      return; // Do nothing while loading authentication state
    }

    if (!isAuthenticated) {
      // If not authenticated and not on an allowed public path, redirect to login
      if (!isPublicPath) {
        router.replace('/login');
      }
    } else { // isAuthenticated is true
      if (user && user.twilioNumber && !user.isTwilioVerified) {
        // If authenticated but Twilio not verified, and not already on the verify-twilio page, redirect to verify-twilio
        if (!isVerifyTwilioPage) {
          router.replace('/verify-twilio');
        }
      } else {
        // If authenticated and Twilio is verified (or no Twilio number set),
        // and currently on a public authentication page (excluding /auth) or verify-twilio page, redirect to home
        if ((isAuthPage || isVerifyTwilioPage) && pathname !== '/') {
          router.replace('/');
        }
      }
    }
  }, [loading, isAuthenticated, user, pathname, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading application...</div>;
  }

  // If not authenticated and not on an allowed public path, return null to prevent rendering before redirect
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  // If authenticated and on a public auth page (excluding /auth, which handles its own redirection),
  // return null to prevent rendering the auth page content.
  if (isAuthenticated && (isAuthPage || isVerifyTwilioPage)) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="w-full px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">InboxCentral</h1>
          <div className="flex items-center">
            {isAuthenticated && user && user.isTwilioVerified && user.twilioNumber && (
              <div className="flex items-center mr-4 p-2 bg-gray-100 rounded-md"> {/* Added styling for phone number */}
                <span className="text-sm font-bold text-gray-700 mr-2">Twilio: {user.twilioNumber}</span>
                <button
                  onClick={() => setIsTwilioModalOpen(true)} // Open modal instead of redirecting
                  className="text-blue-500 hover:text-blue-700 text-lg" // Icon styling
                  aria-label="Edit Twilio Number"
                >
                  &#9998; {/* Pencil icon */}
                </button>
              </div>
            )}
            {isAuthenticated && user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="block px-4 py-2 text-sm text-gray-700">
                      <p className="font-bold">{user.name || 'User'}</p>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            {isTwilioModalOpen && (
              <TwilioVerificationModal
                isOpen={isTwilioModalOpen}
                onClose={() => setIsTwilioModalOpen(false)}
                currentTwilioNumber={user?.twilioNumber || ''}
              />
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full p-6 bg-gray-50 rounded-none shadow-none">{children}</main>
      <Toaster />
    </div>
  );
}
