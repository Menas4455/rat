interface DragOverlayProps {
  isDragging: boolean;
}

export const DragOverlay: React.FC<DragOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 bg-blue-600 bg-opacity-20 z-50 flex items-center justify-center pointer-events-none p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 text-center max-w-sm w-full mx-auto">
        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📄</div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Suelta los archivos aquí
        </h3>
        <p className="text-sm sm:text-base text-gray-600">
          Puedes soltar múltiples PDFs en cualquier parte
        </p>
      </div>
    </div>
  );
};