
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminExercises } from '@/hooks/useAdminExercises';
import Papa from 'papaparse';

interface BatchUploadFormProps {
  onComplete: () => void;
  categories: Array<{ id: string, name: string }>;
}

interface ExerciseData {
  name: string;
  description?: string;
  category_id?: string;
  image_url?: string;
  video_url?: string;
}

const BatchUploadForm: React.FC<BatchUploadFormProps> = ({ onComplete, categories }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExerciseData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { createExercise } = useAdminExercises();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      complete: (results) => {
        const validData = results.data.filter(item => item.name).map(item => ({
          name: item.name,
          description: item.description || null,
          category_id: item.category_id || null,
          image_url: item.image_url || null,
          video_url: item.video_url || null
        })) as ExerciseData[];
        
        setPreviewData(validData);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (previewData.length === 0) {
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    const total = previewData.length;
    let completed = 0;
    
    try {
      for (const exercise of previewData) {
        await createExercise({
          name: exercise.name,
          description: exercise.description || null,
          category_id: exercise.category_id || null,
          image_url: exercise.image_url || null,
          video_url: exercise.video_url || null
        });
        
        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      }
      
      onComplete();
    } catch (error) {
      console.error('Error uploading exercises:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="csv-file" className="block text-sm font-medium">
          Selecione um arquivo CSV para importar exercícios
        </label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      
      {previewData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pré-visualização ({previewData.length} exercícios)</h3>
          <div className="border rounded-md max-h-60 overflow-y-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Descrição</th>
                  <th className="px-4 py-2 text-left text-xs font-medium">Categoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {previewData.map((exercise, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{exercise.name}</td>
                    <td className="px-4 py-2 text-sm">{exercise.description || '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      {categories.find(c => c.id === exercise.category_id)?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {uploading ? (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center">{uploadProgress}% completo</p>
            </div>
          ) : (
            <Button type="submit" className="w-full">
              Importar {previewData.length} exercícios
            </Button>
          )}
        </div>
      )}
    </form>
  );
};

export default BatchUploadForm;
