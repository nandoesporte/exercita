
import { toast as sonnerToast } from 'sonner';
import type { ExternalToast } from 'sonner';

// Define our simplified toast options interface
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any; // Allow other props to be passed
}

// Convert our app's toast options to Sonner's expected format
function convertToExternalToast(options: ToastOptions): ExternalToast {
  const { variant, description, title, ...rest } = options;
  
  // Create a properly formatted ExternalToast object
  const externalToast: ExternalToast = {
    ...rest
  };
  
  // For sonner, we pass title directly in the object
  if (title !== undefined) {
    externalToast.title = title;
  }
  
  // Map our variant to Sonner's style if needed
  if (variant === "destructive") {
    externalToast.style = { background: 'var(--destructive)', color: 'var(--destructive-foreground)' };
  }
  
  return externalToast;
}

// Base toast function that handles both string and object inputs
function toastImpl(message: string | ToastOptions): void {
  if (typeof message === 'string') {
    // If a string is passed, use it directly
    sonnerToast(message);
  } else {
    // Extract description for the primary message
    const { description, ...options } = message;
    sonnerToast(description || '', convertToExternalToast(options));
  }
}

// Create the toast object with success and error methods
export const toast = Object.assign(toastImpl, {
  // Success toast variant
  success: (message: string | ToastOptions): void => {
    if (typeof message === 'string') {
      sonnerToast.success(message);
    } else {
      const { description, ...options } = message;
      sonnerToast.success(description || '', convertToExternalToast(options));
    }
  },
  
  // Error toast variant
  error: (message: string | ToastOptions): void => {
    if (typeof message === 'string') {
      sonnerToast.error(message);
    } else {
      const { description, ...options } = message;
      sonnerToast.error(description || '', convertToExternalToast(options));
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
