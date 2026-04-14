'use client';
import { Button } from '@/components/Button';

interface Props { message: string; onConfirm: () => void; onCancel: () => void; }

export function ConfirmDialog({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-neutral-800 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
