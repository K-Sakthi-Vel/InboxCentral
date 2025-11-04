import React from 'react';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-10 transform transition-all scale-100 opacity-100">
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
          <h3 className="text-xl font-bold text-gray-800">Contact Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors text-lg">
            &times;
          </button>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-4">History & notes coming soon</div>
          <div className="space-y-3 text-gray-700">
            <p className="flex justify-between items-center">
              <span className="font-medium">Name:</span>
              <span>John Doe</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="font-medium">Phone:</span>
              <span>+1 555 555</span>
            </p>
            <p className="flex justify-between items-center">
              <span className="font-medium">Tags:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                lead
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                important
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
