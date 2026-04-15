import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const clientProjectController = {
  async getAll(_req: AuthRequest, res: Response): Promise<void> {
    const projects = await prisma.clientProject.findMany({
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const project = await prisma.clientProject.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
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

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { title, description, clientId, budget, timeline, status } = req.body;

    const project = await prisma.clientProject.create({
      data: {
        title,
        description,
        clientId,
        budget,
        timeline,
        status: status ?? 'prospect',
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(project);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, description, budget, timeline, status, clientId } = req.body;

    // Verify project exists
    const existing = await prisma.clientProject.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = await prisma.clientProject.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(budget !== undefined && { budget }),
        ...(timeline !== undefined && { timeline }),
        ...(status && { status }),
        ...(clientId && { clientId }),
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(project);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify project exists
    const existing = await prisma.clientProject.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    await prisma.clientProject.delete({ where: { id } });
    res.status(204).send();
  },
};
