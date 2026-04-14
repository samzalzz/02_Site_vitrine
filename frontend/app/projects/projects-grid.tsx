'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { api } from '@/lib/api';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  images?: string[];
  deployedUrl?: string;
  githubUrl?: string;
}

export default function ProjectsGrid() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.projects.getAll();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load projects. Please try again later.'
        );
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-neutral-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Unable to Load Projects
        </h3>
        <p className="text-red-700 mb-4">{error}</p>
        <p className="text-sm text-red-600">
          Please check back later or contact the administrator.
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          No Projects Yet
        </h3>
        <p className="text-neutral-600">
          Projects will be displayed here soon. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          title={project.title}
          description={project.description}
          technologies={project.technologies}
          images={project.images}
          deployedUrl={project.deployedUrl}
          githubUrl={project.githubUrl}
        />
      ))}
    </div>
  );
}
