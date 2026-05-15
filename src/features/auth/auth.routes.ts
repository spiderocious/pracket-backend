import { Router } from 'express';

import { authenticate } from '@middlewares/auth.middleware.js';
import { validate } from '@middlewares/validate.middleware.js';

import { login, logout, me, register } from './auth.handler.js';
import { loginValidation, registerValidation } from './auth.schema.js';

const router = Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
