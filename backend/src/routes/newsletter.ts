import { Router } from 'express';
import { newsletterController } from '../controllers/newsletterController';
import { newsletterSchema } from '../utils/validators';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/subscribe', async (req, res, next) => {
  try {
    const validated = newsletterSchema.parse(req.body);
    req.body = validated;
    await newsletterController.subscribe(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/unsubscribe', async (req, res, next) => {
  try {
    const validated = newsletterSchema.parse(req.body);
    req.body = validated;
    await newsletterController.unsubscribe(req, res);
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/', authMiddleware, adminOnly, async (req, res, next) => {
  try {
    await newsletterController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
