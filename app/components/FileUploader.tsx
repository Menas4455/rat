'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploader({ onFilesSelected }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
    >
      <input {...getInputProps()} />
      <div className="text-gray-600">
        {isDragActive ? (
          <p>Suelta los archivos aquí...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">📁 Arrastra y suelta archivos PDF aquí</p>
            <p className="text-sm text-gray-500">o haz clic para seleccionar múltiples archivos</p>
          </div>
        )}
      </div>
    </div>
  );
}