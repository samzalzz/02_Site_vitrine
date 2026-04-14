import { Router } from 'express';
import { skillController } from '../controllers/skillController';
import { skillSchema } from '../utils/validators';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', async (req, res, next) => {
  try {
    await skillController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.post(
  '/',
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const validated = skillSchema.parse(req.body);
      req.body = validated;
      await skillController.create(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const validated = skillSchema.partial().parse(req.body);
      req.body = validated;
      await skillController.update(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      await skillController.delete(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
