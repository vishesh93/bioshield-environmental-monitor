import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setIsInstallable(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
  };

  // Show install banner when installable and not dismissed
  const showBanner = isInstallable && showInstallBanner;
  
  // Always show a download button, but with different styles
  return (
    <>
      {/* Install Banner - shows when installable */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
          >
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-xl shadow-2xl text-white">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Install BioShield App</h3>
                    <p className="text-sm text-white/90">Get the full mobile experience!</p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="bg-white/20 hover:bg-white/30 p-1 rounded-full transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInstallClick}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Install App
                </motion.button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-3 text-white/80 hover:text-white transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Download Button - always visible */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={isInstallable ? handleInstallClick : () => {
            // For iOS or when PWA prompt is not available, show instructions
            alert('To install this app:\n\n1. Open this page in your mobile browser\n2. Tap the Share button\n3. Select "Add to Home Screen"\n\nOr use your browser\'s install option from the menu.');
          }}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 flex items-center justify-center gap-2"
          title="Download App"
        >
          <Download size={20} />
        </motion.button>
      </motion.div>
    </>
  );
};

export default PWAInstall;