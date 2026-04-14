'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterSchema, type NewsletterData } from '@/lib/validators';
import { api } from '@/lib/api';
import { Button } from './Button';
import { cn } from '@/lib/cn';

export function NewsletterForm() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
  });

  useEffect(() => {
    if (submitStatus !== 'idle') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const onSubmit = async (data: NewsletterData) => {
    try {
      await api.newsletter.subscribe(data.email);
      setSubmitStatus('success');
      setErrorMessage('');
      reset();
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to subscribe. Please try again.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="rounded-lg bg-green-50 p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-800 text-sm font-medium">Subscribed successfully!</p>
          </div>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="rounded-lg bg-red-50 p-3 border border-red-200">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-red-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Email Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            {...register('email')}
            type="email"
            className={cn(
              'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors text-sm',
              errors.email
                ? 'border-red-300 focus:ring-red-500'
                : 'border-neutral-300 focus:border-primary-500'
            )}
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="flex-shrink-0"
        >
          {isSubmitting ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </div>
    </form>
  );
}
