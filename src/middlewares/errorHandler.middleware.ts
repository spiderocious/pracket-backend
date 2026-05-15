import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@lib/errors.js';
import { logger } from '@lib/logger.js';
import { ResponseUtil } from '@lib/response.js';
import { HTTP_STATUS } from '@shared/constants/http-status.js';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    if (err.status >= 500) logger.error({ err }, err.message);
    ResponseUtil.error(res, err.status, {
      code: err.code,
      message: err.message,
      ...(err.fieldErrors !== undefined ? { field_errors: err.fieldErrors } : {}),
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  ResponseUtil.error(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, {
    code: 'internal',
    message: 'An unexpected error occurred',
  });
};
