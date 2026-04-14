import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody } from './Card';
import { Button } from './Button';
import { cn } from '@/lib/cn';

interface ProjectCardProps {
  title: string;
  description: string;
  technologies: string[];
  images?: string[];
  deployedUrl?: string;
  githubUrl?: string;
}

export function ProjectCard({
  title,
  description,
  technologies,
  images,
  deployedUrl,
  githubUrl,
}: ProjectCardProps) {
  const primaryImage = images?.[0] || '/placeholder.jpg';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-64 bg-neutral-200 flex-shrink-0">
        <Image
          src={primaryImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <CardBody className="flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-neutral-600 text-sm mb-4 flex-grow">
          {description}
        </p>

        {/* Technologies */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className={cn(
                  'inline-block px-3 py-1 rounded-full text-xs font-medium',
                  'bg-primary-50 text-primary-700 border border-primary-200'
                )}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          {deployedUrl && (
            <Link href={deployedUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="primary" size="sm" className="w-full">
                Live Demo
              </Button>
            </Link>
          )}
          {githubUrl && (
            <Link href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                GitHub
              </Button>
            </Link>
          )}
          {!deployedUrl && !githubUrl && (
            <Button variant="ghost" size="sm" className="w-full" disabled>
              No Links Available
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
