
/**
 * Solicita permissão para enviar notificações push
 * @returns Promise<boolean> Retorna true se a permissão foi concedida
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações push');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão para notificações:', error);
    return false;
  }
};

/**
 * Verifica se a aplicação está sendo executada como PWA instalado
 * @returns boolean
 */
export const isPwaInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

/**
 * Verifica se o dispositivo está online
 * @returns boolean
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Registra callbacks para mudanças no estado de conectividade
 * @param onlineCallback Função a ser chamada quando ficar online
 * @param offlineCallback Função a ser chamada quando ficar offline
 */
export const registerConnectivityListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
};

/**
 * Remove listeners de conectividade
 * @param onlineCallback Função registrada para evento online
 * @param offlineCallback Função registrada para evento offline
 */
export const removeConnectivityListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): void => {
  window.removeEventListener('online', onlineCallback);
  window.removeEventListener('offline', offlineCallback);
};
