
import { toast as originalToast } from '@/hooks/use-toast';
import { ReactNode } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any; // Allow other props to be passed
}

// This wrapper function handles both the old format and new format
export function toast(message: string | ToastOptions): void {
  if (typeof message === 'string') {
    // If a string is passed, use it directly
    originalToast(message);
  } else {
    // If an object is passed with title/description properties, adapt it to the current toast API
    const messageContent = message.title || message.description || '';
    originalToast(messageContent);
  }
}
