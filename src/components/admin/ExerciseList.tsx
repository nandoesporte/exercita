
import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Exercise {
  id: string;
  exercise: {
    id: string;
    name: string;
    description?: string | null;
  };
  sets: number;
  reps?: number | null;
  duration?: number | null;
  rest?: number | null;
  weight?: number | null;
  order_position: number;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onRemove: (id: string) => void;
  onMoveUp: (id: string, currentPosition: number) => void;
  onMoveDown: (id: string, currentPosition: number) => void;
  isLoading: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onRemove,
  onMoveUp,
  onMoveDown,
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
              <h3 className="font-medium">{exercise.exercise.name}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMoveUp(exercise.id, exercise.order_position)}
                disabled={index === 0}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMoveDown(exercise.id, exercise.order_position)}
                disabled={index === exercises.length - 1}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(exercise.id)}
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Séries:</span> {exercise.sets}
            </div>
            <div>
              {exercise.reps ? (
                <><span className="text-muted-foreground">Repetições:</span> {exercise.reps}</>
              ) : exercise.duration ? (
                <><span className="text-muted-foreground">Duração:</span> {exercise.duration}s</>
              ) : null}
            </div>
            {exercise.rest && (
              <div>
                <span className="text-muted-foreground">Descanso:</span> {exercise.rest}s
              </div>
            )}
            {exercise.weight && (
              <div className="flex items-center gap-1">
                <Weight className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Carga:</span> {exercise.weight} kg
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
