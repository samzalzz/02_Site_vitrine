import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12;

export const userController = {
  async getAll(_req: AuthRequest, res: Response): Promise<void> {
    const users = await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { email, password, name, role } = req.body;

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.adminUser.create({
      data: { email, passwordHash, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.status(201).json(user);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await prisma.adminUser.update({
      where: { id },
      data: { ...(name && { name }), ...(role && { role }) },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    res.json(user);
  },

  async remove(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.userId) {
      throw new AppError(400, 'Cannot delete your own account');
    }

    // Ensure at least one admin remains
    const count = await prisma.adminUser.count();
    if (count <= 1) {
      throw new AppError(400, 'Cannot delete the last admin account');
    }

    await prisma.adminUser.delete({ where: { id } });
    res.status(204).send();
  },

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Users can only change their own password
    if (id !== req.userId) {
      throw new AppError(403, 'Cannot change another user\'s password');
    }

    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.adminUser.update({ where: { id }, data: { passwordHash } });
    res.json({ message: 'Password changed successfully' });
  },
};
