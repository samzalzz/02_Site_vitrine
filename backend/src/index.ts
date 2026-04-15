import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import projectRoutes from './routes/projects.js';
import experienceRoutes from './routes/experiences.js';
import skillRoutes from './routes/skills.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import clientAuthRoutes from './routes/clientAuth.js';
import clientRoutes from './routes/clients.js';
import clientProjectRoutes from './routes/clientProjects.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocket } from './socket/socketHandler.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/client-auth', clientAuthRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/client-projects', clientProjectRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Create HTTP server with Socket.io
const httpServer = http.createServer(app);
initializeSocket(httpServer);

// Start server
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
