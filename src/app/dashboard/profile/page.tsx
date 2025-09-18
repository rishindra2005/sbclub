'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageUploader from '@/components/ImageUploader';

// Define user interface locally
interface IUserProfile {
  name: string;
  email: string;
  images: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await res.json();
        setUser(data);
        setExistingImages(data.images || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageSelect = (files: FileList | null) => {
    if (files) {
      setNewImages(Array.from(files));
    } else {
      setNewImages([]);
    }
  };

  const handleDeleteExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter(img => img !== imageUrl));
  };

  const handleSaveChanges = async () => {
    setError('');
    if ((existingImages.length + newImages.length) > 3) {
      setError('You can have a maximum of 3 images.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('existingImages', JSON.stringify(existingImages));
      for (const file of newImages) {
        formData.append('newImages', file);
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setExistingImages(updatedUser.images || []);
      setNewImages([]); // Clear the file input

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <p className="p-4 text-center">Loading profile...</p>;
  if (error) return <p className="p-4 text-center text-red-500">{error}</p>;
  if (!user) return <p className="p-4 text-center">Could not load profile.</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>

            <hr className="my-8" />

            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Images</h3>
            <p className="text-sm text-gray-600 mb-4">Upload up to 3 images of yourself to use in virtual try-ons. These will be sent to the AI when you start a new chat.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <Image src={imageUrl} alt={`User image ${index + 1}`} width={200} height={200} className="rounded-lg object-cover aspect-square" />
                  <button 
                    onClick={() => handleDeleteExistingImage(imageUrl)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <ImageUploader onImageSelect={handleImageSelect} />
              {newImages.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  New: {newImages.map(f => f.name).join(', ')}
                </p>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleSaveChanges} 
                disabled={loading}
                className="px-6 py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
