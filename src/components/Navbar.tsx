import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, BarChart3, Home, Activity, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Android-style status bar */}
      <div className="fixed top-0 left-0 right-0 z-40 h-1 bg-gradient-to-r from-green-400 to-blue-500" />
      
      {/* Main Navigation */}
      <nav className="fixed top-1 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3 relative z-10 h-16"
            >
              <motion.div 
                className="relative overflow-hidden h-10 w-10 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 0px rgba(34, 197, 94, 0.7))',
                    'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))',
                    'drop-shadow(0 0 0px rgba(34, 197, 94, 0.7))'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-b from-gray-700 to-gray-800 relative">
                  {/* Shield icon */}
                  <div className="absolute inset-0 flex items-center justify-center z-30">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Base water background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400" />
                  
                  {/* First wave */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-cyan-500 to-blue-400"
                    animate={{
                      clipPath: [
                        'polygon(0 50%, 25% 45%, 50% 50%, 75% 40%, 100% 50%, 100% 100%, 0% 100%)',
                        'polygon(0 45%, 25% 50%, 50% 40%, 75% 50%, 100% 45%, 100% 100%, 0% 100%)',
                        'polygon(0 50%, 25% 45%, 50% 50%, 75% 40%, 100% 50%, 100% 100%, 0% 100%)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Second wave */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-blue-500 to-cyan-400 opacity-80"
                    animate={{
                      clipPath: [
                        'polygon(0 60%, 50% 55%, 100% 60%, 100% 100%, 0% 100%)',
                        'polygon(0 55%, 50% 60%, 100% 55%, 100% 100%, 0% 100%)',
                        'polygon(0 60%, 50% 55%, 100% 60%, 100% 100%, 0% 100%)'
                      ]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                </div>
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                BioShield
              </motion.span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        className={`
                          flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
                          transition-all duration-300 shadow-sm
                          ${isActive
                            ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md'
                          }
                        `}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMenu}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={closeMenu}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-17 left-0 z-50 w-80 h-full bg-white dark:bg-gray-900 shadow-2xl md:hidden"
            >
              <div className="p-6 space-y-6">
                {/* App Info */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        BioShield
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Environmental Monitor</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="space-y-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={closeMenu}
                          className={`
                            flex items-center space-x-4 px-4 py-4 rounded-xl text-lg font-medium
                            transition-all duration-300 shadow-sm hover:shadow-md
                            ${isActive
                              ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <Icon size={24} />
                          <span>{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="ml-auto w-2 h-2 bg-white rounded-full"
                            />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* App Version */}
                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <p className="text-xs text-gray-400">Version 1.0.0</p>
                  <p className="text-xs text-gray-400">Environmental Protection System</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;