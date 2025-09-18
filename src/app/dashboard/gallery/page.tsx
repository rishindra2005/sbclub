'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Define interfaces locally as we can't import from models in client components
interface IMessage {
  sender: 'user' | 'assistant';
  text?: string;
  imageUrl?: string;
  createdAt: Date;
}

interface ITrial {
  _id: string;
  messages: IMessage[];
}

export default function MasterGalleryPage() {
  const [allImages, setAllImages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllTrials = async () => {
      try {
        const res = await fetch('/api/trials');
        if (!res.ok) {
          throw new Error('Failed to fetch trials for the gallery');
        }
        const trials: ITrial[] = await res.json();

        const images = trials
          .flatMap(trial => trial.messages.filter(msg => msg.sender === 'assistant' && msg.imageUrl))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort newest first
        
        setAllImages(images);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllTrials();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono">
      <header className="bg-gray-900/50 backdrop-blur-lg shadow-cyan-400/20 shadow-lg sticky top-0 z-20 border-b border-cyan-400/20">
        <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-widest" style={{ textShadow: '0 0 5px #00ffff' }}>MASTER GALLERY</h1>
          <Link href="/dashboard" className="text-sm font-medium text-cyan-400 hover:text-cyan-300">
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <p className="text-center text-cyan-400">Loading gallery...</p>
        ) : error ? (
          <p className="text-center text-red-400">{error}</p>
        ) : allImages.length === 0 ? (
          <div className="text-center mt-16 border border-cyan-400/50 rounded-lg p-8 bg-gray-900/50">
            <h3 className="text-xl font-medium text-cyan-400">NO IMAGES GENERATED YET</h3>
            <p className="mt-2 text-gray-400">Your generated images will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allImages.map((imageMsg, index) => (
              <div 
                key={index} 
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:border-cyan-400 transition-all duration-300 shadow-lg hover:shadow-cyan-400/20"
                onClick={() => setModalImageUrl(imageMsg.imageUrl!)}
              >
                <Image
                  src={imageMsg.imageUrl!}
                  alt={`Generated outfit ${index + 1}`}
                  layout="fill"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </main>

      {modalImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setModalImageUrl(null)}>
          <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
            <Image src={modalImageUrl} alt="Enlarged outfit" width={800} height={800} className="max-w-screen-lg max-h-[80vh] object-contain rounded-lg shadow-2xl shadow-cyan-400/20" />
            <a
              href={modalImageUrl}
              download={`v-closet-image.png`}
              className="absolute bottom-8 right-8 bg-cyan-400 text-gray-900 px-5 py-2 rounded-full hover:bg-cyan-300 text-sm font-bold shadow-lg transition-transform hover:scale-105"
            >
              DOWNLOAD
            </a>
            <button 
              onClick={() => setModalImageUrl(null)} 
              className="absolute top-0 right-0 m-4 text-white bg-black/50 rounded-full p-2 leading-none hover:bg-black/75"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}