'use client';

import { useRef, useState, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ArrowPathIcon,
  ScissorsIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  SparklesIcon,
  CheckIcon,
  Cog6ToothIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';

interface ImageEditorProps {
  imageUrl: string;
  crop: Crop;
  rotation: number;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: Crop) => void;
  onRotationChange: (direction: 'left' | 'right') => void;
  onReset: () => void;
  onApply: (imageElement: HTMLImageElement) => Promise<void>;
  onCancel: () => void;
  originalImageUrl?: string;
}

type AspectRatio = 'free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '2:3' | '3:2';

const aspectRatios: { value: AspectRatio; label: string; icon: string; ratio?: number }[] = [
  { value: 'free', label: 'Libre', icon: '✂️' },
  { value: '1:1', label: 'Cuadrado', icon: '⬛', ratio: 1 },
  { value: '4:3', label: '4:3', icon: '🖼️', ratio: 4/3 },
  { value: '3:4', label: '3:4', icon: '📱', ratio: 3/4 },
  { value: '16:9', label: '16:9', icon: '📺', ratio: 16/9 },
  { value: '9:16', label: '9:16', icon: '📱', ratio: 9/16 },
  { value: '2:3', label: '2:3', icon: '📸', ratio: 2/3 },
  { value: '3:2', label: '3:2', icon: '📷', ratio: 3/2 },
];

