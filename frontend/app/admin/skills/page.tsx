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
  name: z.string().min(1, 'Required'),
  category: z.string().min(1, 'Required'),
  level: z.string().min(1, 'Required'),
  icon: z.string().optional(),
});
type FormData = z.infer<typeof schema>;
interface Skill { id: string; name: string; category: string; level: number; icon?: string; }

const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'category', header: 'Category' },
  { key: 'level', header: 'Level (1-5)' },
];

const inputCls = (err: boolean) => cn(
  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
  err ? 'border-red-300' : 'border-neutral-300'
);

export default function SkillsPage() {
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data = [], isLoading } = useQuery<Skill[]>({
    queryKey: ['admin', 'skills'],
    queryFn: () => api.admin.getAll('skills'),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };
  const mutOpts = { onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'skills'] }); closeForm(); } };
  const createM = useMutation({ mutationFn: (d: FormData) => api.admin.create('skills', { ...d, level: parseInt(d.level, 10) }), ...mutOpts });
  const updateM = useMutation({ mutationFn: (d: FormData) => api.admin.update('skills', editItem!.id, { ...d, level: parseInt(d.level, 10) }), ...mutOpts });
  const deleteM = useMutation({ mutationFn: (id: string) => api.admin.remove('skills', id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'skills'] }); setDeleteTarget(null); } });

  const handleEdit = (row: Skill) => {
    setEditItem(row); setShowForm(true);
    setValue('name', row.name);
    setValue('category', row.category);
    setValue('level', String(row.level));
    setValue('icon', row.icon ?? '');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Skills</h1>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(true); setEditItem(null); reset(); }}>Add Skill</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold">{editItem ? 'Edit Skill' : 'New Skill'}</h2></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit(d => editItem ? updateM.mutate(d) : createM.mutate(d))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input {...register('name')} className={inputCls(!!errors.name)} />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input {...register('category')} className={inputCls(!!errors.category)} />
                  {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Level (1-5)</label>
                  <input {...register('level')} type="number" min="1" max="5" className={inputCls(!!errors.level)} />
                  {errors.level && <p className="text-xs text-red-600 mt-1">{errors.level.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (optional)</label>
                  <input {...register('icon')} className={inputCls(!!errors.icon)} />
                </div>
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
        <ConfirmDialog message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
