import type { Express } from 'express';
import { Router } from 'express';
import { body } from 'express-validator';

import { CredentialModel } from '@features/tutors/credentials.model.js';
import { TutorModel } from '@features/tutors/tutors.model.js';
import { UserModel } from '@features/auth/auth.model.js';
import { ReportModel } from '@features/reports/reports.model.js';
import { asyncHandler } from '@lib/asyncHandler.js';
import { NotFoundError } from '@lib/errors.js';
import { ResponseUtil } from '@lib/response.js';
import { authenticate, authorize, type AuthRequest } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

export const register = (app: Express): void => {
  const router = Router();

  router.use(authenticate, authorize('admin'));

  // --- Credential review ---

  router.get(
    '/credentials',
    asyncHandler(async (req, res) => {
      const status = (req.query['status'] as string) ?? 'pending';
      const credentials = await CredentialModel.find({ reviewStatus: status }).sort({ createdAt: 1 }).lean();
      return ResponseUtil.ok(res, credentials);
    }),
  );

  router.patch(
    '/credentials/:id',
    [body('reviewStatus').isIn(['approved', 'rejected']).withMessage('reviewStatus must be approved or rejected')],
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
      const { reviewStatus } = req.body as { reviewStatus: 'approved' | 'rejected' };
      const credential = await CredentialModel.findOneAndUpdate(
        { id: req.params['id'] },
        { $set: { reviewStatus } },
        { new: true },
      ).lean();
      if (!credential) throw new NotFoundError('Credential');

      // If approved, check if tutor should be verified
      if (reviewStatus === 'approved') {
        const allCredentials = await CredentialModel.find({ tutorId: credential.tutorId }).lean();
        const allApproved = allCredentials.every((c) => c.reviewStatus === 'approved');
        if (allApproved && allCredentials.length >= 1) {
          await TutorModel.updateOne(
            { id: credential.tutorId },
            { $set: { verificationStatus: 'verified', isListed: true } },
          );
        }
      }

      if (reviewStatus === 'rejected') {
        await TutorModel.updateOne(
          { id: credential.tutorId },
          { $set: { verificationStatus: 'rejected', isListed: false } },
        );
      }

      return ResponseUtil.ok(res, credential);
    }),
  );

  // --- Tutor account actions ---

  router.patch(
    '/tutors/:id',
    asyncHandler(async (req, res) => {
      const { isActive } = req.body as { isActive: boolean };
      const tutor = await TutorModel.findOne({ id: req.params['id'] }).lean();
      if (!tutor) throw new NotFoundError('Tutor');

      await Promise.all([
        UserModel.updateOne({ id: tutor.userId }, { $set: { isActive } }),
        TutorModel.updateOne({ id: req.params['id'] }, { $set: { isListed: isActive ? tutor.verificationStatus === 'verified' : false } }),
      ]);

      return ResponseUtil.ok(res, { id: req.params['id'], isActive });
    }),
  );

  // --- Report queue ---

  router.get(
    '/reports',
    asyncHandler(async (req, res) => {
      const status = (req.query['status'] as string) ?? 'pending';
      const reports = await ReportModel.find({ status }).sort({ createdAt: 1 }).lean();
      return ResponseUtil.ok(res, reports);
    }),
  );

  router.patch(
    '/reports/:id',
    [body('status').isIn(['resolved']).withMessage('status must be resolved')],
    validate,
    asyncHandler(async (req, res) => {
      const { status, adminNote } = req.body as { status: 'resolved'; adminNote?: string };
      const report = await ReportModel.findOneAndUpdate(
        { id: req.params['id'] },
        { $set: { status, adminNote, resolvedAt: new Date() } },
        { new: true },
      ).lean();
      if (!report) throw new NotFoundError('Report');
      return ResponseUtil.ok(res, report);
    }),
  );

  app.use('/api/admin', router);
};
