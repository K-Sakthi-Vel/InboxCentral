import React from 'react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import UserIcon from './UserIcon';

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
        'p-3 rounded-lg cursor-pointer flex items-start justify-between transition-all duration-200 ease-in-out',
        isSelected ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'bg-white hover:bg-gray-50'
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) onClick();
      }}
    >
      <div className="flex items-center">
        <UserIcon className="h-10 w-10 text-gray-400 mr-3" />
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{thread.contactName || 'Unknown'}</div>
          <div className="text-sm text-gray-600 mt-1 truncate">{thread.snippet || '—'}</div>
        </div>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <div className="text-xs text-gray-500">{thread.channel || 'SMS'}</div>
        <div className="text-xs text-gray-400 mt-1">
          {thread.updatedAt ? formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true }) : ''}
        </div>
        {thread.unread ? (
          <div className="mt-2 inline-block bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {thread.unread}
          </div>
        ) : null}
      </div>
    </div>
  );
}
