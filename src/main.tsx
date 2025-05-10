
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner'
// Fix the import - use sonner's toast
import { toast } from 'sonner'
import { registerConnectivityListeners, registerInstallPrompt } from '@/utils/pwaUtils'
import { TooltipProvider } from '@/components/ui/tooltip'

// Add type declaration for the global deferredPromptEvent
declare global {
  interface Window {
    deferredPromptEvent: any;
  }
}

// Componente raiz que envolve a aplicação
const Main = () => {
  // Initialize PWA install prompt
  React.useEffect(() => {
    console.log('Registering PWA install prompt');
    registerInstallPrompt();
    
    // Log when PWA is installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed successfully');
      // Clear the deferred prompt when installed
      window.deferredPromptEvent = null;
    });

    // Make sure to clean up event listener on unmount
    return () => {
      window.removeEventListener('appinstalled', () => {
        console.log('Cleaned up appinstalled event listener');
      });
    };
  }, []);

  // Adiciona listener para status online/offline
  const handleOfflineStatus = () => {
    if (!navigator.onLine) {
      toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    } else {
      toast.success('Conexão restabelecida.');
    }
  };

  // Registra os listeners quando o componente é montado
  React.useEffect(() => {
    const onlineCallback = () => handleOfflineStatus();
    const offlineCallback = () => handleOfflineStatus();
    
    registerConnectivityListeners(onlineCallback, offlineCallback);

    // Verifica o status inicial
    if (!navigator.onLine) {
      toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    }

    return () => {
      // Os listeners são removidos corretamente
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Toaster position="bottom-center" richColors closeButton />
            <App />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
