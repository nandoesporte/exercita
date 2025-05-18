
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGymPhotos } from '@/hooks/useGymPhotos';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GymPhotoUploader = () => {
  const { uploadPhoto, uploading } = useGymPhotos();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10485760, // 10MB
    multiple: false
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecione uma foto para enviar');
      return;
    }

    try {
      await uploadPhoto(file, description);
      setFile(null);
      setPreview(null);
      setDescription('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar foto');
    }
  };

  const handleCancelUpload = () => {
    setFile(null);
    setPreview(null);
    setDescription('');
  };

  return (
    <div className="mt-4 space-y-6">
      <div 
        {...getRootProps()} 
        className={`
          border-2 border-dashed rounded-lg p-6 cursor-pointer 
          flex flex-col items-center justify-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${preview ? 'hidden' : 'block'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Arraste e solte uma foto da sua academia aqui ou clique para selecionar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG ou WEBP (máx. 10MB)
          </p>
        </div>
      </div>

      {preview && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  Trocar Imagem
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  placeholder="Descreva brevemente sua academia..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCancelUpload}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Foto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GymPhotoUploader;
