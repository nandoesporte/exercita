
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'sonner'

// Componente raiz que envolve a aplicação
const Main = () => {
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
    window.addEventListener('online', handleOfflineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // Verifica o status inicial
    if (!navigator.onLine) {
      toast.warning('Você está offline. Algumas funcionalidades podem não estar disponíveis.');
    }

    return () => {
      // Remove os listeners quando o componente é desmontado
      window.removeEventListener('online', handleOfflineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(<Main />);
