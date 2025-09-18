'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-cyan-500/20 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
      <div className="relative w-full max-w-md rounded-lg border border-cyan-400/50 bg-gray-900/50 p-8 shadow-2xl shadow-cyan-400/20 backdrop-blur-lg">
        <h1 className="mb-6 text-center text-4xl font-bold text-cyan-400 font-mono tracking-widest" style={{ textShadow: '0 0 10px #00ffff' }}>LOGIN</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="mb-4 text-center text-red-400 font-mono">{error}</p>}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-cyan-400 font-mono" htmlFor="email">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-cyan-400/50 bg-gray-900/50 px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-cyan-400 font-mono" htmlFor="password">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-cyan-400/50 bg-gray-900/50 px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-cyan-400 py-2 font-bold text-gray-900 transition-transform hover:scale-105 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 font-mono"
            style={{ textShadow: '0 0 5px #000' }}
          >
            JACK IN
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400 font-mono">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-cyan-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}