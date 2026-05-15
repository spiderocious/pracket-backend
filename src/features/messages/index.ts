import type { Express } from 'express';
import { Router } from 'express';
import { body } from 'express-validator';

import { ConnectionModel } from '@features/connections/connections.model.js';
import { asyncHandler } from '@lib/asyncHandler.js';
import { ForbiddenError, NotFoundError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';
import { ResponseUtil } from '@lib/response.js';
import { authenticate, type AuthRequest } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

import { MessageModel } from './messages.model.js';

export const register = (app: Express): void => {
  const router = Router({ mergeParams: true });

  router.use(authenticate);

  const assertMember = async (connectionId: string, userId: string) => {
    const connection = await ConnectionModel.findOne({ id: connectionId }).lean();
    if (!connection) throw new NotFoundError('Connection');
    const isMember = connection.studentId === userId || connection.tutorUserId === userId;
    if (!isMember) throw new ForbiddenError();
    return connection;
  };

  // GET paginated history
  router.get(
    '/:connectionId',
    asyncHandler(async (req: AuthRequest, res) => {
      await assertMember(req.params['connectionId']!, req.user!.userId);
      const page = Number(req.query['page'] ?? 1);
      const limit = Math.min(Number(req.query['limit'] ?? 50), 100);
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        MessageModel.find({ connectionId: req.params['connectionId'] })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        MessageModel.countDocuments({ connectionId: req.params['connectionId'] }),
      ]);

      return ResponseUtil.ok(res, items, { page, total, totalPages: Math.ceil(total / limit) });
    }),
  );

  // POST send message (REST fallback — prefer Socket.io)
  router.post(
    '/:connectionId',
    [body('body').trim().notEmpty().withMessage('Message body is required')],
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
      const connection = await assertMember(req.params['connectionId']!, req.user!.userId);
      if (connection.status === 'closed') throw new ForbiddenError('Connection is closed');

      const message = await MessageModel.create({
        id: ids.message(),
        connectionId: req.params['connectionId'],
        senderId: req.user!.userId,
        body: (req.body as { body: string }).body,
      });

      if (!connection.firstReplyAt && connection.tutorUserId === req.user!.userId) {
        await ConnectionModel.updateOne({ id: connection.id }, { firstReplyAt: new Date() });
      }

      return ResponseUtil.created(res, message);
    }),
  );

  app.use('/api/messages', router);
};
