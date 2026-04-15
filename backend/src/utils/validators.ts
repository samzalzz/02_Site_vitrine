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

// Client authentication schemas
export const clientLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const clientResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Client management schemas (admin operations)
export const createClientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active').optional(),
  canLogin: z.boolean().default(false),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  canLogin: z.boolean().optional(),
});

// Project / opportunity schemas
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().min(1, 'Client is required'),
  budget: z.coerce.number().optional(),
  timeline: z.string().optional(),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']).default('prospect'),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  budget: z.coerce.number().optional(),
  timeline: z.string().optional(),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']).optional(),
  clientId: z.string().min(1).optional(),
});

// Chat message schema
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  projectId: z.string().min(1),
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
export type ClientLoginInput = z.infer<typeof clientLoginSchema>;
export type ClientResetPasswordInput = z.infer<typeof clientResetPasswordSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
