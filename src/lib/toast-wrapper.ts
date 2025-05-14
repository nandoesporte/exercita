
import { toast as originalToast, type Toast, type ToastProps } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any; // Allow other props to be passed
}

// Utility function to format toast message based on input type
function formatToastMessage(message: string | ToastOptions): ToastProps | string {
  if (typeof message === 'string') {
    return message;
  } else {
    // Convert our ToastOptions to the format expected by the original toast
    const formattedProps: ToastProps = {};
    
    if (message.description) {
      formattedProps.description = message.description;
    }
    
    if (message.variant) {
      formattedProps.variant = message.variant;
    }
    
    return formattedProps;
  }
}

// Base toast function
function toastImpl(message: string | ToastOptions): void {
  originalToast(formatToastMessage(message));
}

// Create the toast object with success and error methods
export const toast = Object.assign(toastImpl, {
  // Success toast variant
  success: (message: string | ToastOptions): void => {
    if (typeof message === 'string') {
      originalToast(message);
    } else {
      const options = { ...message, variant: "default" as const };
      toastImpl(options);
    }
  },
  
  // Error toast variant
  error: (message: string | ToastOptions): void => {
    if (typeof message === 'string') {
      originalToast({ 
        description: message, 
        variant: "destructive" 
      } as ToastProps);
    } else {
      const options = { ...message, variant: "destructive" as const };
      toastImpl(options);
    }
  }
});
