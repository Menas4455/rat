'use client';

import { DocumentType } from '../types';
import { DOCUMENT_TYPES } from '../constants';
import { motion } from 'framer-motion';

interface DocTypeSelectorProps {
  currentType: DocumentType;
  photosByType: Record<string, number>;
  onSelect: (type: DocumentType) => void;
  onClose: () => void;
}

export const DocTypeSelector: React.FC<DocTypeSelectorProps> = ({
  currentType,
  photosByType,
  onSelect,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-20 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="bg-white w-full rounded-t-3xl p-4 max-h-[80vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Seleccionar documento</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2">
          {DOCUMENT_TYPES.map((type) => {
            const count = photosByType[type.id] || 0;
            const isActive = currentType === type.id;
            
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelect(type.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-500 shadow-md' 
                    : 'bg-gray-50 border border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="text-left">
                    <span className={`font-medium ${type.color}`}>{type.label}</span>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
                {count > 0 && (
                  <span className={`${type.bgColor} ${type.color} px-3 py-1 rounded-full text-sm font-medium`}>
                    {count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};