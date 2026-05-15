import { Router } from 'express';

import { authenticate, authorize } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

import {
  addCredential,
  getMyCredentials,
  getMyProfile,
  getPublicProfile,
  updateAvailability,
  updateProfile,
  updateVisibility,
} from './tutors.handler.js';
import { addCredentialValidation, updateAvailabilityValidation, updateProfileValidation } from './tutors.schema.js';

const router = Router();

// Public
router.get('/:id', getPublicProfile);

// Tutor-only
router.get('/me/profile', authenticate, authorize('tutor'), getMyProfile);
router.patch('/me/profile', authenticate, authorize('tutor'), updateProfileValidation, validate, updateProfile);
router.patch('/me/availability', authenticate, authorize('tutor'), updateAvailabilityValidation, validate, updateAvailability);
router.patch('/me/visibility', authenticate, authorize('tutor'), updateVisibility);
router.get('/me/credentials', authenticate, authorize('tutor'), getMyCredentials);
router.post('/me/credentials', authenticate, authorize('tutor'), addCredentialValidation, validate, addCredential);

export default router;
