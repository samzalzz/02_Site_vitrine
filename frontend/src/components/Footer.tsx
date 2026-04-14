import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'CV', href: '/cv' },
    { label: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { label: 'GitHub', href: '#', icon: 'GitHub' },
    { label: 'LinkedIn', href: '#', icon: 'LinkedIn' },
    { label: 'Twitter', href: '#', icon: 'Twitter' },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-4">About</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              A passionate developer building beautiful and functional web experiences.
              Specialized in modern frontend technologies and responsive design.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Section */}
          <div>
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Social</h3>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-primary-600 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-200 pt-8">
          <p className="text-center text-neutral-600 text-sm">
            &copy; {currentYear} Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
