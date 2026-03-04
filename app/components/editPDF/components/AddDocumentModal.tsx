'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { AdditionalDocument, DocumentType, NewDocumentState } from '../types';
import { imageToPdf } from '../utils/pdfHelpers';
import { degrees } from 'pdf-lib';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: AdditionalDocument) => void;
  documentTypes: DocumentType[];
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  documentTypes
}) => {
  const [newDocument, setNewDocument] = useState<NewDocumentState>({
    position: 'after',
    targetDocType: 'cedula',
    name: '',
    file: null,
    rotation: 0,
    previewUrl: '',
    pageCount: 1
  });

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    let pdfBytes: Uint8Array;
    let pageCount = 1;
    let previewUrl = '';
    
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      pageCount = pdfDoc.getPageCount();
      pdfBytes = new Uint8Array(arrayBuffer);

      const previewPdf = await PDFDocument.create();
      const [firstPage] = await previewPdf.copyPages(pdfDoc, [0]);
      previewPdf.addPage(firstPage);
      const previewBytes = await previewPdf.save();
      previewUrl = URL.createObjectURL(new Blob([previewBytes.slice()], { type: 'application/pdf' }));
    } else if (file.type.startsWith('image/')) {
      pdfBytes = await imageToPdf(file);
      pageCount = 1;

      previewUrl = URL.createObjectURL(file);
    } else {
      alert('Formato no soportado. Use PDF o imágenes.');
      return;
    }

    setNewDocument(prev => ({
      ...prev,
      file: new File([pdfBytes.slice()], file.name, { type: 'application/pdf' }),
      pageCount,
      previewUrl
    }));
  };

  const rotatePreview = async (direction: 'left' | 'right') => {
    if (!newDocument.file) return;

    const newRotation = direction === 'left' 
      ? (newDocument.rotation - 90 + 360) % 360 
      : (newDocument.rotation + 90) % 360;

    if (newDocument.file.type.startsWith('image/')) {
      const img = new Image();
      const url = URL.createObjectURL(newDocument.file);
      img.onload = async () => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([img.height, img.width]); 
        
        const imgBytes = await newDocument.file!.arrayBuffer();
        let image;
        if (newDocument.file!.type === 'image/jpeg' || newDocument.file!.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imgBytes);
        } else {
          image = await pdfDoc.embedPng(imgBytes);
        }

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: img.height,
          height: img.width,
          rotate: degrees(newRotation)
        });
        
        const pdfBytes = await pdfDoc.save();
        const rotatedFile = new File([pdfBytes.slice()], newDocument.file!.name, { type: 'application/pdf' });

        const previewPdf = await PDFDocument.create();
        const [firstPage] = await previewPdf.copyPages(pdfDoc, [0]);
        previewPdf.addPage(firstPage);
        const previewBytes = await previewPdf.save();
        const newPreviewUrl = URL.createObjectURL(new Blob([previewBytes.slice()], { type: 'application/pdf' }));
        
        setNewDocument(prev => ({
          ...prev,
          rotation: newRotation,
          file: rotatedFile,
          previewUrl: newPreviewUrl
        }));
      };
      img.src = url;
    } else {
      const arrayBuffer = await newDocument.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const previewPdf = await PDFDocument.create();
      const [firstPage] = await previewPdf.copyPages(pdfDoc, [0]);
      firstPage.setRotation(degrees(newRotation));
      previewPdf.addPage(firstPage);
      const previewBytes = await previewPdf.save();
      const newPreviewUrl = URL.createObjectURL(new Blob([previewBytes.slice()], { type: 'application/pdf' }));
      
      setNewDocument(prev => ({
        ...prev,
        rotation: newRotation,
        previewUrl: newPreviewUrl
      }));
    }
  };

  const handleSave = () => {
    if (!newDocument.file || !newDocument.name.trim()) {
      alert('Complete todos los campos');
      return;
    }

    const additionalDoc: AdditionalDocument = {
      id: `additional-${Date.now()}-${Math.random()}`,
      name: newDocument.name,
      position: newDocument.position,
      targetDocType: newDocument.targetDocType,
      file: newDocument.file,
      rotation: newDocument.rotation,
      pageCount: newDocument.pageCount
    };

    onSave(additionalDoc);
    onClose();
    setNewDocument({
      position: 'after',
      targetDocType: 'cedula',
      name: '',
      file: null,
      rotation: 0,
      previewUrl: '',
      pageCount: 1
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Agregar Documento Adicional</h3>
            <button
              onClick={onClose}
              className="text-2xl font-bold text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Posición</label>
                <select
                  value={newDocument.position}
                  onChange={(e) => {
                    const position = e.target.value as 'before' | 'after' | 'between';
                    setNewDocument(prev => ({ ...prev, position }));
                  }}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="before">Antes de</option>
                  <option value="after">Después de</option>
                  <option value="between">Entre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {newDocument.position === 'between' ? 'Entre' : newDocument.position === 'before' ? 'Antes de' : 'Después de'}
                </label>
                <select
                  value={newDocument.targetDocType}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, targetDocType: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                >
                  {documentTypes.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del documento</label>
              <input
                type="text"
                value={newDocument.name}
                onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: certificado, constancia, etc."
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Archivo (PDF o imagen)</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {newDocument.previewUrl && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Previsualización</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rotatePreview('left')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ↺ Izquierda
                    </button>
                    <button
                      onClick={() => rotatePreview('right')}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      ↻ Derecha
                    </button>
                  </div>
                </div>
                <div className="border rounded overflow-hidden bg-white">
                  <iframe
                    src={newDocument.previewUrl}
                    className="w-full h-64"
                    title="Previsualización"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Rotación actual: {newDocument.rotation}° | Páginas: {newDocument.pageCount}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!newDocument.file || !newDocument.name.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
