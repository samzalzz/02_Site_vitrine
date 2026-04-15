'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    queryKey: ['admin', 'client-project', id],
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
