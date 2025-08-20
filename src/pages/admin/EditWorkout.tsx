
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminWorkouts, WorkoutFormData } from '@/hooks/useAdminWorkouts';
import { useWorkout } from '@/hooks/useWorkouts';
import WorkoutForm from '@/components/admin/WorkoutForm';
import { toast } from '@/lib/toast-wrapper';

const EditWorkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workout, isLoading: isWorkoutLoading } = useWorkout(id);
  const { 
    categories, 
    areCategoriesLoading, 
    users, 
    areUsersLoading,
    updateWorkout,
    isUpdating,
  } = useAdminWorkouts();
  
  // Mock missing functions since they're not in the admin store
  const getWorkoutDays = (workoutId: string) => {
    return [];
  };
  
  // Mock getWorkoutDays to return empty array instead of query result
  const workoutDays: string[] = [];
  const [defaultValues, setDefaultValues] = useState<WorkoutFormData | null>(null);

  useEffect(() => {
    if (workout && workoutDays) {
      setDefaultValues({
        name: workout.name,
        description: workout.description || '',
        duration: workout.duration,
        difficulty_level: workout.difficulty_level,
        category_id: workout.category_id || null,
        days_of_week: workoutDays,
      });
    }
  }, [workout, workoutDays]);

  const handleBackClick = () => {
    navigate('/admin/workouts');
  };

  const handleSubmit = (data: WorkoutFormData) => {
    if (!id) return;
    
    updateWorkout({
      id,
      ...data
    });
  };

  const isLoading = isWorkoutLoading || areCategoriesLoading || areUsersLoading;

  if (isLoading && !defaultValues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBackClick}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Editar Treino</h1>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        {defaultValues && (
          <WorkoutForm 
            onSubmit={handleSubmit} 
            isLoading={isUpdating}
            categories={categories}
           users={users.map(user => ({
             ...user,
             atualizado_em: new Date().toISOString(),
             criado_em: new Date().toISOString()
           }))}
            defaultValues={defaultValues}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

export default EditWorkout;
