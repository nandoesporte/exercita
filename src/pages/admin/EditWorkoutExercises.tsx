
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useAdminWorkouts, WorkoutExercise } from '@/hooks/useAdminWorkouts';
import { useWorkout } from '@/hooks/useWorkouts';
import ExerciseList from '@/components/admin/ExerciseList';
import AddExerciseForm from '@/components/admin/AddExerciseForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the days of week options
const daysOfWeek = [
  { id: 'all', label: 'Todos os dias' },
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

const EditWorkoutExercises = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading: isWorkoutLoading } = useWorkout(id);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const { 
    exercises,
    areExercisesLoading,
    getWorkoutExercises,
    addExerciseToWorkout,
    isAddingExercise,
    removeExerciseFromWorkout,
    isRemovingExercise,
    updateExerciseOrder,
    isUpdatingExerciseOrder
  } = useAdminWorkouts();

  const { 
    data: workoutExercises = [], 
    isLoading: areWorkoutExercisesLoading 
  } = getWorkoutExercises(id || '', selectedDayOfWeek);

  const handleBackClick = () => {
    navigate('/admin/workouts');
  };

  const handleAddExercise = (exerciseData: WorkoutExercise) => {
    if (!id) return;
    
    addExerciseToWorkout({
      workoutId: id,
      exerciseData
    });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    if (!id) return;
    
    removeExerciseFromWorkout({
      exerciseId,
      workoutId: id
    });
  };

  const handleMoveUp = (exerciseId: string, currentPosition: number) => {
    if (!id || currentPosition <= 1) return;
    
    updateExerciseOrder({
      exerciseId,
      newPosition: currentPosition - 1,
      workoutId: id
    });
  };

  const handleMoveDown = (exerciseId: string, currentPosition: number) => {
    if (!id || currentPosition >= workoutExercises.length) return;
    
    updateExerciseOrder({
      exerciseId,
      newPosition: currentPosition + 1,
      workoutId: id
    });
  };

  const handleDayChange = (day: string) => {
    setSelectedDayOfWeek(day === 'all' ? null : day);
  };

  const isLoading = isWorkoutLoading || areExercisesLoading || areWorkoutExercisesLoading;
  const isActionLoading = isAddingExercise || isRemovingExercise || isUpdatingExerciseOrder;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBackClick}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          Editar Exercícios do Treino
          {workout && <span className="ml-2 text-muted-foreground">- {workout.title}</span>}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      ) : (
        <>
          {/* Day of Week Filter - Dropdown for mobile, Tabs for desktop */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <Calendar className="mr-2 h-4 w-4" />
              <h2 className="font-medium">Filtrar por dia</h2>
            </div>
            
            {isMobile ? (
              <Select defaultValue="all" onValueChange={handleDayChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar dia" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Tabs defaultValue="all" onValueChange={handleDayChange}>
                <TabsList className="flex overflow-x-auto w-full">
                  {daysOfWeek.map((day) => (
                    <TabsTrigger key={day.id} value={day.id} className="flex-shrink-0">
                      {day.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Lista de Exercícios</h2>
              <ExerciseList 
                exercises={workoutExercises}
                onRemove={handleRemoveExercise}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isLoading={areWorkoutExercisesLoading}
              />
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Adicionar Exercício</h2>
              <AddExerciseForm 
                exercises={exercises}
                onAddExercise={handleAddExercise}
                currentExerciseCount={workoutExercises.length}
                isLoading={isActionLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditWorkoutExercises;

