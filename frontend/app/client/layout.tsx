'use client';
import { useRouter } from 'next/navigation';
import { clientAuth } from '@/lib/clientAuth';
import { Button } from '@/components/Button';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    clientAuth.removeToken();
    router.push('/client/login');
  };

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-neutral-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-700">
          <span className="font-bold text-lg">Client Portal</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="/client/dashboard" className="block px-3 py-2 rounded-md text-sm hover:bg-neutral-800">
            Dashboard
          </a>
        </nav>
        <div className="px-3 py-4 border-t border-neutral-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-left text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-neutral-50 p-8">{children}</main>
    </div>
  );
}
