'use client';
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type DocumentType = 'cedula' | 'rif' | 'titulos' | 'constancia' | 'curriculum';

interface DocumentPhoto {
  id: string;
  dataUrl: string;
  type: DocumentType;
}

interface UserData {
  nombreApellido: string;
  numeroCedula: string;
  tipoCargo: string;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  cedula: 'CÉDULA',
  rif: 'RIF',
  titulos: 'TÍTULOS',
  constancia: 'CONSTANCIA',
  curriculum: 'CURRICULUM'
};

const DOCUMENT_ICONS: Record<DocumentType, string> = {
  cedula: '🆔',
  rif: '📋',
  titulos: '🎓',
  constancia: '📄',
  curriculum: '📑'
};

export default function CameraPdf() {
  const [step, setStep] = useState<'form' | 'capture'>('form');
  const [userData, setUserData] = useState<UserData>({
    nombreApellido: '',
    numeroCedula: '',
    tipoCargo: ''
  });
  
  const [photos, setPhotos] = useState<DocumentPhoto[]>([]);
  const [currentDocType, setCurrentDocType] = useState<DocumentType>('cedula');
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDocTypeSelector, setShowDocTypeSelector] = useState(false);
  const [showImageSourceDialog, setShowImageSourceDialog] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [rotation, setRotation] = useState(0);
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const documentTypes: DocumentType[] = ['cedula', 'rif', 'titulos', 'constancia', 'curriculum'];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userData.nombreApellido && userData.numeroCedula) {
      setStep('capture');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
        setShowEditor(true);
        setCrop({
          unit: '%',
          width: 90,
          height: 90,
          x: 5,
          y: 5
        });
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSavePhoto = () => {
    if (tempPhoto) {
      const newPhoto: DocumentPhoto = {
        id: Date.now().toString(),
        dataUrl: tempPhoto,
        type: currentDocType
      };
      setPhotos([...photos, newPhoto]);
      setTempPhoto(null);
      setShowConfirmDialog(false);
      setShowEditor(false);
    }
  };

  const handleRetakePhoto = () => {
    setTempPhoto(null);
    setShowConfirmDialog(false);
    setShowEditor(false);
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const getPhotosForDocType = (type: DocumentType) => {
    return photos.filter(p => p.type === type);
  };

  const resetToInitialState = () => {
    setStep('form');
    setPhotos([]);
    setCurrentDocType('cedula');
    setTempPhoto(null);
    setShowConfirmDialog(false);
    setShowDocTypeSelector(false);
    setShowImageSourceDialog(false);
    setShowEditor(false);
    setUserData({
      nombreApellido: '',
      numeroCedula: '',
      tipoCargo: ''
    });
    setCrop({
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    });
    setRotation(0);
    setCompletedCrop(null);
    setIsGenerating(false);
  };

  const generatePDFs = async () => {
    try {
      setIsGenerating(true);
      const folderName = `${userData.nombreApellido} - ${userData.numeroCedula}`;
      const zip = new JSZip();
      
      const folder = zip.folder(folderName);
      
      for (const docType of documentTypes) {
        const docPhotos = getPhotosForDocType(docType);
        if (docPhotos.length > 0) {
          const pdf = new jsPDF();
          
          for (let i = 0; i < docPhotos.length; i++) {
            if (i > 0) {
              pdf.addPage();
            }
            
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
          const fileName = `${userData.numeroCedula} - ${docType}.pdf`;
          folder?.file(fileName, pdfBlob);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
      
      // Mostrar mensaje de éxito y resetear después de 2 segundos
      alert(`✅ PDFs generados correctamente`);
      
      // Limpiar todo y volver al inicio
      resetToInitialState();
      
    } catch (error) {
      console.error('Error al generar los PDFs:', error);
      alert('❌ Error al generar los PDFs');
      setIsGenerating(false);
    }
  };

  const canGeneratePDFs = () => {
    return photos.length > 0 && !isGenerating;
  };

  const totalPhotos = photos.length;

  const openImageSourceDialog = () => {
    setShowImageSourceDialog(true);
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop, rotation: number = 0): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const ctx = canvas.getContext('2d');
    
    const rad = rotation * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;
    
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    
    if (ctx) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        cropWidth,
        cropHeight,
        -cropWidth / 2,
        -cropHeight / 2,
        cropWidth,
        cropHeight
      );
    }
    
    return Promise.resolve(canvas.toDataURL('image/jpeg'));
  };

  const handleApplyEdit = async () => {
    if (imgRef.current && completedCrop) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop, rotation);
        setTempPhoto(croppedImageUrl);
        setShowEditor(false);
        setShowConfirmDialog(true);
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
        alert('Error al procesar la imagen');
      }
    }
  };

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">📄 Document Scanner</h1>
            <p className="text-gray-600">Ingresa tus datos para comenzar</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  value={userData.nombreApellido}
                  onChange={(e) => setUserData({...userData, nombreApellido: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cédula *
                </label>
                <input
                  type="text"
                  required
                  value={userData.numeroCedula}
                  onChange={(e) => setUserData({...userData, numeroCedula: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Ej: V-12345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cargo
                </label>
                <input
                  type="text"
                  value={userData.tipoCargo}
                  onChange={(e) => setUserData({...userData, tipoCargo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Ej: Gerente (opcional)"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-6"
              >
                Comenzar a escanear 📸
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header simplificado con botón de reinicio */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800 text-sm truncate">
                {userData.nombreApellido}
              </h2>
              <p className="text-xs text-gray-500">{userData.numeroCedula}</p>
            </div>
            <button
              onClick={() => setShowDocTypeSelector(true)}
              className="bg-blue-50 px-4 py-2 rounded-full flex items-center gap-2"
            >
              <span className="text-blue-600 font-medium text-sm">
                {DOCUMENT_ICONS[currentDocType]} {DOCUMENT_LABELS[currentDocType]}
              </span>
              <span className="text-blue-600">▼</span>
            </button>
            <div className="w-16 text-right flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                {totalPhotos}
              </span>
              <button
                onClick={resetToInitialState}
                className="text-gray-500 hover:text-gray-700 text-xl"
                title="Volver al inicio"
              >
                🏠
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de tipo de documento modal */}
      {showDocTypeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Seleccionar documento</h3>
              <button 
                onClick={() => setShowDocTypeSelector(false)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {documentTypes.map((type) => {
                const count = getPhotosForDocType(type).length;
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setCurrentDocType(type);
                      setShowDocTypeSelector(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                      currentDocType === type 
                        ? 'bg-blue-50 border-2 border-blue-500' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{DOCUMENT_ICONS[type]}</span>
                      <span className="font-medium text-gray-800">{DOCUMENT_LABELS[type]}</span>
                    </div>
                    {count > 0 && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Selector de fuente de imagen (Cámara o Galería) */}
      {showImageSourceDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-center">Seleccionar imagen de</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowImageSourceDialog(false);
                  setTimeout(() => cameraInputRef.current?.click(), 100);
                }}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <span className="text-3xl">📷</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Cámara</p>
                  <p className="text-sm text-gray-600">Tomar una foto ahora</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowImageSourceDialog(false);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="w-full flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
              >
                <span className="text-3xl">🖼️</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Galería</p>
                  <p className="text-sm text-gray-600">Seleccionar de tus fotos</p>
                </div>
              </button>
              <button
                onClick={() => setShowImageSourceDialog(false)}
                className="w-full p-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor de imágenes */}
      {showEditor && tempPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-30 flex flex-col">
          <div className="bg-white p-4 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Editar imagen</h3>
            <button
              onClick={handleRetakePhoto}
              className="text-gray-500 text-xl"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
              aspect={undefined}
            >
              <img
                ref={imgRef}
                src={tempPhoto}
                alt="Editar"
                style={{ transform: `rotate(${rotation}deg)`, maxHeight: '60vh' }}
                className="max-w-full object-contain"
              />
            </ReactCrop>
          </div>

          <div className="bg-white p-4 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Rotar:</span>
              <button
                onClick={() => setRotation((rotation - 90) % 360)}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <span>↺</span> -90°
              </button>
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <span>↻</span> +90°
              </button>
              <button
                onClick={() => setRotation(0)}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl"
              >
                Reset
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApplyEdit}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                ✓ Aplicar cambios
              </button>
              <button
                onClick={handleRetakePhoto}
                className="flex-1 bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de fotos */}
      <div className="p-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {getPhotosForDocType(currentDocType).map((photo) => (
            <div key={photo.id} className="relative group aspect-square">
              <img
                src={photo.dataUrl}
                alt="Documento"
                className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
              />
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                🗑️
              </button>
            </div>
          ))}

          {/* Botón para agregar foto */}
          <button
            onClick={openImageSourceDialog}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white hover:border-blue-500 transition-colors"
          >
            <span className="text-4xl text-gray-400 mb-1">+</span>
            <span className="text-xs text-gray-500">Agregar</span>
          </button>
        </div>
      </div>

      {/* Inputs ocultos */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botón flotante para generar PDF */}
      {canGeneratePDFs() && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-100 via-gray-100 to-transparent">
          <button
            onClick={generatePDFs}
            disabled={isGenerating}
            className={`w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 ${
              isGenerating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generando PDFs...
              </>
            ) : (
              <>
                <span>📄</span>
                Generar PDFs ({totalPhotos} {totalPhotos === 1 ? 'foto' : 'fotos'})
              </>
            )}
          </button>
        </div>
      )}

      {/* Dialog de confirmación */}
      {showConfirmDialog && tempPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-3 text-center">¿Guardar esta foto?</h3>
            <img
              src={tempPhoto}
              alt="Preview"
              className="w-full h-64 object-contain rounded-xl border-2 border-gray-200 mb-4 bg-gray-50"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSavePhoto}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                ✓ Guardar
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setShowEditor(true);
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                ✎ Editar
              </button>
              <button
                onClick={handleRetakePhoto}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}