import { CEDULA_PATTERNS } from '../constants';
import { PdfFile } from '../types';

export const extractCedulaFromFilename = (filename: string): string => {
  for (const pattern of CEDULA_PATTERNS) {
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

export const generateFileName = (
  pdf: PdfFile, 
  docType: string, 
  additionalName?: string
): string => {
  const cedula = pdf.cedulaNumber;
  if (additionalName) {
    return `${cedula} - ${additionalName}.pdf`;
  }
  
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