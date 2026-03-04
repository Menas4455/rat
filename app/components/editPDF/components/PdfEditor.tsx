'use client';

import { PdfFile, DocumentType, PageInfo } from '../types';
import { generateFileName } from '../utils/filenameHelpers';
import { 
  ArrowLeftIcon, 
  DocumentPlusIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

interface PdfEditorProps {
  pdf: PdfFile;
  documentTypes: DocumentType[];
  onBack: () => void;
  onSave: () => void;
  onAddDocument: () => void;
  onRotatePage: (docType: string, pageIdx: number, direction: 'left' | 'right') => void;
  onExpandPage: (page: PageInfo) => void;
  onRemoveAdditionalDoc: (docId: string) => void;
  onRotateAdditionalDoc: (docId: string, rotation: number) => void;
  loading?: boolean;
}

export const PdfEditor: React.FC<PdfEditorProps> = ({
  pdf,
  documentTypes,
  onBack,
  onSave,
  onAddDocument,
  onRotatePage,
  onExpandPage,
  onRemoveAdditionalDoc,
  onRotateAdditionalDoc,
  loading = false
}) => {
  return (
    <div className="mt-6">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-gradient-to-r from-gray-50 to-indigo-50 p-4 rounded-xl border border-indigo-100">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver</span>
        </button>
        
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 break-all text-center sm:text-left flex items-center gap-2">
          <span className="text-2xl">✏️</span>
          Editando: {pdf.name}
        </h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onAddDocument}
            className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <DocumentPlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Agregar Documento</span>
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1">
        {documentTypes.map(docType => {
          const doc = pdf.documents[docType.id];
          if (!doc?.pages?.length) return null;

          return (
            <div key={docType.id} className="border border-purple-200 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-white">
              <h3 className="text-sm sm:text-base font-semibold text-purple-800 mb-3 break-all flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                {docType.name} ({doc.pages.length} {doc.pages.length === 1 ? 'página' : 'páginas'})
                <span className="text-xs font-normal text-gray-500 ml-2">
                  {generateFileName(pdf, docType.id)}
                </span>
              </h3>
              <div className="space-y-2">
                {doc.pages.map((page: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-white hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <button
                        onClick={() => onExpandPage(page)}
                        className="group relative w-full sm:w-32 h-40 sm:h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer mx-auto sm:mx-0"
                      >
                        {page.imageUrl ? (
                          <>
                            <img 
                              src={page.imageUrl} 
                              alt={`Página ${page.index + 1}`}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                              <ArrowsPointingOutIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ArrowPathIcon className="w-5 h-5 text-gray-400 animate-spin" />
                          </div>
                        )}
                      </button>

                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                            Página {page.index + 1}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                            {page.rotation}° rotación
                          </span>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => onRotatePage(docType.id, idx, 'left')}
                            className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <span className="text-lg group-hover:-rotate-12 transition-transform">↺</span>
                            Izquierda
                          </button>
                          <button
                            onClick={() => onRotatePage(docType.id, idx, 'right')}
                            className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <span className="text-lg group-hover:rotate-12 transition-transform">↻</span>
                            Derecha
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {pdf.additionalDocs && pdf.additionalDocs.length > 0 && (
          <div className="border border-indigo-200 rounded-xl p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-white">
            <h3 className="text-sm sm:text-base font-semibold text-indigo-800 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Documentos Adicionales ({pdf.additionalDocs.length})
            </h3>
            <div className="space-y-2">
              {pdf.additionalDocs.map((doc, idx) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-800">{doc.name}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          {doc.pageCount} {doc.pageCount === 1 ? 'pág' : 'págs'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Rotación: {doc.rotation}°
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {doc.position === 'before' ? '📌 Antes de' : doc.position === 'after' ? '📌 Después de' : '📌 Entre'} {doc.targetDocType}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => onRotateAdditionalDoc(doc.id, (doc.rotation + 90) % 360)}
                        className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <span className="text-lg group-hover:rotate-12 transition-transform">↻</span>
                        Rotar
                      </button>
                      <button
                        onClick={() => onRemoveAdditionalDoc(doc.id)}
                        className="flex-1 sm:flex-none group inline-flex items-center justify-center gap-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <TrashIcon className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};