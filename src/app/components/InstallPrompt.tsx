import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';

export const InstallPrompt: React.FC = () => {
  const { showInstallPrompt, dismissInstallPrompt } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      dismissInstallPrompt();
    }
  };

  if (!showInstallPrompt || !isInstallable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50"
      >
        <div className="bg-card border-2 border-primary rounded-2xl shadow-2xl p-4">
          <button
            onClick={dismissInstallPrompt}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-primary-foreground" />
            </div>
            
            <div className="flex-1 pr-4">
              <h3 className="font-bold text-lg mb-1">Install FlowDesk</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Install FlowDesk on your device for the best experience!
              </p>
              
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="flex-1">
                  Install
                </Button>
                <Button onClick={dismissInstallPrompt} variant="outline" size="sm">
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
