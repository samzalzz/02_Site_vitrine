import { Suspense } from 'react';
import ProjectsGrid from './projects-grid';

export const metadata = {
  title: 'Projects | Portfolio',
  description: 'View my professional projects and case studies',
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            My Projects
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl">
            Explore my recent projects showcasing my skills in web development,
            design, and problem-solving. Each project demonstrates my ability to
            build scalable and user-friendly applications.
          </p>
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-neutral-600">Loading projects...</p>
            </div>
          </div>
        }>
          <ProjectsGrid />
        </Suspense>
      </section>
    </main>
  );
}
