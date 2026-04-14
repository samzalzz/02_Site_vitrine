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

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type CreateData = z.infer<typeof createSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});
type PasswordData = z.infer<typeof passwordSchema>;

const COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  {
    key: 'createdAt',
    header: 'Created',
    render: (row: AdminUser) => new Date(row.createdAt).toLocaleDateString(),
  },
];

const inputCls = (err: boolean) =>
  cn(
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500',
    err ? 'border-red-300' : 'border-neutral-300'
  );

export default function UsersPage() {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [changePwdUser, setChangePwdUser] = useState<AdminUser | null>(null);
  const [apiError, setApiError] = useState('');

  const { data = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => api.admin.getUsers(),
  });

  const createForm = useForm<CreateData>({ resolver: zodResolver(createSchema) });
  const pwdForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const createM = useMutation({
    mutationFn: (d: CreateData) => api.admin.createUser(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreateForm(false);
      createForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => api.admin.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => setApiError(e.message),
  });

  const pwdM = useMutation({
    mutationFn: (d: PasswordData) =>
      api.admin.changePassword(changePwdUser!.id, d.currentPassword, d.newPassword),
    onSuccess: () => {
      setChangePwdUser(null);
      pwdForm.reset();
      setApiError('');
    },
    onError: (e: Error) => setApiError(e.message),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Users</h1>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setShowCreateForm(true);
            setApiError('');
          }}
        >
          Add User
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
            <h2 className="font-semibold text-neutral-900">New Admin User</h2>
          </div>
          <div className="px-6 py-4">
            <form
              onSubmit={createForm.handleSubmit((d) => createM.mutate(d))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                  <input
                    {...createForm.register('name')}
                    className={inputCls(!!createForm.formState.errors.name)}
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-xs text-red-600 mt-1">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                  <input
                    {...createForm.register('email')}
                    type="email"
                    className={inputCls(!!createForm.formState.errors.email)}
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-xs text-red-600 mt-1">
                      {createForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Password (minimum 8 characters)
                </label>
                <input
                  {...createForm.register('password')}
                  type="password"
                  className={inputCls(!!createForm.formState.errors.password)}
                />
                {createForm.formState.errors.password && (
                  <p className="text-xs text-red-600 mt-1">
                    {createForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={createForm.formState.isSubmitting}
                >
                  Create User
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

      {changePwdUser && (
        <Card className="mb-6">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Change Password — {changePwdUser.name}</h2>
          </div>
          <div className="px-6 py-4">
            <form
              onSubmit={pwdForm.handleSubmit((d) => pwdM.mutate(d))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Current Password
                </label>
                <input
                  {...pwdForm.register('currentPassword')}
                  type="password"
                  className={inputCls(!!pwdForm.formState.errors.currentPassword)}
                />
                {pwdForm.formState.errors.currentPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {pwdForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  New Password (minimum 8 characters)
                </label>
                <input
                  {...pwdForm.register('newPassword')}
                  type="password"
                  className={inputCls(!!pwdForm.formState.errors.newPassword)}
                />
                {pwdForm.formState.errors.newPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    {pwdForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={pwdForm.formState.isSubmitting}
                >
                  Change Password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setChangePwdUser(null);
                    pwdForm.reset();
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

      {isLoading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={data}
          onEdit={setChangePwdUser}
          onDelete={setDeleteTarget}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete admin user "${deleteTarget.name}" (${deleteTarget.email})? They will lose all access immediately.`}
          onConfirm={() => deleteM.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
