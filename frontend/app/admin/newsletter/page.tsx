'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface NewsletterSubscriber { id: string; email: string; createdAt?: string; }
const COLUMNS = [
  { key: 'email', header: 'Email' },
  { key: 'createdAt', header: 'Subscribed Date' },
];

export default function NewsletterPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);
  const { data = [], isLoading } = useQuery<NewsletterSubscriber[]>({ queryKey: ['admin', 'newsletter'], queryFn: () => api.admin.getAll('newsletter') });
  const deleteM = useMutation({ mutationFn: (id: string) => api.admin.remove('newsletter', id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'newsletter'] }); setDeleteTarget(null); } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Newsletter Subscribers</h1>
      {isLoading ? <p className="text-neutral-500">Loading...</p> : <DataTable columns={COLUMNS} data={data} onDelete={setDeleteTarget} />}
      {deleteTarget && <ConfirmDialog message={`Unsubscribe "${deleteTarget.email}"?`} onConfirm={() => deleteM.mutate(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
