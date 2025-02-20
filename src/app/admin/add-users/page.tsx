'use client';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Id } from '@/convex/_generated/dataModel';

export default function AddUsers() {
  const { user } = useAuth();
  const sendInvite = useAction(api.email.sendInviteEmail);
  const orgInfo = useQuery(api.auth.getOrganizationInfo, 
    user?.organizationId ? { organizationId: user.organizationId as Id<"organizations"> } : "skip"
  );
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (!orgInfo) throw new Error("Organization info not found");

      await sendInvite({
        email,
        inviteCode: orgInfo.inviteCode,
        organizationName: orgInfo.name
      });
      
      setMessage('Invite sent successfully!');
      setEmail('');
    } catch (error) {
      setMessage('Failed to send invite');
      console.error('Error sending invite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Add Users</h1>
        
        <div className="max-w-md">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter email address"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-black text-white py-2 px-4 rounded-md ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Invite'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-md ${
              message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 