'use client';

import { useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useCamera } from './hooks/useCamera';
import { useImageProcessing } from './hooks/useImageProcessing';
import { readFileAsDataURL, compressImage } from './utils/imageHelpers';
import { DOCUMENT_TYPES, N8N_WEBHOOK_URL } from './constants';
import { DocumentPhoto } from './types';
import { UserForm } from './components/UserForm';
import { CameraHeader } from './components/CameraHeader';
import { DocumentGrid } from './components/DocumentGrid';
import { ImageEditor } from './components/ImageEditor';
import { ExportDialog } from './components/ExportDialog';
import { DocTypeSelector } from './components/DocTypeSelector';
import { ImageSourceDialog } from './components/ImageSourceDialog';

export default function CameraPdf() {
  const camera = useCamera();
  const imageProcessor = useImageProcessing();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (camera.userData.numeroCedula) {
      camera.setStep('capture');
    } else {
      alert('Por favor ingresa tu número de cédula');
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('❌ Por favor, selecciona solo archivos de imagen (JPG, PNG, etc.)');
        return;
      }

      try {
        const dataUrl = await readFileAsDataURL(file);
        const compressedImage = await compressImage(dataUrl);
        imageProcessor.setTempPhoto(compressedImage);
        camera.setShowEditor(true);
        imageProcessor.resetCrop();
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
        alert('Error al cargar la imagen');
      }
    }
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: any,
    rotation: number = 0
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        const rad = rotation * Math.PI / 180;

        const cropWidth = (crop.width / 100) * image.naturalWidth;
        const cropHeight = (crop.height / 100) * image.naturalHeight;
        const cropX = (crop.x / 100) * image.naturalWidth;
        const cropY = (crop.y / 100) * image.naturalHeight;
        
        console.log('Dimensiones originales:', image.naturalWidth, 'x', image.naturalHeight);
        console.log('Crop %:', crop.width, '% x', crop.height, '%');
        console.log('Crop px:', cropWidth, 'x', cropHeight);
        
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
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height
        );
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleApplyEdit = async (imageElement: HTMLImageElement) => {
    console.log('handleApplyEdit llamado con imagen:', imageElement);
    
    const cropToUse = imageProcessor.completedCrop || imageProcessor.crop;
    if (!cropToUse) {
      alert('Por favor define un área de recorte');
      return;
    }

    try {
      console.log('Procesando imagen con crop:', cropToUse);
      const processedImage = await getCroppedImg(
        imageElement, 
        cropToUse, 
        imageProcessor.rotation
      );
      
      if (processedImage) {
        console.log('Imagen procesada, guardando...');
        camera.addPhoto(processedImage, camera.currentDocType);
        camera.setShowEditor(false);
        imageProcessor.clearImage();
      } else {
        console.error('No se pudo procesar la imagen');
        alert('Error al procesar la imagen. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error en handleApplyEdit:', error);
      alert('Error al procesar la imagen');
    }
  };

  const handleCancelEdit = () => {
    camera.setShowEditor(false);
    imageProcessor.clearImage();
  };

  const generatePDFs = async (sendToWhatsApp: boolean = false) => {
    try {
      camera.setIsGenerating(true);
      camera.setShowExportDialog(false);

      const folderName = camera.userData.nombreApellido 
        ? `${camera.userData.nombreApellido} - ${camera.userData.numeroCedula}`
        : `${camera.userData.numeroCedula}`;
        
      const zip = new JSZip();
      const folder = zip.folder(folderName);

      for (const docType of DOCUMENT_TYPES) {
        const docPhotos = camera.photos.filter(p => p.type === docType.id);
        if (docPhotos.length > 0) {
          const pdf = new jsPDF();

          for (let i = 0; i < docPhotos.length; i++) {
            if (i > 0) pdf.addPage();

            const img = new Image();
            img.src = docPhotos[i].dataUrl;

            await new Promise((resolve) => {
              img.onload = () => {
                const imgWidth = 190;
                const imgHeight = (img.height * imgWidth) / img.width;
                pdf.addImage(docPhotos[i].dataUrl, 'JPEG', 10, 10, imgWidth, imgHeight);
                resolve(null);
              };
            });
          }

          const pdfBlob = pdf.output('blob');
          const fileName = `${camera.userData.numeroCedula} - ${docType.id}.pdf`;
          folder?.file(fileName, pdfBlob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipFileName = `${folderName}.zip`;

      saveAs(content, zipFileName);

      if (sendToWhatsApp && N8N_WEBHOOK_URL) {
        await sendToWhatsAppViaN8n(content, zipFileName, camera.userData, camera.photos);
      }

      alert(`✅ PDFs generados correctamente${sendToWhatsApp ? ' y enviados' : ''}`);

      camera.resetToInitial();

    } catch (error) {
      console.error('Error al generar los PDFs:', error);
      alert('❌ Error al generar los PDFs');
    } finally {
      camera.setIsGenerating(false);
    }
  };

  const sendToWhatsAppViaN8n = async (
    zipBlob: Blob,
    fileName: string,
    userData: any,
    photos: DocumentPhoto[]
  ) => {
    try {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(zipBlob);
      });

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileData: base64Data,
          userData: {
            nombre: userData.nombreApellido || 'Sin nombre',
            cedula: userData.numeroCedula,
            cargo: userData.tipoCargo || 'No especificado',
            totalFotos: photos.length,
            documentos: DOCUMENT_TYPES.map(type => ({
              tipo: type.id,
              cantidad: photos.filter(p => p.type === type.id).length
            })).filter(doc => doc.cantidad > 0)
          },
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Error al enviar a n8n');
      console.log('✅ Archivo enviado a n8n correctamente');
    } catch (error) {
      console.error('Error al enviar a WhatsApp:', error);
      alert('⚠️ Los PDFs se guardaron localmente pero hubo un error al enviarlos por WhatsApp');
    }
  };

  const photosByType = DOCUMENT_TYPES.reduce((acc, type) => {
    acc[type.id] = camera.photos.filter(p => p.type === type.id).length;
    return acc;
  }, {} as Record<string, number>);

  if (camera.step === 'form') {
    return (
      <UserForm
        userData={camera.userData}
        onSubmit={handleFormSubmit}
        onChange={camera.setUserData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CameraHeader
        userData={camera.userData}
        currentDocType={camera.currentDocType}
        totalPhotos={camera.getTotalPhotos()}
        onDocTypeClick={() => camera.setShowDocTypeSelector(true)}
        onHomeClick={camera.resetToInitial}
      />

      <DocumentGrid
        photos={camera.photos}
        documentType={camera.currentDocType}
        onAddPhoto={() => camera.setShowImageSourceDialog(true)}
        onDeletePhoto={camera.removePhoto}
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {camera.canGeneratePDFs() && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={() => camera.setShowExportDialog(true)}
            disabled={camera.isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 text-gray-700 hover:text-gray-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
              {camera.getTotalPhotos()}
            </span>
            <span>Generar PDFs</span>
            <span className="text-gray-400 text-xs">
              ({camera.getTotalPhotos()} {camera.getTotalPhotos() === 1 ? 'foto' : 'fotos'})
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {camera.showDocTypeSelector && (
          <DocTypeSelector
            currentType={camera.currentDocType}
            photosByType={photosByType}
            onSelect={camera.setCurrentDocType}
            onClose={() => camera.setShowDocTypeSelector(false)}
          />
        )}

        {camera.showImageSourceDialog && (
          <ImageSourceDialog
            onCameraSelect={() => {
              camera.setShowImageSourceDialog(false);
              setTimeout(() => cameraInputRef.current?.click(), 100);
            }}
            onGallerySelect={(file) => {
              if (file) {
                handleFileSelect(file);
              }
            }}
            onClose={() => camera.setShowImageSourceDialog(false)}
          />
        )}

        {camera.showEditor && imageProcessor.tempPhoto && (
          <ImageEditor
            imageUrl={imageProcessor.tempPhoto}
            originalImageUrl={imageProcessor.originalImage || undefined}
            crop={imageProcessor.crop}
            rotation={imageProcessor.rotation}
            onCropChange={imageProcessor.setCrop}
            onCropComplete={imageProcessor.setCompletedCrop}
            onRotationChange={imageProcessor.applyRotation}
            onReset={imageProcessor.resetToOriginal}
            onApply={handleApplyEdit}
            onCancel={handleCancelEdit}
          />
        )}

        {camera.showExportDialog && (
          <ExportDialog
            totalPhotos={camera.getTotalPhotos()}
            onExportLocal={() => generatePDFs(false)}
            onExportWhatsApp={() => generatePDFs(true)}
            onClose={() => camera.setShowExportDialog(false)}
            isGenerating={camera.isGenerating}
          />
        )}
      </AnimatePresence>
    </div>
  );
}