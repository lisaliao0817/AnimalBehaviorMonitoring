'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

const SpeciesPage = ({ params }: { params: { species: string } }) => {
  const router = useRouter();
  const { species } = params;

  // Mock data – in a real app, fetch from an API based on species
  const speciesData = {
    'capuchin-monkeys': [
      { id: '1', name: 'Janice', dateToCenter: '2014-08-11' },
      { id: '2', name: 'Jane', dateToCenter: '2020-09-30' },
      { id: '3', name: 'Jennie', dateToCenter: '2020-09-30' },
    ],
    'spider-monkeys': [
      { id: '1', name: 'Alex', dateToCenter: '2015-05-21' },
      { id: '2', name: 'Sam', dateToCenter: '2018-11-19' },
    ],
  } as Record<string, Array<{ id: string; name: string; dateToCenter: string }>>;

  const individuals = speciesData[species] || [];

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
        {/* Search and Action Button */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <input
              type="text"
              className="border border-gray-300 rounded-full px-4 py-2 mr-4"
              placeholder="Search for animals/behaviors/dates"
            />
            <button className="text-gray-500">🔍</button>
          </div>
          <Link href="/logbehavior">
            <button className="bg-black text-white px-6 py-2 rounded-lg">Log Behavior</button>
          </Link>
        </div>

        {/* Species Title */}
        <h1 className="text-2xl font-semibold mb-4">
          {species.replace('-', ' ').toUpperCase()}
        </h1>

        {/* Individual Animals Table */}
        <table className="min-w-full bg-white border border-gray-300 rounded-lg mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Date to the Center</th>
              <th className="text-left p-4">Profile</th>
            </tr>
          </thead>
          <tbody>
            {individuals.map((animal) => (
              <tr key={animal.id} className="border-b">
                <td className="p-4">{animal.name}</td>
                <td className="p-4">{animal.dateToCenter}</td>
                <td className="p-4">
                  <button
                    className="text-white bg-black px-4 py-2 rounded-lg"
                    onClick={() => router.push(`/species/${species}/${animal.id}`)}
                  >
                    See Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </ProtectedRoute>
  );
};

export default SpeciesPage;
