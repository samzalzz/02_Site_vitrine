import { Router } from 'express';
import { clientProjectController as projectController } from '../controllers/clientProjectController.js';
import { createProjectSchema, updateProjectSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// All client project management requires admin auth
router.use(authMiddleware, adminOnly);

router.get('/', async (req, res, next) => {
  try {
    await projectController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    req.body = validated;
    await projectController.create(req, res);
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

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateProjectSchema.parse(req.body);
    req.body = validated;
    await projectController.update(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await projectController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
