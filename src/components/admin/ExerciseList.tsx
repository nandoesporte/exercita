
import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

type Exercise = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

type WorkoutExercise = {
  id: string;
  sets?: number | null;
  reps?: number | null;
  duration?: number | null;
  rest?: number | null;
  order_position: number;
  exercise: Exercise;
}

interface ExerciseListProps {
  exercises: WorkoutExercise[];
  onRemove: (id: string) => void;
  onMoveUp: (id: string, currentPosition: number) => void;
  onMoveDown: (id: string, currentPosition: number) => void;
  isLoading?: boolean;
}

const ExerciseList = ({ 
  exercises, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  isLoading 
}: ExerciseListProps) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading exercises...</p>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-muted-foreground/20 rounded-lg">
        <p className="text-muted-foreground">No exercises added to this workout yet.</p>
        <p className="text-xs mt-1">Use the form below to add exercises.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exercises.map((item) => (
        <div 
          key={item.id}
          className="flex items-center gap-3 p-3 bg-card border rounded-md"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {item.order_position}
          </div>
          
          <div className="flex-grow">
            <h4 className="font-medium text-sm">{item.exercise.name}</h4>
            <p className="text-xs text-muted-foreground">
              {item.sets} sets {item.reps ? `• ${item.reps} reps` : ''} 
              {item.duration ? `• ${item.duration}s` : ''}
              {item.rest ? ` • ${item.rest}s rest` : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onMoveUp(item.id, item.order_position)}
              disabled={item.order_position <= 1}
            >
              <ArrowUp size={16} />
              <span className="sr-only">Move up</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onMoveDown(item.id, item.order_position)}
              disabled={item.order_position >= exercises.length}
            >
              <ArrowDown size={16} />
              <span className="sr-only">Move down</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 size={16} />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExerciseList;
