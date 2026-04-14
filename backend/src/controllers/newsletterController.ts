import { PrismaClient } from '@prisma/client';
import { NewsletterInput } from '../utils/validators';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const newsletterController = {
  async subscribe(req: any, res: any) {
    const { email }: NewsletterInput = req.body;

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.active) {
        throw new AppError(400, 'Already subscribed');
      }
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { active: true },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email, active: true },
      });
    }

    res.status(201).json({ message: 'Subscribed successfully' });
  },

  async getAll(_req: any, res: any) {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(subscribers);
  },

  async unsubscribe(req: any, res: any) {
    const { email }: NewsletterInput = req.body;

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      throw new AppError(404, 'Subscriber not found');
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { active: false },
    });

    res.json({ message: 'Unsubscribed' });
  },
};
