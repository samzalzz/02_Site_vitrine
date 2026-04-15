import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { createClientSchema, updateClientSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// All client management routes require admin auth
router.use(authMiddleware, adminOnly);

router.get('/', async (req, res, next) => {
  try {
    await clientController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createClientSchema.parse(req.body);
    req.body = validated;
    await clientController.create(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await clientController.getById(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateClientSchema.parse(req.body);
    req.body = validated;
    await clientController.update(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await clientController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/projects', async (req, res, next) => {
  try {
    await clientController.getProjects(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
