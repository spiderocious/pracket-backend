import { body } from 'express-validator';

export const updateProfileValidation = [
  body('bio').optional().isString(),
  body('subjects').optional().isArray(),
  body('levels').optional().isArray(),
  body('rate').optional().isNumeric(),
  body('connectionFee').optional().isNumeric(),
  body('format').optional().isIn(['online', 'inPerson', 'both']),
  body('location').optional().isString(),
  body('photoKey').optional().isString(),
];

export const updateAvailabilityValidation = [
  body('availability').isArray().withMessage('availability must be an array'),
  body('availability.*.day').isIn(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  body('availability.*.from').matches(/^\d{2}:\d{2}$/),
  body('availability.*.to').matches(/^\d{2}:\d{2}$/),
];

export const addCredentialValidation = [
  body('fileKey').trim().notEmpty().withMessage('fileKey is required'),
  body('type').isIn(['degree', 'governmentId', 'reference']).withMessage('Invalid credential type'),
];
