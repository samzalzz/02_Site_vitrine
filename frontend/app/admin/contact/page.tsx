'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

interface ContactMessage { id: string; name: string; email: string; subject: string; createdAt?: string; }
const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'subject', header: 'Subject' },
  { key: 'createdAt', header: 'Date' },
];

export default function ContactPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const { data = [], isLoading } = useQuery<ContactMessage[]>({ queryKey: ['admin', 'contact'], queryFn: () => api.admin.getAll('contact') });
  const deleteM = useMutation({ mutationFn: (id: string) => api.admin.remove('contact', id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'contact'] }); setDeleteTarget(null); } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Contact Messages</h1>
      {isLoading ? <p className="text-neutral-500">Loading...</p> : <DataTable columns={COLUMNS} data={data} onDelete={setDeleteTarget} />}
      {deleteTarget && <ConfirmDialog message={`Delete message from "${deleteTarget.name}"?`} onConfirm={() => deleteM.mutate(deleteTarget.id)} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}
