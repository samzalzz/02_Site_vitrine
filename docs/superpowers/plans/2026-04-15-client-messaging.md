# Client Management & Real-Time Chat System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hybrid client management system where admin can manage projects/opportunities and selectively grant clients login access to participate in real-time chat with file/image sharing and email notifications.

**Architecture:** 
- **Database:** Add Client, Project (replacing/enhancing existing), Message, FileAttachment, and PasswordReset models to Prisma
- **Backend APIs:** REST endpoints for project/client CRUD (admin), Socket.io for real-time messaging (authenticated), email service for notifications and password resets
- **Admin Dashboard:** Extend with full project/client management, message archive, and password reset tools
- **Client Portal:** New authenticated area where clients can view assigned projects and chat in real-time

**Tech Stack:** Prisma v5, PostgreSQL, Socket.io v4, Express.js, Nodemailer, Next.js 16, TanStack Query, React Hook Form, Zod v3 (backend)/v4 (frontend)

---

## Critical Notes

- **Socket.io** is NOT installed yet — will add in Phase 3
- **File storage** — for MVP, use local filesystem (`public/uploads/`); can migrate to cloud later
- **Email notifications** — use existing Nodemailer setup; add password reset tokens to DB
- **Admin password reset** — admin generates token, sends reset link to client email, client clicks to set new password
- **Client login gating** — `Client.canLogin` boolean controls access; admin sets when creating/editing client
- **Message architecture** — Messages linked to Projects, support both client→admin and admin→client
- **Hybrid access** — Same Project can have both "chat clients" (canLogin=true) and "tracked clients" (canLogin=false, admin-only notes)

---

## Phase 1: Database Schema & Data Models

### Task 1: Add Client, Project, Message, and Attachment Models to Prisma

**Files:**
- Modify: `backend/prisma/schema.prisma`

**Database Models to Add:**

```prisma
model Client {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String?  // Null until first password set
  name         String
  company      String?
  phone        String?
  status       String   @default("active") // "active", "inactive", "prospect"
  canLogin     Boolean  @default(false)    // Whether client can access portal
  projects     Project[]
  messages     Message[]
  passwordResets PasswordReset[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Project {
  id           String   @id @default(cuid())
  title        String
  description  String
  budget       Float?
  timeline     String?  // e.g., "2-4 weeks", "Ongoing"
  status       String   @default("prospect") // "prospect", "active", "completed", "on-hold"
  clientId     String
  client       Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  messages     Message[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Message {
  id           String   @id @default(cuid())
  content      String
  senderId     String   // Can be admin user ID or client ID
  senderType   String   // "admin" or "client"
  senderName   String   // Denormalized for easier display
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  attachments  FileAttachment[]
  createdAt    DateTime @default(now())
}

model FileAttachment {
  id           String   @id @default(cuid())
  messageId    String
  message      Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  fileName     String
  originalName String   // User-facing name
  fileType     String   // MIME type: "image/png", "application/pdf", etc.
  fileSize     Int      // In bytes
  fileUrl      String   // Relative path: "/uploads/abc123.png"
  uploadedAt   DateTime @default(now())
}

model PasswordReset {
  id           String   @id @default(cuid())
  clientId     String
  client       Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  token        String   @unique // Random token from crypto.randomBytes(32).toString('hex')
  expiresAt    DateTime // 24 hours from creation
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 1: Read current schema.prisma**

Read: `backend/prisma/schema.prisma` to see existing models (should have AdminUser from phase 1)

- [ ] **Step 2: Add new models to schema.prisma**

Add the `Client`, `Project`, `Message`, `FileAttachment`, and `PasswordReset` models shown above after existing models.

- [ ] **Step 3: Create and run migration**

```bash
cd backend
npx prisma migrate dev --name add_client_messaging_system
```

Expected output: `✔ Your database is now in sync with your schema`

- [ ] **Step 4: Verify migration**

```bash
cd backend
npx prisma studio
```

Open browser, confirm new tables exist with correct columns.

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat(db): add Client, Project, Message, FileAttachment, PasswordReset models"
```

---

## Phase 2: Backend Authentication, REST APIs, and Validators

### Task 2: Add Client Login Schema & Password Reset Validators

**Files:**
- Modify: `backend/src/utils/validators.ts`

- [ ] **Step 1: Add validators to existing validators file**

Add these schemas to `backend/src/utils/validators.ts`:

```typescript
export const clientLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const clientResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createClientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  canLogin: z.boolean().default(false),
});

export const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  canLogin: z.boolean().optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().min(1, 'Client is required'),
  budget: z.number().optional(),
  timeline: z.string().optional(),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']).default('prospect'),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  budget: z.number().optional(),
  timeline: z.string().optional(),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']).optional(),
  clientId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
  projectId: z.string().min(1),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/utils/validators.ts
git commit -m "feat(validators): add client auth and project management schemas"
```

