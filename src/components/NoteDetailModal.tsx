'use client';

import React from 'react';

interface Note {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface NoteDetailModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteDetailModal({ note, isOpen, onClose }: NoteDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Note Details</h3>
        <div className="max-h-80 overflow-y-auto border border-gray-200 p-3 rounded-md mb-4">
          <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.content}</p>
        </div>
        <div className="text-xs text-gray-600 mb-4">
          Written by: {note.author.name} on {new Date(note.createdAt).toLocaleDateString()}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
