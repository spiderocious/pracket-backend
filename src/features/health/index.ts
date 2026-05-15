import type { Express } from 'express';
import { Router } from 'express';

import { asyncHandler } from '@lib/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';

export const register = (app: Express): void => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => ResponseUtil.ok(res, { status: 'ok' })),
  );

  app.use('/api/health', router);
};
