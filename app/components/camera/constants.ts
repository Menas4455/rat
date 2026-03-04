import { DocumentTypeInfo } from './types';

export const DOCUMENT_TYPES: DocumentTypeInfo[] = [
  {
    id: 'cedula',
    label: 'CÉDULA',
    icon: '🆔',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Documento de identidad'
  },
  {
    id: 'rif',
    label: 'RIF',
    icon: '📋',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Registro de información fiscal'
  },
  {
    id: 'titulos',
    label: 'TÍTULOS',
    icon: '🎓',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Títulos académicos'
  },
  {
    id: 'constancia',
    label: 'CONSTANCIA',
    icon: '📄',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Constancia de trabajo/estudio'
  },
  {
    id: 'curriculum',
    label: 'CURRICULUM',
    icon: '📑',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Hoja de vida'
  }
];

export const DOCUMENT_LABELS: Record<string, string> = {
  cedula: 'CÉDULA',
  rif: 'RIF',
  titulos: 'TÍTULOS',
  constancia: 'CONSTANCIA',
  curriculum: 'CURRICULUM'
};

export const DOCUMENT_ICONS: Record<string, string> = {
  cedula: '🆔',
  rif: '📋',
  titulos: '🎓',
  constancia: '📄',
  curriculum: '📑'
};

export const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';