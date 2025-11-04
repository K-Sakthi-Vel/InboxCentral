import React, { useState } from 'react';
import { useSendMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { IconContext } from 'react-icons';

interface ComposerProps {
  threadId: string;
  initialChannel: string;
}

export default function Composer({ threadId, initialChannel }: ComposerProps) {
  const [text, setText] = useState<string>('');
  const [scheduleAt, setScheduleAt] = useState<string>('');
  const send = useSendMessage();

  async function handleSend() {
    if (!text.trim()) {
      toast.error('Enter a message');
      return;
    }
    try {
      await send.mutateAsync({
        threadId,
        body: text,
        scheduleAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
        channel: initialChannel // Use the channel from the thread
      });
      setText('');
      setScheduleAt('');
      toast.success('Sent (or scheduled)');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error('Failed to send');
    }
  }

  async function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  }

  return (
    <div className="p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        className="w-full min-h-[90px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-y text-gray-800"
      />
      <div className="mt-3 flex items-center gap-3">
        <input
          type="datetime-local"
          value={scheduleAt}
          onChange={(e) => setScheduleAt(e.target.value)}
          className="text-sm p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800"
        />
        <button
          onClick={handleSend}
          className="ml-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
          disabled={send.isPending}
        >
          {send.isPending && (
            <IconContext.Provider value={{ className: "animate-spin mr-2" }}>
              <FaSpinner />
            </IconContext.Provider>
          )}
          Send
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-3">Tip: use schedule to send later</div>
    </div>
  );
}
