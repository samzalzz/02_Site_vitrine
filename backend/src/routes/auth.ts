import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const loginSchema = z.object({
  password: z.string().min(1),
});

// Public routes
router.post('/login', async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    req.body = validated;
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

// Protected routes
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    await authController.getMe(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await authController.logout(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
