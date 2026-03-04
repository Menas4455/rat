'use client';

import { UserData, DocumentType } from '../types';
import { DOCUMENT_TYPES } from '../constants';
import { motion } from 'framer-motion';
import { HomeIcon } from '@heroicons/react/24/outline';

interface CameraHeaderProps {
  userData: UserData;
  currentDocType: DocumentType;
  totalPhotos: number;
  onDocTypeClick: () => void;
  onHomeClick: () => void;
}

export const CameraHeader: React.FC<CameraHeaderProps> = ({
  userData,
  currentDocType,
  totalPhotos,
  onDocTypeClick,
  onHomeClick
}) => {
  const currentDoc = DOCUMENT_TYPES.find(d => d.id === currentDocType)!;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-10 border-b border-gray-200"
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-800 text-sm truncate">
              {userData.nombreApellido}
            </h2>
            <p className="text-xs text-gray-500">{userData.numeroCedula}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDocTypeClick}
            className={`${currentDoc.bgColor} px-4 py-2 rounded-full flex items-center gap-2 mx-2`}
          >
            <span className={`${currentDoc.color} font-medium text-sm flex items-center gap-1`}>
              <span>{currentDoc.icon}</span>
              <span className="hidden sm:inline">{currentDoc.label}</span>
            </span>
            <span className={`${currentDoc.color} text-xs`}>▼</span>
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-md">
                {totalPhotos} {totalPhotos === 1 ? 'foto' : 'fotos'}
              </span>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onHomeClick}
              className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-all"
              title="Volver al inicio"
            >
              <HomeIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};