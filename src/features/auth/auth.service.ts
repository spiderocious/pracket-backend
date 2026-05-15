import bcrypt from 'bcrypt';

import { ConflictError, NotFoundError, UnauthorizedError } from '@lib/errors.js';
import { ids } from '@lib/ids.js';
import { signToken } from '@lib/jwt.js';

import { UserModel } from './auth.model.js';

class AuthService {
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'student' | 'tutor';
  }) {
    const existing = await UserModel.findOne({ email: data.email }).lean();
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await UserModel.create({ id: ids.user(), ...data, passwordHash });

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: this.sanitize(user) };
  }

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email }).select('+passwordHash').lean();
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedError('Account suspended');

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: this.sanitize(user) };
  }

  async me(userId: string) {
    const user = await UserModel.findOne({ id: userId }).lean();
    if (!user) throw new NotFoundError('User');
    return this.sanitize(user);
  }

  private sanitize(user: { id: string; firstName: string; lastName: string; email: string; role: string; isActive: boolean }) {
    return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, isActive: user.isActive };
  }
}

export const authService = new AuthService();
