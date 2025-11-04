'use client';

import React, { useState } from 'react';
import Notes from '@/components/Notes';
import { useSaveNote } from '@/lib/api';

export default function NotesPage() {
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const saveNote = useSaveNote();

  const handleAddNote = () => {
    if (newNoteContent.trim()) {
      saveNote.mutate(
        { content: newNoteContent },
        {
          onSuccess: () => {
            setNewNoteContent('');
            setShowAddNoteModal(false);
          },
        }
      );
    }
  };

  return (
    <div className="grid grid-cols-1 h-[calc(100vh-90px)]">
      {/* Notes Section */}
      <section className="bg-white shadow-md rounded-xl p-6 flex flex-col h-[calc(100vh-90px)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Notes</h2>
          <button
            onClick={() => setShowAddNoteModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Add Note
          </button>
        </div>
        <Notes onNoteAdded={() => {}} /> {/* onNoteAdded is a dummy for now, will refine if needed */}

        {showAddNoteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-black">Add New Note</h3>
              <textarea
                className="w-full p-3 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                rows={5}
                placeholder="Write your note here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddNoteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                  disabled={saveNote.isPending || !newNoteContent.trim()}
                >
                  {saveNote.isPending ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
