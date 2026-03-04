// components/camera/components/ImageSourceDialog.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { CameraIcon, PhotoIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ImageSourceDialogProps {
  onCameraSelect: () => void;
  onGallerySelect: (file?: File) => void;
  onClose: () => void;
}

export const ImageSourceDialog: React.FC<ImageSourceDialogProps> = ({
  onCameraSelect,
  onGallerySelect,
  onClose
}) => {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
      } catch (error) {
        setHasCamera(false);
      }
    };
    checkCamera();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Pasar el archivo y cerrar el modal
      onGallerySelect(file);
      onClose(); // Cerrar inmediatamente después de seleccionar
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  const handleCameraClick = () => {
    if (hasCamera) {
      onCameraSelect();
      onClose(); // Cerrar inmediatamente
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl p-4 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-gray-900 mb-4">Seleccionar imagen</h3>
        
        {hasCamera === false && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg flex items-start gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">
              No se detectó cámara. Puedes seleccionar de la galería.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {/* Opción Cámara */}
          <button
            onClick={handleCameraClick}
            disabled={!hasCamera}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              hasCamera 
                ? 'bg-gray-50 hover:bg-gray-100' 
                : 'bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CameraIcon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-700">Cámara</p>
              <p className="text-xs text-gray-500">Tomar foto ahora</p>
            </div>
            {!hasCamera && (
              <span className="text-xs text-gray-400">No disponible</span>
            )}
          </button>

          {/* Opción Galería - Usamos input file directamente */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <PhotoIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">Galería</p>
                <p className="text-xs text-gray-500">Seleccionar de fotos</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full p-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mt-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};