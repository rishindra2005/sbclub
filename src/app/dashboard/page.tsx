'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ITrial } from '@/models/trial.model';

export default function DashboardPage() {
  const router = useRouter();
  const [trials, setTrials] = useState<ITrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const res = await fetch('/api/trials');
        if (!res.ok) {
          throw new Error('Failed to fetch trials');
        }
        const data = await res.json();
        setTrials(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, []);

  const handleNewTrial = async () => {
    try {
      const res = await fetch('/api/trials', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to create new trial');
      }
      const newTrial = await res.json();
      router.push(`/trial/${newTrial._id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">V-Closet Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="transform rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105 hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">Your Trials</h2>
            <button
              onClick={handleNewTrial}
              className="transform rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700"
            >
              + New Trial
            </button>
          </div>

          {error && <p className="mt-8 text-center text-red-500 rounded-lg bg-red-100 p-4">{error}</p>}

          <div className="mt-8 flow-root">
            {loading ? (
              <p className="p-4 text-center text-gray-500">Loading your trials...</p>
            ) : trials.length === 0 ? (
              <div className="text-center mt-16">
                <h3 className="text-xl font-medium text-gray-700">No trials yet!</h3>
                <p className="mt-2 text-gray-500">Click &quot;New Trial&quot; to start your first virtual try-on.</p>
              </div>
            ) : (
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden shadow-xl ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Date
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {trials.map((trial) => (
                          <tr key={trial._id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {trial.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(trial.createdAt).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <a href={`/trial/${trial._id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                View &rarr;
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
