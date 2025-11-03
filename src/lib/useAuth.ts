import { useEffect, useState } from 'react';

type User = {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
} | null;

export function useAuth() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        setUser(data?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
