'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  status: string;
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
  attachments: Array<{
    id: string;
    fileName: string;
    originalName: string;
    fileUrl: string;
  }>;
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
  const [socketError, setSocketError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm<MessageData>({
    resolver: zodResolver(messageSchema),
  });

  useEffect(() => {
    const token = clientAuth.getToken();
    if (!token) {
      router.push('/client/login');
      return;
    }

    // Validate project ID format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      router.push('/client/dashboard');
      return;
    }

    // Fetch project
    api.client.getProjectById(token, id).then((project) => {
      setProject(project);
      setMessages(project.messages || []);
    }).catch(() => {
      router.push('/client/dashboard');
    });

    // Connect to socket
    const socket = io(undefined, {
      auth: { token },
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setSocketError(null);
      socket.emit('join:project', id);
    });

    socket.on('message:receive', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('error', (error: any) => {
      setSocketError(`Socket error: ${error.message || 'Unknown error'}`);
      setIsConnected(false);
    });

    socket.on('message:error', (error: any) => {
      setSocketError(`Message error: ${error.message || 'Failed to send message'}`);
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
    }, (response: any) => {
      if (response?.success) {
        reset();
        setSocketError(null);
      } else {
        setSocketError(response?.error || 'Failed to send message');
      }
    });
  };

  if (!project) return <div className="text-neutral-500">Loading...</div>;

  // Validate file URL is from own domain
  const isValidFileUrl = (url: string): boolean => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      const apiUrl = new URL(apiBaseUrl);
      const fileUrl = new URL(url, apiUrl.origin);
      return fileUrl.hostname === apiUrl.hostname;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-neutral-900">{project.title}</h1>
            <span className="text-xs px-2 py-1 bg-neutral-100 rounded">{project.status}</span>
          </div>
          <p className="text-neutral-600 mt-2">{project.description}</p>
        </div>
      </Card>

      <Card className="flex flex-col h-96">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">Messages</h2>
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            role="status"
            aria-label={isConnected ? 'Connected' : 'Disconnected'}
          />
        </div>

        {socketError && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-700" role="alert">{socketError}</p>
          </div>
        )}

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
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((attachment) => {
                      // Skip rendering untrusted file URLs
                      if (!isValidFileUrl(attachment.fileUrl)) {
                        return null;
                      }
                      return (
                        <a
                          key={attachment.id}
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs underline opacity-70 hover:opacity-100"
                        >
                          📎 {attachment.originalName}
                        </a>
                      );
                    })}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-6 py-4 border-t border-neutral-200">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
            <div>
              <input
                {...register('content')}
                placeholder="Type a message..."
                aria-invalid={!!errors.content}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.content.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="primary" disabled={isSubmitting || !isConnected}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
