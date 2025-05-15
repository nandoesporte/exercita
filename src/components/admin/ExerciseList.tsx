
import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Edit, Weight, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminExercise } from '@/hooks/useAdminExercises';

interface ExerciseListProps {
  exercises: AdminExercise[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum exercício adicionado ainda. Utilize o formulário para adicionar exercícios.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => (
        <div 
          key={exercise.id}
          className="border rounded-lg p-4 bg-background"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </div>
              <h3 className="font-medium">{exercise.name || "Exercício desconhecido"}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(exercise.id)}
                className="h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(exercise.id)}
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {exercise.description && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Descrição:</span> {exercise.description}
              </div>
            )}
            {exercise.category && (
              <div>
                <span className="text-muted-foreground">Categoria:</span> {exercise.category.name}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