export const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  crop: initialCrop,
  rotation,
  onCropChange,
  onCropComplete,
  onRotationChange,
  onReset,
  onApply,
  onCancel,
  originalImageUrl
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('free');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showCropOptions, setShowCropOptions] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  
  const [localCrop, setLocalCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });

  useEffect(() => {
    if (initialCrop && initialCrop.width !== 100 && imageLoaded) {
      setLocalCrop(initialCrop);
    }
  }, [initialCrop, imageLoaded]);

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
    onCropComplete(crop);
  };

  const handleCropChange = (crop: Crop) => {
    setLocalCrop(crop);
    onCropChange(crop);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Imagen cargada en el editor');
    const img = e.currentTarget;
    setNaturalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
    setImageLoaded(true);
    
    const fullCrop = {
      unit: '%' as const,
      width: 100,
      height: 100,
      x: 0,
      y: 0
    };
    setLocalCrop(fullCrop);
    handleCropComplete(fullCrop);
    onCropChange(fullCrop);
  };

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    setSelectedRatio(ratio);
    const selected = aspectRatios.find(r => r.value === ratio);
    
    if (selected?.ratio) {
      const newCrop = {
        unit: '%' as const,
        width: 70,
        height: 70 / selected.ratio,
        x: 15,
        y: 15
      };
      setLocalCrop(newCrop);
      onCropChange(newCrop);
      handleCropComplete(newCrop);
    } else {

      const fullCrop = {
        unit: '%' as const,
        width: 100,
        height: 100,
        x: 0,
        y: 0
      };
      setLocalCrop(fullCrop);
      onCropChange(fullCrop);
      handleCropComplete(fullCrop);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2.5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleResetWithConfirm = () => {
    if (originalImageUrl && imageUrl !== originalImageUrl) {
      setShowResetConfirm(true);
    } else {
      onReset();
    }
  };

  const handleApply = async () => {
    if (!imgRef.current) {
      console.error('La imagen no está disponible');
      return;
    }

    setIsApplying(true);
    try {

      const cropToUse = completedCrop || localCrop;
      
      if (cropToUse) {
        await onApply(imgRef.current);
      } else {
        console.error('No hay crop disponible');
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleRotateLeft = () => {
    onRotationChange('left');
  };

  const handleRotateRight = () => {
    onRotationChange('right');
  };

  const toggleGuidelines = () => {
    setShowGuidelines(!showGuidelines);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
    >

      <div className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isApplying}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <h3 className="text-white font-medium">Editar imagen</h3>
          {naturalDimensions.width > 0 && (
            <span className="text-xs text-gray-500 hidden sm:inline">
              {naturalDimensions.width} x {naturalDimensions.height}px
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGuidelines}
            className={`p-2 rounded-lg transition-colors ${
              showGuidelines ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Mostrar/Ocultar guías"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleResetWithConfirm}
            disabled={isApplying}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathRoundedSquareIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
          
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="hidden sm:inline">Aplicando...</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Aplicar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        <div className="flex-1 flex items-center justify-center p-4 bg-gray-900 relative overflow-auto">
          <div 
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <ReactCrop
              crop={localCrop}
              onChange={handleCropChange}
              onComplete={handleCropComplete}
              aspect={aspectRatios.find(r => r.value === selectedRatio)?.ratio}
              className="max-w-full max-h-[70vh]"
              ruleOfThirds={showGuidelines}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Editar"
                onLoad={handleImageLoad}
                style={{ transform: `rotate(${rotation}deg)` }}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </ReactCrop>
          </div>

          <div className="absolute bottom-6 right-6 flex gap-2 bg-gray-800/90 backdrop-blur-md rounded-lg p-1 border border-gray-700 shadow-xl">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.3 || isApplying}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Alejar"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </button>
            <span className="px-2 py-2 text-gray-300 text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 2.5 || isApplying}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Acercar"
            >
              <ChevronDoubleRightIcon className="w-4 h-4" />
            </button>
          </div>

          {rotation !== 0 && (
            <div className="absolute top-6 left-6 bg-blue-600/90 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 backdrop-blur-sm">
              <SparklesIcon className="w-4 h-4" />
              <span>{rotation}° rotación</span>
            </div>
          )}
        </div>

        <div className="w-full lg:w-80 bg-gray-900/95 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-gray-800 p-5 overflow-y-auto">
          
          <div className="mb-8">
            <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2">
              <ArrowUturnLeftIcon className="w-4 h-4" />
              Rotación
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRotateLeft}
                disabled={isApplying}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUturnLeftIcon className="w-4 h-4" />
                <span className="text-sm">-90°</span>
              </button>
              <button
                onClick={handleRotateRight}
                disabled={isApplying}
                className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-lg py-3 text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUturnRightIcon className="w-4 h-4" />
                <span className="text-sm">+90°</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-gray-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <ScissorsIcon className="w-4 h-4" />
                Proporciones
              </h4>
              <button
                onClick={() => setShowCropOptions(!showCropOptions)}
                disabled={isApplying}
                className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1"
              >
                <span>{showCropOptions ? 'Ocultar' : 'Mostrar'}</span>
                <ChevronDoubleRightIcon className={`w-3 h-3 transition-transform ${showCropOptions ? 'rotate-90' : ''}`} />
              </button>
            </div>
            
            <AnimatePresence>
              {showCropOptions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => handleAspectRatioChange(ratio.value)}
                        disabled={isApplying}
                        className={`p-2 rounded-lg transition-all ${
                          selectedRatio === ratio.value
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center`}
                      >
                        <div className="text-lg mb-1">{ratio.icon}</div>
                        <div className="text-xs">{ratio.label}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Dimensiones originales:</span>
                <span className="text-white font-mono">
                  {naturalDimensions.width} x {naturalDimensions.height}
                </span>
              </div>
              {localCrop.width && localCrop.height && (
                <>
                  <div className="flex justify-between text-gray-400">
                    <span>Área de recorte:</span>
                    <span className="text-white font-mono">
                      {Math.round(localCrop.width)}% x {Math.round(localCrop.height)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rotación:</span>
                    <span className="text-white font-mono">
                      {rotation}°
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-gray-800 shadow-2xl"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ArrowPathIcon className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-white font-semibold text-lg">¿Restablecer imagen?</h3>
                <p className="text-gray-400 text-sm mt-2">
                  Se perderán todos los cambios realizados (recortes y rotaciones).
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onReset();
                    setShowResetConfirm(false);
                  }}
                  disabled={isApplying}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sí, restablecer
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isApplying}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};