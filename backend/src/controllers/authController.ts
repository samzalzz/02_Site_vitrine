import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const secret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const options: SignOptions = { expiresIn: expiresIn as any };
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      secret,
      options
    );

    res.json({
      token,
      expiresIn,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    const user = await prisma.adminUser.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json(user);
  },

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({ message: 'Logged out successfully' });
  },
};
