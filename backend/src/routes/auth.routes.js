// backend/src/routes/auth.routes.js
import { Router } from 'express';
import { register, login, refresh, logout, getMe, changePassword, updateProfile } from '../controllers/auth.controller.js';
import { googleAuth } from '../controllers/oauth.controller.js';
import { auth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';
import { registerSchema, loginSchema, changePasswordSchema } from '../validations/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);
router.post('/change-password', auth, validate(changePasswordSchema), changePassword);
router.put('/profile', auth, updateProfile);
router.post('/google', googleAuth);

export default router;