
import { Toaster as SonnerToaster } from "sonner";
import { toast } from "sonner";

export { toast, SonnerToaster as Toaster };

export type Toast = {
  id: string | number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  cancel?: React.ReactNode;
  onDismiss?: (toast: Toast) => void;
  onAutoClose?: (toast: Toast) => void;
  promise?: Promise<any>;
};

export type ToastProps = Toast & {
  onOpenChange?: (open: boolean) => void;
  onDescriptionChange?: (description: React.ReactNode) => void;
};

export type ToastActionElement = React.ReactElement<{
  altText: string;
}>;

export function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
  };
}
