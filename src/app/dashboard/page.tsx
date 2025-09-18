'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ITrial } from '@/models/trial.model';
import Image from 'next/image';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [trials, setTrials] = useState<ITrial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrialName, setNewTrialName] = useState('');

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

  const handleCreateTrial = async () => {
    if (!newTrialName.trim()) {
      setError('Please enter a name for the trial.');
      return;
    }
    try {
      const res = await fetch('/api/trials', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTrialName })
      });
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
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="transform rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-transform hover:scale-105 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800">Your Trials</h2>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/gallery" className="transform rounded-md bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-purple-700">
                View Master Gallery
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="transform rounded-md bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-700"
              >
                + New Trial
              </button>
            </div>
          </div>

          {error && <p className="mt-8 text-center text-red-500 rounded-lg bg-red-100 p-4">{error}</p>}

          {/* Trials Grid */}
          <div className="mt-8">
            {loading ? (
              <p className="p-4 text-center text-gray-500">Loading your trials...</p>
            ) : trials.length === 0 ? (
              <div className="text-center mt-16">
                <h3 className="text-xl font-medium text-gray-700">No trials yet!</h3>
                <p className="mt-2 text-gray-500">Click &quot;New Trial&quot; to start your first virtual try-on.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {trials.map((trial) => {
                  const assistantImages = trial.messages.filter(msg => msg.sender === 'assistant' && msg.imageUrl);
                  return (
                    <div key={trial._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform hover:-translate-y-1">
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{trial.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(trial.createdAt).toLocaleDateString()}</p>
                      </div>
                      {assistantImages.length > 0 && (
                        <div className="px-5 pb-5">
                          <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-3">Image Preview</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {assistantImages.slice(0, 5).map((img, index) => (
                              <div key={index} className="relative aspect-square">
                                <Image 
                                  src={img.imageUrl!} 
                                  alt={`Preview ${index}`}
                                  layout="fill"
                                  className="rounded-md object-cover"
                                />
                              </div>
                            ))}
                            {assistantImages.length > 5 && (
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center aspect-square">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">+{assistantImages.length - 5}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
                        <a href={`/trial/${trial._id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold text-sm">
                          View Trial &rarr;
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Trial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Name Your New Trial</h2>
            <input 
              type="text"
              value={newTrialName}
              onChange={(e) => setNewTrialName(e.target.value)}
              placeholder="e.g., Summer Outfit Ideas"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md mb-6 ${styles.textInput}`}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTrial()}
            />
            <div className="flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
              <button onClick={handleCreateTrial} className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">Create Trial</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
