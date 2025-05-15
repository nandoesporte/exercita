
import { toast as sonnerToast } from 'sonner';
import type { ExternalToast } from 'sonner';

// Define our simplified toast options interface
interface ToastOptions {
  description?: React.ReactNode;
  action?: React.ReactNode;
  cancel?: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  duration?: number;
}

// Create a wrapper function for sonner toast
export const toast = {
  // Standard toast
  default(message: string, options?: ToastOptions) {
    // Convert our options to sonner's ExternalToast type
    const externalToast: ExternalToast = { ...options };
    return sonnerToast(message, externalToast);
  },
  
  // Success toast
  success(message: string, options?: ToastOptions) {
    return sonnerToast.success(message, options);
  },
  
  // Error toast
  error(message: string, options?: ToastOptions) {
    return sonnerToast.error(message, options);
  },
  
  // Warning toast
  warning(message: string, options?: ToastOptions) {
    return sonnerToast.warning(message, options);
  },
  
  // Info toast
  info(message: string, options?: ToastOptions) {
    return sonnerToast.info(message, options);
  },
  
  // Custom toast with title
  custom(title: string, message?: string, options?: ToastOptions) {
    if (message) {
      return sonnerToast(title, { 
        description: message,
        ...options 
      });
    }
    return sonnerToast(title, options);
  },
  
  // Loading toast
  loading(message: string, options?: ToastOptions) {
    return sonnerToast.loading(message, options);
  },
  
  // Promise toast
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) {
    return sonnerToast.promise(promise, messages, options);
  },
  
  // Dismiss all toasts
  dismiss() {
    return sonnerToast.dismiss();
  }
};
