import type { Express } from 'express';

import router from './auth.routes.js';

export const register = (app: Express): void => {
  app.use('/api/auth', router);
};
