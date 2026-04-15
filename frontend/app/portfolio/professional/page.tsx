'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const projects = [
  {
    id: 1,
    title: 'Global Finance Platform',
    description: 'Enterprise-grade financial management system serving Fortune 500 clients worldwide',
    category: 'Financial Services',
    image: '/api/placeholder/600/400',
    year: '2025',
  },
  {
    id: 2,
    title: 'Healthcare Integration Suite',
    description: 'HIPAA-compliant platform connecting 200+ healthcare providers',
    category: 'Healthcare',
    image: '/api/placeholder/600/400',
    year: '2024',
  },
  {
    id: 3,
    title: 'Logistics Management System',
    description: 'Real-time supply chain optimization serving global enterprises',
    category: 'Logistics',
    image: '/api/placeholder/600/400',
    year: '2024',
  },
];

export default function ProfessionalPortfolio() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
          <Link href="/" className="text-2xl font-light tracking-wider text-gray-900">
            PORTFOLIO
          </Link>
          <div className="flex gap-12 text-sm font-light tracking-wide">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">HOME</Link>
            <Link href="/portfolio/tech" className="text-gray-600 hover:text-gray-900 transition-colors">TECH</Link>
            <Link href="/portfolio/creative" className="text-gray-600 hover:text-gray-900 transition-colors">CREATIVE</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 md:py-32">
        <div className="space-y-12">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-light tracking-tight leading-tight text-gray-900">
              Enterprise<br />Solutions<br />Refined
            </h1>
            <div className="w-16 h-px bg-gray-300"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <p className="text-gray-600 font-light leading-relaxed max-w-xs">
              Sophisticated technology serving discerning enterprises. We build scalable systems with precision, elegance, and unwavering reliability.
            </p>
            <div className="flex flex-col justify-end gap-6">
              <button className="w-fit px-8 py-3 border border-gray-900 text-gray-900 font-light tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
                View Work
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-y border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <p className="text-3xl font-light text-gray-900">120+</p>
            <p className="text-sm font-light text-gray-600 tracking-wide">ENTERPRISE CLIENTS</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-light text-gray-900">15+</p>
            <p className="text-sm font-light text-gray-600 tracking-wide">YEARS ESTABLISHED</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-light text-gray-900">$2B+</p>
            <p className="text-sm font-light text-gray-600 tracking-wide">MANAGED ASSETS</p>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-light text-gray-900">99.99%</p>
            <p className="text-sm font-light text-gray-600 tracking-wide">UPTIME GUARANTEE</p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-20">
          Featured Engagements
        </h2>

        <div className="space-y-20">
          {projects.map((project, i) => (
            <div
              key={project.id}
              style={{
                animation: `fadeIn 0.8s ease-out forwards`,
                animationDelay: `${i * 200}ms`,
              }}
              className="border-t border-gray-200 pt-12 group"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Content */}
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-sm font-light text-gray-500 tracking-widest uppercase">
                      {project.category}
                    </p>
                    <h3 className="text-3xl md:text-4xl font-light tracking-tight text-gray-900 group-hover:text-gray-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 font-light leading-relaxed max-w-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-8 text-sm">
                    <div className="space-y-1">
                      <p className="text-gray-500 font-light">Year Completed</p>
                      <p className="text-gray-900 font-light text-lg">{project.year}</p>
                    </div>
                    <div className="w-px h-12 bg-gray-200"></div>
                    <Link
                      href="#"
                      className="text-gray-600 hover:text-gray-900 font-light transition-colors group/link"
                    >
                      <span className="flex items-center gap-2">
                        View Case Study
                        <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Image */}
                <div className="relative overflow-hidden bg-gray-100 aspect-video group-hover:bg-gray-200 transition-colors">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <h2 className="text-4xl font-light tracking-tight text-gray-900 mb-16">
            Our Capabilities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Strategy & Consulting',
                description: 'Digital transformation roadmaps aligned with enterprise objectives',
              },
              {
                title: 'System Architecture',
                description: 'Scalable, resilient systems designed for enterprise scale',
              },
              {
                title: 'Implementation & Support',
                description: 'Expert deployment and 24/7 dedicated support teams',
              },
              {
                title: 'Security & Compliance',
                description: 'HIPAA, SOC2, GDPR compliant solutions with certifications',
              },
              {
                title: 'Integration Services',
                description: 'Seamless integration with existing enterprise systems',
              },
              {
                title: 'Training & Change Mgmt',
                description: 'Comprehensive training programs and change management support',
              },
            ].map((service, i) => (
              <div
                key={i}
                style={{
                  animation: `slideInUp 0.6s ease-out forwards`,
                  animationDelay: `${i * 100}ms`,
                }}
                className="space-y-4 hover:bg-white p-6 rounded-lg transition-colors"
              >
                <h3 className="text-lg font-light tracking-tight text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="border border-gray-200 rounded-lg p-12 md:p-20 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-gray-900">
            Ready to Transform Your Enterprise?
          </h2>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Let's discuss how our solutions can drive measurable business value and operational excellence for your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors">
              Schedule Consultation
            </button>
            <button className="px-8 py-3 border border-gray-900 text-gray-900 font-light tracking-wide hover:bg-gray-50 transition-colors">
              Request Proposal
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            {[
              { title: 'Company', links: ['About', 'Team', 'Careers'] },
              { title: 'Services', links: ['Consulting', 'Development', 'Support'] },
              { title: 'Resources', links: ['Blog', 'Case Studies', 'Whitepapers'] },
              { title: 'Contact', links: ['Sales', 'Support', 'Partnerships'] },
            ].map((col, i) => (
              <div key={i} className="space-y-4">
                <h3 className="text-sm font-light tracking-widest uppercase text-gray-900">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-sm font-light text-gray-600 hover:text-gray-900 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <p className="text-sm font-light text-gray-600">
              &copy; 2026 Enterprise Solutions. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-light text-gray-600">
              <Link href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-900 transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
