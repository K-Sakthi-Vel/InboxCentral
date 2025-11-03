import React from 'react';
import Image from 'next/image';
import { useMessages, Message } from '@/lib/api';

interface MessageListProps {
  threadId: string;
}

export default function MessageList({ threadId }: MessageListProps) {
  const { data: messages, isLoading } = useMessages(threadId);

  if (isLoading) return <div>Loading messages...</div>;
  if (!messages || messages.length === 0) return <div className="text-sm text-gray-500 py-6">No messages in this thread</div>;

  return (
    <div className="space-y-4">
      {messages.map((m: Message) => (
        <div
          key={m.id}
          className={`p-3 rounded max-w-3xl ${m.direction === 'INBOUND' ? 'bg-gray-50 self-start' : 'bg-blue-50 self-end'}`}
        >
          <div className="text-sm whitespace-pre-wrap">{m.body}</div>

          {m.media?.length ? (
            <div className="mt-2 flex gap-2 flex-wrap">
              {m.media.map((url: any, i: React.Key | null | undefined) => (
                <div key={i} className="w-28 h-20 relative border rounded overflow-hidden">
                  <Image src={url || '/placeholder.png'} alt="media" fill style={{ objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          ) : null}

          <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
