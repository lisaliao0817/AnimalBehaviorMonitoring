'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import React from 'react';
import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

const LogBehavior = () => {
    const createBehavior = useMutation(api.test.createBehavior);
    const [formData, setFormData] = useState({
        animal: '',
        behavior: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await createBehavior({
                ...formData,
                createdAt: new Date().toISOString(),
            });
            // Clear form after successful submission
            setFormData({
                animal: '',
                behavior: '',
                description: ''
            });
        } catch (error) {
            console.error('Error submitting behavior:', error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-lavender-100 p-6">
        <h1 className="text-lg font-bold mb-10">Xinyi - XXX Rescue Center</h1>
        <nav className="space-y-6">
          <Link href="/" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">🏠</span>
            Dashboard
          </Link>
          <Link href="/species" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">🐾</span>
            Species
          </Link>
          <Link href="#" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">📊</span>
            Analytics
          </Link>
          <Link href="#" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">🗑️</span>
            Archive
          </Link>
          <Link href="#" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">⚙️</span>
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-10">
        {/* Search Bar and Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Log Behavior</h1>
        </div>

        {/* Log Behavior Form */}
        <div className="max-w-lg mx-auto border-2 border-purple-300 p-6 rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date and Time</label>
              <input
                type="text"
                placeholder="Automated value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Who</label>
              <select
                value={formData.animal}
                onChange={handleChange}
                name="animal"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                required
              >
                <option value="">Select an individual</option>
                <option value="John">John</option>
                <option value="Jane">Jane</option>
                <option value="Jennie">Jennie</option>
                {/* Add more options as needed */}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Behavior</label>
              <select
                value={formData.behavior}
                onChange={handleChange}
                name="behavior"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                required
              >
                <option value="">Select behavior</option>
                <option value="Aggression">Aggression</option>
                <option value="Climbing">Climbing</option>
                <option value="Socializing">Socializing</option>
                {/* Add more behaviors as needed */}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={handleChange}
                name="description"
                placeholder="Value"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700"
                rows={4}
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-semibold py-2 rounded-lg"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default LogBehavior;
