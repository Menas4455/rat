'use client';

import { PdfFile, PageInfo } from '../types';
import { DOCUMENT_TYPES } from '../constants';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ExpandedPageModalProps {
  page: PageInfo | null;
  pdf: PdfFile | null;
  onClose: () => void;
  onRotate: (docType: string, pageIdx: number, direction: 'left' | 'right') => void;
}

export const ExpandedPageModal: React.FC<ExpandedPageModalProps> = ({
  page,
  pdf,
  onClose,
  onRotate
}) => {
  if (!page || !pdf) return null;

  const findPageIndex = () => {
    const doc = pdf.documents[page.documentType];
    return doc?.pages.findIndex((p: any) => p.index === page.index) ?? -1;
  };

  const handleRotate = (direction: 'left' | 'right') => {
    const idx = findPageIndex();
    if (idx !== -1) {
      onRotate(page.documentType, idx, direction);
    }
  };

  const documentName = DOCUMENT_TYPES.find(d => d.id === page.documentType)?.name || page.documentType;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        <div className="flex justify-between items-center p-4 sm:p-5 border-b bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              {pdf.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate flex items-center gap-2 mt-1">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {documentName}
              </span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                Página {page.index + 1}
              </span>
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                Rotación: {page.rotation}°
              </span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:rotate-90 transition-all" />
          </button>
        </div>

        <div className="flex-1 p-3 sm:p-5 bg-gray-100 flex items-center justify-center overflow-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden w-full flex justify-center items-center p-4">
            {page.imageUrl && (
              <img 
                src={page.imageUrl} 
                alt={`Página ${page.index + 1}`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5 border-t bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => handleRotate('left')}
            className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-xl group-hover:-rotate-12 transition-transform">↺</span>
            Rotar Izquierda
          </button>
          <button
            onClick={() => handleRotate('right')}
            className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span className="text-xl group-hover:rotate-12 transition-transform">↻</span>
            Rotar Derecha
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};