---

### Task 3: Create Client Authentication Controller

**Files:**
- Create: `backend/src/controllers/clientAuthController.ts`

- [ ] **Step 1: Create clientAuthController.ts**

```typescript
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const clientAuthController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const client = await prisma.client.findUnique({ where: { email } });
    
    if (!client || !client.canLogin || !client.passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, client.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
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
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
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
  },

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

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
    // For now, just log
    console.log(`Password reset token for ${email}: ${token}`);

    res.status(200).json({ message: 'If email exists, reset link will be sent' });
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

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
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/controllers/clientAuthController.ts
git commit -m "feat(auth): add client authentication controller with password reset"
```

---

### Task 4: Create Client & Project Management Controller

**Files:**
- Create: `backend/src/controllers/clientController.ts`
- Create: `backend/src/controllers/projectController.ts`

- [ ] **Step 1: Create clientController.ts**

```typescript
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const clientController = {
  async getAll(_req: AuthRequest, res: Response): Promise<void> {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { email, name, company, phone, canLogin } = req.body;

    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }

    const client = await prisma.client.create({
      data: {
        email,
        name,
        company: company || null,
        phone: phone || null,
        canLogin: canLogin || false,
        passwordHash: null, // Will be set on first login or password reset
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
      },
    });

    res.status(201).json(client);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, company, phone, status, canLogin } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(company !== undefined && { company }),
        ...(phone !== undefined && { phone }),
        ...(status && { status }),
        ...(canLogin !== undefined && { canLogin }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        status: true,
        canLogin: true,
        createdAt: true,
      },
    });

    res.json(client);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    await prisma.client.delete({ where: { id } });
    res.status(204).send();
  },

  async getProjects(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const projects = await prisma.project.findMany({
      where: { clientId: id },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        timeline: true,
        status: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  },
};
```

- [ ] **Step 2: Create projectController.ts**

```typescript
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

export const projectController = {
  async getAll(_req: AuthRequest, res: Response): Promise<void> {
    const projects = await prisma.project.findMany({
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        messages: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderName: true,
            createdAt: true,
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    const { title, description, clientId, budget, timeline, status } = req.body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        clientId,
        budget: budget || null,
        timeline: timeline || null,
        status: status || 'prospect',
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(project);
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { title, description, budget, timeline, status, clientId } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(budget !== undefined && { budget }),
        ...(timeline && { timeline }),
        ...(status && { status }),
        ...(clientId && { clientId }),
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(project);
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;

    await prisma.project.delete({ where: { id } });
    res.status(204).send();
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/clientController.ts backend/src/controllers/projectController.ts
git commit -m "feat(controllers): add client and project management controllers"
```

---

### Task 5: Create Routes for Client Auth, Clients, and Projects

**Files:**
- Create: `backend/src/routes/clientAuth.ts`
- Create: `backend/src/routes/clients.ts`
- Create: `backend/src/routes/projects.ts` (will extend existing or create new)
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create clientAuth.ts**

```typescript
import { Router } from 'express';
import { clientAuthController } from '../controllers/clientAuthController.js';
import { clientLoginSchema, clientResetPasswordSchema, requestPasswordResetSchema } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const validated = clientLoginSchema.parse(req.body);
    req.body = validated;
    await clientAuthController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    await clientAuthController.me(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/request', async (req, res, next) => {
  try {
    const validated = requestPasswordResetSchema.parse(req.body);
    req.body = validated;
    await clientAuthController.requestPasswordReset(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/password-reset/confirm', async (req, res, next) => {
  try {
    const validated = clientResetPasswordSchema.parse(req.body);
    req.body = validated;
    await clientAuthController.resetPassword(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
```

- [ ] **Step 2: Create clients.ts**

```typescript
import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { createClientSchema, updateClientSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// All client management routes require admin auth
router.use(authMiddleware, adminOnly);

router.get('/', async (req, res, next) => {
  try {
    await clientController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createClientSchema.parse(req.body);
    req.body = validated;
    await clientController.create(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateClientSchema.parse(req.body);
    req.body = validated;
    await clientController.update(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await clientController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/projects', async (req, res, next) => {
  try {
    await clientController.getProjects(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
```

- [ ] **Step 3: Create projects.ts (extends existing projects routes)**

Since an existing projects route may exist, integrate with it. Create new route or extend existing:

```typescript
import { Router } from 'express';
import { projectController } from '../controllers/projectController.js';
import { createProjectSchema, updateProjectSchema } from '../utils/validators.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';

const router = Router();

// All project management requires admin auth
router.use(authMiddleware, adminOnly);

router.get('/', async (req, res, next) => {
  try {
    await projectController.getAll(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validated = createProjectSchema.parse(req.body);
    req.body = validated;
    await projectController.create(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await projectController.getById(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const validated = updateProjectSchema.parse(req.body);
    req.body = validated;
    await projectController.update(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await projectController.delete(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
```

