import { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { PdfFile, SplitResult } from '../types';
import { convertPdfPageToImage, identifyDocumentsByOrder } from '../utils/pdfHelpers';
import { generateFileName } from '../utils/filenameHelpers';

export const usePdfProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');

  const preparePreview = async (pdf: PdfFile): Promise<PdfFile> => {
    setLoading(true);
    setProgress(0);
    setLoadingMessage('Preparando vista previa...');
    
    try {
      const groups = identifyDocumentsByOrder(pdf.totalPages);
      const documents: any = {};
      
      const allPages = Object.values(groups).flat() as number[];
      let processedPages = 0;

      for (const [docType, pages] of Object.entries(groups)) {
        const pageInfos = [];
        for (const pageIndex of pages as number[]) {
          setLoadingMessage(`Procesando página ${pageIndex + 1} de ${pdf.totalPages}...`);
          
          pageInfos.push({
            index: pageIndex,
            rotation: 0,
            imageUrl: await convertPdfPageToImage(pdf.pdfDoc, pageIndex, 0),
            documentType: docType
          });
          
          processedPages++;
          setProgress(Math.round((processedPages / allPages.length) * 100));
        }
        documents[docType] = { pages: pageInfos };
      }

      return { ...pdf, documents, edited: false };
    } catch (err) {
      setError('Error al preparar la vista previa');
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const rotatePage = async (
    pdf: PdfFile,
    docType: string,
    pageIdx: number,
    direction: 'left' | 'right'
  ): Promise<PdfFile> => {
    setLoading(true);
    setProgress(50);
    setLoadingMessage('Aplicando rotación...');
    
    try {
      const document = pdf.documents[docType];
      if (!document) return pdf;

      const pages = [...document.pages];
      const page = pages[pageIdx];
      const newRotation = direction === 'left' 
        ? (page.rotation - 90 + 360) % 360 
        : (page.rotation + 90) % 360;
      
      pages[pageIdx] = {
        ...page,
        rotation: newRotation,
        imageUrl: await convertPdfPageToImage(pdf.pdfDoc, page.index, newRotation)
      };

      setProgress(100);
      
      return {
        ...pdf,
        documents: { ...pdf.documents, [docType]: { pages } },
        edited: true
      };
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }
  };

  const saveChanges = async (pdf: PdfFile): Promise<SplitResult[]> => {
    setLoading(true);
    setProgress(0);
    setLoadingMessage('Guardando cambios...');
    
    try {
      const results: SplitResult[] = [];
      const totalDocs = Object.keys(pdf.documents).length + (pdf.additionalDocs?.length || 0);
      let processedDocs = 0;

      for (const docType of ['cedula', 'rif', 'titulo', 'constancia', 'curriculum']) {
        const doc = pdf.documents[docType];
        if (!doc || doc.pages.length === 0) continue;

        setLoadingMessage(`Procesando ${docType}...`);
        
        const newPdf = await PDFDocument.create();
        doc.pages.sort((a: any, b: any) => a.index - b.index);
        
        for (const page of doc.pages) {
          const [copiedPage] = await newPdf.copyPages(pdf.pdfDoc, [page.index]);
          copiedPage.setRotation(degrees(page.rotation));
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
        
        results.push({
          name: generateFileName(pdf, docType),
          blob,
          url: URL.createObjectURL(blob)
        });
        
        processedDocs++;
        setProgress(Math.round((processedDocs / totalDocs) * 100));
      }

      if (pdf.additionalDocs) {
        for (const additionalDoc of pdf.additionalDocs) {
          setLoadingMessage(`Procesando ${additionalDoc.name}...`);
          
          const arrayBuffer = await additionalDoc.file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          
          if (additionalDoc.rotation !== 0) {
            const newPdf = await PDFDocument.create();
            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
              const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
              copiedPage.setRotation(degrees(additionalDoc.rotation));
              newPdf.addPage(copiedPage);
            }
            const rotatedBytes = await newPdf.save();
            const blob = new Blob([rotatedBytes.slice()], { type: 'application/pdf' });
            results.push({
              name: generateFileName(pdf, '', additionalDoc.name),
              blob,
              url: URL.createObjectURL(blob)
            });
          } else {
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            results.push({
              name: generateFileName(pdf, '', additionalDoc.name),
              blob,
              url: URL.createObjectURL(blob)
            });
          }
          
          processedDocs++;
          setProgress(Math.round((processedDocs / totalDocs) * 100));
        }
      }

      results.sort((a, b) => a.name.localeCompare(b.name));
      return results;
    } catch (err) {
      setError('Error al guardar los cambios');
      throw err;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return {
    loading,
    progress,
    loadingMessage,
    error,
    setError,
    setLoading,
    preparePreview,
    rotatePage,
    saveChanges
  };
};