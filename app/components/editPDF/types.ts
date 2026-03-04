export interface AdditionalDocument {
  id: string;
  name: string;
  position: 'before' | 'after' | 'between';
  targetDocType?: string;
  file: File;
  blob?: Blob;
  url?: string;
  rotation: number;
  imageUrl?: string;
  pageCount?: number;
}

export interface PageInfo {
  index: number;
  rotation: number;
  imageUrl: string;
  documentType: string;
}

export interface SplitResult {
  name: string;
  blob: Blob;
  url: string;
}

export interface PdfFile {
  id: string;
  file: File;
  name: string;
  totalPages: number;
  pdfDoc: any;
  edited: boolean;
  documents: any;
  splitResults: SplitResult[];
  cedulaNumber: string;
  additionalDocs?: AdditionalDocument[];
}

export interface DocumentConfig {
  cedula: number;
  rif: number;
  tituloStart: number;
  tituloEnd: number;
  constancia: number;
  curriculumStart: number;
}

export interface DocumentType {
  id: string;
  name: string;
  fileName: string;
}

export interface NewDocumentState {
  position: 'before' | 'after' | 'between';
  targetDocType: string;
  name: string;
  file: File | null;
  rotation: number;
  previewUrl: string;
  pageCount: number;
}