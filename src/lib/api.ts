/**
 * Lightweight typed fetch helpers and React Query hooks.
 * Backend endpoints are stubs to be implemented next.
 */

import axios, { AxiosInstance } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api';

export type Thread = {
  id: string;
  contactName?: string | null;
  snippet?: string | null;
  unread?: number | null;
  updatedAt?: string | null;
  channel?: string | null;
};

export type Message = {
  id: string;
  contactId?: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  body?: string | null;
  media?: string[] | null;
  createdAt: string;
};

export type Note = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/** Fetch threads (group by contact) */
export function useThreads() {
  return useQuery<Thread[], Error>({
    queryKey: ['threads'],
    queryFn: async () => {
      try {
        const res = await api.get<Thread[]>('/inbox/threads');
        return res.data;
      } catch (err) {
        throw err; // Re-throw the error to be handled by React Query's error handling
      }
    },
  });
}

/** Update Twilio Number mutation */
export function useUpdateTwilioNumber() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (twilioNumber: string) => {
      const res = await api.put('/auth/update-twilio-number', { twilioNumber });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session'] }); // Invalidate session to refetch user data
    },
  });
}

/** Request Twilio OTP mutation */
export function useRequestTwilioOtp() {
  return useMutation({
    mutationFn: async (twilioNumber: string) => {
      const res = await api.post('/auth/request-twilio-otp', { twilioNumber });
      return res.data;
    },
  });
}

/** Verify Twilio OTP mutation */
export function useVerifyTwilioOtp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { twilioNumber: string; otp: string }) => {
      const res = await api.post('/auth/verify-twilio-otp', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session'] }); // Invalidate session to refetch user data
    },
  });
}

/** Fetch messages for a thread */
export function useMessages(threadId: string) {
  return useQuery<Message[], Error>({
    queryKey: ['messages', threadId],
    queryFn: async () => {
      try {
        const res = await api.get<Message[]>(`/messages/thread/${threadId}`);
        return res.data;
      } catch (err) {
        throw err; // Re-throw the error to be handled by React Query's error handling
      }
    },
    enabled: !!threadId,
  });
}

/** Send message mutation */
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { threadId: string; body: string; scheduleAt?: string; channel?: string }) => {
      const res = await api.post('/messages/send', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      qc.invalidateQueries({ queryKey: ['threads'] });
    },
  });
}

/** Fetch all notes */
export function useNotes() {
  return useQuery<Note[], Error>({
    queryKey: ['notes'],
    queryFn: async () => {
      try {
        const res = await api.get<Note[]>('/notes');
        return res.data;
      } catch (err) {
        throw err;
      }
    },
  });
}

/** Save note mutation */
export function useSaveNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { content: string }) => {
      const res = await api.post('/notes', { content: payload.content });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
