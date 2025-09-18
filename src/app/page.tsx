import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 sm:text-7xl md:text-8xl">
          Welcome to <span className="text-indigo-600">V-Closet</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
          The future of fashion is here. Upload your photo, describe your dream outfit, and see it come to life with the power of AI.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/login" className="transform rounded-md bg-indigo-600 px-6 py-3 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700">
            Get Started
          </Link>
          <Link href="/signup" className="transform rounded-md bg-gray-200 px-6 py-3 text-lg font-medium text-gray-800 shadow-lg transition-transform hover:scale-105 hover:bg-gray-300">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}