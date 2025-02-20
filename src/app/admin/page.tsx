'use client';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const sendInvite = useMutation(api.email.sendInviteEmail);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendInvite({
        email,
        inviteCode: user!.organizationId, // Using org ID as invite code
        organizationName: "Your Organization" // You might want to store this in user context
      });
      setMessage('Invite sent successfully!');
      setEmail('');
    } catch (error) {
      setMessage('Failed to send invite');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="max-w-md">
        <h2 className="text-xl mb-4">Invite New User</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md"
          >
            Send Invite
          </button>
        </form>
        {message && (
          <div className="mt-4 p-4 rounded-md bg-gray-100">
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 