import { asyncHandler } from '@lib/asyncHandler.js';
import { ResponseUtil } from '@lib/response.js';
import type { AuthRequest } from '@middlewares/auth.middleware.js';

import { tutorService } from './tutors.service.js';

export const getPublicProfile = asyncHandler(async (req, res) => {
  const tutor = await tutorService.getPublicProfile(req.params['id']!);
  return ResponseUtil.ok(res, tutor);
});

export const getMyProfile = asyncHandler(async (req: AuthRequest, res) => {
  const tutor = await tutorService.getOrCreateMyProfile(req.user!.userId);
  return ResponseUtil.ok(res, tutor);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res) => {
  const tutor = await tutorService.updateProfile(req.user!.userId, req.body);
  return ResponseUtil.ok(res, tutor);
});

export const updateAvailability = asyncHandler(async (req: AuthRequest, res) => {
  const tutor = await tutorService.updateAvailability(req.user!.userId, req.body.availability);
  return ResponseUtil.ok(res, tutor);
});

export const updateVisibility = asyncHandler(async (req: AuthRequest, res) => {
  const { isListed } = req.body as { isListed: boolean };
  const tutor = await tutorService.updateVisibility(req.user!.userId, isListed);
  return ResponseUtil.ok(res, tutor);
});

export const addCredential = asyncHandler(async (req: AuthRequest, res) => {
  const { fileKey, type } = req.body as { fileKey: string; type: 'degree' | 'governmentId' | 'reference' };
  const credential = await tutorService.addCredential(req.user!.userId, fileKey, type);
  return ResponseUtil.created(res, credential);
});

export const getMyCredentials = asyncHandler(async (req: AuthRequest, res) => {
  const credentials = await tutorService.getMyCredentials(req.user!.userId);
  return ResponseUtil.ok(res, credentials);
});
