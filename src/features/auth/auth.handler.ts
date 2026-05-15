import type { Response } from 'express';

import { asyncHandler } from '@lib/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import type { AuthRequest } from '@middlewares/auth.middleware.js';

import { authService } from './auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return ResponseUtil.created(res, result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  return ResponseUtil.ok(res, result);
});

export const logout = asyncHandler(async (_req, res: Response) => ResponseUtil.noContent(res));

export const me = asyncHandler(async (req: AuthRequest, res) => {
  const user = await authService.me(req.user!.userId);
  return ResponseUtil.ok(res, user);
});
