import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Message, API_BASE_URL } from '@/lib/api';
import UserIcon from './UserIcon';
import { useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';

interface MessageListProps {
  threadId: string;
  messages: Message[] | undefined;
}

export default function MessageList({ threadId, messages }: MessageListProps) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const socket = io(API_BASE_URL.replace('/api', '')); // Connect to the root of the backend URL

    socket.on('connect', () => {
      console.log('Socket.IO connected on frontend');
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO disconnected on frontend');
    });

    socket.on('message.new', (newMessage: Message) => {
      console.log('Frontend received message.new:', newMessage);
      if (newMessage.contactId === threadId) {
        queryClient.setQueryData(['messages', threadId], (oldMessages: Message[] | undefined) => {
          if (oldMessages) {
            // Check if message already exists to prevent duplicates
            if (!oldMessages.some(msg => msg.id === newMessage.id)) {
              const updatedMessages = [...oldMessages, newMessage];
              console.log('Updating messages cache for thread', threadId, 'with new message:', newMessage);
              return updatedMessages;
            }
            console.log('Message already exists in cache, not adding:', newMessage);
            return oldMessages;
          }
          console.log('Initializing messages cache for thread', threadId, 'with new message:', newMessage);
          return [newMessage];
        });
      }
      // Invalidate threads query to update snippet/unread count
      console.log('Invalidating threads query');
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [threadId, queryClient]);

  if (!messages) return <div className="text-center text-gray-500 py-10">Loading messages...</div>;
  if (messages.length === 0) return <div className="text-center text-gray-500 py-10">No messages in this thread yet.</div>;

  return (
    <div className="flex flex-col space-y-4 h-full pr-2">
      {messages.map((m: Message) => (
        <div
          key={m.id}
          className={clsx(
            'flex items-start gap-3',
            m.direction === 'OUTBOUND' && 'self-end flex-row-reverse'
          )}
        >
          <UserIcon className="h-8 w-8 text-gray-400" />
          <div
            className={clsx(
              'p-4 rounded-xl shadow-sm max-w-[75%]',
              m.direction === 'INBOUND'
                ? 'bg-gray-100 self-start rounded-bl-none text-gray-800'
                : 'bg-blue-500 text-white self-end rounded-br-none'
            )}
          >
            <div className="text-base whitespace-pre-wrap">{m.body}</div>

            {m.media?.length ? (
            <div className="mt-3 flex gap-3 flex-wrap">
              {m.media.map((url: any, i: React.Key | null | undefined) => (
                <div key={i} className="w-32 h-24 relative border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <Image src={url || '/placeholder.png'} alt="media" fill style={{ objectFit: 'cover' }} className="object-cover" />
                </div>
              ))}
            </div>
            ) : null}

            <div className={clsx(
              'text-xs mt-2',
              m.direction === 'INBOUND' ? 'text-gray-500' : 'text-blue-200'
            )}>
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} /> {/* Add this ref for scrolling */}
    </div>
  );
}
