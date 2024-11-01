'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const AnimalProfile = ({ params }: { params: { species: string; animalId: string } }) => {
  const router = useRouter();
  const { species, animalId } = params;

  // Mock data for individual animal profile
  const animalProfileData = {
    name: 'John',
    dateToCenter: '2014.8.11',
    sex: 'Male',
    height: '30 cm',
    heightDate: '2023.9.28',
    weight: '10 kg',
    weightDate: '2023.9.28',
  };

  const behaviorRecords = [
    { date: '10.2', time: '11:00 am', behavior: 'Climbing', description: 'Climbed a tree and ...', loggedBy: 'Tom' },
  ];

  const sicknessRecords = [
    { date: '10.2', illness: 'Diarrhea', description: 'Symptoms and recovery notes', loggedBy: 'Tom' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-lavender-100 p-6">
        <h1 className="text-lg font-bold mb-10">Xinyi - XXX Rescue Center</h1>
        <nav className="space-y-6">
          <a href="/" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">🏠</span>
            Dashboard
          </a>
          <a href="/species" className="block p-2 bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">🐾</span>
            Species
          </a>
          <a href="#" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">📊</span>
            Analytics
          </a>
          <a href="#" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">🗑️</span>
            Archive
          </a>
          <a href="#" className="block p-2 hover:bg-lavender-200 rounded-lg font-medium">
            <span className="mr-2">⚙️</span>
            Settings
          </a>
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
          <button className="bg-black text-white px-6 py-2 rounded-lg">Log Behavior</button>
        </div>

        {/* Animal Info Section */}
        <h1 className="text-2xl font-semibold mb-4">{species.replace('-', ' ').toUpperCase()} - {animalProfileData.name}</h1>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg mb-8">
          <thead>
            <tr>
              <th className="text-left p-4">Field</th>
              <th className="text-left p-4">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4">Name</td>
              <td className="p-4">{animalProfileData.name}</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Date to Center</td>
              <td className="p-4">{animalProfileData.dateToCenter}</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Sex</td>
              <td className="p-4">{animalProfileData.sex}</td>
            </tr>
            <tr className="border-b">
              <td className="p-4">Height</td>
              <td className="p-4">
                {animalProfileData.height} <span className="text-gray-500">({animalProfileData.heightDate})</span>
              </td>
            </tr>
            <tr>
              <td className="p-4">Weight</td>
              <td className="p-4">
                {animalProfileData.weight} <span className="text-gray-500">({animalProfileData.weightDate})</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Behavior Records Section */}
        <h2 className="text-xl font-semibold mb-2">Behavior Records</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg mb-8">
          <thead>
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Time</th>
              <th className="text-left p-4">Behavior</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Logged by</th>
            </tr>
          </thead>
          <tbody>
            {behaviorRecords.map((record, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{record.date}</td>
                <td className="p-4">{record.time}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">{record.behavior}</span>
                </td>
                <td className="p-4">{record.description}</td>
                <td className="p-4">{record.loggedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sickness Records Section */}
        <h2 className="text-xl font-semibold mb-2">Sickness Records</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Illness</th>
              <th className="text-left p-4">Description</th>
              <th className="text-left p-4">Logged by</th>
            </tr>
          </thead>
          <tbody>
            {sicknessRecords.map((record, index) => (
              <tr key={index} className="border-b">
                <td className="p-4">{record.date}</td>
                <td className="p-4">{record.illness}</td>
                <td className="p-4">{record.description}</td>
                <td className="p-4">{record.loggedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnimalProfile;
