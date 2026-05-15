import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '@lib/errors.js';
import { verifyToken, type TokenPayload } from '@lib/jwt.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new UnauthorizedError('Missing token');

  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const authorize =
  (...roles: TokenPayload['role'][]) =>
  (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError();
    next();
  };
