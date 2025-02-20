'use client';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Home() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
          </h1>
          
          {/* Add your dashboard content here */}
          <div className="bg-white rounded-lg shadow p-6">
            <p>Welcome to your dashboard!</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
