import { useState } from 'react';
import { DocumentPhoto, DocumentType, UserData } from '../types';

export const useCamera = () => {
  const [step, setStep] = useState<'form' | 'capture'>('form');
  const [userData, setUserData] = useState<UserData>({
    nombreApellido: '',
    numeroCedula: '',
    tipoCargo: ''
  });
  const [photos, setPhotos] = useState<DocumentPhoto[]>([]);
  const [currentDocType, setCurrentDocType] = useState<DocumentType>('cedula');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDocTypeSelector, setShowDocTypeSelector] = useState(false);
  const [showImageSourceDialog, setShowImageSourceDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const addPhoto = (dataUrl: string, type: DocumentType) => {
    const newPhoto: DocumentPhoto = {
      id: `${Date.now()}-${Math.random()}`,
      dataUrl,
      type,
      createdAt: new Date()
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const getPhotosByType = (type: DocumentType) => {
    return photos.filter(p => p.type === type);
  };

  const getTotalPhotos = () => photos.length;

  const canGeneratePDFs = () => photos.length > 0 && !isGenerating;

  const resetToInitial = () => {
    setStep('form');
    setPhotos([]);
    setCurrentDocType('cedula');
    setUserData({
      nombreApellido: '',
      numeroCedula: '',
      tipoCargo: ''
    });
    setIsGenerating(false);
  };

  return {
    step,
    setStep,
    userData,
    setUserData,
    photos,
    currentDocType,
    setCurrentDocType,
    showConfirmDialog,
    setShowConfirmDialog,
    showDocTypeSelector,
    setShowDocTypeSelector,
    showImageSourceDialog,
    setShowImageSourceDialog,
    showEditor,
    setShowEditor,
    showExportDialog,
    setShowExportDialog,
    isGenerating,
    setIsGenerating,
    addPhoto,
    removePhoto,
    getPhotosByType,
    getTotalPhotos,
    canGeneratePDFs,
    resetToInitial
  };
};