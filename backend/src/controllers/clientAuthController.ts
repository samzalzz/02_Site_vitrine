import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { ZodError } from 'zod';
import { clientLoginSchema, clientResetPasswordSchema, requestPasswordResetSchema } from '../utils/validators.js';

const prisma = new PrismaClient();

export const clientAuthController = {
  async login(req: Request, res: Response, next?: any): Promise<void> {
    try {
      const { email, password } = clientLoginSchema.parse(req.body);

      const client = await prisma.client.findUnique({ where: { email } });

      if (!client || !client.canLogin || !client.passwordHash) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const valid = await bcrypt.compare(password, client.passwordHash);
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const secret = process.env.JWT_SECRET || 'secret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
      const token = jwt.sign(
        { id: client.id, type: 'client', email: client.email, name: client.name },
        secret,
        { expiresIn } as jwt.SignOptions
      );

      res.json({
        token,
        expiresIn,
        client: {
          id: client.id,
          email: client.email,
          name: client.name,
          company: client.company,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid request' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  async me(req: AuthRequest, res: Response, next?: any): Promise<void> {
    try {
      if (req.userType !== 'client') {
        res.status(403).json({ error: 'Not a client account' });
        return;
      }

      const client = await prisma.client.findUnique({
        where: { id: req.userId },
        select: { id: true, email: true, name: true, company: true },
      });

      if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      res.json(client);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid request' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  async requestPasswordReset(req: Request, res: Response, next?: any): Promise<void> {
    try {
      const { email } = requestPasswordResetSchema.parse(req.body);

      const client = await prisma.client.findUnique({ where: { email } });
      if (!client) {
        // Don't reveal if email exists (security)
        res.status(200).json({ message: 'If email exists, reset link will be sent' });
        return;
      }

      // Create reset token (valid for 24 hours)
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.passwordReset.create({
        data: { clientId: client.id, token, expiresAt },
      });

      // TODO: Send email with reset link
      // Link format: https://yourdomain.com/client/reset-password?token={token}

      res.status(200).json({ message: 'If email exists, reset link will be sent' });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid request' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },

  async resetPassword(req: Request, res: Response, next?: any): Promise<void> {
    try {
      const { token, newPassword } = clientResetPasswordSchema.parse(req.body);

      const reset = await prisma.passwordReset.findUnique({ where: { token } });
      if (!reset || new Date() > reset.expiresAt) {
        res.status(400).json({ error: 'Invalid or expired token' });
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await prisma.client.update({
        where: { id: reset.clientId },
        data: { passwordHash },
      });

      // Delete used token
      await prisma.passwordReset.delete({ where: { id: reset.id } });

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Invalid request' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  },
};
