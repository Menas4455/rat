import { PDFDocument, degrees } from 'pdf-lib';

export const convertPdfPageToImage = async (
  pdfDoc: any, 
  pageIndex: number, 
  rotation: number = 0
): Promise<string> => {
  try {
    const singlePagePdf = await PDFDocument.create();
    const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex]);
    copiedPage.setRotation(degrees(rotation));
    singlePagePdf.addPage(copiedPage);
    
    const pdfBytes = await singlePagePdf.save();
    const blob = new Blob([pdfBytes.slice()], { type: 'application/pdf' });
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const blobUrl = URL.createObjectURL(blob);
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        // @ts-ignore
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        pdfjsLib.getDocument(blobUrl).promise.then((pdf: any) => {
          pdf.getPage(1).then((page: any) => {
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };
            
            page.render(renderContext).promise.then(() => {
              const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
              URL.revokeObjectURL(blobUrl);
              resolve(imageUrl);
            });
          });
        });
      };
      document.body.appendChild(script);
    });
  } catch (error) {
    console.error('Error convirtiendo página a imagen:', error);
    return '';
  }
};

export const imageToPdf = async (file: File): Promise<Uint8Array> => {
  return new Promise(async (resolve, reject) => {
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = async () => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([img.width, img.height]);
        const imgBytes = await file.arrayBuffer();
        
        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imgBytes);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(imgBytes);
        } else {
          reject(new Error('Formato de imagen no soportado'));
          return;
        }
        
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
        
        const pdfBytes = await pdfDoc.save();
        URL.revokeObjectURL(url);
        resolve(pdfBytes);
      };
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

export const identifyDocumentsByOrder = (totalPages: number) => {
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