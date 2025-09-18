'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ITrial, IMessage } from '@/models/trial.model';
import ImageUploader from '@/components/ImageUploader';

export default function TrialPage() {
  const [trial, setTrial] = useState<ITrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchTrial = async () => {
        try {
          const res = await fetch(`/api/trials/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch trial data');
          }
          const data = await res.json();
          setTrial(data);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };

      fetchTrial();
    }
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !trial) return;

    const userMessage: IMessage = {
      sender: 'user',
      text: inputText,
      createdAt: new Date(),
    };

    const updatedTrialWithUserMessage = { ...trial, messages: [...trial.messages, userMessage] };
    setTrial(updatedTrialWithUserMessage as ITrial);
    setInputText('');
    setIsAssistantTyping(true);

    try {
      const formData = new FormData();
      formData.append('prompt', inputText);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const geminiRes = await fetch('/api/gemini/generate', {
        method: 'POST',
        body: formData,
      });

      if (!geminiRes.ok) {
        throw new Error('Failed to get response from Gemini');
      }

      const assistantMessage = await geminiRes.json();
      const finalMessages = [...updatedTrialWithUserMessage.messages, assistantMessage];

      const dbRes = await fetch(`/api/trials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: finalMessages }),
      });

      if (!dbRes.ok) {
        throw new Error('Failed to save conversation to database');
      }

      const finalTrial = await dbRes.json();
      setTrial(finalTrial);
      setSelectedImage(null);

    } catch (err) {
      setError((err as Error).message);
      setTrial(trial as ITrial);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  if (loading) return <p className="p-4 text-center">Loading trial...</p>;
  if (error) return <p className="p-4 text-center text-red-500">Error: {error}</p>;
  if (!trial) return <p className="p-4 text-center">Trial not found.</p>;

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-10">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
            &larr; Dashboard
          </Link>
          <h1 className="truncate text-xl font-bold text-gray-900">{trial.name}</h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {trial.messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'assistant' && <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center font-bold text-violet-700">A</div>}
              <div
                className={`max-w-md rounded-2xl px-4 py-3 shadow-md ${ 
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none'
                }`}>
                {msg.text && <p className="text-sm">{msg.text}</p>}
                {msg.imageUrl && <Image src={msg.imageUrl} alt="Generated outfit" width={300} height={300} className="mt-2 rounded-lg" />}
              </div>
              {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">Y</div>}
            </div>
          ))}
          {isAssistantTyping && (
            <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center font-bold text-violet-700">A</div>
                <div className="max-w-md rounded-2xl px-4 py-3 shadow-md bg-white text-gray-900 rounded-bl-none">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/80 backdrop-blur-lg p-4 border-t border-gray-200">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <ImageUploader onImageSelect={handleImageSelect} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe the outfit you want to see..."
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isAssistantTyping}
            />
            <button
              type="submit"
              className="rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={isAssistantTyping || (!inputText.trim() && !selectedImage)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </form>
          {selectedImage && <p className="mt-2 text-sm text-gray-500">Selected: {selectedImage.name}</p>}
        </div>
      </footer>
    </div>
  );
}
