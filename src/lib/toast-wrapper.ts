

import { toast as originalToast } from '@/hooks/use-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any; // Allow other props to be passed
}

// Base toast function
function toastImpl(message: string | ToastOptions): void {
  if (typeof message === 'string') {
    // If a string is passed, use it directly
    originalToast(message);
  } else {
    // If an object is passed with title/description properties, adapt it to the current toast API
    const messageContent = message.title || message.description || '';
    originalToast(messageContent);
  }
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
      originalToast({ description: message, variant: "destructive" as const });
    } else {
      const options = { ...message, variant: "destructive" as const };
      toastImpl(options);
    }
  }
});

