import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { loginSchema } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);
    req.body = validated;
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    await authController.me(req, res);
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