- [ ] **Step 4: Update backend/src/index.ts to register new routes**

Add these imports:
```typescript
import clientAuthRoutes from './routes/clientAuth.js';
import clientRoutes from './routes/clients.js';
import projectRoutes from './routes/projects.js';
```

Add these routes after existing routes:
```typescript
app.use('/api/client-auth', clientAuthRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
```

- [ ] **Step 5: Update auth middleware to support both admin and client tokens**

Modify `backend/src/middleware/auth.ts` to extract `userType` from token:

In the `authMiddleware` function, after `jwt.verify()`, add:
```typescript
req.userType = (decoded as any).type || 'admin'; // 'admin' or 'client'
req.userId = (decoded as any).id;
req.userEmail = (decoded as any).email;
```

Update `AuthRequest` interface:
```typescript
export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
  userType?: string; // 'admin' or 'client'
  userEmail?: string;
}
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/clientAuth.ts backend/src/routes/clients.ts backend/src/routes/projects.ts backend/src/index.ts backend/src/middleware/auth.ts
git commit -m "feat(routes): add client auth, client management, and project management REST endpoints"
```

---

## Phase 3: Socket.io Setup for Real-Time Messaging

### Task 6: Install Socket.io and Set Up Server

**Files:**
- Modify: `backend/package.json`
- Create: `backend/src/socket/socketHandler.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Install Socket.io**

```bash
cd backend
npm install socket.io cors
npm install --save-dev @types/node
```

- [ ] **Step 2: Create socketHandler.ts**

```typescript
import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function initializeSocket(httpServer: Server) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Socket.io authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      socket.data.userId = decoded.id;
      socket.data.userType = decoded.type || 'admin'; // 'admin' or 'client'
      socket.data.userName = decoded.name;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // On new connection
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.userId} (${socket.data.userType})`);

    // Join project room
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`${socket.data.userId} joined project:${projectId}`);
    });

    // Leave project room
    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`${socket.data.userId} left project:${projectId}`);
    });

    // Send message
    socket.on('message:send', async (data: { projectId: string; content: string }) => {
      const { projectId, content } = data;

      try {
        // Create message in database
        const message = await prisma.message.create({
          data: {
            content,
            senderId: socket.data.userId,
            senderType: socket.data.userType,
            senderName: socket.data.userName,
            projectId,
          },
          include: { attachments: true },
        });

        // Broadcast to all users in project room
        io.to(`project:${projectId}`).emit('message:receive', {
          id: message.id,
          content: message.content,
          senderType: message.senderType,
          senderName: message.senderName,
          createdAt: message.createdAt,
          attachments: message.attachments,
        });

        // TODO: Send email notification to other participants
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // File upload will be handled in Task 7

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.userId}`);
    });
  });

  return io;
}
```

- [ ] **Step 3: Update backend/src/index.ts to use Socket.io**

Change the app setup to use http.createServer:

```typescript
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';  // Add this
import { initializeSocket } from './socket/socketHandler.js';  // Add this
// ... other imports

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const httpServer = http.createServer(app);  // Add this

// Initialize Socket.io
initializeSocket(httpServer);  // Add this

// ... middleware setup (cors, json, etc.)

// ... routes

// Start server - change from app.listen() to httpServer.listen()
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  Portfolio Backend Server Started  ║
║  Environment: ${process.env.NODE_ENV?.padEnd(17, ' ')}║
║  Port: ${String(PORT).padEnd(26, ' ')}║
║  URL: http://localhost:${String(PORT).padEnd(19, ' ')}║
╚════════════════════════════════════╝
  `);
});
```

- [ ] **Step 4: Commit**

```bash
git add backend/package.json backend/src/socket/socketHandler.ts backend/src/index.ts
git commit -m "feat(socket.io): set up real-time messaging server with authentication"
```

---

## Phase 4: File Upload, Message Attachments, and Email Notifications

### Task 7: Add File Upload Handling and Email Notifications

**Files:**
- Create: `backend/src/utils/fileHandler.ts`
- Create: `backend/src/utils/emailService.ts`
- Create: `backend/src/middleware/fileUpload.ts`
- Modify: `backend/src/socket/socketHandler.ts`

- [ ] **Step 1: Install multer for file uploads**

```bash
cd backend
npm install multer
npm install --save-dev @types/multer
```

- [ ] **Step 2: Create fileHandler.ts for file management**

```typescript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const fileHandler = {
  saveFile(buffer: Buffer, originalName: string): { fileName: string; fileUrl: string } {
    // Generate unique filename
    const ext = path.extname(originalName);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, buffer);

    return {
      fileName,
      fileUrl: `/uploads/${fileName}`,
    };
  },

  deleteFile(fileName: string): void {
    const filePath = path.join(UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  },

  getFilePath(fileName: string): string {
    return path.join(UPLOAD_DIR, fileName);
  },
};
```

