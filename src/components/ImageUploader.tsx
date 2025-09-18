'use client';

interface ImageUploaderProps {
  onImageSelect: (files: FileList | null) => void;
}

export default function ImageUploader({ onImageSelect }: ImageUploaderProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Selected files:', Array.from(files).map(f => f.name));
      onImageSelect(files);
    } else {
      onImageSelect(null);
    }
  };

  return (
    <div>
      <label htmlFor="image-upload" className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
        Upload Images
      </label>
      <input
        id="image-upload"
        name="image-upload"
        type="file"
        accept="image/*"
        multiple // Allow multiple files
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  );
}