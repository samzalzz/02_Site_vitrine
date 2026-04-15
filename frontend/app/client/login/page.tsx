'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clientAuth } from '@/lib/clientAuth';
import { Button } from '@/components/Button';
import { cn } from '@/lib/cn';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function ClientLoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    try {
      const { token } = await api.client.login(email, password);
      clientAuth.setToken(token);
      router.push('/client/dashboard');
    } catch {
      setError('password', { message: 'Invalid email or password' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-sm bg-white rounded-lg border border-neutral-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Client Portal</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.email ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input
              {...register('password')}
              id="password"
              type="password"
              aria-invalid={!!errors.password}
              className={cn(
                'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500',
                errors.password ? 'border-red-300' : 'border-neutral-300'
              )}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600" role="alert">{errors.password.message}</p>}
          </div>
          <Button type="submit" variant="primary" size="md" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
