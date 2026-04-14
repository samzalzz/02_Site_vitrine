import { Router } from 'express';
import { projectController } from '../controllers/projectController.js';
import { projectSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', async (req, res, next) => {
  try {
    await projectController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await projectController.getById(req, res);
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
      const validated = projectSchema.parse(req.body);
      req.body = validated;
      await projectController.create(req, res);
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
      const validated = projectSchema.partial().parse(req.body);
      req.body = validated;
      await projectController.update(req, res);
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
      await projectController.delete(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
