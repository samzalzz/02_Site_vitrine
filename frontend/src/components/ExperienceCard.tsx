import React from 'react';
import { Card, CardBody } from './Card';
import { cn } from '@/lib/cn';

interface ExperienceCardProps {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies?: string[];
}

export function ExperienceCard({
  title,
  company,
  startDate,
  endDate,
  description,
  technologies = [],
}: ExperienceCardProps) {
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return date;
    }
  };

  const startFormatted = formatDate(startDate);
  const endFormatted = endDate ? formatDate(endDate) : 'Present';
  const dateRange = `${startFormatted} – ${endFormatted}`;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardBody className="flex flex-col gap-4">
        {/* Title and Date on same line */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral-900">
              {title}
            </h3>
            <p className="text-primary-600 font-medium">
              {company}
            </p>
          </div>
          <span className="text-sm text-neutral-500 whitespace-nowrap">
            {dateRange}
          </span>
        </div>

        {/* Description */}
        <p className="text-neutral-600 text-sm leading-relaxed">
          {description}
        </p>

        {/* Technologies */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className={cn(
                  'inline-block px-3 py-1 rounded-full text-xs font-medium',
                  'bg-neutral-100 text-neutral-700 border border-neutral-200'
                )}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
