/**
 * Lightweight typed fetch helpers and React Query hooks.
 * Backend endpoints are stubs to be implemented next.
 */

import axios, { AxiosInstance } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

/** Fetch threads (group by contact) */
export function useThreads() {
  return useQuery<Thread[], Error>({
    queryKey: ['threads'],
    queryFn: async () => {
      try {
        const res = await api.get<Thread[]>('/inbox/threads');
        return res.data;
      } catch (err) {
        // fallback mock data if backend not ready
        return [
          { id: 't1', contactName: 'Alice', snippet: 'Hey, is this available?', unread: 1, channel: 'SMS', updatedAt: new Date().toISOString() },
          { id: 't2', contactName: 'Bob', snippet: 'Thanks for the info', unread: 0, channel: 'WHATSAPP', updatedAt: new Date().toISOString() }
        ];
      }
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
        // fallback sample messages
        return [
          { id: 'm1', direction: 'INBOUND', body: 'Hello', media: null, createdAt: new Date().toISOString() },
          { id: 'm2', direction: 'OUTBOUND', body: 'Hi there!', media: null, createdAt: new Date().toISOString() }
        ];
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
