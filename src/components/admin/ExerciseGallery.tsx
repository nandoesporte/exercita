
import React from 'react';
import { Edit, Trash, FileVideo } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminExercise } from '@/hooks/useAdminExercises';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ExerciseGalleryProps {
  exercises: AdminExercise[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ExerciseGallery: React.FC<ExerciseGalleryProps> = ({ 
  exercises, 
  onEdit, 
  onDelete, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="aspect-square bg-muted"></div>
            <CardHeader className="p-3">
              <div className="h-4 bg-muted rounded-full w-3/4"></div>
            </CardHeader>
            <CardFooter className="p-3 pt-0 flex justify-between">
              <div className="h-9 bg-muted rounded-md w-full"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Nenhum exercício encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {exercises.map(exercise => (
        <Card key={exercise.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative">
            <AspectRatio ratio={1 / 1}>
              {exercise.image_url ? (
                <img
                  src={exercise.image_url}
                  alt={exercise.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <svg className="h-12 w-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </AspectRatio>
            {exercise.video_url && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileVideo className="h-3 w-3" />
                  Vídeo
                </Badge>
              </div>
            )}
          </div>

          <CardHeader className="p-3 pb-1">
            <h3 className="font-medium text-sm">{exercise.name}</h3>
            {exercise.category && (
              <Badge variant="outline" className="mt-1">
                {exercise.category.name}
              </Badge>
            )}
          </CardHeader>
          
          <CardFooter className="p-3 pt-0 flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(exercise.id)}
              className="flex-1 mr-1"
            >
              <Edit className="h-4 w-4 mr-1" /> 
              Editar
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDelete(exercise.id)}
              className="flex-1 text-destructive hover:text-destructive ml-1"
            >
              <Trash className="h-4 w-4 mr-1" /> 
              Deletar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ExerciseGallery;
