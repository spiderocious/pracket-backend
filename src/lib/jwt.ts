import jwt from 'jsonwebtoken';

import { env } from '../env.js';

export interface TokenPayload {
  userId: string;
  role: 'student' | 'tutor' | 'admin';
}

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
