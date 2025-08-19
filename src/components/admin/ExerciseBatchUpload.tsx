import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
// Removed Supabase imports - using MySQL now

interface ExerciseBatchUploadProps {
  onSubmit: (data: any[]) => Promise<void>;
  categories: { id: string; name: string; color: string; icon: string; created_at: string; updated_at: string }[];
}

export function ExerciseBatchUpload({ onSubmit, categories }: ExerciseBatchUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Placeholder - batch upload not yet implemented with MySQL
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadResult('Upload em lote será implementado em breve com MySQL.');
    } catch (error) {
      setUploadResult('Erro no upload: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Upload em Lote de Exercícios
        </CardTitle>
        <CardDescription>
          Faça upload de múltiplos exercícios usando um arquivo CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading || categories.length === 0}
          />
        </div>
        
        {categories.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma categoria disponível. Crie categorias primeiro antes de fazer upload.
            </AlertDescription>
          </Alert>
        )}
        
        {uploadResult && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadResult}</AlertDescription>
          </Alert>
        )}

        {isUploading && (
          <div className="text-center">
            <div className="spinner"></div>
            <p>Processando upload...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExerciseBatchUpload;
