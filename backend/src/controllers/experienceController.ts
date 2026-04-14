import { PrismaClient } from '@prisma/client';
import { ExperienceInput } from '../utils/validators';

const prisma = new PrismaClient();

export const experienceController = {
  async getAll(_req: any, res: any) {
    const experiences = await prisma.experience.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(experiences);
  },

  async create(req: any, res: any) {
    const data: ExperienceInput = req.body;
    const experience = await prisma.experience.create({ data });
    res.status(201).json(experience);
  },

  async update(req: any, res: any) {
    const data: Partial<ExperienceInput> = req.body;
    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data,
    });
    res.json(experience);
  },

  async delete(req: any, res: any) {
    await prisma.experience.delete({ where: { id: req.params.id } });
    res.json({ message: 'Experience deleted' });
  },
};
