import { useState, useCallback } from 'react';
import { Crop } from 'react-image-crop';

export const useImageProcessing = () => {
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [rotation, setRotation] = useState(0);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);

  const getCroppedImg = useCallback(async (
    image: HTMLImageElement,
    crop: Crop,
    rotation: number = 0
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        const rad = rotation * Math.PI / 180;

        const cropWidth = (crop.width || 90) * scaleX;
        const cropHeight = (crop.height || 90) * scaleY;
        const cropX = (crop.x || 5) * scaleX;
        const cropY = (crop.y || 5) * scaleY;
        
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        
        ctx.drawImage(
          image,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          -cropWidth / 2,
          -cropHeight / 2,
          cropWidth,
          cropHeight
        );

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  const applyRotation = useCallback((direction: 'left' | 'right') => {
    setRotation(prev => direction === 'left' 
      ? (prev - 90 + 360) % 360 
      : (prev + 90) % 360
    );
  }, []);

  const resetToOriginal = useCallback(() => {
    if (originalImage) {
      setTempPhoto(originalImage);
      setRotation(0);
      const defaultCrop = {
        unit: '%' as const,
        width: 90,
        height: 90,
        x: 5,
        y: 5
      };
      setCrop(defaultCrop);
      setCompletedCrop(defaultCrop);
    }
  }, [originalImage]);

  const resetRotation = useCallback(() => setRotation(0), []);

  const resetCrop = useCallback(() => {
    const defaultCrop = {
      unit: '%' as const,
      width: 90,
      height: 90,
      x: 5,
      y: 5
    };
    setCrop(defaultCrop);
    setCompletedCrop(defaultCrop);
  }, []);

  const setImageWithOriginal = useCallback((imageUrl: string | null) => {
    setTempPhoto(imageUrl);
    
    if (imageUrl) {
      setOriginalImage(imageUrl);
      const defaultCrop = {
        unit: '%' as const,
        width: 90,
        height: 90,
        x: 5,
        y: 5
      };
      setCrop(defaultCrop);
      setCompletedCrop(defaultCrop);
      setRotation(0);
    } else {
      setOriginalImage(null);
    }
  }, []);

  const clearImage = useCallback(() => {
    setTempPhoto(null);
    setOriginalImage(null);
    setRotation(0);
    resetCrop();
  }, [resetCrop]);

  const handleCropChange = useCallback((newCrop: Crop) => {
    setCrop(newCrop);
  }, []);

  const handleCropComplete = useCallback((newCrop: Crop) => {
    console.log('Crop completado:', newCrop);
    setCompletedCrop(newCrop);
  }, []);

  return {
    tempPhoto,
    setTempPhoto: setImageWithOriginal,
    clearImage,
    originalImage,
    crop,
    setCrop: handleCropChange,
    rotation,
    setRotation,
    completedCrop,
    setCompletedCrop: handleCropComplete,
    applyRotation,
    resetRotation,
    resetCrop,
    resetToOriginal,
    getCroppedImg
  };
};