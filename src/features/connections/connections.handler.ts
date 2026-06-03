import { asyncHandler } from '@lib/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import type { AuthRequest } from '@middlewares/auth.middleware.js';

import { connectionService } from './connections.service.js';

export const openConnection = asyncHandler(async (req: AuthRequest, res) => {
  const { tutorId } = req.body as { tutorId: string };
  const connection = await connectionService.open(req.user!.userId, tutorId);
  return ResponseUtil.created(res, connection);
});

export const listConnections = asyncHandler(async (req: AuthRequest, res) => {
  const connections = await connectionService.list(req.user!.userId, req.user!.role);
  return ResponseUtil.ok(res, connections);
});

export const getConnection = asyncHandler(async (req: AuthRequest, res) => {
  const connection = await connectionService.getOne(req.params['id'] as string, req.user!.userId, req.user!.role);
  return ResponseUtil.ok(res, connection);
});
