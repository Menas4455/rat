import { DocumentType } from './types';

export const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'cedula', name: 'Cédula', fileName: 'cedula' },
  { id: 'rif', name: 'RIF', fileName: 'rif' },
  { id: 'titulo', name: 'Títulos', fileName: 'titulos' },
  { id: 'constancia', name: 'Constancia', fileName: 'constancia' },
  { id: 'curriculum', name: 'Curriculum', fileName: 'curriculum' }
];

export const CEDULA_PATTERNS = [
  /(\d{1,2}\.?\d{3}\.?\d{3,4})/,
  /V[-\s]?(\d{1,2}\.?\d{3}\.?\d{3,4})/i,
  /(\d{7,8})/,
];

export const ROTATION_STEP = 90;
export const MAX_TITULO_PAGES = 4;
export const PREVIEW_SCALE = 1.5;
export const IMAGE_QUALITY = 0.8;