
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminWorkouts, WorkoutFormData } from '@/hooks/useAdminWorkouts';
import WorkoutForm from '@/components/admin/WorkoutForm';

const EditWorkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getWorkout, 
    updateWorkout, 
    isUpdating, 
    categories, 
    areCategoriesLoading,
    users,
    areUsersLoading
  } = useAdminWorkouts();
  
  const { data: workout, isLoading: isWorkoutLoading } = getWorkout(id || '');
  
  const handleBackClick = () => {
    navigate('/admin/workouts');
  };
  
  const handleSubmit = (formData: WorkoutFormData) => {
    if (!id) return;
    
    updateWorkout({ id, formData }, {
      onSuccess: () => {
        navigate('/admin/workouts');
      }
    });
  };
  
  const isLoading = isWorkoutLoading || areCategoriesLoading || areUsersLoading;
  
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={handleBackClick}
          className="p-2 hover:bg-muted rounded-full"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Edit Workout</h1>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading workout...</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-6">
          {workout && (
            <WorkoutForm 
              onSubmit={handleSubmit}
              isLoading={isUpdating}
              categories={categories}
              users={users}
              defaultValues={{
                title: workout.title,
                description: workout.description || '',
                duration: workout.duration,
                level: workout.level,
                category_id: workout.category_id || null,
                image_url: workout.image_url || '',
                calories: workout.calories || null,
                days_of_week: workout.days_of_week || [],
              }}
              isEditing={true}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EditWorkout;
