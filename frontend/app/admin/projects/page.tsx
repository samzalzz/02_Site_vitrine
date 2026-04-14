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
import { Card, CardHeader, CardBody } from '@/components/Card';
import { cn } from '@/lib/cn';

const schema = z.object({
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  technologies: z.string().min(1, 'Comma-separated list required'),
  deployedUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;
interface Project { id: string; title: string; description: string; technologies: string | string[]; deployedUrl?: string; githubUrl?: string; featured?: boolean; }

const COLUMNS = [
  { key: 'title', header: 'Title' },
  { key: 'technologies', header: 'Technologies', render: (r: Project) => Array.isArray(r.technologies) ? r.technologies.join(', ') : r.technologies },
  { key: 'featured', header: 'Featured', render: (r: Project) => r.featured ? 'Yes' : 'No' },
];

const inputCls = (err: boolean) => cn(
  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
  err ? 'border-red-300' : 'border-neutral-300'
);

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data = [], isLoading } = useQuery<Project[]>({
    queryKey: ['admin', 'projects'],
    queryFn: () => api.admin.getAll('projects'),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };
  const mutOpts = { onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'projects'] }); closeForm(); } };
  const createM = useMutation({ mutationFn: (d: FormData) => api.admin.create('projects', { ...d, technologies: d.technologies.split(',').map(t => t.trim()) }), ...mutOpts });
  const updateM = useMutation({ mutationFn: (d: FormData) => api.admin.update('projects', editItem!.id, { ...d, technologies: d.technologies.split(',').map(t => t.trim()) }), ...mutOpts });
  const deleteM = useMutation({ mutationFn: (id: string) => api.admin.remove('projects', id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'projects'] }); setDeleteTarget(null); } });

  const handleEdit = (row: Project) => {
    setEditItem(row); setShowForm(true);
    setValue('title', row.title);
    setValue('description', row.description);
    setValue('technologies', Array.isArray(row.technologies) ? row.technologies.join(', ') : row.technologies);
    setValue('featured', row.featured ?? false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditItem(null); reset(); }}>Add Project</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold">{editItem ? 'Edit Project' : 'New Project'}</h2></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(d => editItem ? updateM.mutate(d) : createM.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input {...register('title')} className={inputCls(!!errors.title)} />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                  <input {...register('technologies')} className={inputCls(!!errors.technologies)} />
                  {errors.technologies && <p className="text-xs text-red-600 mt-1">{errors.technologies.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea {...register('description')} rows={3} className={inputCls(!!errors.description)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deployed URL</label>
                  <input {...register('deployedUrl')} className={inputCls(!!errors.deployedUrl)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">GitHub URL</label>
                  <input {...register('githubUrl')} className={inputCls(!!errors.githubUrl)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input {...register('featured')} type="checkbox" id="featured" className="rounded" />
                <label htmlFor="featured" className="text-sm">Featured</label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>{editItem ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="ghost" size="sm" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {isLoading ? <p className="text-neutral-500">Loading...</p> : <DataTable columns={COLUMNS} data={data} onEdit={handleEdit} onDelete={setDeleteTarget} />}

      {deleteTarget && (
        <ConfirmDialog message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
