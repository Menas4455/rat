'use client';

import { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import DocumentConfigurator from './DocumentConfigurator';
import FileUploader from './FileUploader';

interface PdfFile {
  id: string;
  file: File;
  name: string;
  totalPages: number;
  pdfDoc: any;
  edited: boolean;
  documents: any;
  splitResults: SplitResult[];
  cedulaNumber: string;
}

interface PageInfo {
  index: number;
  rotation: number;
  dataUrl: string;
  documentType: string;
}

interface SplitResult {
  name: string;
  blob: Blob;
  url: string;
}

interface DocumentConfig {
  cedula: number;
  rif: number;
  tituloStart: number;
  tituloEnd: number;
  constancia: number;
  curriculumStart: number;
}

export default function PdfSplitter() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [expandedPage, setExpandedPage] = useState<PageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const documentTypes = [
    { id: 'cedula', name: 'Cédula', fileName: 'cedula' },
    { id: 'rif', name: 'RIF', fileName: 'rif' },
    { id: 'titulo', name: 'Títulos', fileName: 'titulos' },
    { id: 'constancia', name: 'Constancia', fileName: 'constancia' },
    { id: 'curriculum', name: 'Curriculum', fileName: 'curriculum' }
  ];

  // Función para extraer el número de cédula del nombre del archivo
  const extractCedulaFromFilename = (filename: string): string => {
    const patterns = [
      /(\d{1,2}\.?\d{3}\.?\d{3,4})/,
      /V[-\s]?(\d{1,2}\.?\d{3}\.?\d{3,4})/i,
      /(\d{7,8})/,
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        let cedula = match[1] || match[0];
        cedula = cedula.replace(/[^\d]/g, '');
        if (cedula.length >= 7 && cedula.length <= 8) {
          return cedula;
        }
      }
    }

    const digits = filename.replace(/[^\d]/g, '');
    if (digits.length >= 7) {
      return digits.substring(0, 8);
    }

    return 'desconocido';
  };

  // Manejadores de arrastrar y soltar globales
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files || []);
      const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles.length > 0) {
        await handleFilesSelected(pdfFiles);
      } else {
        setError('Solo se permiten archivos PDF');
        setTimeout(() => setError(''), 3000);
      }
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    setLoading(true);
    try {
      const newFiles: PdfFile[] = [];
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const cedulaNumber = extractCedulaFromFilename(file.name);
        
        newFiles.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          totalPages: pdfDoc.getPageCount(),
          pdfDoc,
          edited: false,
          documents: {},
          splitResults: [],
          cedulaNumber
        });
      }
      setPdfFiles(prev => [...prev, ...newFiles]);
    } catch (err) {
      setError('Error al leer PDFs');
    } finally {
      setLoading(false);
    }
  };

  const removePdf = (id: string) => {
    setPdfFiles(prev => prev.filter(p => p.id !== id));
    if (selectedPdf?.id === id) setSelectedPdf(null);
  };

  const generatePagePreview = async (pdfDoc: any, pageIndex: number, rotation: number = 0) => {
    try {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
      copiedPage.setRotation(degrees(rotation));
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      // Convertir Uint8Array a ArrayBuffer estándar
      // Crea un Uint8Array "normal" a partir de pdfBytes
      const safeBytes = Uint8Array.from(pdfBytes);

      return URL.createObjectURL(new Blob([safeBytes], { type: 'application/pdf' }));
    } catch {
      return '';
    }
  };

  const identifyDocumentsByOrder = (totalPages: number) => {
    const groups: any = {};
    let currentIndex = 0;
    
    if (currentIndex < totalPages) {
      groups['cedula'] = [currentIndex];
      currentIndex++;
    }
    if (currentIndex < totalPages) {
      groups['rif'] = [currentIndex];
      currentIndex++;
    }
    
    const tituloPages = [];
    const maxTituloPages = Math.min(currentIndex + 4, totalPages - 2);
    while (currentIndex < maxTituloPages) {
      tituloPages.push(currentIndex);
      currentIndex++;
    }
    if (tituloPages.length > 0) groups['titulo'] = tituloPages;
    
    if (currentIndex < totalPages) {
      groups['constancia'] = [currentIndex];
      currentIndex++;
    }
    
    const curriculumPages = [];
    while (currentIndex < totalPages) {
      curriculumPages.push(currentIndex);
      currentIndex++;
    }
    if (curriculumPages.length > 0) groups['curriculum'] = curriculumPages;
    
    return groups;
  };

  const preparePreview = async (pdfId: string) => {
    const pdf = pdfFiles.find(p => p.id === pdfId);
    if (!pdf) return;

    setLoading(true);
    const groups = identifyDocumentsByOrder(pdf.totalPages);
    const documents: any = {};

    for (const [docType, pages] of Object.entries(groups)) {
      const pageInfos = [];
      for (const pageIndex of pages as number[]) {
        pageInfos.push({
          index: pageIndex,
          rotation: 0,
          dataUrl: await generatePagePreview(pdf.pdfDoc, pageIndex, 0),
          documentType: docType
        });
      }
      documents[docType] = { pages: pageInfos };
    }

    const updatedPdf = { ...pdf, documents, edited: false };
    setPdfFiles(prev => prev.map(p => p.id === pdfId ? updatedPdf : p));
    setSelectedPdf(updatedPdf);
    setLoading(false);
  };

  const rotatePage = async (docType: string, pageIdx: number, direction: 'left' | 'right') => {
    if (!selectedPdf) return;

    const document = selectedPdf.documents[docType];
    if (!document) return;

    const pages = [...document.pages];
    const page = pages[pageIdx];
    const newRotation = direction === 'left' ? (page.rotation - 90 + 360) % 360 : (page.rotation + 90) % 360;
    
    pages[pageIdx] = {
      ...page,
      rotation: newRotation,
      dataUrl: await generatePagePreview(selectedPdf.pdfDoc, page.index, newRotation)
    };

    const updatedPdf = {
      ...selectedPdf,
      documents: { ...selectedPdf.documents, [docType]: { pages } },
      edited: true
    };

    setSelectedPdf(updatedPdf);
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
    
    if (expandedPage?.index === page.index) {
      setExpandedPage(pages[pageIdx]);
    }
  };

  const generateFileName = (pdf: PdfFile, docType: string): string => {
    const cedula = pdf.cedulaNumber;
    
    switch(docType) {
      case 'cedula':
        return `${cedula} - cedula.pdf`;
      case 'rif':
        return `${cedula} - rif.pdf`;
      case 'titulo':
        return `${cedula} - titulos.pdf`;
      case 'constancia':
        return `${cedula} - constancia.pdf`;
      case 'curriculum':
        return `${cedula} - curriculum.pdf`;
      default:
        return `${cedula} - ${docType}.pdf`;
    }
  };

  const saveChanges = async () => {
    if (!selectedPdf) return;

    setLoading(true);
    const results: SplitResult[] = [];

    for (const docType of documentTypes.map(d => d.id)) {
      const doc = selectedPdf.documents[docType];
      if (!doc || doc.pages.length === 0) continue;

      const newPdf = await PDFDocument.create();
      doc.pages.sort((a: any, b: any) => a.index - b.index);
      
      for (const page of doc.pages) {
        const [copiedPage] = await newPdf.copyPages(selectedPdf.pdfDoc, [page.index]);
        copiedPage.setRotation(degrees(page.rotation));
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      // Convertir Uint8Array a ArrayBuffer estándar
      const buffer = pdfBytes.buffer.slice(0);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      
      results.push({
        name: generateFileName(selectedPdf, docType),
        blob,
        url: URL.createObjectURL(blob)
      });
    }

    results.sort((a, b) => a.name.localeCompare(b.name));

    const updatedPdf = { ...selectedPdf, splitResults: results };
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
    setSelectedPdf(null);
    setLoading(false);
  };

  const generateDocumentsForDownload = async (pdf: PdfFile) => {
    setLoading(true);
    
    const groups = identifyDocumentsByOrder(pdf.totalPages);
    const results: SplitResult[] = [];

    for (const [docType, pages] of Object.entries(groups)) {
      if ((pages as number[]).length === 0) continue;

      const newPdf = await PDFDocument.create();
      
      for (const pageIndex of pages as number[]) {
        const [copiedPage] = await newPdf.copyPages(pdf.pdfDoc, [pageIndex]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      // Convertir Uint8Array a ArrayBuffer estándar
      const buffer = pdfBytes.buffer.slice(0);
      const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
      
      results.push({
        name: generateFileName(pdf, docType),
        blob,
        url: URL.createObjectURL(blob)
      });
    }

    results.sort((a, b) => a.name.localeCompare(b.name));

    const updatedPdf = { ...pdf, splitResults: results };
    setPdfFiles(prev => prev.map(p => p.id === pdf.id ? updatedPdf : p));

    const zip = new JSZip();
    const folder = zip.folder(pdf.name.replace('.pdf', ''));
    results.forEach(r => folder?.file(r.name, r.blob));
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdf.name.replace('.pdf', '')}.zip`;
    a.click();
    
    setLoading(false);
  };

  const downloadSingle = (pdf: PdfFile) => {
    if (pdf.splitResults.length === 0) {
      generateDocumentsForDownload(pdf);
      return;
    }
    
    const zip = new JSZip();
    const folder = zip.folder(pdf.name.replace('.pdf', ''));
    pdf.splitResults.forEach(r => folder?.file(r.name, r.blob));
    
    zip.generateAsync({ type: 'blob' }).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdf.name.replace('.pdf', '')}.zip`;
      a.click();
    });
  };

  const downloadAll = async () => {
    const pdfsToDownload = pdfFiles.filter(p => p.splitResults.length > 0);
    const pdfsWithoutResults = pdfFiles.filter(p => p.splitResults.length === 0);
    
    if (pdfsWithoutResults.length > 0) {
      setLoading(true);
      
      for (const pdf of pdfsWithoutResults) {
        const groups = identifyDocumentsByOrder(pdf.totalPages);
        const results: SplitResult[] = [];

        for (const [docType, pages] of Object.entries(groups)) {
          if ((pages as number[]).length === 0) continue;

          const newPdf = await PDFDocument.create();
          
          for (const pageIndex of pages as number[]) {
            const [copiedPage] = await newPdf.copyPages(pdf.pdfDoc, [pageIndex]);
            newPdf.addPage(copiedPage);
          }

          const pdfBytes = await newPdf.save();
          // Convertir Uint8Array a ArrayBuffer estándar
          const buffer = pdfBytes.buffer.slice(0);
          const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
          
          results.push({
            name: generateFileName(pdf, docType),
            blob,
            url: URL.createObjectURL(blob)
          });
        }

        results.sort((a, b) => a.name.localeCompare(b.name));
        
        const updatedPdf = { ...pdf, splitResults: results };
        setPdfFiles(prev => prev.map(p => p.id === pdf.id ? updatedPdf : p));
        pdfsToDownload.push(updatedPdf);
      }
    }

    const zip = new JSZip();
    pdfsToDownload.forEach(pdf => {
      const folder = zip.folder(pdf.name.replace('.pdf', ''));
      pdf.splitResults.forEach(r => folder?.file(r.name, r.blob));
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todos_los_documentos.zip';
    a.click();
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay de arrastre - responsive */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-600 bg-opacity-20 z-50 flex items-center justify-center pointer-events-none p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 text-center max-w-sm w-full mx-auto">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📄</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Suelta los archivos aquí</h3>
            <p className="text-sm sm:text-base text-gray-600">Puedes soltar múltiples PDFs en cualquier parte</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Header - responsive */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Dividir PDFs en Documentos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Sube varios PDFs, ajusta la rotación y descarga los documentos organizados
          </p>

          {/* Uploader - responsive */}
          <FileUploader onFilesSelected={handleFilesSelected} />

          {/* Loading/Error messages - responsive */}
          {loading && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm sm:text-base">
              Procesando...
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Lista principal - responsive */}
          {!selectedPdf && pdfFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  PDFs ({pdfFiles.length})
                </h2>
                <button
                  onClick={downloadAll}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  📦 Descargar Todos ({pdfFiles.length})
                </button>
              </div>

              <div className="space-y-3">
                {pdfFiles.map(pdf => (
                  <div key={pdf.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Información del PDF - responsive */}
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-sm sm:text-base text-gray-800 break-all">
                            {pdf.name}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {pdf.totalPages} pág
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            Cédula: {pdf.cedulaNumber}
                          </span>
                          {pdf.edited && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Editado
                            </span>
                          )}
                          {pdf.splitResults.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              {pdf.splitResults.length} docs
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones - responsive */}
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => preparePreview(pdf.id)}
                          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => downloadSingle(pdf)}
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          Descargar
                        </button>
                        <button
                          onClick={() => removePdf(pdf.id)}
                          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vista de edición - responsive */}
          {selectedPdf && (
            <div className="mt-6">
              {/* Header de edición - responsive */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <button
                  onClick={() => setSelectedPdf(null)}
                  className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <span>←</span> Volver
                </button>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 break-all text-center sm:text-left">
                  Editando: {selectedPdf.name}
                </h2>
                <button
                  onClick={saveChanges}
                  disabled={loading}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              {/* Contenido de edición - responsive */}
              <div className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1">
                {documentTypes.map(docType => {
                  const doc = selectedPdf.documents[docType.id];
                  if (!doc?.pages?.length) return null;

                  return (
                    <div key={docType.id} className="border border-purple-200 rounded-lg p-3 sm:p-4 bg-purple-50">
                      <h3 className="text-sm sm:text-base font-semibold text-purple-800 mb-2 break-all">
                        {docType.name} ({doc.pages.length} pág) - {generateFileName(selectedPdf, docType.id)}
                      </h3>
                      <div className="space-y-2">
                        {doc.pages.map((page: any, idx: number) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-white">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              {/* Miniatura - responsive */}
                              <button
                                onClick={() => setExpandedPage(page)}
                                className="w-full sm:w-16 h-24 sm:h-20 border border-gray-300 rounded overflow-hidden bg-white flex-shrink-0 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer mx-auto sm:mx-0"
                              >
                                <iframe
                                  src={page.dataUrl}
                                  className="w-full h-full scale-[0.25] origin-top-left pointer-events-none"
                                  style={{ transform: 'scale(0.25)', width: '400%', height: '400%' }}
                                  title={`Página ${page.index + 1}`}
                                />
                              </button>
                              
                              {/* Información y controles - responsive */}
                              <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    P{page.index + 1}
                                  </span>
                                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                    {page.rotation}°
                                  </span>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => rotatePage(docType.id, idx, 'left')}
                                    className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                                  >
                                    ↺ Izquierda
                                  </button>
                                  <button
                                    onClick={() => rotatePage(docType.id, idx, 'right')}
                                    className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                                  >
                                    ↻ Derecha
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
              </div>
            </div>
          )}

          {/* Modal expandido - responsive */}
          {expandedPage && selectedPdf && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4"
              onClick={() => setExpandedPage(null)}
            >
              <div 
                className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Header del modal - responsive */}
                <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                      {selectedPdf.name} - Página {expandedPage.index + 1}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {documentTypes.find(d => d.id === expandedPage.documentType)?.name} - Rotación: {expandedPage.rotation}°
                    </p>
                  </div>
                  <button 
                    onClick={() => setExpandedPage(null)} 
                    className="text-xl sm:text-2xl font-bold text-gray-500 hover:text-gray-700 ml-2"
                  >
                    ×
                  </button>
                </div>
                
                {/* Contenido del modal - responsive */}
                <div className="flex-1 p-2 sm:p-4 bg-gray-100 flex items-center justify-center overflow-auto">
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
                    <iframe 
                      src={expandedPage.dataUrl} 
                      className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh]"
                      title={`Página ${expandedPage.index + 1} expandida`}
                    />
                  </div>
                </div>
                
                {/* Controles del modal - responsive */}
                <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      const doc = selectedPdf.documents[expandedPage.documentType];
                      const idx = doc?.pages.findIndex((p: any) => p.index === expandedPage.index);
                      if (idx !== -1) {
                        rotatePage(expandedPage.documentType, idx, 'left');
                      }
                    }}
                    className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">↺</span> Rotar Izquierda
                  </button>
                  <button
                    onClick={() => {
                      const doc = selectedPdf.documents[expandedPage.documentType];
                      const idx = doc?.pages.findIndex((p: any) => p.index === expandedPage.index);
                      if (idx !== -1) {
                        rotatePage(expandedPage.documentType, idx, 'right');
                      }
                    }}
                    className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">↻</span> Rotar Derecha
                  </button>
                  <button
                    onClick={() => setExpandedPage(null)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}