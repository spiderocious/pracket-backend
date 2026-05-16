import type { Express } from 'express';
import { Router } from 'express';
import { body } from 'express-validator';

import { ConnectionModel } from '@features/connections/connections.model.js';
import { TutorModel } from '@features/tutors/tutors.model.js';
import { asyncHandler } from '@lib/asyncHandler.js';
import { ConflictError, ForbiddenError, NotFoundError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';
import { ResponseUtil } from '@lib/response.js';
import { authenticate, type AuthRequest } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

import { ReviewModel } from './reviews.model.js';

export const register = (app: Express): void => {
  const router = Router();

  // Public — list all reviews for a tutor
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const { tutorId } = req.query as { tutorId?: string };
      const filter = tutorId ? { tutorId } : {};
      const reviews = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
      return ResponseUtil.ok(res, reviews);
    }),
  );

  // Student — submit a review
  router.post(
    '/',
    authenticate,
    [
      body('connectionId').trim().notEmpty().withMessage('connectionId is required'),
      body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5'),
      body('comment').trim().notEmpty().withMessage('comment is required'),
    ],
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
      const { connectionId, rating, comment } = req.body as {
        connectionId: string;
        rating: number;
        comment: string;
      };

      // Verify connection exists and caller is the student
      const connection = await ConnectionModel.findOne({ id: connectionId }).lean();
      if (!connection) throw new NotFoundError('Connection');
      if (connection.studentId !== req.user!.userId) throw new ForbiddenError();

      // One review per connection
      const existing = await ReviewModel.findOne({ connectionId }).lean();
      if (existing) throw new ConflictError('You have already reviewed this connection');

      const tutor = await TutorModel.findOne({ id: connection.tutorId }).lean();
      if (!tutor) throw new NotFoundError('Tutor');

      // Save the review
      const review = await ReviewModel.create({
        id: ids.review(),
        connectionId,
        studentId: req.user!.userId,
        tutorId: connection.tutorId,
        rating,
        comment: comment.trim(),
      });

      // Recompute average atomically using current count + new rating
      const newCount = tutor.ratingCount + 1;
      // For new tutors starting at 2.5 (default), we treat ratingCount === 0
      // as having no real ratings yet — compute purely from real ratings.
      const currentSum = tutor.ratingCount === 0
        ? 0
        : tutor.ratingAverage * tutor.ratingCount;
      const newAverage = (currentSum + rating) / newCount;

      await TutorModel.updateOne(
        { id: connection.tutorId },
        { $set: { ratingAverage: Math.round(newAverage * 10) / 10, ratingCount: newCount } },
      );

      return ResponseUtil.created(res, review);
    }),
  );

  app.use('/api/reviews', router);
};
