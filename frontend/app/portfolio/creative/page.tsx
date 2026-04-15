'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const projects = [
  {
    id: 1,
    title: 'Mindful Motion',
    description: 'An interactive meditation app with gesture-based interactions',
    tags: ['Design', 'Animation', 'React'],
    image: '/api/placeholder/400/300',
    color: 'from-lime-300 to-cyan-400',
  },
  {
    id: 2,
    title: 'Neon Dreams',
    description: 'Experimental audio-visual performance platform',
    tags: ['Sound Design', 'WebGL', 'Generative Art'],
    image: '/api/placeholder/400/300',
    color: 'from-pink-400 to-purple-500',
  },
  {
    id: 3,
    title: 'Organic Chaos',
    description: 'Data visualization with living, breathing aesthetics',
    tags: ['D3.js', 'Generative', 'Data Art'],
    image: '/api/placeholder/400/300',
    color: 'from-yellow-300 to-orange-400',
  },
  {
    id: 4,
    title: 'Chromatic Flow',
    description: 'Color theory exploration through interactive storytelling',
    tags: ['Interactive', 'Illustration', 'UX'],
    image: '/api/placeholder/400/300',
    color: 'from-teal-300 to-blue-500',
  },
];

export default function CreativePortfolio() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="bg-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-gradient-to-br from-lime-200 to-cyan-200 rounded-full blur-3xl"
          style={{
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transition: 'all 0.3s ease-out',
          }}
        />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-bl from-yellow-200 to-orange-200 rounded-full blur-3xl animation-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-cyan-500 to-purple-500">
            ✨ CREATIVE
          </Link>
          <div className="flex gap-8 font-bold text-sm">
            <Link href="/" className="text-gray-700 hover:text-lime-500 transition-colors">HOME</Link>
            <Link href="/portfolio/tech" className="text-gray-700 hover:text-lime-500 transition-colors">TECH</Link>
            <Link href="/portfolio/professional" className="text-gray-700 hover:text-lime-500 transition-colors">PRO</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="space-y-8">
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black leading-tight text-gray-900">
              WHERE DREAMS
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 via-cyan-400 to-purple-500 animate-pulse">
                COME ALIVE
              </span>
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-gray-700 max-w-xl text-lg leading-relaxed font-medium">
            Bold visions turned into interactive experiences. We craft digital art that moves hearts and minds.
          </p>
          <div className="pt-8 flex gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-lime-400 to-cyan-400 text-gray-900 font-black rounded-full hover:shadow-2xl hover:shadow-lime-300/50 transition-all transform hover:scale-105">
              EXPLORE NOW
            </button>
            <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-black rounded-full hover:bg-gray-900 hover:text-white transition-all">
              GET IN TOUCH
            </button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-20">
          Our Creative Universe
        </h2>

        <div className="space-y-12">
          {projects.map((project, i) => (
            <div
              key={project.id}
              style={{
                animation: `fadeInUp 0.8s ease-out forwards`,
                animationDelay: `${i * 150}ms`,
              }}
              className="group"
            >
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                {/* Image */}
                <div className="relative overflow-hidden rounded-3xl h-64 md:h-80">
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-30 mix-blend-multiply`}></div>
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-lime-500 group-hover:to-cyan-500 transition-all">
                      {project.title}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className={`px-4 py-2 font-bold text-sm rounded-full bg-gradient-to-r ${project.color} text-white shadow-lg`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Link */}
                  <Link
                    href={project.id.toString()}
                    className="inline-flex items-center gap-2 text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-cyan-500 hover:to-purple-500 transition-all group/link"
                  >
                    VIEW PROJECT
                    <span className="text-2xl group-hover/link:translate-x-2 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-300 via-cyan-300 to-purple-400 p-12 md:p-20">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Let's Create Magic Together
            </h2>
            <p className="text-gray-800 text-lg mb-8 max-w-xl">
              Every great project starts with a conversation. Tell us about your vision, and let's bring it to life.
            </p>
            <button className="px-10 py-4 bg-gray-900 text-white font-black rounded-full hover:shadow-2xl hover:shadow-gray-900/50 transition-all transform hover:scale-105">
              START YOUR PROJECT
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t-2 border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '80+', label: 'Projects Created' },
            { number: '45+', label: 'Happy Clients' },
            { number: '12', label: 'Design Awards' },
            { number: '∞', label: 'Creativity' },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-cyan-500">
                {stat.number}
              </p>
              <p className="text-gray-700 font-bold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { title: 'EXPLORE', links: ['Projects', 'Process', 'Team'] },
              { title: 'LEARN', links: ['Blog', 'Insights', 'Resources'] },
              { title: 'CONNECT', links: ['Instagram', 'Twitter', 'Dribbble'] },
              { title: 'CONTACT', links: ['Email', 'Form', 'Chat'] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-black text-gray-900 mb-4">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-gray-700 hover:text-lime-500 font-bold transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-gray-200 pt-8 flex justify-between items-center">
            <p className="text-gray-700 font-bold">&copy; 2026 CREATIVE STUDIO. DREAMS INCLUDED.</p>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-cyan-500 font-black">✨ MAGIC</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
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
