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
import { Card } from '@/components/Card';
import { cn } from '@/lib/cn';

interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  status: string;
  canLogin: boolean;
  createdAt: string;
  _count: { projects: number };
}

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  canLogin: z.boolean().optional(),
});
type CreateData = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  status: z.string().optional(),
  canLogin: z.boolean().optional(),
});
type EditData = z.infer<typeof editSchema>;

const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'company', header: 'Company' },
  {
    key: '_count.projects',
    header: 'Projects',
    render: (row: Client) => row._count.projects,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row: Client) => (
      <span className={cn('px-2 py-1 text-xs font-medium rounded-full',
        row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      )}>
        {row.status}
      </span>
    ),
  },
  {
    key: 'canLogin',
    header: 'Portal Access',
    render: (row: Client) => (
      <span className={cn('px-2 py-1 text-xs font-medium rounded-full',
        row.canLogin ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
      )}>
        {row.canLogin ? 'Enabled' : 'Disabled'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created',
    render: (row: Client) => new Date(row.createdAt).toLocaleDateString(),
  },
];

const inputCls = (err: boolean) =>
  cn(
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
    err ? 'border-red-300' : 'border-neutral-300'
  );

export default function ClientsPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [apiError, setApiError] = useState('');

  const { data = [], isLoading } = useQuery<Client[]>({
    queryKey: ['admin', 'clients'],
    queryFn: () => api.admin.getClients(),
  });

  const createForm = useForm<CreateData>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditData>({ resolver: zodResolver(editSchema) });

  const createM = useMutation({
    mutationFn: (d: CreateData) => api.admin.createClient(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setShowCreateForm(false);
      createForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const updateM = useMutation({
    mutationFn: (d: EditData) => api.admin.updateClient(editingClient!.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setEditingClient(null);
      editForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.admin.deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'clients'] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const resetPwdM = useMutation({
    mutationFn: (clientId: string) => api.admin.sendPasswordReset(clientId),
    onSuccess: () => {
      setApiError('');
      alert('Password reset email sent successfully');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    editForm.reset({
      name: client.name,
      company: client.company,
      phone: client.phone,
      status: client.status,
      canLogin: client.canLogin,
    });
    setApiError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setShowCreateForm(true);
            setApiError('');
          }}
        >
          Add Client
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
            <h2 className="font-semibold text-neutral-900">New Client</h2>
          </div>
          <div className="px-6 py-4">
            <form
              onSubmit={createForm.handleSubmit((d) => createM.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                  <input
                    {...createForm.register('name')}
                    placeholder="John Doe"
                    className={inputCls(!!createForm.formState.errors.name)}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-xs text-red-600 mt-1">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
                  <input
                    {...createForm.register('email')}
                    type="email"
                    placeholder="john@example.com"
                    className={inputCls(!!createForm.formState.errors.email)}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Company</label>
                  <input
                    {...createForm.register('company')}
                    placeholder="Acme Inc."
                    className={inputCls(!!createForm.formState.errors.company)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    {...createForm.register('phone')}
                    placeholder="+1 (555) 000-0000"
                    className={inputCls(!!createForm.formState.errors.phone)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  {...createForm.register('canLogin')}
                  type="checkbox"
                  id="create-canLogin"
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="create-canLogin" className="text-sm font-medium text-neutral-700">
                  Enable portal access
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createForm.formState.isSubmitting}
                >
                  Create Client
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false);
                    createForm.reset();
                    setApiError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {editingClient && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Edit Client — {editingClient.name}</h2>
            <p className="text-xs text-neutral-500 mt-1">{editingClient.email}</p>
          </div>
          <div className="px-6 py-4">
            <form
              onSubmit={editForm.handleSubmit((d) => updateM.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <input
                    {...editForm.register('name')}
                    className={inputCls(!!editForm.formState.errors.name)}
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-xs text-red-600 mt-1">
                      {editForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select
                    {...editForm.register('status')}
                    className={inputCls(!!editForm.formState.errors.status)}
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Company</label>
                  <input
                    {...editForm.register('company')}
                    className={inputCls(!!editForm.formState.errors.company)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
                  <input
                    {...editForm.register('phone')}
                    className={inputCls(!!editForm.formState.errors.phone)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  {...editForm.register('canLogin')}
                  type="checkbox"
                  id="edit-canLogin"
                  className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="edit-canLogin" className="text-sm font-medium text-neutral-700">
                  Enable portal access
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={editForm.formState.isSubmitting}
                >
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingClient(null);
                    editForm.reset();
                    setApiError('');
                  }}
                >
                  Cancel
                </Button>
                {editingClient.canLogin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => resetPwdM.mutate(editingClient.id)}
                    disabled={resetPwdM.isPending}
                    className="ml-auto text-blue-600 hover:bg-blue-50"
                  >
                    Send Password Reset
                  </Button>
                )}
              </div>
            </form>
          </div>
        </Card>
      )}

      {isLoading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={data}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete client "${deleteTarget.name}" (${deleteTarget.email})? All associated projects will be affected.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
