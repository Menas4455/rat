'use client';

import { DocumentPhoto, DocumentType } from '../types';
import { DOCUMENT_TYPES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface DocumentGridProps {
  photos: DocumentPhoto[];
  documentType: DocumentType;
  onAddPhoto: () => void;
  onDeletePhoto: (id: string) => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  photos,
  documentType,
  onAddPhoto,
  onDeletePhoto
}) => {
  const typePhotos = photos.filter(p => p.type === documentType);
  const docInfo = DOCUMENT_TYPES.find(d => d.id === documentType)!;

  return (
    <div className="p-4 pb-24">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <AnimatePresence>
          {typePhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="relative group aspect-square"
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-gray-200 shadow-md group-hover:shadow-xl transition-all">
                <img
                  src={photo.dataUrl}
                  alt={`${docInfo.label}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDeletePhoto(photo.id)}
                className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
              >
                <TrashIcon className="w-4 h-4" />
              </motion.button>

              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-xs px-2 py-1 rounded-full ${docInfo.bgColor} ${docInfo.color} font-medium`}>
                  {docInfo.icon} {docInfo.label}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddPhoto}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <PlusIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
          <span className="text-xs text-gray-500 group-hover:text-blue-500 mt-1">
            Agregar
          </span>
        </motion.button>
      </div>

      {typePhotos.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-400 text-sm">
            No hay fotos de {docInfo.label.toLowerCase()}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Haz clic en el botón "+" para agregar
          </p>
        </motion.div>
      )}
    </div>
  );
};