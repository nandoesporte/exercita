
import React, { useState } from 'react';
import { FileUploader } from "react-drag-drop-files";
import { Upload, FileText, X, Check, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from '@/integrations/supabase/types';
import { ScrollArea } from "@/components/ui/scroll-area";

type Category = Database['public']['Tables']['workout_categories']['Row'];

interface BatchUploadFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  categories: Category[];
}

const allowedTypes = ["csv", "xlsx", "json"];

const BatchUploadForm: React.FC<BatchUploadFormProps> = ({
  onSubmit,
  isLoading,
  categories
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
  };

  const handleFileChange = async (file: File) => {
    setFile(file);
    
    // If it's a CSV or JSON, try to preview it
    if (file.type === 'text/csv' || file.type === 'application/json') {
      try {
        const text = await file.text();
        let data = [];
        
        if (file.type === 'application/json') {
          data = JSON.parse(text);
          data = Array.isArray(data) ? data.slice(0, 5) : [data];
        } else if (file.type === 'text/csv') {
          // Very simple CSV parsing for preview only
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          data = lines.slice(1, 6).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((header, i) => {
              row[header.trim()] = values[i]?.trim() || '';
            });
            return row;
          });
        }
        
        setPreviewData(data);
      } catch (error) {
        console.error('Error previewing file:', error);
      }
    }
  };

  const handleFileDrop = () => {
    setDragActive(false);
  };

  const handleDragState = (state: boolean) => {
    setDragActive(state);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (categoryId) {
      formData.append('categoryId', categoryId);
    }
    
    await onSubmit(formData);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">Categoria (opcional)</Label>
        <Select
          value={categoryId}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem categoria</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Opcionalmente, defina uma categoria padrão para todos os exercícios
        </p>
      </div>

      <div>
        <Label className="mb-2 block">Arquivo de Exercícios</Label>
        <FileUploader
          handleChange={handleFileChange}
          onDrop={handleFileDrop}
          onDraggingStateChange={handleDragState}
          name="file"
          types={allowedTypes}
          maxSize={5}
          minSize={0}
        >
          <div
            className={`
              border-2 border-dashed rounded-lg p-6 text-center
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border'}
              ${file ? 'bg-muted/50' : ''}
              cursor-pointer hover:bg-muted/50 transition-colors
            `}
          >
            {!file ? (
              <div className="space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">
                  Arraste arquivo aqui ou clique para fazer upload
                </div>
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: CSV, XLSX, JSON (máximo 5MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </FileUploader>

        <p className="text-sm text-muted-foreground mt-2">
          O arquivo deve conter as colunas: name (obrigatório), description, image_url, video_url
        </p>
      </div>

      {previewData.length > 0 && (
        <div className="space-y-2">
          <Label>Prévia dos Dados</Label>
          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="h-36">
              <div className="p-2">
                <table className="w-full text-xs">
                  <thead className="text-left text-muted-foreground bg-muted">
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th key={key} className="p-2">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item, index) => (
                      <tr key={index} className="border-t border-border">
                        {Object.values(item).map((value: any, i) => (
                          <td key={i} className="p-2 truncate" title={value}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
          <p className="text-xs text-muted-foreground">
            Mostrando os primeiros {previewData.length} registros
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button 
          type="submit" 
          disabled={!file || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <><div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> Processando</>
          ) : (
            <><Check className="h-4 w-4" /> Processar Upload</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default BatchUploadForm;
