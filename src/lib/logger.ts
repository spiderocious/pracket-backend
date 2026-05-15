import { env } from '../env.js';

type Level = 'debug' | 'info' | 'warn' | 'error';

const log = (level: Level, obj: object | string, msg?: string): void => {
  const ts = new Date().toISOString();
  const message = typeof obj === 'string' ? obj : msg ?? '';
  const meta = typeof obj === 'object' ? obj : {};
  if (env.NODE_ENV === 'development') {
    const prefix = `[${ts}] [${level.toUpperCase()}]`;
    console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`, Object.keys(meta).length ? meta : '');
  } else {
    process.stdout.write(JSON.stringify({ ts, level, message, ...meta }) + '\n');
  }
};

export const logger = {
  debug: (obj: object | string, msg?: string) => log('debug', obj, msg),
  info: (obj: object | string, msg?: string) => log('info', obj, msg),
  warn: (obj: object | string, msg?: string) => log('warn', obj, msg),
  error: (obj: object | string, msg?: string) => log('error', obj, msg),
};
