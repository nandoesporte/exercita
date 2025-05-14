
import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster, type ToasterProps } from "sonner"

// Define toast props interface for typescript
export interface ToastProps {
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

// Export the Toast type
export type Toast = string | ToastProps

// Define ToastActionElement type
export type ToastActionElement = React.ReactElement<unknown>

// Custom hook for toast
export const useToast = () => {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
    error: sonnerToast.error,
  }
}

// Export for direct usage without the hook
export { sonnerToast as toast, SonnerToaster as Toaster }
