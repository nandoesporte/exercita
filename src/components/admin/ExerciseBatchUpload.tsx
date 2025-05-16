import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, File, X, Check, Loader2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast-wrapper';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  category_id: z.string().uuid({ message: "Precisa ser um ID válido" }),
  files: z.array(
    z.object({
      file: z.any(),
      name: z.string().min(2, { message: "Nome muito curto" }),
      uploadProgress: z.number().optional(),
      uploadedUrl: z.string().optional(),
      error: z.string().optional(),
      status: z.enum(['pending', 'uploading', 'success', 'error']).default('pending'),
    })
  ).min(1, { message: "Selecione pelo menos um arquivo" }),
});

type FormValues = z.infer<typeof formSchema>;

interface ExerciseBatchUploadProps {
  onSubmit: (data: any[]) => Promise<void>;
  categories: { id: string; name: string; color: string; icon: string; created_at: string; updated_at: string }[];
}

export function ExerciseBatchUpload({ onSubmit, categories }: ExerciseBatchUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: '',
      files: [],
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      // Extract name from filename (remove extension)
      const fileName = file.name.split('.')[0]
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
      return {
        file,
        name: fileName,
        status: 'pending',
        uploadProgress: 0,
      };
    });
    
    setFileList(prev => [...prev, ...newFiles]);
    form.setValue('files', [...fileList, ...newFiles]);
    
  }, [fileList, form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/gif': ['.gif'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: true
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = [...fileList];
    newFiles.splice(index, 1);
    setFileList(newFiles);
    form.setValue('files', newFiles);
  };

  const updateFileStatus = (index: number, data: Partial<FormValues['files'][0]>) => {
    setFileList(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles[index] = { ...newFiles[index], ...data };
      return newFiles;
    });
  };

  const handleSubmit = async (values: FormValues) => {
    if (fileList.length === 0) {
      toast.error("Adicione pelo menos um arquivo para upload");
      return;
    }

    setUploading(true);
    
    try {
      const results = [];

      // Check if the bucket exists, create it if it doesn't
      const { error: bucketError } = await supabase.storage.getBucket('exercises');
      if (bucketError && bucketError.message.includes('not found')) {
        await supabase.storage.createBucket('exercises', { public: true });
      }

      // Process files sequentially
      for (let i = 0; i < fileList.length; i++) {
        const fileData = fileList[i];
        updateFileStatus(i, { status: 'uploading', uploadProgress: 0 });

        try {
          // Generate unique filename
          const fileExt = fileData.file.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `exercises/${fileName}`;
          
          // Upload file to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('exercises')
            .upload(filePath, fileData.file);
            
          if (uploadError) {
            updateFileStatus(i, { status: 'error', error: uploadError.message });
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('exercises')
            .getPublicUrl(filePath);

          updateFileStatus(i, { status: 'success', uploadedUrl: publicUrl, uploadProgress: 100 });
          
          // Ensure we're using the UUID from the category_id field
          results.push({
            name: fileData.name,
            description: null,
            category_id: values.category_id, // This will now be a valid UUID from the form
            image_url: publicUrl,
            video_url: null,
          });
        } catch (error: any) {
          updateFileStatus(i, { status: 'error', error: error.message });
        }
      }

      console.log("Submitting batch with data:", results);
      await onSubmit(results);

    } catch (error: any) {
      toast.error(`Erro ao processar arquivos: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <p className="text-sm text-muted-foreground">
        Faça upload em lote de múltiplos arquivos GIF ou imagens de exercícios de uma vez.
        Os nomes dos arquivos serão usados como nomes dos exercícios.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Todos os exercícios carregados serão atribuídos a esta categoria
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="files"
            render={() => (
              <FormItem>
                <FormLabel>Arquivos (GIF/Imagens)</FormLabel>
                <FormControl>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer",
                      isDragActive ? "border-primary bg-primary/10" : "border-border"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      {isDragActive
                        ? "Solte os arquivos aqui..."
                        : "Arraste e solte arquivos aqui, ou clique para selecionar"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Suporta: GIF, PNG, JPG (máximo 10MB por arquivo)
                    </p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {fileList.length > 0 && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Arquivos para upload ({fileList.length})</h3>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setFileList([]);
                    form.setValue('files', []);
                  }}
                >
                  Limpar todos
                </Button>
              </div>
              <Separator />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {fileList.map((file, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 border rounded-md bg-muted/30"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <input
                          type="text"
                          className="bg-transparent border-none focus:outline-none text-sm p-0"
                          value={file.name}
                          onChange={(e) => {
                            const newFiles = [...fileList];
                            newFiles[index].name = e.target.value;
                            setFileList(newFiles);
                            form.setValue('files', newFiles);
                          }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        {file.status === 'error' && (
                          <span className="text-xs text-destructive">{file.error}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'pending' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                      {file.status === 'uploading' && (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-xs">{file.uploadProgress || 0}%</span>
                        </div>
                      )}
                      {file.status === 'success' && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">
                          <Check className="h-3 w-3 mr-1" /> Enviado
                        </Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive">
                          Erro
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || fileList.length === 0} 
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Upload em Lote
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Make sure we're exporting the component correctly
export default ExerciseBatchUpload;
