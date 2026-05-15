import type { Server as HttpServer } from 'node:http';

import { Server as SocketServer } from 'socket.io';

import { verifyToken } from '@lib/jwt.js';
import { logger } from '@lib/logger.js';

import { env } from '../env.js';
import { handleMessageSocket } from './messages.socket.js';

let io: SocketServer;

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
};

export const initSocket = (server: HttpServer): void => {
  io = new SocketServer(server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined;
    if (!token) return next(new Error('Missing token'));
    try {
      const payload = verifyToken(token);
      socket.data['userId'] = payload.userId;
      socket.data['role'] = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id, userId: socket.data['userId'] as string }, 'socket connected');
    handleMessageSocket(io, socket);
    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'socket disconnected');
    });
  });
};
