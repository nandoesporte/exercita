
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

// Create a wrapper around the sonner toast
const toast = Object.assign(
  // Default toast function
  (message: string, options?: ExternalToast) => sonnerToast(message, options),
  {
    // All methods from sonner
    success: (message: string, options?: ExternalToast) => sonnerToast.success(message, options),
    error: (message: string, options?: ExternalToast) => sonnerToast.error(message, options),
    info: (message: string, options?: ExternalToast) => sonnerToast.info(message, options),
    warning: (message: string, options?: ExternalToast) => sonnerToast.warning(message, options),
    loading: (message: string, options?: ExternalToast) => sonnerToast.loading(message, options),
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
    custom: (message: React.ReactNode, options?: ExternalToast) => sonnerToast.custom(message, options),
    promise: <T>(
      promise: Promise<T>, 
      messages: { 
        loading: string; 
        success: string | ((data: T) => string); 
        error: string | ((error: unknown) => string);
      },
      options?: ExternalToast
    ) => sonnerToast.promise(promise, messages, options)
  }
);

export { toast };
