
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminWorkouts, WorkoutExercise } from '@/hooks/useAdminWorkouts';
import { useWorkout } from '@/hooks/useWorkouts';
import ExerciseList from '@/components/admin/ExerciseList';
import AddExerciseForm from '@/components/admin/AddExerciseForm';

const EditWorkoutExercises = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading: isWorkoutLoading } = useWorkout(id);
  
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
  } = getWorkoutExercises(id || '');

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

  const isLoading = isWorkoutLoading || areExercisesLoading || areWorkoutExercisesLoading;
  const isActionLoading = isAddingExercise || isRemovingExercise || isUpdatingExerciseOrder;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBackClick}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          Edit Workout Exercises
          {workout && <span className="ml-2 text-muted-foreground">- {workout.title}</span>}
        </h1>
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Exercise List</h2>
            <ExerciseList 
              exercises={workoutExercises}
              onRemove={handleRemoveExercise}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isLoading={areWorkoutExercisesLoading}
            />
          </div>
          
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Add Exercise</h2>
            <AddExerciseForm 
              exercises={exercises}
              onAddExercise={handleAddExercise}
              currentExerciseCount={workoutExercises.length}
              isLoading={isActionLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EditWorkoutExercises;
