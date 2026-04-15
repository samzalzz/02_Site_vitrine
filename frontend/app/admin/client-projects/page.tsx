'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
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
  budget: z.string().optional(),
  timeline: z.string().optional(),
  status: z.enum(['prospect', 'active', 'completed', 'on-hold']).optional(),
});

type CreateData = z.infer<typeof createSchema>;

const inputCls = (err: boolean) =>
  cn(
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
    err ? 'border-red-300' : 'border-neutral-300'
  );

export default function ClientProjectsPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [apiError, setApiError] = useState('');

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['admin', 'client-projects'],
    queryFn: () => api.admin.getProjects(),
  });

  const { data: clients = [] } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['admin', 'clients'],
    queryFn: () => api.admin.getClients(),
  });

  const createForm = useForm<CreateData>({ resolver: zodResolver(createSchema) });

  const createM = useMutation({
    mutationFn: (d: CreateData) => api.admin.createProject({
      ...d,
      budget: d.budget ? parseFloat(String(d.budget)) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'client-projects'] });
      setShowCreateForm(false);
      createForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.admin.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'client-projects'] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const ProjectRow = ({ project }: { project: Project }) => (
    <tr className="bg-white hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3 text-neutral-700">
        <Link href={`/admin/client-projects/${project.id}`} className="font-semibold text-primary-600 hover:underline">
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
        <h1 className="text-2xl font-bold text-neutral-900">Client Projects</h1>
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
            <h2 className="font-semibold text-neutral-900">New Client Project</h2>
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
