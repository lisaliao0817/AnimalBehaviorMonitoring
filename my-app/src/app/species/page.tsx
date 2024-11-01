'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Species = () => {
  const router = useRouter();

  // Mock data for species
  const speciesData = [
    { id: 'capuchin-monkeys', name: 'Capuchin Monkeys' },
    { id: 'spider-monkeys', name: 'Spider Monkeys' },
  ];

  return (
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

        {/* Species Cards */}
        <div className="grid grid-cols-2 gap-6">
          {speciesData.map((species) => (
            <div
              key={species.id}
              className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col items-center cursor-pointer"
              onClick={() => router.push(`/species/${species.id}`)}
            >
              <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                {/* Placeholder for image */}
                <span>🖼️</span>
              </div>
              <h3 className="text-center font-medium">{species.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Species;
