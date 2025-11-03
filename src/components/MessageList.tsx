import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { useMessages, Message } from '@/lib/api';

interface MessageListProps {
  threadId: string;
}

export default function MessageList({ threadId }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(threadId);

  if (isLoading) return <div className="text-center text-gray-500 py-10">Loading messages...</div>;
  if (!messages || messages.length === 0) return <div className="text-center text-gray-500 py-10">No messages in this thread yet.</div>;

  return (
    <div className="flex flex-col space-y-4">
      {messages.map((m: Message) => (
        <div
          key={m.id}
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
      ))}
    </div>
  );
}
