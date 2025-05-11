
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner'
import { registerConnectivityListeners, registerInstallPrompt } from '@/utils/pwaUtils'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Add type declaration for the global deferredPromptEvent
declare global {
  interface Window {
    deferredPromptEvent: any;
  }
}

// Create the query client outside the component to avoid re-creation on renders
const queryClient = new QueryClient();

// Root component that wraps the application
const Main = () => {
  // Initialize PWA install prompt
  React.useEffect(() => {
    console.log('Registering PWA install prompt');
    registerInstallPrompt();
    
    // Log when PWA is installed
    const handleAppInstalled = () => {
      console.log('PWA was installed successfully');
      // Clear the deferred prompt when installed
      window.deferredPromptEvent = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Add listener for online/offline status
  const handleOfflineStatus = () => {
    if (!navigator.onLine) {
      toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    } else {
      toast.success('Conexão restabelecida.');
    }
  };

  // Register listeners when component mounts
  React.useEffect(() => {
    const onlineCallback = () => handleOfflineStatus();
    const offlineCallback = () => handleOfflineStatus();
    
    registerConnectivityListeners(onlineCallback, offlineCallback);

    // Check initial status
    if (!navigator.onLine) {
      toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    }

    return () => {
      // Listeners are properly removed
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }, []);

  return (
    <React.StrictMode>
      <Router>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster position="bottom-center" richColors closeButton />
              <App />
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </Router>
    </React.StrictMode>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
