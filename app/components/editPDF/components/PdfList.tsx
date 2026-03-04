import { PdfFile } from '../types';
import { PencilIcon, DocumentArrowDownIcon, TrashIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface PdfListProps {
  pdfFiles: PdfFile[];
  onEdit: (pdfId: string) => void;
  onDownload: (pdf: PdfFile) => void;
  onRemove: (pdfId: string) => void;
  onDownloadAll: () => void;
}

export const PdfList: React.FC<PdfListProps> = ({
  pdfFiles,
  onEdit,
  onDownload,
  onRemove,
  onDownloadAll
}) => {
  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          PDFs ({pdfFiles.length})
        </h2>
        <button
          onClick={onDownloadAll}
          className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <ArchiveBoxIcon className="w-5 h-5" />
          <span>Descargar Todos ({pdfFiles.length})</span>
          <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
        </button>
      </div>

      <div className="space-y-3">
        {pdfFiles.map(pdf => (
          <div 
            key={pdf.id} 
            className="group border border-gray-200 rounded-xl p-3 sm:p-4 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-medium text-sm sm:text-base text-gray-800 break-all flex items-center gap-2">
                    <span className="text-2xl">📄</span>
                    {pdf.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {pdf.totalPages} {pdf.totalPages === 1 ? 'página' : 'páginas'}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Cédula: {pdf.cedulaNumber}
                  </span>
                  {pdf.edited && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                      Editado
                    </span>
                  )}
                  {pdf.splitResults.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {pdf.splitResults.length} documentos
                    </span>
                  )}
                  {pdf.additionalDocs && pdf.additionalDocs.length > 0 && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                      +{pdf.additionalDocs.length} adicionales
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onEdit(pdf.id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => onDownload(pdf)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <DocumentArrowDownIcon className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
                <button
                  onClick={() => onRemove(pdf.id)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 group/remove"
                >
                  <TrashIcon className="w-3.5 h-3.5 group-hover/remove:rotate-12 transition-transform" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};