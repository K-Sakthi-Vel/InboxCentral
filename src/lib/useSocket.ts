import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const useSocket = (teamId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const newSocket = io(SOCKET_URL, {
      query: { teamId },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [teamId]);

  return socket;
};
