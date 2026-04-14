import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const authController = {
  async login(req: any, res: any) {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const secret: string = process.env.JWT_SECRET || 'secret';
    const expiresIn: string = process.env.JWT_EXPIRES_IN || '7d';
    const options: SignOptions = { expiresIn: expiresIn as any };
    const token = jwt.sign(
      { id: 'admin', role: 'admin' },
      secret,
      options
    );

    res.json({ token, expiresIn });
  },

  async getMe(req: AuthRequest, res: any) {
    res.json({ userId: req.userId, role: req.role });
  },

  async logout(_req: any, res: any) {
    // Token is stateless, logout happens on client
    res.json({ message: 'Logged out' });
  },
};
