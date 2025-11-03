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
    // STEP 1: Change to a two-column grid. Example uses fixed width for sidebar (300px)
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-[calc(100vh-120px)]"> 
      
      {/* Left Column: Threads and Quick Actions (Now combined into one full-height column) */}
      <div className="flex flex-col gap-6"> 
          
        {/* Top of Left: Threads */}
        <aside className="bg-white shadow-md rounded-xl p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">Threads</h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              New
            </button>
          </div>

          {isLoading ? (
            <div className="text-center text-gray-500 py-10">Loading threads...</div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {threads?.map((t: { id: any; contactName?: string | null | undefined; snippet?: string | null | undefined; unread?: number | null | undefined; updatedAt?: string | null | undefined; channel?: string | null | undefined; }) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  isSelected={t.id === selectedThreadId}
                  onClick={() => setSelectedThreadId(t.id)}
                />
              )) ?? <div className="text-center text-gray-500 py-10">No threads yet</div>}
            </div>
          )}
        </aside>

        {/* Bottom of Left: Quick Actions */}
        {/* We keep this as a separate aside/div to stack it visually, it doesn't need to be h-full now */}
        <aside className="bg-white shadow-md rounded-xl p-4 flex flex-col flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="text-sm text-gray-600 mb-6">Contact preview and analytics will appear here.</div>
          <div>
            <button
              className="w-full px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              onClick={() => alert('Analytics not yet implemented')}
            >
              View Analytics
            </button>
          </div>
        </aside>
      </div>

      {/* Right Column: Messages (Full Height and fills remaining space) */}
      <section className="bg-white shadow-md rounded-xl p-6 flex flex-col **h-full**">
        {selectedThreadId ? (
          <>
            {/* Header: Fixed height top section - Added flex-shrink-0 */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 **flex-shrink-0**">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Thread with Contact</h3>
                <div className="text-sm text-gray-500">contact@example.com · WhatsApp</div>
              </div>
              <div>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  onClick={() => setShowContact(true)}
                >
                  View Contact
                </button>
              </div>
            </div>

            {/* Message List: Flexible section - has flex-1 to grow */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <MessageList threadId={selectedThreadId} />
            </div>

            {/* Composer: Fixed height bottom section - Added flex-shrink-0 */}
            <div className="mt-6 **flex-shrink-0**">
              <Composer threadId={selectedThreadId} />
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-20 text-lg">Select a thread to view messages</div>
        )}
      </section>

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}