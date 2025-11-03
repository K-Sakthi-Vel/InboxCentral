import React, { useState } from 'react';
import { useSendMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface ComposerProps {
  threadId: string;
}

export default function Composer({ threadId }: ComposerProps) {
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
        channel: 'SMS' // default; later add selector
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

  return (
    <div className="p-2 border rounded">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a message..."
        className="w-full min-h-[80px] p-2 border rounded"
      />
      <div className="mt-2 flex items-center gap-2">
        <input
          type="datetime-local"
          value={scheduleAt}
          onChange={(e) => setScheduleAt(e.target.value)}
          className="text-sm p-1 border rounded"
        />
        <button onClick={handleSend} className="ml-auto px-3 py-1 rounded bg-blue-600 text-white">
          Send
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-2">Tip: use schedule to send later</div>
    </div>
  );
}
