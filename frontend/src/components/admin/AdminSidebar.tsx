'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experiences', label: 'Experiences' },
  { href: '/admin/skills', label: 'Skills' },
  { href: '/admin/contact', label: 'Contact' },
  { href: '/admin/newsletter', label: 'Newsletter' },
  { href: '/admin/users', label: 'Admin Users' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    auth.removeToken();
    router.push('/admin/login');
  };

  return (
    <aside className="w-56 min-h-screen bg-neutral-900 flex flex-col">
      <div className="px-6 py-5 border-b border-neutral-700">
        <span className="text-white font-bold text-lg">Admin</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label }) => (
          <Link key={href} href={href}
            className={cn(
              'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary-600 text-white'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            )}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-neutral-700">
        <button onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors text-left">
          Logout
        </button>
      </div>
    </aside>
  );
}
