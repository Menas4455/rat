import JSZip from 'jszip';
import { SplitResult, PdfFile } from '../types';

export const downloadZip = async (
  pdfs: PdfFile[],
  fileName: string = 'documentos.zip'
): Promise<void> => {
  const zip = new JSZip();
  
  pdfs.forEach(pdf => {
    const folder = zip.folder(pdf.name.replace('.pdf', ''));
    pdf.splitResults.forEach(r => folder?.file(r.name, r.blob));
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadSinglePdf = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};