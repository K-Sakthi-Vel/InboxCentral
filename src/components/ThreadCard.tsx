import React from 'react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export type Thread = {
  id: string;
  contactName?: string | null;
  snippet?: string | null;
  unread?: number | null;
  updatedAt?: string | null;
  channel?: string | null;
};

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function ThreadCard({ thread, onClick, isSelected = false }: ThreadCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={clsx(
        'p-2 rounded hover:bg-gray-50 cursor-pointer flex items-start justify-between',
        isSelected ? 'bg-blue-50 border border-blue-100' : ''
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
    >
      <div>
        <div className="font-medium">{thread.contactName || 'Unknown'}</div>
        <div className="text-sm text-gray-500">{thread.snippet || '—'}</div>
      </div>
      <div className="text-right">
        <div className="text-xs text-gray-400">{thread.channel || 'SMS'}</div>
        <div className="text-xs text-gray-400">{thread.updatedAt ? formatDistanceToNow(new Date(thread.updatedAt)) : ''}</div>
        {thread.unread ? (
          <div className="mt-1 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {thread.unread}
          </div>
        ) : null}
      </div>
    </div>
  );
}
