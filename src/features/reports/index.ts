import type { Express } from 'express';
import { Router } from 'express';
import { body } from 'express-validator';

import { ConnectionModel } from '@features/connections/connections.model.js';
import { TutorModel } from '@features/tutors/tutors.model.js';
import { asyncHandler } from '@lib/asyncHandler.js';
import { ForbiddenError, NotFoundError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';
import { ResponseUtil } from '@lib/response.js';
import { authenticate, type AuthRequest } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

import { ReportModel } from './reports.model.js';

export const register = (app: Express): void => {
  const router = Router();

  router.post(
    '/',
    authenticate,
    [
      body('connectionId').trim().notEmpty().withMessage('connectionId is required'),
      body('reason').trim().notEmpty().withMessage('reason is required'),
    ],
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
      const { connectionId, reason } = req.body as { connectionId: string; reason: string };
      const connection = await ConnectionModel.findOne({ id: connectionId }).lean();
      if (!connection) throw new NotFoundError('Connection');
      if (connection.studentId !== req.user!.userId) throw new ForbiddenError();

      const tutor = await TutorModel.findOne({ id: connection.tutorId }).lean();
      if (!tutor) throw new NotFoundError('Tutor');

      // Close the connection
      await ConnectionModel.updateOne({ id: connectionId }, { $set: { status: 'closed' } });

      const report = await ReportModel.create({
        id: ids.report(),
        connectionId,
        reporterId: req.user!.userId,
        tutorId: connection.tutorId,
        reason,
      });

      return ResponseUtil.created(res, report);
    }),
  );

  app.use('/api/reports', router);
};
