
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

// Componente raiz que envolve a aplicação
const Main = () => {
  // Initialize PWA install prompt
  React.useEffect(() => {
    registerInstallPrompt();
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
    registerConnectivityListeners(
      () => handleOfflineStatus(), // Online callback
      () => handleOfflineStatus()  // Offline callback
    );

    // Verifica o status inicial
    if (!navigator.onLine) {
      toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    }

    return () => {
      // Os listeners são removidos automaticamente pelo utilitário
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
