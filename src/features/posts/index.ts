import type { Express } from 'express';
import { Router } from 'express';
import { body } from 'express-validator';

import { TutorModel } from '@features/tutors/tutors.model.js';
import { asyncHandler } from '@lib/asyncHandler.js';
import { ForbiddenError, NotFoundError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';
import { ResponseUtil } from '@lib/response.js';
import { authenticate, authorize, type AuthRequest } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

import { PostModel } from './posts.model.js';

const postValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('body').trim().notEmpty().withMessage('Body is required'),
];

export const register = (app: Express): void => {
  const router = Router();

  // Public — list published posts for a tutor
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { tutorId } = req.query as { tutorId?: string };
      const filter: Record<string, unknown> = { isPublished: true };
      if (tutorId) filter['tutorId'] = tutorId;
      const posts = await PostModel.find(filter).sort({ publishedAt: -1 }).lean();
      return ResponseUtil.ok(res, posts);
    }),
  );

  // Public — single post (drafts not visible)
  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const post = await PostModel.findOne({ id: req.params['id'], isPublished: true }).lean();
      if (!post) throw new NotFoundError('Post');
      return ResponseUtil.ok(res, post);
    }),
  );

  // Tutor — create
  router.post(
    '/',
    authenticate,
    authorize('tutor'),
    postValidation,
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
      const tutor = await TutorModel.findOne({ userId: req.user!.userId }).lean();
      if (!tutor) throw new NotFoundError('Tutor profile');

      const { title, body: postBody, isPublished = false } = req.body as { title: string; body: string; isPublished?: boolean };
      const post = await PostModel.create({
        id: ids.post(),
        tutorId: tutor.id,
        title,
        body: postBody,
        isPublished,
        publishedAt: isPublished ? new Date() : undefined,
      });
      return ResponseUtil.created(res, post);
    }),
  );

  // Tutor — update
  router.patch(
    '/:id',
    authenticate,
    authorize('tutor'),
    asyncHandler(async (req: AuthRequest, res) => {
      const tutor = await TutorModel.findOne({ userId: req.user!.userId }).lean();
      if (!tutor) throw new NotFoundError('Tutor profile');

      const post = await PostModel.findOne({ id: req.params['id'] }).lean();
      if (!post) throw new NotFoundError('Post');
      if (post.tutorId !== tutor.id) throw new ForbiddenError();

      const { title, body: postBody, isPublished } = req.body as { title?: string; body?: string; isPublished?: boolean };
      const update: Record<string, unknown> = {};
      if (title !== undefined) update['title'] = title;
      if (postBody !== undefined) update['body'] = postBody;
      if (isPublished !== undefined) {
        update['isPublished'] = isPublished;
        if (isPublished && !post.publishedAt) update['publishedAt'] = new Date();
      }

      const updated = await PostModel.findOneAndUpdate({ id: req.params['id'] }, { $set: update }, { new: true }).lean();
      return ResponseUtil.ok(res, updated);
    }),
  );

  // Tutor — delete
  router.delete(
    '/:id',
    authenticate,
    authorize('tutor'),
    asyncHandler(async (req: AuthRequest, res) => {
      const tutor = await TutorModel.findOne({ userId: req.user!.userId }).lean();
      if (!tutor) throw new NotFoundError('Tutor profile');

      const post = await PostModel.findOne({ id: req.params['id'] }).lean();
      if (!post) throw new NotFoundError('Post');
      if (post.tutorId !== tutor.id) throw new ForbiddenError();

      await PostModel.deleteOne({ id: req.params['id'] });
      return ResponseUtil.noContent(res);
    }),
  );

  app.use('/api/posts', router);
};
