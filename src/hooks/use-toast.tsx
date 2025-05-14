
import React from "react";
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";

export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export const toast = (
  title: React.ReactNode, 
  props?: Omit<ToastProps, "title">
) => {
  return sonnerToast(title, {
    ...props
  });
};

export const useToast = () => {
  return {
    toast
  };
};

export function Toaster() {
  return null; // This will be imported from toaster.tsx
}

export function ToastAction() {
  return null; // Just a placeholder for type inference
}

export type Toast = ToastProps;
