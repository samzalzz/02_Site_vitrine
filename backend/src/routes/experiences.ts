import { Router } from 'express';
import { experienceController } from '../controllers/experienceController';
import { experienceSchema } from '../utils/validators';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', async (req, res, next) => {
  try {
    await experienceController.getAll(req, res);
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
      const validated = experienceSchema.parse(req.body);
      req.body = validated;
      await experienceController.create(req, res);
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
      const validated = experienceSchema.partial().parse(req.body);
      req.body = validated;
      await experienceController.update(req, res);
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
      await experienceController.delete(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
