'use client';

import { useRef } from 'react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      onClick={handleClick}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors group"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-4xl sm:text-5xl mb-3 group-hover:scale-110 transition-transform">
        📄
      </div>
      <p className="text-sm sm:text-base text-gray-600 font-medium">
        Haz clic para seleccionar archivos PDF
      </p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">
        o arrastra y suelta aquí
      </p>
      <p className="text-xs text-gray-400 mt-2">
        Puedes seleccionar múltiples archivos
      </p>
    </div>
  );
}