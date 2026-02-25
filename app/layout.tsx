import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Splitter - Dividir Documentos",
  description: "Divide automáticamente PDFs en documentos separados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
