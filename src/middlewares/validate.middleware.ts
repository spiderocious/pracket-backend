import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { HTTP_STATUS } from '@shared/constants/http-status.js';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const field_errors: Record<string, string[]> = {};
  for (const e of errors.array()) {
    const key = (e as { path?: string }).path ?? '_root';
    (field_errors[key] ??= []).push(e.msg as string);
  }

  res.status(HTTP_STATUS.BAD_REQUEST).json({
    error: { code: 'validation_error', message: 'Validation failed', field_errors },
  });
};
