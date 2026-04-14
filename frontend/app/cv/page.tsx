import { Suspense } from 'react';
import { ExperienceCard } from '@/components/ExperienceCard';
import { Card, CardBody } from '@/components/Card';
import { api } from '@/lib/api';

export const metadata = {
  title: 'CV | Portfolio',
  description: 'Professional experience and skills',
};

interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: string;
}

async function ExperienceSection() {
  try {
    const experiences = await api.experiences.getAll();

    // Sort by startDate descending (newest first)
    const sorted = [...experiences].sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    if (sorted.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-600">No experiences found yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {sorted.map((exp) => (
          <ExperienceCard
            key={exp.id}
            title={exp.title}
            company={exp.company}
            startDate={exp.startDate}
            endDate={exp.endDate}
            description={exp.description}
          />
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Unable to Load Experiences
        </h3>
        <p className="text-red-700 mb-4">
          {error instanceof Error ? error.message : 'Failed to fetch experiences'}
        </p>
        <p className="text-sm text-red-600">
          Please check back later or contact the administrator.
        </p>
      </div>
    );
  }
}

async function SkillsSection() {
  try {
    const skills = await api.skills.getAll();

    if (skills.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-600">No skills found yet.</p>
        </div>
      );
    }

    // Group skills by category
    const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
      const category = skill.category.toLowerCase();
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardBody>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 capitalize">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <span
                    key={skill.id}
                    className="inline-block px-3 py-2 rounded-full text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Unable to Load Skills
        </h3>
        <p className="text-red-700 mb-4">
          {error instanceof Error ? error.message : 'Failed to fetch skills'}
        </p>
        <p className="text-sm text-red-600">
          Please check back later or contact the administrator.
        </p>
      </div>
    );
  }
}

export default function CVPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            CV & Experience
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            A comprehensive overview of my professional experience, roles, and
            technical skills. Discover my journey in fullstack development and
            the technologies I've mastered along the way.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Experience Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Professional Experience
          </h2>
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-neutral-600">Loading experiences...</p>
              </div>
            </div>
          }>
            <ExperienceSection />
          </Suspense>
        </div>

        {/* Skills Section */}
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Skills & Technologies
          </h2>
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-neutral-600">Loading skills...</p>
              </div>
            </div>
          }>
            <SkillsSection />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
