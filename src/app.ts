import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { register as registerAuth } from '@features/auth/index.js';
import { register as registerConnections } from '@features/connections/index.js';
import { register as registerHealth } from '@features/health/index.js';
import { register as registerMessages } from '@features/messages/index.js';
import { register as registerPosts } from '@features/posts/index.js';
import { register as registerReports } from '@features/reports/index.js';
import { register as registerSearch } from '@features/search/index.js';
import { register as registerShortlist } from '@features/shortlist/index.js';
import { register as registerTutors } from '@features/tutors/index.js';
import { register as registerAdmin } from '@features/admin/index.js';
import { errorHandler } from '@middlewares/errorHandler.middleware.js';

import { env } from './env.js';

const features = [
  registerHealth,
  registerAuth,
  registerTutors,
  registerSearch,
  registerShortlist,
  registerConnections,
  registerMessages,
  registerPosts,
  registerReports,
  registerAdmin,
];

export const buildApp = (): express.Express => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(compression());

  features.forEach((register) => register(app));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
};
