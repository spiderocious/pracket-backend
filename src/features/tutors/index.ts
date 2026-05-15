import type { Express } from 'express';

import router from './tutors.routes.js';

export const register = (app: Express): void => {
  app.use('/api/tutors', router);
};
