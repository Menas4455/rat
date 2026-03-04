'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { PdfFile } from './types';
import { DOCUMENT_TYPES } from './constants';
import { usePdfProcessing } from './hooks/usePdfProcessing';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { extractCedulaFromFilename } from './utils/filenameHelpers';
import { downloadZip } from './utils/fileHelpers';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { DragOverlay } from './components/DragOverlay';
import FileUploader from './FileUploader';
import { PdfList } from './components/PdfList';
import { PdfEditor } from './components/PdfEditor';
import { AddDocumentModal } from './components/AddDocumentModal';
import { ExpandedPageModal } from './components/ExpandedPageModal';
import { LoadingProgress } from '../ui/LoadingProgress';

export default function PdfSplitter() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [expandedPage, setExpandedPage] = useState<any>(null);
  
  const { 
    loading, 
    progress, 
    loadingMessage,
    error, 
    setError, 
    setLoading, 
    preparePreview, 
    rotatePage, 
    saveChanges 
  } = usePdfProcessing();

  const handleFilesDrop = async (files: File[]) => {
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
          cedulaNumber,
          additionalDocs: []
        });
      }
      setPdfFiles(prev => [...prev, ...newFiles]);
    } catch (err) {
      setError('Error al leer PDFs');
    } finally {
      setLoading(false);
    }
  };

  const { isDragging } = useDragAndDrop({
    onFilesDrop: handleFilesDrop,
    onError: setError
  });

  const handleEdit = async (pdfId: string) => {
    const pdf = pdfFiles.find(p => p.id === pdfId);
    if (!pdf) return;
    
    const updatedPdf = await preparePreview(pdf);
    setPdfFiles(prev => prev.map(p => p.id === pdfId ? updatedPdf : p));
    setSelectedPdf(updatedPdf);
  };

  const handleRotatePage = async (
    docType: string, 
    pageIdx: number, 
    direction: 'left' | 'right'
  ) => {
    if (!selectedPdf) return;
    
    const updatedPdf = await rotatePage(selectedPdf, docType, pageIdx, direction);
    setSelectedPdf(updatedPdf);
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
    
    if (expandedPage) {
      const updatedPage = updatedPdf.documents[docType]?.pages[pageIdx];
      if (updatedPage) {
        setExpandedPage(updatedPage);
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedPdf) return;
    
    const results = await saveChanges(selectedPdf);
    const updatedPdf = { ...selectedPdf, splitResults: results };
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
    setSelectedPdf(null);
  };

  const handleDownloadSingle = async (pdf: PdfFile) => {
    if (pdf.splitResults.length === 0) {
      const results = await saveChanges(pdf);
      const updatedPdf = { ...pdf, splitResults: results };
      setPdfFiles(prev => prev.map(p => p.id === pdf.id ? updatedPdf : p));
      await downloadZip([updatedPdf], `${pdf.name.replace('.pdf', '')}.zip`);
    } else {
      await downloadZip([pdf], `${pdf.name.replace('.pdf', '')}.zip`);
    }
  };

  const handleDownloadAll = async () => {
    const pdfsWithResults = pdfFiles.filter(p => p.splitResults.length > 0);
    const pdfsWithoutResults = pdfFiles.filter(p => p.splitResults.length === 0);
    
    if (pdfsWithoutResults.length > 0) {
      setLoading(true);
      try {
        for (const pdf of pdfsWithoutResults) {
          const results = await saveChanges(pdf);
          const updatedPdf = { ...pdf, splitResults: results };
          setPdfFiles(prev => prev.map(p => p.id === pdf.id ? updatedPdf : p));
          pdfsWithResults.push(updatedPdf);
        }
      } finally {
        setLoading(false);
      }
    }
    
    await downloadZip(pdfsWithResults, 'todos_los_documentos.zip');
  };

  const handleRemovePdf = (id: string) => {
    setPdfFiles(prev => prev.filter(p => p.id !== id));
    if (selectedPdf?.id === id) setSelectedPdf(null);
  };

  const handleAddDocument = (newDoc: any) => {
    if (!selectedPdf) return;
    const updatedPdf = {
      ...selectedPdf,
      additionalDocs: [...(selectedPdf.additionalDocs || []), newDoc],
      edited: true
    };
    setSelectedPdf(updatedPdf);
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
  };

  const handleRemoveAdditionalDoc = (docId: string) => {
    if (!selectedPdf) return;
    const updatedDocs = selectedPdf.additionalDocs?.filter(d => d.id !== docId);
    const updatedPdf = { ...selectedPdf, additionalDocs: updatedDocs, edited: true };
    setSelectedPdf(updatedPdf);
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
  };

  const handleRotateAdditionalDoc = async (docId: string, rotation: number) => {
    if (!selectedPdf) return;
    const updatedDocs = selectedPdf.additionalDocs?.map(d => 
      d.id === docId ? { ...d, rotation } : d
    );
    const updatedPdf = { ...selectedPdf, additionalDocs: updatedDocs, edited: true };
    setSelectedPdf(updatedPdf);
    setPdfFiles(prev => prev.map(p => p.id === selectedPdf.id ? updatedPdf : p));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DragOverlay isDragging={isDragging} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 relative">
          <Header />

          {!selectedPdf && <FileUploader onFilesSelected={handleFilesDrop} />}

          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4">
                <LoadingProgress 
                  progress={progress} 
                  text={loadingMessage}
                  variant={progress === 100 ? 'success' : 'default'}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm sm:text-base flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {!selectedPdf && pdfFiles.length > 0 && (
            <PdfList
              pdfFiles={pdfFiles}
              onEdit={handleEdit}
              onDownload={handleDownloadSingle}
              onRemove={handleRemovePdf}
              onDownloadAll={handleDownloadAll}
            />
          )}

          {selectedPdf && (
            <div className="fixed inset-0 bg-white z-40 overflow-auto">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <PdfEditor
                  pdf={selectedPdf}
                  documentTypes={DOCUMENT_TYPES}
                  onBack={() => setSelectedPdf(null)}
                  onSave={handleSaveChanges}
                  onAddDocument={() => setShowAddDocumentModal(true)}
                  onRotatePage={handleRotatePage}
                  onExpandPage={setExpandedPage}
                  onRemoveAdditionalDoc={handleRemoveAdditionalDoc}
                  onRotateAdditionalDoc={handleRotateAdditionalDoc}
                  loading={loading}
                />
              </div>
            </div>
          )}

          <AddDocumentModal
            isOpen={showAddDocumentModal}
            onClose={() => setShowAddDocumentModal(false)}
            onSave={handleAddDocument}
            documentTypes={DOCUMENT_TYPES}
          />

          <ExpandedPageModal
            page={expandedPage}
            pdf={selectedPdf}
            onClose={() => setExpandedPage(null)}
            onRotate={handleRotatePage}
          />

          {!selectedPdf && <Footer />}
        </div>
      </div>
    </div>
  );
}