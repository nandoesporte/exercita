
// Import the toast from sonner
import { toast as sonnerToast } from "sonner";
import type { ToastOptions } from "sonner";

// Create a callable toast function that also has additional methods
const createToast = ((message: string, options?: ToastOptions) => {
  return sonnerToast(message, options);
}) as ((message: string, options?: ToastOptions) => string | number) & {
  success: (message: string, options?: ToastOptions) => string | number;
  error: (message: string, options?: ToastOptions) => string | number;
  info: (message: string, options?: ToastOptions) => string | number;
  warning: (message: string, options?: ToastOptions) => string | number;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: ToastOptions
  ) => Promise<T>;
  custom: (
    message: string,
    options?: ToastOptions & {
      icon?: JSX.Element;
      description?: string;
    }
  ) => string | number;
  dismiss: () => void;
};

// Add all the methods to our toast function
createToast.success = (message, options) => sonnerToast.success(message, options);
createToast.error = (message, options) => sonnerToast.error(message, options);
createToast.info = (message, options) => sonnerToast.info(message, options);
createToast.warning = (message, options) => {
  return sonnerToast(message, {
    ...options,
    className: "bg-yellow-100 border-yellow-400 text-yellow-800",
  });
};
createToast.promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
  options?: ToastOptions
) => {
  return sonnerToast.promise(promise, messages, options);
};
createToast.custom = (
  message: string,
  options?: ToastOptions & {
    icon?: JSX.Element;
    description?: string;
  }
) => {
  return sonnerToast(message, options);
};
createToast.dismiss = () => sonnerToast.dismiss();

// Export the callable toast function with methods
export const toast = createToast;
