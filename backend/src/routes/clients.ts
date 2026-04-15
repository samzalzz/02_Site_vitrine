import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { createClientSchema, updateClientSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Client routes that require authentication but not admin
router.get('/me/projects', authMiddleware, async (req, res, next) => {
  try {
    if ((req as any).userType !== 'client') {
      res.status(403).json({ error: 'Not a client' });
      return;
    }
    const projects = await prisma.clientProject.findMany({
      where: { clientId: (req as any).userId },
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderName: true,
            createdAt: true,
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get('/me/projects/:id', authMiddleware, async (req, res, next) => {
  try {
    if ((req as any).userType !== 'client') {
      res.status(403).json({ error: 'Not a client' });
      return;
    }
    const project = await prisma.clientProject.findUnique({
      where: { id: req.params.id },
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderName: true,
            createdAt: true,
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!project || project.clientId !== (req as any).userId) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// All admin client management routes require admin auth
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
