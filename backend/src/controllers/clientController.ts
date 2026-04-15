import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const clientController = {
  async getAll(_req: AuthRequest, res: Response): Promise<void> {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { email, name, company, phone, status, canLogin } = req.body;

    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const client = await prisma.client.create({
      data: {
        email,
        name,
        company: company || null,
        phone: phone || null,
        status: status || 'active',
        canLogin: typeof canLogin === 'boolean' ? canLogin : false,
        passwordHash: null, // Will be set on first login or password reset
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
      },
    });

    res.status(201).json(client);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, company, phone, status, canLogin } = req.body;

    // Verify client exists
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(company !== undefined && { company }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
        ...(typeof canLogin === 'boolean' && { canLogin }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
      },
    });

    res.json(client);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify client exists
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    await prisma.client.delete({ where: { id } });
    res.status(204).send();
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
    });

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(client);
  },

  async getProjects(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const projects = await prisma.clientProject.findMany({
      where: { clientId: id },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        timeline: true,
        status: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  },
};
