'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardBody } from '@/components/Card';

function StatCard({ label, count }: { label: string; count: number | undefined }) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-neutral-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-neutral-900">{count ?? '—'}</p>
      </CardBody>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: projects } = useQuery({ queryKey: ['admin', 'projects'], queryFn: () => api.admin.getAll('projects') });
  const { data: experiences } = useQuery({ queryKey: ['admin', 'experiences'], queryFn: () => api.admin.getAll('experiences') });
  const { data: skills } = useQuery({ queryKey: ['admin', 'skills'], queryFn: () => api.admin.getAll('skills') });
  const { data: contacts } = useQuery({ queryKey: ['admin', 'contact'], queryFn: () => api.admin.getAll('contact') });

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" count={(projects as unknown[])?.length} />
        <StatCard label="Experiences" count={(experiences as unknown[])?.length} />
        <StatCard label="Skills" count={(skills as unknown[])?.length} />
        <StatCard label="Contact Messages" count={(contacts as unknown[])?.length} />
      </div>
    </div>
  );
}
