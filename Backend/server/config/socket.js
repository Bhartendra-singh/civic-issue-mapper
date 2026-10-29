import { Server } from 'socket.io';
import { parseCookie } from 'cookie';
import jwt from 'jsonwebtoken';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie || '';
      const cookies = parseCookie(rawCookie);
      const token = cookies.accessToken;

      if (!token) {
        return next(new Error('AUTH_REQUIRED'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (error) {
      console.log('Socket auth error:', error.message);
      next(new Error('AUTH_FAILED'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    if (socket.user.role === 'admin') {
      socket.join('admins');
    }

    socket.on('report:join', (reportId) => {
      if (typeof reportId !== 'string' || !/^[a-f\d]{24}$/i.test(reportId)) return;
      socket.join(`report:${reportId}`);
    });

    socket.on('report:leave', (reportId) => {
      if (typeof reportId !== 'string') return;
      socket.leave(`report:${reportId}`);
    });
  });

  return io;
};

export const getIO = () => io;