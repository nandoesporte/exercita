
import * as React from "react"
import { toast as sonnerToast, Toaster as SonnerToaster, type ToasterProps } from "sonner"

export interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export type Toast = ToastProps

type ToastActionElement = React.ReactElement<unknown>

export const useToast = () => {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
    error: sonnerToast.error,
  }
}

export { sonnerToast as toast, type ToastActionElement, SonnerToaster as Toaster }
