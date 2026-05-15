import type { Express } from 'express';
import { Router } from 'express';

import { authenticate } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';
import { body } from 'express-validator';

import { getConnection, listConnections, openConnection } from './connections.handler.js';

export const register = (app: Express): void => {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/',
    [body('tutorId').trim().notEmpty().withMessage('tutorId is required')],
    validate,
    openConnection,
  );
  router.get('/', listConnections);
  router.get('/:id', getConnection);

  app.use('/api/connections', router);
};
