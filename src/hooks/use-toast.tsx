
import React from "react";
import { toast as sonnerToast, type ToastOptions } from "sonner";

export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
}

export type ToastActionElement = React.ReactElement;

// This function overloads toast to support both direct message and options object
export const toast = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast(props);
  } else {
    const { title, description, variant, ...rest } = props;
    return sonnerToast(title as string, {
      description,
      // Map our variant to sonner's style
      style: variant === "destructive" ? { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" } : undefined,
      ...rest
    });
  }
};

export const useToast = () => {
  return {
    toast
  };
};

export function Toaster() {
  return null; // This will be imported from toaster.tsx
}

export type Toast = ToastProps;
