import type { Express } from 'express';
import { Router } from 'express';

import { asyncHandler } from '@lib/asyncHandler.js';
import { ids } from '@lib/ids.js';
import { ResponseUtil } from '@lib/response.js';
import { authenticate } from '@middlewares/auth.middleware.js';
import type { AuthRequest } from '@middlewares/auth.middleware.js';

import { ShortlistModel } from './shortlist.model.js';

export const register = (app: Express): void => {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/',
    asyncHandler(async (req: AuthRequest, res) => {
      const list = await ShortlistModel.findOneAndUpdate(
        { userId: req.user!.userId },
        { $setOnInsert: { id: ids.shortlist(), userId: req.user!.userId, tutorIds: [] } },
        { upsert: true, new: true },
      ).lean();
      return ResponseUtil.ok(res, list);
    }),
  );

  router.post(
    '/:tutorId',
    asyncHandler(async (req: AuthRequest, res) => {
      const list = await ShortlistModel.findOneAndUpdate(
        { userId: req.user!.userId },
        { $addToSet: { tutorIds: req.params['tutorId'] }, $setOnInsert: { id: ids.shortlist() } },
        { upsert: true, new: true },
      ).lean();
      return ResponseUtil.ok(res, list);
    }),
  );

  router.delete(
    '/:tutorId',
    asyncHandler(async (req: AuthRequest, res) => {
      await ShortlistModel.updateOne(
        { userId: req.user!.userId },
        { $pull: { tutorIds: req.params['tutorId'] } },
      );
      return ResponseUtil.noContent(res);
    }),
  );

  app.use('/api/shortlist', router);
};
