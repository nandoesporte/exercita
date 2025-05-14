
import { toast as sonnerToast } from 'sonner';
import type { ToastProps } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any; // Allow other props to be passed
}

// Base toast function that handles both string and object inputs
function toastImpl(message: string | ToastOptions): void {
  if (typeof message === 'string') {
    // If a string is passed, use it directly
    sonnerToast(message);
  } else {
    // If an object is passed, convert it to the format expected by sonner
    const { description, variant, ...otherProps } = message;
    sonnerToast(description || '', {
      ...(variant && { variant }),
      ...otherProps
    });
  }
}

// Create the toast object with success and error methods
export const toast = Object.assign(toastImpl, {
  // Success toast variant
  success: (message: string | ToastOptions): void => {
    if (typeof message === 'string') {
      sonnerToast.success(message);
    } else {
      const { description, ...otherProps } = message;
      sonnerToast.success(description || '', otherProps);
    }
  },
  
  // Error toast variant
  error: (message: string | ToastOptions): void => {
    if (typeof message === 'string') {
      sonnerToast.error(message);
    } else {
      const { description, ...otherProps } = message;
      sonnerToast.error(description || '', otherProps);
    }
  },
  
  // Add direct access to the original toast methods
  dismiss: sonnerToast.dismiss,
  info: sonnerToast.info,
  warning: sonnerToast.warning,
  loading: sonnerToast.loading,
  custom: sonnerToast.custom,
  promise: sonnerToast.promise
});
