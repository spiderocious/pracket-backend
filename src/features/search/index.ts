import type { Express } from 'express';
import { Router } from 'express';

import { asyncHandler } from '@lib/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';

import { searchService } from './search.service.js';

export const register = (app: Express): void => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const q = req.query as Record<string, string>;
      const results = await searchService.search({
        subject: q['subject'],
        level: q['level'],
        location: q['location'],
        format: q['format'],
        minRate: q['minRate'] ? Number(q['minRate']) : undefined,
        maxRate: q['maxRate'] ? Number(q['maxRate']) : undefined,
        verified: q['verified'] === 'false' ? false : true,
        sort: q['sort'] as 'relevance' | 'price' | 'price_desc' | undefined,
        page: q['page'] ? Number(q['page']) : 1,
        limit: q['limit'] ? Math.min(Number(q['limit']), 50) : 20,
      });
      return ResponseUtil.ok(res, results.items, { page: results.page, total: results.total, totalPages: results.totalPages });
    }),
  );

  app.use('/api/search', router);
};
