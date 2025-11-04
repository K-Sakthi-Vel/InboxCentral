'use client';

import React from 'react';
import NotesPage from '@/components/NotesPage';
import { withAuth } from '@/lib/useAuth';

function Notes() {
  return <NotesPage />;
}

export default withAuth(Notes);
