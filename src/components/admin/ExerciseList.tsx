
import React from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface Exercise {
  id: string;
  order_position: number;
  is_title_section?: boolean;
  section_title?: string | null;
  exercise?: {
    id: string;
    name: string;
  };
  sets?: number;
  reps?: number | null;
  duration?: number | null;
  rest?: number | null;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onRemove: (exerciseId: string) => void;
  onMoveUp: (exerciseId: string, currentPosition: number) => void;
  onMoveDown: (exerciseId: string, currentPosition: number) => void;
  isLoading?: boolean;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onRemove,
  onMoveUp,
  onMoveDown,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando exercícios...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="py-6 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
        <p className="text-muted-foreground">
          Nenhum exercício adicionado ainda. Use o formulário ao lado para adicionar exercícios ou títulos de seção.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {exercises.map((item) => (
        <div 
          key={item.id} 
          className={`p-3 border rounded-lg ${item.is_title_section ? 'bg-muted/50 border-primary/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                {item.order_position}
              </div>
              <div>
                {item.is_title_section ? (
                  <h3 className="font-bold text-primary">{item.section_title}</h3>
                ) : (
                  <>
                    <h3 className="font-medium">{item.exercise?.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.sets && `${item.sets} séries`}
                      {item.reps && ` • ${item.reps} reps`}
                      {item.duration && ` • ${item.duration} seg`}
                      {item.rest && ` • ${item.rest} seg descanso`}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onMoveUp(item.id, item.order_position)}
                disabled={item.order_position === 1}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onMoveDown(item.id, item.order_position)}
                disabled={item.order_position === exercises.length}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemove(item.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
