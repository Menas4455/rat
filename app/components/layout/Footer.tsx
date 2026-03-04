export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
      <p>
        © {currentYear} <span className="font-semibold text-gray-700">Ing. Michael Mena</span>. 
        Todos los derechos reservados.
      </p>
      <p className="mt-1 text-xs">
        Desarrollado con ❤️ para facilitar la gestión de documentos PDF
      </p>
    </footer>
  );
};