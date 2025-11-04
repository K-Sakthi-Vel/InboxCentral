'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuth'; // Import useAuth

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth(); // Destructure login from useAuth

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (token) {
        localStorage.setItem('token', token); // Set token immediately
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/session`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const data = await res.json();

          if (res.ok && data.user) {
            login(token, data.user); // Update global auth state
            if (data.user.isTwilioVerified) {
              router.replace('/'); // Redirect to home if Twilio is verified
            } else {
              router.replace('/verify-twilio'); // Redirect to Twilio verification if not verified
            }
          } else {
            localStorage.removeItem('token');
            router.replace('/login'); // Redirect to login if session fetch fails
          }
        } catch (error) {
          console.error('Failed to fetch user session after Google login:', error);
          localStorage.removeItem('token');
          router.replace('/login'); // Redirect to login on error
        }
      } else {
        // If no token is present, redirect to login
        router.replace('/login');
      }
    };

    handleAuthCallback();
  }, [token, router, login]); // Dependencies: token, router, login


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-700">Processing authentication...</p>
    </div>
  );
}
