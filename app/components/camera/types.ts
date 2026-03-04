export type DocumentType = 'cedula' | 'rif' | 'titulos' | 'constancia' | 'curriculum';

export interface DocumentPhoto {
  id: string;
  dataUrl: string;
  type: DocumentType;
  createdAt?: Date;
}

export interface UserData {
  nombreApellido: string;
  numeroCedula: string;
  tipoCargo: string;
}

export interface DocumentTypeInfo {
  id: DocumentType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface CropArea {
  unit: '%';
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface ExportOptions {
  sendToWhatsApp: boolean;
  format: 'zip' | 'individual';
}