'use client';
import { Button } from '@/components/Button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete: (row: T) => void;
}

export function DataTable<T extends { id: string }>({ columns, data, onEdit, onDelete }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-neutral-600">{col.header}</th>
            ))}
            <th className="px-4 py-3 text-right font-medium text-neutral-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {data.map(row => (
            <tr key={row.id} className="bg-white hover:bg-neutral-50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-neutral-700">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
              <td className="px-4 py-3 text-right">
                <div className="flex gap-2 justify-end">
                  {onEdit && <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>Edit</Button>}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(row)}
                    className="text-red-600 hover:bg-red-50">Delete</Button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-neutral-400">No records found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
