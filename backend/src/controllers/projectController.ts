import { PrismaClient } from '@prisma/client';
import { ProjectInput } from '../utils/validators';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const projectController = {
  async getAll(_req: any, res: any) {
    const projects = await prisma.project.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(projects);
  },

  async getById(req: any, res: any) {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      throw new AppError(404, 'Project not found');
    }

    res.json(project);
  },

  async create(req: any, res: any) {
    const data: ProjectInput = req.body;

    const project = await prisma.project.create({
      data: {
        ...data,
        deployedUrl: data.deployedUrl || undefined,
        githubUrl: data.githubUrl || undefined,
      },
    });

    res.status(201).json(project);
  },

  async update(req: any, res: any) {
    const data: Partial<ProjectInput> = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...data,
        deployedUrl: data.deployedUrl || undefined,
        githubUrl: data.githubUrl || undefined,
      },
    });

    res.json(project);
  },

  async delete(req: any, res: any) {
    await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Project deleted' });
  },
};
