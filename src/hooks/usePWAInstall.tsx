
import { useState, useEffect } from 'react';
import { isPwaInstalled } from '@/utils/pwaUtils';

export const usePWAInstall = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  
  useEffect(() => {
    // Check if the PWA is already installed
    const isInstalled = isPwaInstalled();
    
    // Check if user dismissed it recently (using localStorage)
    const dismissedRecently = localStorage.getItem('pwa_prompt_dismissed');
    const dismissedTime = dismissedRecently ? new Date(dismissedRecently) : null;
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Check if install prompt is available
    const hasInstallPrompt = !!window.deferredPromptEvent;
    setCanInstall(hasInstallPrompt && !isInstalled);
    
    // Only show if not installed and not dismissed recently
    if (!isInstalled && (!dismissedTime || dismissedTime < oneDayAgo)) {
      setUserDismissed(false);
    } else {
      setUserDismissed(true);
    }
  }, []);

  const showPrompt = () => {
    if (!isPwaInstalled() && !userDismissed && window.deferredPromptEvent) {
      setShowInstallPrompt(true);
      return true;
    }
    return false;
  };

  const closePrompt = () => {
    setShowInstallPrompt(false);
    setUserDismissed(true);
    // Remember the user dismissed it for 24 hours
    localStorage.setItem('pwa_prompt_dismissed', new Date().toISOString());
  };

  return {
    showInstallPrompt,
    setShowInstallPrompt,
    showPrompt,
    closePrompt,
    canInstall
  };
};
