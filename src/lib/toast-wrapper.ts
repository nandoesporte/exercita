
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";
import React from "react";

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
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
    custom: (content: React.ReactNode, options?: ExternalToast) => 
      sonnerToast.custom(content, options),
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
