import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { contactSchema } from '../utils/validators';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/', async (req, res, next) => {
  try {
    const validated = contactSchema.parse(req.body);
    req.body = validated;
    await contactController.submit(req, res);
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await contactController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await contactController.markAsRead(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await contactController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
