import React from 'react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg p-4 w-full max-w-2xl z-10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Contact</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div>
          <div className="text-sm text-gray-600">History & notes coming soon</div>
          <div className="mt-4 text-sm text-gray-700">
            <p>Name: John Doe</p>
            <p>Phone: +1 555 555</p>
            <p>Tags: lead, important</p>
          </div>
        </div>
      </div>
    </div>
  );
}
