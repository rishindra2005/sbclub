'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.message || 'Something went wrong');
      }
    } catch (_) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://source.unsplash.com/random/1600x900?closet,fashion')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative w-full max-w-md rounded-lg border border-gray-200/20 bg-white/10 p-8 shadow-lg backdrop-blur-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">Create Your V-Closet</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-center text-red-400">{error}</p>}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300/30 bg-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300/30 bg-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300/30 bg-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-300">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
