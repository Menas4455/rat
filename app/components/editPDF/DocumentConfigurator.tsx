'use client';

import { useState } from 'react';

interface DocumentConfig {
  cedula: number;
  rif: number;
  tituloStart: number;
  tituloEnd: number;
  constancia: number;
  curriculumStart: number;
}

interface ConfiguratorProps {
  totalPages: number;
  onSave: (config: DocumentConfig) => void;
  onCancel: () => void;
}

export default function DocumentConfigurator({ totalPages, onSave, onCancel }: ConfiguratorProps) {
  const [config, setConfig] = useState<DocumentConfig>({
    cedula: 1,
    rif: 2,
    tituloStart: 3,
    tituloEnd: Math.min(4, totalPages - 2),
    constancia: Math.min(5, totalPages - 1),
    curriculumStart: Math.min(6, totalPages),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Configurar Orden de Documentos
        </h2>
        <p className="text-gray-600 mb-6">
          El PDF tiene {totalPages} páginas. Ajusta el orden de los documentos según corresponda:
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula de Identidad (Página):
              </label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={config.cedula}
                onChange={(e) => setConfig({ ...config, cedula: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RIF (Página):
              </label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={config.rif}
                onChange={(e) => setConfig({ ...config, rif: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Títulos/Certificaciones - Inicio:
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={config.tituloStart}
                  onChange={(e) => setConfig({ ...config, tituloStart: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Títulos/Certificaciones - Fin:
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={config.tituloEnd}
                  onChange={(e) => setConfig({ ...config, tituloEnd: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Constancia de Servicios (Página):
              </label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={config.constancia}
                onChange={(e) => setConfig({ ...config, constancia: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curriculum (Desde página):
              </label>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={config.curriculumStart}
                onChange={(e) => setConfig({ ...config, curriculumStart: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                El curriculum incluirá desde esta página hasta el final del documento
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Aplicar Configuración
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
