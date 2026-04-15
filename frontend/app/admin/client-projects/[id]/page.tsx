'use client';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useForm as useFormHook } from 'react-hook-form';
import { z } from 'zod';
import { api } from '@/lib/api';
import { auth } from '@/lib/auth';
import { escapeHtml } from '@/lib/html';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { cn } from '@/lib/cn';
import io, { Socket } from 'socket.io-client';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  budget?: number;
  timeline?: string;
  status: string;
  clientId: string;
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
  content: z.string().min(1, 'Message cannot be empty').transform(s => s.trim()),
});
type MessageData = z.infer<typeof messageSchema>;

const editProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});
type EditProjectData = z.infer<typeof editProjectSchema>;

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState<string>('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [apiError, setApiError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageFormRef = useRef<{ reset: () => void } | null>(null);
  let nextTempId = 0;

  const { register, handleSubmit, reset, formState: { isSubmitting, errors: msgErrors } } = useForm<MessageData>({ mode: 'onBlur' });
  const editForm = useFormHook<EditProjectData>();

  const { data: project, isLoading } = useQuery<ProjectDetail>({
    queryKey: ['admin', 'client-project', id],
    queryFn: () => api.admin.getProjectById(id),
  });

  const updateProjectM = useMutation({
    mutationFn: (data: EditProjectData) => api.admin.updateProject(id, {
      title: data.title,
      description: data.description,
      status: data.status,
      budget: data.budget ? parseFloat(data.budget) : undefined,
      timeline: data.timeline,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'client-project', id] });
      setShowEditForm(false);
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  useEffect(() => {
    if (project) {
      setMessages(project.messages);
      editForm.reset({
        title: project.title,
        description: project.description,
        status: project.status as any,
        budget: project.budget?.toString() || '',
        timeline: project.timeline || '',
      });
    }
  }, [project, editForm]);

  useEffect(() => {
    const token = auth.getToken();
    if (!token) return;

    const socket = io(undefined, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Connected to socket');
      setIsConnected(true);
      setSocketError('');
      socket.emit('join:project', id);
    });

    socket.on('message:receive', (message: Message) => {
      setMessages((prev) => {
        const idx = prev.findIndex(m => m.id.startsWith('temp-'));
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = message;
          return updated;
        }
        return [...prev, message];
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      setSocketError('Connection failed. Please refresh the page.');
    });

    socket.on('message:error', (data: any) => {
      console.error('Message error:', data);
      setSocketError(data.message || 'Failed to send message');
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
    if (!socketRef.current || !isConnected) return;

    const tempId = `temp-${++nextTempId}-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: data.content,
      senderType: 'admin',
      senderName: 'You',
      createdAt: new Date().toISOString(),
      attachments: [],
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setSocketError('');

    socketRef.current.emit('message:send', {
      projectId: id,
      content: data.content,
    });

    reset();
  };

  if (isLoading) return <div className="text-neutral-500">Loading...</div>;
  if (!project) return <div className="text-red-600">Project not found</div>;

  const inputCls = (err: boolean) =>
    cn(
      'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
      err ? 'border-red-300' : 'border-neutral-300'
    );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{project.title}</h1>
            <p className="text-sm text-neutral-600 mt-2">Client: {project.client.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowEditForm(!showEditForm)}>
            {showEditForm ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {apiError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {apiError}
          </div>
        )}

        {showEditForm ? (
          <div className="px-6 py-4 space-y-4 border-b border-neutral-200">
            <form onSubmit={editForm.handleSubmit((d) => updateProjectM.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                <input {...editForm.register('title')} className={inputCls(!!editForm.formState.errors.title)} />
                {editForm.formState.errors.title && (
                  <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea {...editForm.register('description')} rows={3} className={inputCls(!!editForm.formState.errors.description)} />
                {editForm.formState.errors.description && (
                  <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.description.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select {...editForm.register('status')} className={inputCls(!!editForm.formState.errors.status)}>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                  {editForm.formState.errors.status && (
                    <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.status.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Budget</label>
                  <input type="number" {...editForm.register('budget')} className={inputCls(!!editForm.formState.errors.budget)} />
                  {editForm.formState.errors.budget && (
                    <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.budget.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Timeline</label>
                <input {...editForm.register('timeline')} className={inputCls(!!editForm.formState.errors.timeline)} />
                {editForm.formState.errors.timeline && (
                  <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.timeline.message}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={editForm.formState.isSubmitting || updateProjectM.isPending}>
                  Save
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowEditForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
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
        )}
      </Card>

      <Card className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-neutral-900">Messages</h2>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-neutral-600">{isConnected ? 'Connected' : 'Connecting...'}</span>
          </div>
        </div>

        {!isConnected && (
          <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
            <p className="text-sm text-yellow-800">Connecting to messaging service...</p>
          </div>
        )}

        {socketError && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-700">{socketError}</p>
          </div>
        )}

        <div className="px-6 py-4 flex-1 overflow-y-auto max-h-96 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-neutral-400 py-8">
              <p className="text-sm">No messages yet</p>
            </div>
          )}
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
                } ${msg.id.startsWith('temp-') ? 'opacity-60' : ''}`}
              >
                <div className="text-xs font-medium text-opacity-70 mb-1">{msg.senderName}</div>
                <p className="break-words">{msg.content}</p>
                {msg.attachments?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline block hover:no-underline"
                        title={escapeHtml(att.originalName)}
                      >
                        📎 {escapeHtml(att.originalName)}
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
          {msgErrors.content && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {msgErrors.content.message}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <input
              {...register('content')}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50 disabled:text-neutral-400"
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
