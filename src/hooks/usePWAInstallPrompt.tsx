
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';
import { usePWAInstall } from './usePWAInstall';
import { toast } from '@/lib/toast-wrapper';

export const usePWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const isMobile = useIsMobile();
  const { canInstall, showPrompt: showPWAPrompt, closePrompt } = usePWAInstall();
  
  useEffect(() => {
    // Only show the prompt on mobile devices and if the app can be installed
    if (isMobile && canInstall) {
      // Add a slight delay before showing the prompt
      const timer = setTimeout(() => {
        const promptShown = showPWAPrompt();
        setShowPrompt(promptShown);
        
        if (!promptShown && canInstall) {
          // If couldn't show the prompt but installation is possible, show a toast
          toast.info('Você pode instalar este app no seu celular');
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    return () => {};
  }, [isMobile, canInstall, showPWAPrompt]);
  
  const handleClosePrompt = () => {
    setShowPrompt(false);
    closePrompt();
  };
  
  return {
    showPrompt,
    handleClosePrompt
  };
};
