'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ITrial } from '@/models/trial.model';
import Image from 'next/image';
import Link from 'next/link';

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

  const handleDeleteTrial = async (trialId: string) => {
    if (confirm('Are you sure you want to delete this trial? This action cannot be undone.')) {
      try {
        const res = await fetch(`/api/trials/${trialId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to delete trial');
        }

        setTrials(trials.filter((trial) => trial._id !== trialId));
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      <header className="bg-gray-900/50 backdrop-blur-lg shadow-cyan-400/20 shadow-lg sticky top-0 z-10 border-b border-cyan-400/20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-widest" style={{ textShadow: '0 0 5px #00ffff' }}>V-CLOSET DASHBOARD</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/profile" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="transform rounded-md bg-cyan-400 px-4 py-2 text-sm font-bold text-gray-900 shadow-lg transition-transform hover:scale-105 hover:bg-cyan-300"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-cyan-400" style={{ textShadow: '0 0 10px #00ffff' }}>YOUR TRIALS</h2>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/gallery" className="transform rounded-md bg-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-purple-500">
                VIEW MASTER GALLERY
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="transform rounded-md bg-green-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-green-400"
              >
                + NEW TRIAL
              </button>
            </div>
          </div>

          {error && <p className="mt-8 text-center text-red-400 rounded-lg bg-red-900/50 p-4">{error}</p>}

          {/* Trials Grid */}
          <div className="mt-8">
            {loading ? (
              <p className="p-4 text-center text-gray-500">Loading your trials...</p>
            ) : trials.length === 0 ? (
              <div className="text-center mt-16 border border-cyan-400/50 rounded-lg p-8 bg-gray-900/50">
                <h3 className="text-xl font-medium text-cyan-400">NO TRIALS YET</h3>
                <p className="mt-2 text-gray-400">Click &quot;+ New Trial&quot; to start your first simulation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {trials.map((trial) => {
                  const assistantImages = trial.messages.filter(msg => msg.sender === 'assistant' && msg.imageUrl);
                  return (
                    <div key={trial._id} className="bg-gray-900/50 border border-cyan-400/50 rounded-lg shadow-xl shadow-cyan-400/10 overflow-hidden transition-transform hover:-translate-y-1 hover:border-cyan-400">
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-cyan-400 truncate">{trial.name}</h3>
                        <p className="text-sm text-gray-500">{new Date(trial.createdAt).toLocaleDateString()}</p>
                      </div>
                      {assistantImages.length > 0 && (
                        <div className="px-5 pb-5">
                          <h4 className="font-semibold text-sm text-gray-400 mb-3">IMAGE PREVIEW</h4>
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
                              <div className="bg-gray-800 rounded-md flex items-center justify-center aspect-square">
                                <p className="text-xs font-bold text-gray-500">+{assistantImages.length - 5}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="px-5 py-3 bg-gray-900/50 border-t border-cyan-400/20 flex justify-between items-center">
                        <a href={`/trial/${trial._id}`} className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
                          VIEW TRIAL &rarr;
                        </a>
                        <button onClick={() => handleDeleteTrial(trial._id)} className="text-red-500 hover:text-red-400 font-semibold text-sm">
                          DELETE
                        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-cyan-400/50 p-8 rounded-lg shadow-2xl shadow-cyan-400/20 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Name Your New Trial</h2>
            <input 
              type="text"
              value={newTrialName}
              onChange={(e) => setNewTrialName(e.target.value)}
              placeholder="e.g., Summer Outfit Ideas"
              className="w-full rounded-md border border-cyan-400/50 bg-gray-900/50 px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTrial()}
            />
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md text-gray-400 hover:bg-gray-700">Cancel</button>
              <button onClick={handleCreateTrial} className="px-4 py-2 rounded-md bg-green-500 text-white font-bold hover:bg-green-400">Create Trial</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}