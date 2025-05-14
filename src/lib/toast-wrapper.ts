
import { toast as originalToast } from '@/hooks/use-toast';

// This wrapper function handles both the old format and new format
export function toast(message: string | { title?: string; description?: string; variant?: "default" | "destructive" }) {
  if (typeof message === 'string') {
    // If a string is passed, use it directly
    originalToast(message);
  } else {
    // If an object is passed, adapt it to the current toast API
    if (message.title) {
      // If there's a title, display it 
      originalToast(message.title);
    } else if (message.description) {
      // If no title but description exists, use that
      originalToast(message.description);
    }
  }
}
