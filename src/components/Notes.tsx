'use client';

import React, { useEffect, useState } from 'react';
import NoteDetailModal from '../components/NoteDetailModal';
import { useNotes } from '@/lib/api';
import { useSocket } from '@/lib/useSocket';
import { useAuth } from '@/lib/useAuth';

interface Note {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface NotesProps {
  onNoteAdded: () => void;
}

const lightColors = [
  'bg-yellow-100',
  'bg-green-100',
  'bg-blue-100',
  'bg-red-100',
  'bg-purple-100',
];

export default function Notes({ onNoteAdded }: NotesProps) {
  const { user } = useAuth();
  const { data: notes, isLoading, error, refetch } = useNotes();
  const teamId = user?.teamRoles?.[0]?.teamId;
  const socket = useSocket(teamId);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    if (socket) {
      socket.on('note_added', () => {
        refetch();
        onNoteAdded();
      });
      socket.on('note_updated', () => {
        refetch();
      });
    }

    return () => {
      socket?.off('note_added');
      socket?.off('note_updated');
    };
  }, [socket, refetch, onNoteAdded]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedNote(null);
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading notes...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error loading notes.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.isArray(notes) && notes.length > 0 ? (
          notes.map((note: Note, index: number) => (
            <div
              key={note.id}
              className={`${lightColors[index % lightColors.length]} p-4 rounded-lg shadow-md relative cursor-pointer overflow-hidden`}
              style={{ height: '120px' }}
              onClick={() => handleNoteClick(note)}
            >
              <p className="text-gray-800 text-sm mb-2 overflow-hidden text-ellipsis h-16">{note.content}</p>
              <div className="absolute bottom-2 left-4 text-xs text-gray-600">
                Written by: {note.author.name} on {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10 col-span-full">No notes yet. Add one to get started!</div>
        )}
      </div>
      {selectedNote && (
        <NoteDetailModal
          note={selectedNote}
          isOpen={showDetailModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
