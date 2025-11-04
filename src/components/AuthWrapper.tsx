'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { TwilioVerificationModal } from '../components/TwilioVerificationModal'; // Will create this component
import { useAuth } from '@/lib/useAuth';
import { useRemoveTwilioNumber } from '@/lib/api'; // Import the new mutation hook
import { useRouter, usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

interface AuthWrapperProps {
  children: ReactNode;
  activeTabName: string;
}

export function AuthWrapper({ children, activeTabName }: AuthWrapperProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { mutate: removeTwilioNumber } = useRemoveTwilioNumber(); // Use the new mutation hook
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
      // If authenticated and Twilio is verified (or no Twilio number set),
      // and currently on a public authentication page (excluding /auth) or verify-twilio page, redirect to home
      if ((isAuthPage || isVerifyTwilioPage) && pathname !== '/') {
        router.replace('/');
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

  // Open Twilio verification modal if authenticated but not verified
  useEffect(() => {
    if (!loading && isAuthenticated && user && user.twilioNumber && !user.isTwilioVerified) {
      setIsTwilioModalOpen(true);
    } else {
      setIsTwilioModalOpen(false);
    }
  }, [loading, isAuthenticated, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading application...</div>;
  }

  // If not authenticated and not on an allowed public path, return null to prevent rendering before redirect
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  // If authenticated and on a public auth page (excluding /auth, which handles its own redirection),
  // return null to prevent rendering the auth page content.
  if (isAuthenticated && isAuthPage) {
    return null;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-[65px] shadow-sm px-6 flex items-center justify-between">
        {activeTabName && <h1 className="text-2xl font-bold text-gray-800">{activeTabName}</h1>}
        <div className="flex items-center">
          {isAuthenticated && user && user.isTwilioVerified && user.twilioNumber && (
            <div className="flex items-center mr-4 p-2"> {/* Added styling for phone number */}
              <span className="text-sm font-bold text-gray-700 mr-2">{user.twilioNumber}</span>
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
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 font-bold text-sm"
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
                  {user.isTwilioVerified && user.twilioNumber && (
                    <button
                      onClick={() => {
                        removeTwilioNumber(); // Call the mutation to remove the Twilio number
                        setIsDropdownOpen(false); // Close dropdown after click
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Remove Verified Number
                    </button>
                  )}
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
      </header>
      <main className="flex-1 w-full p-3 bg-gray-50 rounded-none shadow-none">{children}</main>
      <Toaster />
    </div>
  );
}
