'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

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
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({ user: null, loading: false, isAuthenticated: false });
    router.push('/login');
  };

  return { ...authState, login, logout, fetchUser };
}

export function withAuth<P extends object>(Component: React.ComponentType<P & { user: User | null }>) {
  return function ProtectedRoute(props: P) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
    }

    // Ensure the user prop is passed correctly
    const componentProps = { ...props, user };
    return <Component {...componentProps} />;
  };
}
