import type { Server as SocketServer, Socket } from 'socket.io';

import { logger } from '@lib/logger.js';
import { ConnectionModel } from '@features/connections/connections.model.js';
import { MessageModel } from '@features/messages/messages.model.js';
import { ids } from '@lib/ids.js';

export const handleMessageSocket = (io: SocketServer, socket: Socket): void => {
  const userId = socket.data['userId'] as string;

  socket.on('join_connection', async (connectionId: string) => {
    const connection = await ConnectionModel.findOne({ id: connectionId }).lean();
    if (!connection) return socket.emit('error', { message: 'Connection not found' });

    const isMember = connection.studentId === userId || connection.tutorUserId === userId;
    if (!isMember) return socket.emit('error', { message: 'Forbidden' });

    await socket.join(`conn:${connectionId}`);
    logger.info({ userId, connectionId }, 'joined connection room');
  });

  socket.on('send_message', async ({ connectionId, body }: { connectionId: string; body: string }) => {
    if (!body?.trim()) return;

    const connection = await ConnectionModel.findOne({ id: connectionId }).lean();
    if (!connection) return socket.emit('error', { message: 'Connection not found' });

    const isMember = connection.studentId === userId || connection.tutorUserId === userId;
    if (!isMember) return socket.emit('error', { message: 'Forbidden' });

    if (connection.status === 'closed') return socket.emit('error', { message: 'Connection is closed' });

    const message = await MessageModel.create({ id: ids.message(), connectionId, senderId: userId, body: body.trim() });

    // Mark first tutor reply
    if (!connection.firstReplyAt && connection.tutorUserId === userId) {
      await ConnectionModel.updateOne({ id: connectionId }, { firstReplyAt: new Date() });
    }

    io.to(`conn:${connectionId}`).emit('new_message', { data: message });
  });
};
