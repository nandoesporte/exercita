
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, File, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';
import Papa from 'papaparse';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CategoryType = Database['public']['Tables']['workout_categories']['Row'];

interface BatchUploadFormProps {
  onComplete: () => void;
  categories: CategoryType[];
}

const formSchema = z.object({
  category_id: z.string().optional().nullable(),
  fileType: z.enum(["csv", "images"]),
});

type FileWithPreview = {
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress: number;
};

const BatchUploadForm = ({ onComplete, categories }: BatchUploadFormProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: null,
      fileType: "csv",
    }
  });

  const fileType = form.watch("fileType");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Process files based on type
    if (fileType === "csv" && selectedFiles.length > 0) {
      // Only allow 1 CSV file
      const csvFile = selectedFiles[0];
      setFiles([{ file: csvFile, status: 'pending', progress: 0 }]);
      
      // Parse CSV preview
      Papa.parse(csvFile, {
        header: true,
        complete: (results) => {
          setCsvData(results.data.slice(0, 5)); // Show first 5 rows
        }
      });
    } else if (fileType === "images") {
      // Allow multiple image files
      const newFiles = selectedFiles.map(file => {
        return {
          file,
          preview: URL.createObjectURL(file),
          status: 'pending' as const,
          progress: 0
        };
      });
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      // Revoke object URL to avoid memory leaks
      if (updatedFiles[index].preview) {
        URL.revokeObjectURL(updatedFiles[index].preview!);
      }
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });

    if (fileType === "csv") {
      setCsvData(null);
    }
  };

  const uploadCSV = async (file: File, categoryId: string | null) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const { data, errors } = results;
            
            if (errors.length > 0) {
              reject(new Error("Erro ao analisar o arquivo CSV"));
              return;
            }
            
            // Process each row
            const successfulRows = [];
            const failedRows = [];
            
            for (const row of data) {
              try {
                // Skip empty rows
                if (!row.name) continue;
                
                // Create the exercise
                const { error } = await supabase.from('exercises').insert({
                  name: row.name,
                  description: row.description || null,
                  category_id: categoryId,
                  image_url: row.image_url || null,
                  video_url: row.video_url || null
                });
                
                if (error) {
                  failedRows.push({ ...row, error: error.message });
                } else {
                  successfulRows.push(row);
                }
              } catch (err) {
                failedRows.push({ ...row, error: "Erro ao processar linha" });
              }
            }
            
            // Report results
            if (failedRows.length > 0) {
              console.error("Falha ao importar algumas linhas:", failedRows);
              toast({
                title: `${successfulRows.length} exercícios importados`,
                description: `${failedRows.length} exercícios não puderam ser importados.`,
                variant: "destructive",
              });
            } else {
              toast({
                title: `${successfulRows.length} exercícios importados com sucesso`,
                description: "Todos os exercícios do CSV foram importados.",
              });
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  const uploadImages = async (files: FileWithPreview[], categoryId: string | null) => {
    const uploadPromises = files.map(async (fileItem, index) => {
      try {
        // Update status to uploading
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = { ...updatedFiles[index], status: 'uploading' };
          return updatedFiles;
        });

        const file = fileItem.file;
        const fileExt = file.name.split('.').pop();
        const fileName = file.name.split('.')[0].toLowerCase().replace(/\s+/g, '-');
        const filePath = `exercises/${fileName}-${uuidv4()}.${fileExt}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('exercises')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setFiles(prevFiles => {
                const updatedFiles = [...prevFiles];
                updatedFiles[index] = { ...updatedFiles[index], progress: percent };
                return updatedFiles;
              });
            }
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('exercises')
          .getPublicUrl(filePath);

        // Create exercise entry with the image
        const { error: dbError } = await supabase.from('exercises').insert({
          name: fileName.replace(/-/g, ' '),
          image_url: publicUrl,
          category_id: categoryId
        });

        if (dbError) {
          throw dbError;
        }

        // Update status to success
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = { ...updatedFiles[index], status: 'success', progress: 100 };
          return updatedFiles;
        });

      } catch (error: any) {
        console.error('Error uploading image:', error);
        
        // Update status to error
        setFiles(prevFiles => {
          const updatedFiles = [...prevFiles];
          updatedFiles[index] = { 
            ...updatedFiles[index], 
            status: 'error', 
            error: error.message || "Erro ao fazer upload"
          };
          return updatedFiles;
        });
      }
    });

    return Promise.allSettled(uploadPromises);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUploading(true);
      
      // Check if storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('exercises');
      
      // If bucket doesn't exist, create it
      if (bucketError && bucketError.message.includes('not found')) {
        await supabase.storage.createBucket('exercises', { public: true });
      }
      
      if (fileType === "csv" && files.length > 0) {
        await uploadCSV(files[0].file, values.category_id || null);
      } else if (fileType === "images" && files.length > 0) {
        await uploadImages(files, values.category_id || null);
      }
      
      onComplete();
    } catch (error: any) {
      console.error('Error in batch upload:', error);
      toast({
        title: "Erro no upload em lote",
        description: error.message || "Ocorreu um erro durante o processo de upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fileType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Upload</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de upload" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="csv">Arquivo CSV</SelectItem>
                  <SelectItem value="images">Imagens</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {fileType === "csv" ? 
                  "Upload de arquivo CSV com exercícios. Colunas esperadas: name, description, image_url, video_url" :
                  "Upload de várias imagens de exercícios. O nome do arquivo será usado como nome do exercício."
                }
              </FormDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria (opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
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
                Todos os exercícios serão adicionados a esta categoria
              </FormDescription>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>{fileType === "csv" ? "Arquivo CSV" : "Imagens"}</FormLabel>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Input
              type="file"
              accept={fileType === "csv" ? ".csv" : "image/*"}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple={fileType === "images"}
              disabled={isUploading}
            />
            <label 
              htmlFor="file-upload" 
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">
                {fileType === "csv" ? "Clique para selecionar um arquivo CSV" : "Clique para selecionar imagens"}
              </p>
              <p className="text-xs text-muted-foreground">
                {fileType === "csv" ? "CSV com colunhas: name, description, image_url, video_url" : "PNG, JPG ou GIF (max. 10MB por arquivo)"}
              </p>
            </label>
          </div>
          
          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Arquivos selecionados</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-2 bg-muted rounded-lg">
                  {fileType === "images" && file.preview ? (
                    <div className="w-10 h-10 mr-3 rounded overflow-hidden flex-shrink-0">
                      <img src={file.preview} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <File className="h-10 w-10 p-2 mr-3 text-blue-500" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file.name}</p>
                    
                    {file.status === 'uploading' && (
                      <div className="w-full h-1.5 bg-muted-foreground/20 rounded-full mt-1">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <p className="text-xs text-destructive">{file.error}</p>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    {file.status === 'success' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : file.status === 'error' ? (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-destructive hover:text-destructive/70"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        disabled={isUploading}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* CSV Data Preview */}
          {fileType === "csv" && csvData && csvData.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Prévia dos Dados (5 primeiras linhas)</h4>
              <div className="border rounded-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted">
                    <tr>
                      {Object.keys(csvData[0]).map((header, i) => (
                        <th key={i} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((cell: any, j) => (
                          <td key={j} className="px-3 py-2 text-xs">
                            {typeof cell === 'string' && cell.length > 30 
                              ? cell.substring(0, 30) + '...' 
                              : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <Button 
          type="submit"
          className="w-full"
          disabled={isUploading || files.length === 0}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Iniciar Upload
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BatchUploadForm;
