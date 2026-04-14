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
  company: z.string().min(1, 'Required'),
  position: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().min(1, 'Required'),
  technologies: z.string().min(1, 'Comma-separated list required'),
});
type FormData = z.infer<typeof schema>;
interface Experience { id: string; company: string; position: string; startDate: string; endDate?: string; current: boolean; description: string; technologies: string | string[]; }

const COLUMNS = [
  { key: 'company', header: 'Company' },
  { key: 'position', header: 'Position' },
  { key: 'startDate', header: 'Start Date' },
  { key: 'current', header: 'Current', render: (r: Experience) => r.current ? 'Yes' : 'No' },
];

const inputCls = (err: boolean) => cn(
  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
  err ? 'border-red-300' : 'border-neutral-300'
);

export default function ExperiencesPage() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Experience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data = [], isLoading } = useQuery<Experience[]>({
    queryKey: ['admin', 'experiences'],
    queryFn: () => api.admin.getAll('experiences'),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { current: false } });

  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };
  const mutOpts = { onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'experiences'] }); closeForm(); } };
  const createM = useMutation({ mutationFn: (d: FormData) => api.admin.create('experiences', { ...d, technologies: d.technologies.split(',').map(t => t.trim()) }), ...mutOpts });
  const updateM = useMutation({ mutationFn: (d: FormData) => api.admin.update('experiences', editItem!.id, { ...d, technologies: d.technologies.split(',').map(t => t.trim()) }), ...mutOpts });
  const deleteM = useMutation({ mutationFn: (id: string) => api.admin.remove('experiences', id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'experiences'] }); setDeleteTarget(null); } });

  const handleEdit = (row: Experience) => {
    setEditItem(row); setShowForm(true);
    setValue('company', row.company);
    setValue('position', row.position);
    setValue('startDate', row.startDate);
    setValue('endDate', row.endDate ?? '');
    setValue('current', row.current);
    setValue('description', row.description);
    setValue('technologies', Array.isArray(row.technologies) ? row.technologies.join(', ') : row.technologies);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Experiences</h1>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditItem(null); reset(); }}>Add Experience</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold">{editItem ? 'Edit Experience' : 'New Experience'}</h2></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(d => editItem ? updateM.mutate(d) : createM.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input {...register('company')} className={inputCls(!!errors.company)} />
                  {errors.company && <p className="text-xs text-red-600 mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position</label>
                  <input {...register('position')} className={inputCls(!!errors.position)} />
                  {errors.position && <p className="text-xs text-red-600 mt-1">{errors.position.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input {...register('startDate')} type="date" className={inputCls(!!errors.startDate)} />
                  {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input {...register('endDate')} type="date" className={inputCls(!!errors.endDate)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea {...register('description')} rows={3} className={inputCls(!!errors.description)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Technologies (comma-separated)</label>
                <input {...register('technologies')} className={inputCls(!!errors.technologies)} />
                {errors.technologies && <p className="text-xs text-red-600 mt-1">{errors.technologies.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input {...register('current')} type="checkbox" id="current" className="rounded" />
                <label htmlFor="current" className="text-sm">Currently working here</label>
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
        <ConfirmDialog message={`Delete experience at "${deleteTarget.company}"? This cannot be undone.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
