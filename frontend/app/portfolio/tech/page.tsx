'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const projects = [
  {
    id: 1,
    title: 'Neural Network Dashboard',
    description: 'Real-time ML pipeline visualization with WebSocket integration',
    tags: ['Python', 'React', 'WebSocket', 'TensorFlow'],
    image: '/api/placeholder/400/300',
    link: '#',
  },
  {
    id: 2,
    title: 'Quantum Simulator Interface',
    description: 'Interactive quantum computing simulation platform',
    tags: ['TypeScript', 'WebGL', 'Node.js', 'Quantum.js'],
    image: '/api/placeholder/400/300',
    link: '#',
  },
  {
    id: 3,
    title: 'Distributed Cache System',
    description: 'High-performance caching layer with distributed consensus',
    tags: ['Go', 'Rust', 'Redis', 'gRPC'],
    image: '/api/placeholder/400/300',
    link: '#',
  },
  {
    id: 4,
    title: 'Blockchain Explorer',
    description: 'Ethereum transaction visualization and analytics engine',
    tags: ['Solidity', 'Web3.js', 'GraphQL', 'React'],
    image: '/api/placeholder/400/300',
    link: '#',
  },
];

export default function TechPortfolio() {
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setGlitchActive(Math.random() > 0.95);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 255, 0.05) 25%, rgba(0, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 255, 0.05) 75%, rgba(0, 255, 255, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-900/30 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="text-xl font-mono font-bold text-cyan-400">
            &lt;/TECH&gt;
          </Link>
          <div className="flex gap-8 font-mono text-sm">
            <Link href="/" className="text-gray-400 hover:text-cyan-400 transition-colors">HOME</Link>
            <Link href="/portfolio/creative" className="text-gray-400 hover:text-cyan-400 transition-colors">CREATIVE</Link>
            <Link href="/portfolio/professional" className="text-gray-400 hover:text-cyan-400 transition-colors">PRO</Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className={`text-5xl md:text-7xl font-mono font-bold leading-tight ${glitchActive ? 'text-pink-500' : 'text-cyan-400'} transition-colors duration-75`}>
              CUTTING EDGE<br />TECHNOLOGY
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
          </div>
          <p className="text-gray-400 max-w-xl font-mono text-sm leading-relaxed">
            &gt; Exploring the boundaries of modern development. From distributed systems to quantum computing interfaces.
            Advanced solutions for complex problems.
          </p>
          <div className="pt-8 flex gap-4">
            <button className="px-8 py-3 bg-cyan-500 text-black font-mono font-bold hover:bg-cyan-400 transition-colors">
              EXPLORE
            </button>
            <button className="px-8 py-3 border border-cyan-500 text-cyan-400 font-mono font-bold hover:bg-cyan-500/10 transition-colors">
              LEARN MORE
            </button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-cyan-900/30">
        <h2 className="text-3xl md:text-4xl font-mono font-bold text-cyan-400 mb-4">
          FEATURED_PROJECTS
        </h2>
        <p className="text-gray-500 font-mono text-sm mb-16">
          // Latest innovations and technical achievements
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <div
              key={project.id}
              style={{
                animation: `slideIn 0.6s ease-out forwards`,
                animationDelay: `${i * 100}ms`,
              }}
              className="group"
            >
              <div className="relative overflow-hidden border border-cyan-900/50 hover:border-cyan-400/50 transition-colors duration-300 bg-gradient-to-br from-cyan-900/10 to-purple-900/10">
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden bg-black/50">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-cyan-400 font-mono font-bold text-lg mb-2 group-hover:text-pink-500 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs font-mono bg-cyan-900/30 text-cyan-300 border border-cyan-700/50 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Link */}
                  <Link
                    href={project.link}
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-pink-500 font-mono font-bold text-sm transition-colors pt-4"
                  >
                    VIEW_PROJECT →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-cyan-900/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-mono font-bold text-cyan-400">
              READY TO BUILD THE FUTURE?
            </h2>
            <p className="text-gray-400 font-mono">
              Let's collaborate on your next innovation. From concept to deployment, we engineer solutions that push boundaries.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-mono font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
              START PROJECT
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cyan-900/20 border border-cyan-700/50 p-6 rounded">
              <p className="text-cyan-400 font-mono font-bold text-2xl">150+</p>
              <p className="text-gray-400 font-mono text-sm">Projects</p>
            </div>
            <div className="bg-purple-900/20 border border-purple-700/50 p-6 rounded">
              <p className="text-purple-400 font-mono font-bold text-2xl">50+</p>
              <p className="text-gray-400 font-mono text-sm">Clients</p>
            </div>
            <div className="bg-pink-900/20 border border-pink-700/50 p-6 rounded">
              <p className="text-pink-400 font-mono font-bold text-2xl">10+</p>
              <p className="text-gray-400 font-mono text-sm">Years</p>
            </div>
            <div className="bg-cyan-900/20 border border-cyan-700/50 p-6 rounded">
              <p className="text-cyan-400 font-mono font-bold text-2xl">∞</p>
              <p className="text-gray-400 font-mono text-sm">Innovation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cyan-900/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-cyan-400 font-mono font-bold mb-4">EXPLORE</h3>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Projects</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Services</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-mono font-bold mb-4">ABOUT</h3>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Team</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Process</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-mono font-bold mb-4">CONNECT</h3>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Twitter</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-400 font-mono font-bold mb-4">LEGAL</h3>
              <ul className="space-y-2 text-sm text-gray-400 font-mono">
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-cyan-400 transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-900/30 pt-8 flex justify-between items-center">
            <p className="text-gray-500 font-mono text-sm">&copy; 2026 TECH INNOVATIONS. ALL RIGHTS RESERVED.</p>
            <p className="text-cyan-400 font-mono text-sm">status: online ●</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideIn {
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
