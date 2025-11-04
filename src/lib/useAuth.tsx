'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useRequestTwilioOtp, useVerifyTwilioOtp, useUpdateTwilioNumber } from './api'; // Import new API hooks

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  twilioNumber?: string | null; // Make nullable
  isTwilioVerified?: boolean;
  teamRoles?: { teamId: string }[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
  requestTwilioVerification: (twilioNumber: string) => Promise<{ success: boolean; message: string }>;
  verifyTwilioNumber: (twilioNumber: string, otp: string) => Promise<{ success: boolean; message: string }>;
  updateTwilioNumber: (twilioNumber: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<Omit<AuthState, 'login' | 'logout' | 'fetchUser' | 'requestTwilioVerification' | 'verifyTwilioNumber' | 'updateTwilioNumber'>>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  const requestOtpMutation = useRequestTwilioOtp();
  const verifyOtpMutation = useVerifyTwilioOtp();
  const updateTwilioNumberMutation = useUpdateTwilioNumber();

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState({ user: null, loading: false, isAuthenticated: false });
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/session`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.user) {
        setAuthState({ user: data.user, loading: false, isAuthenticated: true });
      } else {
        localStorage.removeItem('token');
        setAuthState({ user: null, loading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      localStorage.removeItem('token');
      setAuthState({ user: null, loading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setAuthState({ user, loading: false, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ user: null, loading: false, isAuthenticated: false });
    router.replace('/login'); // Use replace for logout to prevent going back to protected pages
  };

  const requestTwilioVerification = async (twilioNumber: string) => {
    try {
      await requestOtpMutation.mutateAsync(twilioNumber);
      return { success: true, message: 'OTP sent successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to send OTP.' };
    }
  };

  const verifyTwilioNumber = async (twilioNumber: string, otp: string) => {
    try {
      await verifyOtpMutation.mutateAsync({ twilioNumber, otp });
      await fetchUser();
      return { success: true, message: 'Twilio number verified successfully!' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to verify OTP.' };
    }
  };

  const updateTwilioNumber = async (twilioNumber: string) => {
    try {
      await updateTwilioNumberMutation.mutateAsync(twilioNumber);
      await fetchUser();
      return { success: true, message: 'Twilio number updated. Please verify.' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Failed to update Twilio number.' };
    }
  };

  const authContextValue = {
    ...authState,
    login,
    logout,
    fetchUser,
    requestTwilioVerification,
    verifyTwilioNumber,
    updateTwilioNumber,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function withAuth<P extends object>(Component: React.ComponentType<P & { user: User | null }>) {
  return function ProtectedRoute(props: P) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.replace('/login'); // Use replace for initial unauthenticated redirect
      } else if (!loading && isAuthenticated && user && !user.isTwilioVerified) {
        router.replace('/verify-twilio'); // Use replace for Twilio verification redirect
      }
    }, [loading, isAuthenticated, user, router]);

    if (loading || !isAuthenticated) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
    }

    const componentProps = { ...props, user };
    return <Component {...componentProps} />;
  };
}
