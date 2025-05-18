
import React from 'react';
import { X, ZoomIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

interface ImageViewerModalProps {
  imageUrl: string;
  altText?: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  imageUrl,
  altText = "Exercise preview",
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <div className="flex items-center gap-2">
            <ZoomIn className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">{altText}</h3>
          </div>
          <DialogClose className="rounded-full hover:bg-muted p-2" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-center min-h-full">
            <img 
              src={imageUrl} 
              alt={altText} 
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerModal;