- [ ] **Step 3: Create middleware/fileUpload.ts**

```typescript
import multer from 'multer';
import path from 'path';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage(); // Keep in memory, we'll save manually

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new Error('Invalid file type'));
      return;
    }
    cb(null, true);
  },
});
```

- [ ] **Step 4: Create emailService.ts**

```typescript
import nodemailer from 'nodemailer';

// Configure nodemailer (adjust based on your email provider)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailService = {
  async sendPasswordResetEmail(clientEmail: string, clientName: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@portfolio.local',
      to: clientEmail,
      subject: 'Reset Your Password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${clientName},</p>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  },

  async sendMessageNotificationEmail(recipientEmail: string, recipientName: string, senderName: string, projectTitle: string, messagePreview: string): Promise<void> {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@portfolio.local',
      to: recipientEmail,
      subject: `New message from ${senderName} - ${projectTitle}`,
      html: `
        <h2>New Message</h2>
        <p>Hi ${recipientName},</p>
        <p><strong>${senderName}</strong> sent you a message in project <strong>${projectTitle}</strong>:</p>
        <blockquote style="border-left: 4px solid #3b82f6; padding-left: 10px; margin: 10px 0; color: #666;">
          ${messagePreview}
        </blockquote>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/projects/${projectTitle}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Conversation</a>
      `,
    });
  },
};
```

- [ ] **Step 5: Update socketHandler.ts to handle file uploads and notifications**

Add this handler inside the `io.on('connection', ...)` block:

```typescript
// Handle file upload
socket.on('file:upload', async (data: { projectId: string; file: Buffer; fileName: string; fileType: string; fileSize: number }) => {
  try {
    const { fileHandler } = await import('../utils/fileHandler.js');
    const { projectId, file, fileName, fileType, fileSize } = data;

    // Save file
    const { fileUrl } = fileHandler.saveFile(file, fileName);

    // Note: File attachments are created when attached to a message
    // For now, just return the file info
    socket.emit('file:uploaded', {
      fileName,
      fileUrl,
      fileType,
      fileSize,
    });
  } catch (error) {
    socket.emit('error', { message: 'File upload failed' });
  }
});
```

Also update the `message:send` handler to trigger email notifications:

```typescript
// After message is created, send email notification
try {
  const { emailService } = await import('../utils/emailService.js');
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (project && project.clientId && socket.data.userType === 'admin') {
    // Admin sent message to client
    await emailService.sendMessageNotificationEmail(
      project.client.email,
      project.client.name,
      socket.data.userName,
      project.title,
      content.substring(0, 100)
    );
  }
} catch (emailError) {
  console.error('Failed to send notification email:', emailError);
}
```

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/src/utils/fileHandler.ts backend/src/utils/emailService.ts backend/src/middleware/fileUpload.ts backend/src/socket/socketHandler.ts
git commit -m "feat(uploads): add file upload handling and email notifications"
```

---

## Phase 5: Admin Dashboard — Clients and Projects Management Pages

### Task 8: Create Admin Clients Management Page

**Files:**
- Create: `frontend/app/admin/clients/page.tsx`
- Modify: `frontend/src/lib/api.ts`
- Modify: `frontend/src/components/admin/AdminSidebar.tsx`

- [ ] **Step 1: Update frontend/src/lib/api.ts to add client methods**

Add to the `admin` namespace:

```typescript
    async getClients() {
      return this.getAll<{
        id: string;
        email: string;
        name: string;
        company?: string;
        phone?: string;
        status: string;
        canLogin: boolean;
        createdAt: string;
        _count: { projects: number };
      }>('clients');
    },
    async createClient(data: { email: string; name: string; company?: string; phone?: string; canLogin?: boolean }) {
      return this.create<{ id: string; email: string; name: string; company?: string; phone?: string; status: string; canLogin: boolean; createdAt: string }>('clients', data);
    },
    async updateClient(id: string, data: { name?: string; company?: string; phone?: string; status?: string; canLogin?: boolean }) {
      return this.update<{ id: string; email: string; name: string; company?: string; phone?: string; status: string; canLogin: boolean }>('clients', id, data);
    },
    async deleteClient(id: string) {
      return this.remove('clients', id);
    },
    async sendPasswordReset(clientId: string) {
      const res = await fetch(`${API_BASE_URL}/clients/${clientId}/send-password-reset`, {
        method: 'POST',
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error(await res.json().then(d => d.error ?? 'Failed'));
      return res.json();
    },
```

- [ ] **Step 2: Update AdminSidebar to add Clients link**

In `frontend/src/components/admin/AdminSidebar.tsx`, add to NAV array:

```typescript
{ href: '/admin/clients', label: 'Clients' },
```

- [ ] **Step 3: Create clients management page**

Create `frontend/app/admin/clients/page.tsx`:

```typescript
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { cn } from '@/lib/cn';

interface AdminClient {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  status: string;
  canLogin: boolean;
  createdAt: string;
  _count: { projects: number };
}

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().optional(),
  phone: z.string().optional(),
  canLogin: z.boolean().default(false),
});
type CreateData = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).optional(),
  canLogin: z.boolean().optional(),
});
type EditData = z.infer<typeof editSchema>;

