import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  technologies: z.array(z.string()),
  images: z.array(z.string()).optional().default([]),
  deployedUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().optional().default(0),
});

export const experienceSchema = z.object({
  title: z.string().min(3).max(255),
  company: z.string().min(2).max(255),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().min(10).max(5000),
  technologies: z.array(z.string()),
  order: z.number().int().optional().default(0),
});

export const skillSchema = z.object({
  name: z.string().min(2).max(255),
  category: z.string().min(2).max(100),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  order: z.number().int().optional().default(0),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  subject: z.string().min(5).max(255),
  message: z.string().min(10).max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});

// Auth and user management schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin']).default('admin'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['admin']).optional(),
});

// Export TypeScript types
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
