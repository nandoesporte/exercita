
import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Edit, Weight, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Create a more flexible type that can handle both AdminExercise and WorkoutExercise
interface ExerciseListProps {
  exercises: Array<{
    id: string;
    name?: string;
    category?: { name?: string; } | null;
    description?: string;
    image_url?: string;
    [key: string]: any; // Allow for additional properties
  }>;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveUp?: (id: string, position: number) => void;
  onMoveDown?: (id: string, position: number) => void;
  onRemove?: (id: string) => void;
  isLoading: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onRemove,
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

  // Helper to format duration in a readable way
  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined) return null;
    
    if (seconds >= 60 && seconds % 60 === 0) {
      return `${seconds / 60} min`;
    }
    return `${seconds} seg`;
  };

  const handleDelete = onDelete || onRemove;

  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => {
        // Handle both direct exercise objects and nested exercise objects
        const exerciseData = exercise.exercise || exercise;
        const imageUrl = exerciseData.image_url || exercise.image_url;
        const categoryName = exerciseData.category?.name || 
                            (exercise.category && exercise.category.name);
        
        return (
          <div 
            key={exercise.id}
            className="border rounded-lg p-4 bg-background"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 text-primary font-medium rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
                <h3 className="font-medium">{exercise.name || (exercise.exercise && exercise.exercise.name) || "Exercício desconhecido"}</h3>
              </div>
              <div className="flex items-center gap-1">
                {onMoveUp && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMoveUp(exercise.id, index + 1)}
                    disabled={index === 0}
                    className="h-8 w-8"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMoveDown(exercise.id, index + 1)}
                    disabled={index === exercises.length - 1}
                    className="h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(exercise.id)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {handleDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exercise.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Preview image/gif */}
            {imageUrl && (
              <div className="mb-3 aspect-video overflow-hidden rounded-md bg-muted">
                <img 
                  src={imageUrl} 
                  alt={exercise.name || "Exercise preview"} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              {(exercise.description || (exercise.exercise && exercise.exercise.description)) && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Descrição:</span> {exercise.description || (exercise.exercise && exercise.exercise.description)}
                </div>
              )}
              {categoryName && (
                <div>
                  <span className="text-muted-foreground">Categoria:</span> {categoryName}
                </div>
              )}
              {exercise.sets && (
                <div>
                  <span className="text-muted-foreground">Séries:</span> {exercise.sets}
                </div>
              )}
              {exercise.reps && (
                <div>
                  <span className="text-muted-foreground">Repetições:</span> {exercise.reps}
                </div>
              )}
              {exercise.duration !== undefined && exercise.duration !== null && (
                <div>
                  <span className="text-muted-foreground">Duração:</span> {formatDuration(exercise.duration)}
                </div>
              )}
              {exercise.rest !== undefined && exercise.rest !== null && (
                <div>
                  <span className="text-muted-foreground">Descanso:</span> {
                    exercise.rest >= 60 && exercise.rest % 60 === 0
                      ? `${exercise.rest / 60} min`
                      : `${exercise.rest} seg`
                  }
                </div>
              )}
              {exercise.weight && (
                <div>
                  <span className="text-muted-foreground">Peso:</span> {exercise.weight}kg
                </div>
              )}
              {exercise.day_of_week && (
                <div>
                  <span className="text-muted-foreground">Dia:</span> {exercise.day_of_week}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExerciseList;
