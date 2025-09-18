'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ITrial, IMessage } from '@/models/trial.model';
import ImageUploader from '@/components/ImageUploader';
import OutfitBox from '@/components/OutfitBox';

// Define user interface locally
interface IUserProfile {
  images: string[];
}

export default function TrialPage() {
  const [trial, setTrial] = useState<ITrial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [userProfileImages, setUserProfileImages] = useState<string[]>([]);
  const [outfitDescription, setOutfitDescription] = useState('');
  const [describedImage, setDescribedImage] = useState<File | null>(null);
  const [isDescribing, setIsDescribing] = useState(false);

  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    const fetchTrialAndProfile = async () => {
      try {
        const [trialRes, profileRes] = await Promise.all([
          fetch(`/api/trials/${id}`),
          fetch('/api/profile'),
        ]);

        if (!trialRes.ok) throw new Error('Failed to fetch trial data');
        const trialData = await trialRes.json();
        setTrial(trialData);
        setEditingName(trialData.name);

        if (profileRes.ok) {
          const profileData: IUserProfile = await profileRes.json();
          setUserProfileImages(profileData.images || []);
        }

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrialAndProfile();
    }
  }, [id]);

  const handleImagePastedForDescription = async (file: File) => {
    setDescribedImage(file);
    setIsDescribing(true);
    setOutfitDescription('');
  
    try {
      const formData = new FormData();
      formData.append('image', file);
  
      const res = await fetch('/api/gemini/describe', {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) {
        throw new Error('Failed to describe outfit');
      }
  
      const { description } = await res.json();
      console.log('Outfit Description:', description);
      setOutfitDescription(description);
  
    } catch (error) {
      console.error(error);
      // handle error state in UI
    } finally {
      setIsDescribing(false);
    }
  };

  const handleUpdateTrialName = async () => {
    if (!trial || !editingName.trim()) return;
    try {
      const res = await fetch(`/api/trials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update trial name');
      const updatedTrial = await res.json();
      setTrial(updatedTrial);
      setIsEditingName(false);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && selectedImages.length === 0) || !trial) return;

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
      let prompt = inputText;
      if (outfitDescription) {
        prompt = `[Outfit Description: ${outfitDescription}] \n\n ${inputText}`;
        setOutfitDescription(''); // Clear after use
        setDescribedImage(null); // Clear the image preview
      }
      formData.append('prompt', prompt);


      if (trial.messages.length > 0) {
        formData.append('history', JSON.stringify(trial.messages));
      }

      for (const image of selectedImages) {
        formData.append('image', image);
      }

      const geminiRes = await fetch('/api/gemini/generate', {
        method: 'POST',
        body: formData,
      });

      if (!geminiRes.ok) throw new Error('Failed to get response from Gemini');

      const assistantMessage = await geminiRes.json();
      const finalMessages = [...updatedTrialWithUserMessage.messages, assistantMessage];

      const dbRes = await fetch(`/api/trials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: finalMessages }),
      });

      if (!dbRes.ok) throw new Error('Failed to save conversation to database');

      const finalTrial = await dbRes.json();
      setTrial(finalTrial);
      setSelectedImages([]);

    } catch (err) {
      setError((err as Error).message);
      setTrial(trial as ITrial);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  const handleNewImageUpload = (files: FileList | null) => {
    if (files) {
      setSelectedImages(prev => [...prev, ...Array.from(files)]);
    }
  };

  const handleToggleProfileImage = async (imageUrl: string) => {
    const fileName = `profile-image-${userProfileImages.indexOf(imageUrl)}`;
    const isSelected = selectedImages.some(file => file.name === fileName);

    if (isSelected) {
      setSelectedImages(prev => prev.filter(file => file.name !== fileName));
    } else {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: blob.type });
      setSelectedImages(prev => [...prev, file]);
    }
  };

  const assistantImages = trial?.messages.filter(msg => msg.sender === 'assistant' && msg.imageUrl) || [];

  if (loading) return <p className="p-4 text-center">Loading trial...</p>;
  if (error) return <p className="p-4 text-center text-red-500">Error: {error}</p>;
  if (!trial) return <p className="p-4 text-center">Trial not found.</p>;

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">&larr; Dashboard</Link>
          <div className="flex-1 text-center">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2">
                <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="px-2 py-1 text-xl font-bold text-gray-900 bg-transparent border-b-2 border-indigo-500 focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleUpdateTrialName()}/>
                <button onClick={handleUpdateTrialName} className="text-sm font-semibold text-green-600 hover:text-green-800">Save</button>
                <button onClick={() => setIsEditingName(false)} className="text-sm text-red-600 hover:text-red-800">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                <h1 className="truncate text-xl font-bold text-gray-900">{trial.name}</h1>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></div>
              </div>
            )}
          </div>
          <div className="w-24"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-2xl space-y-6">
            {trial.messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'assistant' && <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center font-bold text-violet-700">A</div>}
                <div className={`max-w-md rounded-2xl px-4 py-3 shadow-md ${ msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none' }`}>
                  {msg.text && <p className="text-sm">{msg.text}</p>}
                  {msg.imageUrl && <Image src={msg.imageUrl} alt="Generated outfit" width={300} height={300} className="mt-2 rounded-lg cursor-pointer transition-transform hover:scale-105" onClick={() => setModalImageUrl(msg.imageUrl!)} />}
                </div>
                {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">Y</div>}
              </div>
            ))}
            {isAssistantTyping && <div className="flex items-end gap-2 justify-start"><div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center font-bold text-violet-700">A</div><div className="max-w-md rounded-2xl px-4 py-3 shadow-md bg-white text-gray-900 rounded-bl-none"><div className="flex items-center justify-center space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div></div></div></div>}
          </div>
        </main>

        {/* Image Gallery Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-gray-50 p-4 border-l border-gray-200 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Image Gallery</h2>
          {assistantImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {assistantImages.map((imgMsg, index) => (
                <div key={index} className="cursor-pointer group" onClick={() => setModalImageUrl(imgMsg.imageUrl!)}>
                  <Image src={imgMsg.imageUrl!} alt={`Generated outfit ${index + 1}`} width={100} height={100} className="rounded-md object-cover aspect-square transition-transform group-hover:scale-105 shadow-md"/>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">No images generated yet.</p>
          )}
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-lg p-4 border-t border-gray-200 z-10">
        <div className="mx-auto max-w-4xl">
          {userProfileImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Select from your profile images:</p>
              <div className="flex items-center gap-3">
                {userProfileImages.map((imgUrl, index) => (
                  <div key={index} className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${selectedImages.some(f => f.name === `profile-image-${index}`) ? 'border-indigo-500' : 'border-transparent'}`} onClick={() => handleToggleProfileImage(imgUrl)}>
                    <Image src={imgUrl} alt={`Your Image ${index + 1}`} width={60} height={60} className="object-cover aspect-square" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-3">
              <ImageUploader onImageSelect={handleNewImageUpload} />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe the outfit... or paste an image"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                disabled={isAssistantTyping}
              />
              <button type="submit" className="rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:bg-gray-400" disabled={isAssistantTyping || (!inputText.trim() && selectedImages.length === 0)}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
            </form>
            <div className="w-48">
              <OutfitBox 
                onImagePasted={handleImagePastedForDescription} 
                isDescribing={isDescribing}
                describedImage={describedImage}
              />
            </div>
          </div>

          {selectedImages.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Selected: {selectedImages.map(f => f.name).join(', ')}
            </p>
          )}
        </div>
      </footer>

      {/* Modal */}
      {modalImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setModalImageUrl(null)}>
          <div className="relative p-4" onClick={(e) => e.stopPropagation()}>
            <Image src={modalImageUrl} alt="Enlarged outfit" width={800} height={800} className="max-w-screen-lg max-h-[80vh] object-contain rounded-lg shadow-2xl" />
            <a href={modalImageUrl} download={`v-closet-image.png`} className="absolute bottom-8 right-8 bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 text-sm font-semibold shadow-lg transition-transform hover:scale-105">Download</a>
            <button onClick={() => setModalImageUrl(null)} className="absolute top-0 right-0 m-4 text-white bg-black/50 rounded-full p-2 leading-none hover:bg-black/75"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      )}
    </div>
  );
}
