interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Dividir PDFs en Documentos" 
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl font-bold">M</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          {title}
        </h1>
      </div>
      <p className="text-sm sm:text-base text-gray-600">
        by <span className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Ing. Michael Mena
        </span> — Sube varios PDFs, ajusta la rotación y descarga los documentos organizados
      </p>
    </div>
  );
};