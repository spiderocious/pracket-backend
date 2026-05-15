import { createServer } from 'node:http';

import { buildApp } from './app.js';
import { env } from './env.js';
import { connectDB, disconnectDB } from './lib/db.js';
import { logger } from './lib/logger.js';
import { initSocket } from './socket/index.js';

const start = async (): Promise<void> => {
  await connectDB();

  const app = buildApp();
  const httpServer = createServer(app);

  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'pracket-backend listening');
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutting down gracefully');
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    await disconnectDB();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

void start();
