import Link from "next/link";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";

export const metadata = {
  title: "Home | Portfolio",
  description: "Welcome to my professional portfolio. Explore my projects and expertise in fullstack development.",
};

export default function Home() {
  const expertiseItems = [
    {
      emoji: "⚛️",
      title: "Frontend Development",
      description: "Building beautiful, responsive user interfaces with React, Next.js, and modern CSS frameworks like Tailwind CSS.",
    },
    {
      emoji: "🔧",
      title: "Backend Development",
      description: "Creating robust APIs and server-side applications with Node.js, Express, and databases like PostgreSQL and MongoDB.",
    },
    {
      emoji: "🚀",
      title: "DevOps & Deployment",
      description: "Deploying applications to production with Docker, CI/CD pipelines, and cloud platforms like Vercel and AWS.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl mb-6">
            Fullstack Developer
          </h1>
          <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
            I craft beautiful, functional web experiences using modern technologies. Specialized in fullstack development with a passion for clean code and great user experiences.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/projects">
              <Button variant="primary" size="lg">
                View Projects
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-neutral-900 mb-12">
            Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {expertiseItems.map((item, index) => (
              <Card key={index}>
                <CardBody className="text-center">
                  <div className="text-5xl mb-4">{item.emoji}</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 px-4 py-16 sm:px-6 lg:px-8 md:py-24">
        <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 md:p-16 text-center shadow-lg">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Let's Work Together
          </h2>
          <p className="text-neutral-600 mb-8 text-lg">
            Have a project in mind? I'd love to help bring your ideas to life. Let's start building something amazing together.
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="lg">
              Start a Project
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
