import { io } from 'socket.io-client';
import { tryRefreshToken } from './api';

const SOCKET_URL = 'http://localhost:5000';
const MAX_AUTH_RETRIES = 2;

let socket = null;
let authRetries = 0;

export const connectSocket = () => {
  if (socket) return socket;

  const current = io(SOCKET_URL, { withCredentials: true });
  socket = current;

  current.on('connect', () => {
    authRetries = 0;
  });

  current.on('connect_error', async (err) => {
    if (err.message !== 'AUTH_FAILED' && err.message !== 'AUTH_REQUIRED') return;

    current.disconnect();

    if (authRetries >= MAX_AUTH_RETRIES) return;
    authRetries += 1;

    const refreshed = await tryRefreshToken();
    if (refreshed && socket === current) {
      current.connect();
    }
  });

  return current;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  authRetries = 0;
};

export const getSocket = () => socket;