import React from 'react';
import Link from 'next/link';

const Dashboard = () => {
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
            <button className="text-gray-500">
              🔍
            </button>
          </div>
          <Link href="/logbehavior">
            <button className="bg-black text-white px-6 py-2 rounded-lg">Log Behavior</button>
          </Link>
        </div>

        {/* Behavior Logs */}
        <div>
          <h2 className="text-xl font-semibold mb-4">October 2</h2>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">Who</th>
                <th className="text-left p-4">Behavior</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Logged by</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">10:30 am</td>
                <td className="p-4">Jane</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">Aggression</span>
                </td>
                <td className="p-4">Scratched John</td>
                <td className="p-4">Tom</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">11:00 am</td>
                <td className="p-4">John</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">Climbing</span>
                </td>
                <td className="p-4">Description</td>
                <td className="p-4">Tom</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">3:00 pm</td>
                <td className="p-4">Janice</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">Socializing</span>
                </td>
                <td className="p-4">Description</td>
                <td className="p-4">Tom</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-xl font-semibold mb-4">October 3</h2>
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">Who</th>
                <th className="text-left p-4">Behavior</th>
                <th className="text-left p-4">Description</th>
                <th className="text-left p-4">Logged by</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4">10:30 am</td>
                <td className="p-4">Jane</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">Aggression</span>
                </td>
                <td className="p-4">Scratched John</td>
                <td className="p-4">Tom</td>
              </tr>
              <tr className="border-b">
                <td className="p-4">11:00 am</td>
                <td className="p-4">John</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">Climbing</span>
                </td>
                <td className="p-4">Description</td>
                <td className="p-4">Tom</td>
              </tr>
              <tr>
                <td className="p-4">3:00 pm</td>
                <td className="p-4">Janice</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-lg">Socializing</span>
                </td>
                <td className="p-4">Description</td>
                <td className="p-4">Tom</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
