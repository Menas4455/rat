'use client';

import { UserData } from '../types';
import { motion } from 'framer-motion';
import { IdentificationIcon, UserIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface UserFormProps {
  userData: UserData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: UserData) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ userData, onSubmit, onChange }) => {
  const [cedulaError, setCedulaError] = useState('');

  const handleCedulaChange = (value: string) => {

    const cleaned = value.replace(/[^\dV-]/g, '');
    
    if (cleaned) {
      const parts = cleaned.split('-');
      if (parts.length > 1) {
        if (!/^\d+$/.test(parts[1])) {
          setCedulaError('Solo se permiten números después del guión');
          return;
        }
      } else {
        if (!/^\d+$/.test(cleaned)) {
          setCedulaError('Solo se permiten números');
          return;
        }
      }
    }
    
    setCedulaError('');
    onChange({...userData, numeroCedula: cleaned});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl"
          >
            <span className="text-4xl">📱</span>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Document Scanner
          </h1>
          <p className="text-gray-600">Ingresa tus datos para comenzar</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <UserIcon className="w-4 h-4 text-gray-400" />
                Nombre y Apellido <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={userData.nombreApellido}
                onChange={(e) => onChange({...userData, nombreApellido: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                placeholder="Ej: Juan Pérez"
              />
              <p className="text-xs text-gray-400 mt-1">Campo opcional</p>
            </div>

            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <IdentificationIcon className="w-4 h-4 text-gray-400" />
                Número de Cédula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={userData.numeroCedula}
                onChange={(e) => handleCedulaChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all ${
                  cedulaError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="V-12345678 o 12345678"
              />
              {cedulaError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500 mt-1 flex items-center gap-1"
                >
                  <span>⚠️</span> {cedulaError}
                </motion.p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Solo números, formato V-12345678 o 12345678
              </p>
            </div>

            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                Tipo de Cargo <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={userData.tipoCargo}
                onChange={(e) => onChange({...userData, tipoCargo: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all"
                placeholder="Ej: Gerente"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!userData.numeroCedula || cedulaError !== ''}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
            >
              Comenzar a escanear 📸
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};