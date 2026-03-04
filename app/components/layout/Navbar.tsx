'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentIcon, CameraIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  color: string;
}

const navItems: NavItem[] = [
  {
    name: 'Dividir PDF',
    path: '/',
    icon: <DocumentIcon className="w-5 h-5" />,
    color: 'from-blue-600 to-purple-600'
  },
  {
    name: 'Escanear Documentos',
    path: '/camera',
    icon: <CameraIcon className="w-5 h-5" />,
    color: 'from-green-600 to-teal-600'
  }
];

export const Navbar = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const activeItem = navItems.find(item => item.path === pathname);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <Link href="/" className="flex items-center gap-2 group">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className={`w-8 h-8 bg-gradient-to-br ${
                    activeItem?.color || 'from-blue-600 to-purple-600'
                  } rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg`}
                >
                  <span className="text-white font-bold text-lg">M</span>
                </motion.div>
                <span className="font-semibold text-gray-800 hidden sm:block">
                  Ing. Michael Mena
                </span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                  >
                    <Link
                      href={item.path}
                      className={`
                        relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                        flex items-center gap-2 group
                        ${isActive 
                          ? `text-${item.color.split(' ')[0].replace('from-', '')}-600` 
                          : 'text-gray-600 hover:text-gray-900'
                        }
                      `}
                    >
                      <motion.span
                        animate={{
                          scale: isActive ? 1.1 : 1,
                        }}
                        className={`transition-colors ${
                          isActive ? `text-${item.color.split(' ')[0].replace('from-', '')}-600` : ''
                        }`}
                      >
                        {item.icon}
                      </motion.span>
                      <span>{item.name}</span>

                      {isActive && (
                        <motion.div
                          layoutId="navbar-active"
                          className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>

                    {hoveredPath === item.path && !isActive && (
                      <motion.div
                        layoutId="navbar-hover"
                        className="absolute inset-0 bg-gray-100 rounded-xl -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bars3Icon className="w-6 h-6 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.path}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                          transition-all duration-200
                          ${isActive 
                            ? `bg-gradient-to-r ${item.color} bg-opacity-10 text-${item.color.split(' ')[0].replace('from-', '')}-600 border border-${item.color.split(' ')[0].replace('from-', '')}-200` 
                            : 'text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <motion.span
                          whileHover={{ scale: 1.1 }}
                          className={isActive ? `text-${item.color.split(' ')[0].replace('from-', '')}-600` : 'text-gray-500'}
                        >
                          {item.icon}
                        </motion.span>
                        <span>{item.name}</span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`ml-auto w-1.5 h-1.5 bg-gradient-to-r ${item.color} rounded-full`}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};