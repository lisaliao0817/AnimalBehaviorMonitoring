'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (!user) return null; // Don't render sidebar if user is not logged in

  return (
    <aside className="w-64 bg-lavender-100 p-6 flex flex-col h-screen">
      <div>
        <h1 className="text-lg font-bold mb-10">Animal Behavior Monitoring</h1>
        <nav className="space-y-6">
          <Link 
            href="/" 
            className={`block p-2 rounded-lg font-medium ${
              isActive('/') ? 'bg-lavender-200' : 'hover:bg-lavender-200'
            }`}
          >
            <span className="mr-2">🏠</span>
            Dashboard
          </Link>
          <Link 
            href="/species" 
            className={`block p-2 rounded-lg font-medium ${
              isActive('/species') ? 'bg-lavender-200' : 'hover:bg-lavender-200'
            }`}
          >
            <span className="mr-2">🐾</span>
            Species
          </Link>
          <Link 
            href="#" 
            className={`block p-2 rounded-lg font-medium ${
              isActive('/analytics') ? 'bg-lavender-200' : 'hover:bg-lavender-200'
            }`}
          >
            <span className="mr-2">📊</span>
            Analytics
          </Link>
          
          {user.role === 'admin' && (
            <Link 
              href="/admin/add-users" 
              className={`block p-2 rounded-lg font-medium ${
                isActive('/admin/add-users') ? 'bg-lavender-200' : 'hover:bg-lavender-200'
              }`}
            >
              <span className="mr-2">👥</span>
              Add Users
            </Link>
          )}

          <Link 
            href="#" 
            className={`block p-2 rounded-lg font-medium ${
              isActive('/settings') ? 'bg-lavender-200' : 'hover:bg-lavender-200'
            }`}
          >
            <span className="mr-2">⚙️</span>
            Settings
          </Link>
        </nav>
      </div>

      {/* User info and logout section */}
      <div className="mt-auto pt-6 border-t border-lavender-200">
        <div className="mb-4">
          <p className="text-sm font-medium">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center p-2 rounded-lg font-medium text-red-600 hover:bg-red-50"
        >
          <span className="mr-2">🚪</span>
          Log Out
        </button>
      </div>
    </aside>
  );
} 