import { PrismaClient } from '@prisma/client';
import { SkillInput } from '../utils/validators';

const prisma = new PrismaClient();

export const skillController = {
  async getAll(_req: any, res: any) {
    const skills = await prisma.skill.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(skills);
  },

  async create(req: any, res: any) {
    const data: SkillInput = req.body;
    const skill = await prisma.skill.create({ data });
    res.status(201).json(skill);
  },

  async update(req: any, res: any) {
    const data: Partial<SkillInput> = req.body;
    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data,
    });
    res.json(skill);
  },

  async delete(req: any, res: any) {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.json({ message: 'Skill deleted' });
  },
};
