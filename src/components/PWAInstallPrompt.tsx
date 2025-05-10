
import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isPwaInstalled } from '@/utils/pwaUtils';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from '@/components/ui/motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallPromptProps {
  onClose: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if already installed
    if (isPwaInstalled()) {
      setIsVisible(false);
      return;
    }

    // Get the stored install prompt
    const storedPrompt = window.deferredPromptEvent;
    if (storedPrompt) {
      setDeferredPrompt(storedPrompt);
    } else {
      // If no prompt is available, don't show the component
      setIsVisible(false);
    }

    return () => {
      // Cleanup
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the prompt
      setDeferredPrompt(null);
      window.deferredPromptEvent = null;
      
      // Close the prompt component
      handleClose();
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 right-4 z-50"
    >
      <Card className="border border-fitness-orange/20 bg-fitness-darkGray/95 backdrop-blur-sm">
        <button 
          onClick={handleClose} 
          className="absolute right-2 top-2 p-1 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
        
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center">
            <div className="mr-4 flex-shrink-0 bg-fitness-orange/10 p-3 rounded-full">
              <Smartphone className="h-6 w-6 text-fitness-orange" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Instale o aplicativo Mais Saúde</h3>
              <p className="text-sm text-gray-300">
                Acesse rapidamente e treine mesmo offline
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex gap-3">
            <Button 
              onClick={handleInstall}
              className="flex-1 bg-fitness-orange hover:bg-fitness-orange/90"
            >
              <Download className="mr-2 h-4 w-4" /> Instalar App
            </Button>
            <Button 
              onClick={handleClose}
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Agora não
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PWAInstallPrompt;