const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'company', header: 'Company' },
  { key: 'status', header: 'Status' },
  { key: 'canLogin', header: 'Can Login', render: (r: AdminClient) => (r.canLogin ? '✓' : '✗') },
];

const inputCls = (err: boolean) =>
  cn(
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
    err ? 'border-red-300' : 'border-neutral-300'
  );

export default function ClientsPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminClient | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClient, setEditingClient] = useState<AdminClient | null>(null);
  const [apiError, setApiError] = useState('');

  const { data = [], isLoading } = useQuery<AdminClient[]>({
    queryKey: ['admin', 'clients'],
    queryFn: () => api.admin.getClients(),
  });

  const createForm = useForm<CreateData>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditData>({ resolver: zodResolver(editSchema) });

  const createM = useMutation({
    mutationFn: (d: CreateData) => api.admin.createClient(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setShowCreateForm(false);
      createForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const updateM = useMutation({
    mutationFn: (d: EditData) => api.admin.updateClient(editingClient!.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setEditingClient(null);
      editForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.admin.deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const resetPwdM = useMutation({
    mutationFn: (id: string) => api.admin.sendPasswordReset(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setApiError('');
      alert('Password reset email sent');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setShowCreateForm(true);
            setApiError('');
          }}
        >
          Add Client
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {apiError}
        </div>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">New Client</h2>
          </div>
          <div className="px-6 py-4">
            <form
              onSubmit={createForm.handleSubmit((d) => createM.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <input
                    {...createForm.register('name')}
                    className={inputCls(!!createForm.formState.errors.name)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    {...createForm.register('email')}
                    type="email"
                    className={inputCls(!!createForm.formState.errors.email)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Company</label>
                  <input
                    {...createForm.register('company')}
                    className={inputCls(!!createForm.formState.errors.company)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    {...createForm.register('phone')}
                    className={inputCls(!!createForm.formState.errors.phone)}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    {...createForm.register('canLogin')}
                    className="w-4 h-4 mr-2 rounded"
                  />
                  Allow to login to client portal
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={createForm.formState.isSubmitting}>
                  Create
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {editingClient && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Edit Client — {editingClient.name}</h2>
          </div>
          <div className="px-6 py-4">
            <form
              onSubmit={editForm.handleSubmit((d) => updateM.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <input
                    {...editForm.register('name')}
                    className={inputCls(!!editForm.formState.errors.name)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select
                    {...editForm.register('status')}
                    className={inputCls(!!editForm.formState.errors.status)}
                  >
                    <option value="">Select status</option>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Company</label>
                  <input
                    {...editForm.register('company')}
                    className={inputCls(!!editForm.formState.errors.company)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    {...editForm.register('phone')}
                    className={inputCls(!!editForm.formState.errors.phone)}
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    {...editForm.register('canLogin')}
                    className="w-4 h-4 mr-2 rounded"
                  />
                  Allow to login to client portal
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={editForm.formState.isSubmitting}>
                  Update
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingClient(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => resetPwdM.mutate(editingClient.id)}
                  disabled={resetPwdM.isPending}
                  className="text-blue-600"
                >
                  Send Password Reset Email
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={data}
          onEdit={setEditingClient}
          onDelete={setDeleteTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete client "${deleteTarget.name}" (${deleteTarget.email})? Their projects and messages will remain.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/admin/clients/page.tsx frontend/src/lib/api.ts frontend/src/components/admin/AdminSidebar.tsx
git commit -m "feat(admin): add clients management page with CRUD and password reset"
```

---

### Task 9: Create Admin Projects Management Page with Chat View

**Files:**
- Create: `frontend/app/admin/projects/page.tsx` (replaces or extends existing)
- Create: `frontend/app/admin/projects/[id]/page.tsx`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Update frontend/src/lib/api.ts to add project methods**

Add to the `admin` namespace:

```typescript
    async getProjects() {
      return this.getAll<{
        id: string;
        title: string;
        description: string;
        budget?: number;
        timeline?: string;
        status: string;
        clientId: string;
        client: { id: string; name: string; email: string; company?: string };
        _count: { messages: number };
        createdAt: string;
      }>('projects');
    },
    async getProjectById(id: string) {
      return this.getAll<{
        id: string;
        title: string;
        description: string;
        budget?: number;
        timeline?: string;
        status: string;
        clientId: string;
        client: { id: string; name: string; email: string; company?: string };
        messages: {
          id: string;
          content: string;
          senderType: string;
          senderName: string;
          createdAt: string;
          attachments: { id: string; fileName: string; originalName: string; fileUrl: string }[];
        }[];
      }>(`projects/${id}`);
    },
    async createProject(data: { title: string; description: string; clientId: string; budget?: number; timeline?: string; status?: string }) {
      return this.create<{ id: string; title: string; description: string; clientId: string; status: string; createdAt: string }>('projects', data);
    },
    async updateProject(id: string, data: { title?: string; description?: string; budget?: number; timeline?: string; status?: string; clientId?: string }) {
      return this.update<{ id: string; title: string; description: string; status: string }>('projects', id, data);
    },
    async deleteProject(id: string) {
      return this.remove('projects', id);
    },
```

- [ ] **Step 2: Create projects list page**

Create `frontend/app/admin/projects/page.tsx`:

```typescript
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { cn } from '@/lib/cn';

interface Project {
  id: string;
  title: string;
  description: string;
  budget?: number;
  timeline?: string;
  status: string;
  clientId: string;
  client: { id: string; name: string; email: string; company?: string };
  _count: { messages: number };
  createdAt: string;
}

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().min(1, 'Client is required'),
  budget: z.coerce.number().optional(),
  timeline: z.string().optional(),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']).default('prospect'),
});
type CreateData = z.infer<typeof createSchema>;

const COLUMNS = [
  { key: 'title', header: 'Title', render: (r: Project) => <strong>{r.title}</strong> },
  { key: 'client', header: 'Client', render: (r: Project) => r.client?.name },
  { key: 'status', header: 'Status' },
  { key: '_count', header: 'Messages', render: (r: Project) => r._count.messages },
];

const inputCls = (err: boolean) =>
  cn(
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
    err ? 'border-red-300' : 'border-neutral-300'
  );

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [apiError, setApiError] = useState('');

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.admin.getProjects(),
  });

  const { data: clients = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['admin', 'clients'],
    queryFn: () => api.admin.getClients(),
  });

  const createForm = useForm<CreateData>({ resolver: zodResolver(createSchema) });

  const createM = useMutation({
    mutationFn: (d: CreateData) => api.admin.createProject(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
      setShowCreateForm(false);
      createForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.admin.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => setApiError(e.message),
  });

  // Custom render for actions with link to project detail
  const ProjectRow = ({ project }: { project: Project }) => (
    <tr className="bg-white hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3 text-neutral-700">
        <Link href={`/admin/projects/${project.id}`} className="font-semibold text-primary-600 hover:underline">
          {project.title}
        </Link>
      </td>
      <td className="px-4 py-3 text-neutral-700">{project.client?.name}</td>
      <td className="px-4 py-3 text-neutral-700">
        <span className="px-2 py-1 bg-neutral-100 rounded text-xs">{project.status}</span>
      </td>
      <td className="px-4 py-3 text-neutral-700">{project._count.messages}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(project)} className="text-red-600 hover:bg-red-50">
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
        <Button variant="primary" size="sm" onClick={() => setShowCreateForm(true)}>
          New Project
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {apiError}
        </div>
      )}

      {showCreateForm && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">New Project</h2>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={createForm.handleSubmit((d) => createM.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input {...createForm.register('title')} className={inputCls(!!createForm.formState.errors.title)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  {...createForm.register('description')}
                  rows={4}
                  className={inputCls(!!createForm.formState.errors.description)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
                  <select {...createForm.register('clientId')} className={inputCls(!!createForm.formState.errors.clientId)}>
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select {...createForm.register('status')} className={inputCls(!!createForm.formState.errors.status)}>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Budget</label>
                  <input type="number" {...createForm.register('budget')} className={inputCls(!!createForm.formState.errors.budget)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Timeline</label>
                  <input {...createForm.register('timeline')} className={inputCls(!!createForm.formState.errors.timeline)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={createForm.formState.isSubmitting}>
                  Create
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Title</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Client</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Messages</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                    No projects yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete project "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create project detail/chat page**

Create `frontend/app/admin/projects/[id]/page.tsx`:

```typescript
'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import io, { Socket } from 'socket.io-client';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  budget?: number;
  timeline?: string;
  status: string;
  client: { id: string; name: string; email: string; company?: string };
  messages: Array<{
    id: string;
    content: string;
    senderType: string;
    senderName: string;
    createdAt: string;
    attachments: Array<{
      id: string;
      fileName: string;
      originalName: string;
      fileUrl: string;
    }>;
  }>;
}

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string;
  attachments: any[];
}

const messageSchema = z.object({
  content: z.string().min(1),
});
type MessageData = z.infer<typeof messageSchema>;

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MessageData>();

  const { data: project, isLoading } = useQuery<ProjectDetail>({
    queryKey: ['admin', 'project', id],
    queryFn: () => api.admin.getProjectById(id),
  });

  useEffect(() => {
    if (project) {
      setMessages(project.messages);
    }
  }, [project]);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) return;

    const socket = io(undefined, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
      setIsConnected(true);
      socket.emit('join:project', id);
    });

    socket.on('message:receive', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = (data: MessageData) => {
    if (!socketRef.current) return;

    socketRef.current.emit('message:send', {
      projectId: id,
      content: data.content,
    });

    reset();
  };

  if (isLoading) return <div className="text-neutral-500">Loading...</div>;
  if (!project) return <div className="text-red-600">Project not found</div>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="px-6 py-4 border-b border-neutral-200">
          <h1 className="text-2xl font-bold text-neutral-900">{project.title}</h1>
          <p className="text-sm text-neutral-600 mt-2">Client: {project.client.name}</p>
        </div>
        <div className="px-6 py-4 space-y-3">
          <p className="text-neutral-700">{project.description}</p>
          <div className="grid grid-cols-3 gap-4">
            {project.budget && (
              <div>
                <span className="text-sm text-neutral-600">Budget: </span>
                <strong>${project.budget.toLocaleString()}</strong>
              </div>
            )}
            {project.timeline && (
              <div>
                <span className="text-sm text-neutral-600">Timeline: </span>
                <strong>{project.timeline}</strong>
              </div>
            )}
            <div>
              <span className="text-sm text-neutral-600">Status: </span>
              <strong className="capitalize">{project.status}</strong>
            </div>
          </div>
        </div>
      </Card>

      <Card className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-neutral-900">Messages</h2>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-neutral-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto max-h-96 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-sm rounded-lg px-4 py-2 ${
                  msg.senderType === 'admin'
                    ? 'bg-primary-100 text-primary-900'
                    : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <div className="text-xs font-medium text-opacity-70 mb-1">{msg.senderName}</div>
                <p>{msg.content}</p>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline block"
                      >
                        📎 {att.originalName}
                      </a>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 py-4 border-t border-neutral-200">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <input
              {...register('content')}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting || !isConnected}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/admin/projects/page.tsx frontend/app/admin/projects/[id]/page.tsx frontend/src/lib/api.ts
git commit -m "feat(admin): add projects management with real-time chat interface"
```

---

## Phase 6: Client Portal — Login, Dashboard, and Chat

### Task 10: Create Client Portal Login Page and Dashboard

**Files:**
- Create: `frontend/app/client/layout.tsx`
- Create: `frontend/app/client/login/page.tsx`
- Create: `frontend/app/client/dashboard/page.tsx`
- Create: `frontend/app/client/projects/[id]/page.tsx`
- Create: `frontend/src/lib/clientAuth.ts`
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Create clientAuth.ts for client authentication**

Create `frontend/src/lib/clientAuth.ts`:

```typescript
const TOKEN_KEY = 'client_auth_token';

export const clientAuth = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
```

- [ ] **Step 2: Add client API methods to frontend/src/lib/api.ts**

Add a new `client` namespace to the api object:

```typescript
  client: {
    async login(email: string, password: string): Promise<{ token: string; client: any }> {
      const res = await fetch(`${API_BASE_URL}/client-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid email or password');
      return res.json();
    },
    async me(token: string): Promise<any> {
      const res = await fetch(`${API_BASE_URL}/client-auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unauthenticated');
      return res.json();
    },
    async getProjects(token: string): Promise<any[]> {
      const res = await fetch(`${API_BASE_URL}/clients/me/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  },
```

- [ ] **Step 3: Create client layout**

Create `frontend/app/client/layout.tsx`:

```typescript
'use client';
import { useRouter } from 'next/navigation';
import { clientAuth } from '@/lib/clientAuth';
import { Button } from '@/components/Button';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    clientAuth.removeToken();
    router.push('/client/login');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-neutral-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-700">
          <span className="font-bold text-lg">Client Portal</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="/client/dashboard" className="block px-3 py-2 rounded-md text-sm hover:bg-neutral-800">
            Dashboard
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-neutral-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-left text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-neutral-50 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Create client login page**

Create `frontend/app/client/login/page.tsx`:

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clientAuth } from '@/lib/clientAuth';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function ClientLoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      const { token } = await api.client.login(email, password);
      clientAuth.setToken(token);
      router.push('/client/dashboard');
    } catch {
      setError('password', { message: 'Invalid email or password' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm bg-white rounded-lg border border-neutral-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Client Portal</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.email ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.password ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create client dashboard**

Create `frontend/app/client/dashboard/page.tsx`:

```typescript
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientAuth } from '@/lib/clientAuth';
import { api } from '@/lib/api';
import { Card } from '@/components/Card';

interface ClientProject {
  id: string;
  title: string;
  description: string;
  status: string;
  _count: { messages: number };
}

export default function ClientDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = clientAuth.getToken();
    if (!token) {
      router.push('/client/login');
      return;
    }

    api.client.getProjects(token).then(setProjects).catch(() => router.push('/client/login')).finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return <div className="text-neutral-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Your Projects</h1>
      {projects.length === 0 ? (
        <p className="text-neutral-600">No projects assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/client/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">{project.title}</h2>
                  <p className="text-sm text-neutral-600 mb-3">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-neutral-100 rounded">{project.status}</span>
                    <span className="text-xs text-neutral-500">{project._count.messages} messages</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create client project chat page**

Create `frontend/app/client/projects/[id]/page.tsx`:

```typescript
'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { clientAuth } from '@/lib/clientAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import io, { Socket } from 'socket.io-client';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  messages: Array<{
    id: string;
    content: string;
    senderType: string;
    senderName: string;
    createdAt: string;
  }>;
}

interface Message {
  id: string;
  content: string;
  senderType: string;
  senderName: string;
  createdAt: string;
}

const messageSchema = z.object({
  content: z.string().min(1),
});
type MessageData = z.infer<typeof messageSchema>;

export default function ClientProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const socketRef = useRef<Socket | null>(null);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<MessageData>();

  useEffect(() => {
    const token = clientAuth.getToken();
    if (!token) {
      router.push('/client/login');
      return;
    }

    // Fetch project
    api.client.getProjects(token).then((projects) => {
      const project = projects.find((p) => p.id === id);
      if (project) {
        setProject(project);
        setMessages(project.messages || []);
      }
    });

    // Connect to socket
    const socket = io(undefined, {
      auth: { token },
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join:project', id);
    });

    socket.on('message:receive', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = (data: MessageData) => {
    if (!socketRef.current) return;

    socketRef.current.emit('message:send', {
      projectId: id,
      content: data.content,
    });

    reset();
  };

  if (!project) return <div className="text-neutral-500">Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">{project.title}</h1>
          <p className="text-neutral-600 mt-2">{project.description}</p>
        </div>
      </Card>

      <Card className="flex flex-col h-96">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Messages</h2>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-sm rounded-lg px-4 py-2 ${
                  msg.senderType === 'client' ? 'bg-primary-100 text-primary-900' : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                <div className="text-xs font-medium opacity-70 mb-1">{msg.senderName}</div>
                <p>{msg.content}</p>
                <div className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 py-4 border-t border-neutral-200">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <input
              {...register('content')}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button type="submit" variant="primary" disabled={isSubmitting || !isConnected}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Update backend to support client project queries**

Add this endpoint to `backend/src/routes/clients.ts`:

```typescript
router.get('/me/projects', authMiddleware, async (req, res, next) => {
  try {
    if ((req as any).userType !== 'client') {
      res.status(403).json({ error: 'Not a client' });
      return;
    }
    const projects = await prisma.project.findMany({
      where: { clientId: (req as any).userId },
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            senderType: true,
            senderName: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});
```

- [ ] **Step 8: Commit**

```bash
git add frontend/app/client/layout.tsx frontend/app/client/login/page.tsx frontend/app/client/dashboard/page.tsx frontend/app/client/projects/[id]/page.tsx frontend/src/lib/clientAuth.ts frontend/src/lib/api.ts backend/src/routes/clients.ts
git commit -m "feat(client-portal): add client login, dashboard, and real-time chat"
```

---

## Final Steps

### Task 11: Build and Deploy Testing

- [ ] **Step 1: Build frontend**

```bash
cd frontend
npm run build
```

Expected: Zero TypeScript errors, all routes generated

- [ ] **Step 2: Build backend**

```bash
cd backend
npm run build
npm run lint
```

Expected: TypeScript passes, no lint errors

- [ ] **Step 3: Test socket.io connection locally (optional)**

```bash
cd backend
npm run dev
# In another terminal
cd frontend
npm run dev
# Open http://localhost:3000/admin and log in
# Open http://localhost:3000/client and log in as a client with canLogin=true
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete client management + real-time chat system"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push
```

---

## Environment Variables Required

Add these to your `.env` file in backend and Coolify deployment:

```env
# Email Configuration (for password resets and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yoursite.com

# Frontend URL (for email links)
FRONTEND_URL=https://yourdomain.com

# Existing variables
JWT_SECRET=your-random-secret-string
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

---

## Testing Checklist

- ✅ Admin can create and manage clients
- ✅ Admin can create projects and assign to clients
- ✅ Admin can send password reset emails to clients
- ✅ Client can log in if `canLogin=true`
- ✅ Client can view assigned projects
- ✅ Real-time messaging works (admin ↔ client)
- ✅ Email notifications sent on new messages
- ✅ File uploads work (images, PDFs, etc.)
- ✅ Socket.io auto-reconnects on disconnect
- ✅ Frontend builds with no errors
- ✅ Backend builds and lints with no errors

