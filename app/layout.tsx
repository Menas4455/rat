import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/app/components/layout/Navbar';
import { PageTransition } from '@/app/components/ui/PageTransition';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daniel Valles - PDF Tools',
  description: 'Aplicación profesional para dividir PDFs y escanear documentos',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <PageTransition>
          <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-16">
            {children}
          </main>
        </PageTransition>
      </body>
    </html>
  );
}