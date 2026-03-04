'use client';

import { motion } from 'framer-motion';
import { DocumentArrowDownIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

interface ExportDialogProps {
  totalPhotos: number;
  onExportLocal: () => void;
  onExportWhatsApp: () => void;
  onClose: () => void;
  isGenerating: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  totalPhotos,
  onExportLocal,
  onExportWhatsApp,
  onClose,
  isGenerating
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-800">
          ¿Cómo quieres exportar?
        </h3>
        <p className="text-gray-500 text-center mb-6 text-sm">
          Tienes <span className="font-bold text-blue-600">{totalPhotos}</span> {totalPhotos === 1 ? 'foto' : 'fotos'} para exportar
        </p>
        
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportLocal}
            disabled={isGenerating}
            className="w-full flex items-center gap-4 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <DocumentArrowDownIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Solo guardar</p>
              <p className="text-sm text-gray-500">Descargar ZIP localmente</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExportWhatsApp}
            disabled={isGenerating}
            className="w-full flex items-center gap-4 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Guardar y enviar</p>
              <p className="text-sm text-gray-500">Enviar a WhatsApp (opcion en produccion) </p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full p-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancelar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};