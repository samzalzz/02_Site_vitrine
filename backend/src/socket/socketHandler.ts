import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DecodedToken {
  id: string;
  type: string;
  name: string;
  email: string;
}

interface SocketData {
  userId: string;
  userType: 'admin' | 'client';
  userName: string;
  userEmail: string;
}

export function initializeSocket(httpServer: Server) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as DecodedToken;
      socket.data = {
        userId: decoded.id,
        userType: (decoded.type || 'admin') as 'admin' | 'client',
        userName: decoded.name,
        userEmail: decoded.email,
      } as SocketData;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const data = socket.data as SocketData;
    console.log(`User connected: ${data.userId} (${data.userType})`);

    // Room management - join project
    socket.on('join:project', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`${data.userId} joined project:${projectId}`);
    });

    // Room management - leave project
    socket.on('leave:project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`${data.userId} left project:${projectId}`);
    });

    // Message handling
    socket.on('message:send', async (messageData: { projectId: string; content: string }) => {
      const { projectId, content } = messageData;

      try {
        // Determine sender ID based on user type
        const adminId = data.userType === 'admin' ? data.userId : undefined;
        const clientId = data.userType === 'client' ? data.userId : undefined;

        const message = await prisma.message.create({
          data: {
            content,
            projectId,
            adminId,
            clientId,
            senderType: data.userType,
            senderName: data.userName,
          },
        });

        io.to(`project:${projectId}`).emit('message:receive', {
          id: message.id,
          content: message.content,
          senderType: message.senderType,
          senderName: message.senderName,
          createdAt: message.createdAt,
        });

        // TODO: Send email notification to other participants (Task 7)
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${data.userId}`);
    });
  });

  return io;
}
