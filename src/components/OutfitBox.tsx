'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';

interface OutfitBoxProps {
  onImagePasted: (file: File) => void;
  isDescribing: boolean;
  describedImage: File | null;
}

export default function OutfitBox({ onImagePasted, isDescribing, describedImage }: OutfitBoxProps) {
  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          onImagePasted(file);
          break; // Handle only the first pasted image
        }
      }
    }
  }, [onImagePasted]);

  const handleClick = () => {
    navigator.clipboard.read().then(items => {
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            item.getType(type).then(blob => {
              const file = new File([blob], `pasted-image-${Date.now()}`, { type: blob.type });
              onImagePasted(file);
            });
            return;
          }
        }
      }
    }).catch(err => {
      console.error('Failed to read clipboard contents: ', err);
    });
  };

  return (
    <div 
      onPaste={handlePaste}
      onClick={handleClick}
      className="relative w-full h-24 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300"
      tabIndex={0} // Make it focusable to receive paste events
    >
      {isDescribing ? (
        <p>Describing outfit...</p>
      ) : describedImage ? (
        <Image src={URL.createObjectURL(describedImage)} alt="Pasted outfit" layout="fill" className="object-contain rounded-lg" />
      ) : (
        <p>Paste or click to add an outfit image</p>
      )}
    </div>
  );
}
