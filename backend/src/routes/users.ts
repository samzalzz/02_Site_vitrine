import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { createUserSchema, updateUserSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// All user management routes require admin auth
router.use(authMiddleware, adminOnly);

router.get('/', async (req, res, next) => {
  try { await userController.getAll(req, res); } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createUserSchema.parse(req.body);
    req.body = validated;
    await userController.create(req, res);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateUserSchema.parse(req.body);
    req.body = validated;
    await userController.update(req, res);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try { await userController.remove(req, res); } catch (e) { next(e); }
});

router.put('/:id/password', async (req, res, next) => {
  try { await userController.changePassword(req, res); } catch (e) { next(e); }
});

export default router;
