import { PrismaClient } from '@prisma/client';
import { ContactInput } from '../utils/validators.js';

const prisma = new PrismaClient();

export const contactController = {
  async submit(req: any, res: any) {
    const data: ContactInput = req.body;
    const submission = await prisma.contactSubmission.create({ data });
    // TODO: Send email notification
    res.status(201).json({ message: 'Message received', id: submission.id });
  },

  async getAll(_req: any, res: any) {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  },

  async markAsRead(req: any, res: any) {
    const submission = await prisma.contactSubmission.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(submission);
  },

  async delete(req: any, res: any) {
    await prisma.contactSubmission.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Submission deleted' });
  },
};
