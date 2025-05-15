
// Import the toast from sonner
import { toast as sonnerToast } from "sonner";
import type { ToastOptions } from "sonner";

// Helper function to create a function with consistent params
const createToastFunction = (
  fn: (message: string, options?: ToastOptions) => string | number
) => {
  return (message: string, options?: ToastOptions): string | number => {
    return fn(message, options);
  };
};

// Define our unified toast API
export const toast = {
  // Default toast
  default: createToastFunction((message, options) => {
    return sonnerToast(message, options);
  }),

  // Success toast
  success: createToastFunction((message, options) => {
    return sonnerToast.success(message, options);
  }),

  // Error toast
  error: createToastFunction((message, options) => {
    return sonnerToast.error(message, options);
  }),

  // Info toast
  info: createToastFunction((message, options) => {
    return sonnerToast.info(message, options);
  }),

  // Warning toast
  warning: createToastFunction((message, options) => {
    return sonnerToast(message, {
      ...options,
      className: "bg-yellow-100 border-yellow-400 text-yellow-800",
    });
  }),

  // Promise toast
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ) => {
    return sonnerToast.promise(promise, messages, options);
  },

  // Custom toast
  custom: (
    message: string,
    options?: ToastOptions & {
      icon?: JSX.Element;
      description?: string;
    }
  ) => {
    return sonnerToast(message, options);
  },

  // Dismiss all toasts
  dismiss: () => sonnerToast.dismiss(),
};
