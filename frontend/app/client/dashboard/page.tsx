'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientAuth } from '@/lib/clientAuth';
import { api } from '@/lib/api';
import { Card } from '@/components/Card';

interface ClientProject {
  id: string;
  title: string;
  description: string;
  status: string;
  messages: Array<{ id: string }>;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = clientAuth.getToken();
    if (!token) {
      router.push('/client/login');
      return;
    }

    api.client.getProjects(token).then(setProjects).catch(() => router.push('/client/login')).finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return <div className="text-neutral-500">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Your Projects</h1>
      {projects.length === 0 ? (
        <p className="text-neutral-600">No projects assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/client/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="px-6 py-4">
                  <h2 className="text-lg font-semibold text-neutral-900 mb-2">{project.title}</h2>
                  <p className="text-sm text-neutral-600 mb-3">{project.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-neutral-100 rounded">{project.status}</span>
                    <span className="text-xs text-neutral-500">{project.messages.length} messages</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
