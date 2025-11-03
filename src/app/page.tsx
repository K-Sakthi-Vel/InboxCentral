'use client';

import React, { JSX, useState } from 'react';
import ThreadCard from '@/components/ThreadCard';
import MessageList from '@/components/MessageList';
import Composer from '@/components/Composer';
import ContactModal from '@/components/ContactModal';
import { useThreads } from '@/lib/api';

export default function InboxPage(): JSX.Element {
  const { data: threads, isLoading } = useThreads();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left: threads */}
      <aside className="lg:col-span-3 bg-white border rounded p-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Threads</h2>
          <button className="text-sm text-blue-600">New</button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[70vh]">
            {threads?.map((t: { id: any; contactName?: string | null | undefined; snippet?: string | null | undefined; unread?: number | null | undefined; updatedAt?: string | null | undefined; channel?: string | null | undefined; }) => (
              <ThreadCard
                key={t.id}
                thread={t}
                isSelected={t.id === selectedThreadId}
                onClick={() => setSelectedThreadId(t.id)}
              />
            )) ?? <div className="text-sm text-gray-500">No threads yet</div>}
          </div>
        )}
      </aside>

      {/* Middle: messages */}
      <section className="lg:col-span-6 bg-white border rounded p-4 flex flex-col">
        {selectedThreadId ? (
          <>
            <div className="flex items-center justify-between border-b pb-2 mb-2">
              <div>
                <h3 className="font-semibold">Thread</h3>
                <div className="text-sm text-gray-500">contact@example.com · WhatsApp</div>
              </div>
              <div>
                <button
                  className="text-sm text-gray-600"
                  onClick={() => setShowContact(true)}
                >
                  Contact
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <MessageList threadId={selectedThreadId} />
            </div>

            <div className="mt-2">
              <Composer threadId={selectedThreadId} />
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-20">Select a thread to view messages</div>
        )}
      </section>

      {/* Right: quick actions / placeholder */}
      <aside className="lg:col-span-3 bg-white border rounded p-4">
        <div className="text-sm text-gray-600 mb-4">Contact preview / analytics stub</div>
        <div>
          <button
            className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
            onClick={() => alert('Analytics not yet implemented')}
          >
            View Analytics
          </button>
        </div>
      </aside>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
