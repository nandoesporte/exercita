
import React from 'react';
import { ArrowLeft, Clock, Dumbbell } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Database } from '@/integrations/supabase/types';

type Exercise = Database['public']['Tables']['exercises']['Row'];
type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'] & {
  exercise: Exercise;
};

interface ExerciseDetailProps {
  workoutExercise: WorkoutExercise;
  onBack: () => void;
}

const ExerciseDetail = ({ workoutExercise, onBack }: ExerciseDetailProps) => {
  const { exercise, sets, reps, duration, rest } = workoutExercise;
  
  return (
    <>
      <Header showBack onBackClick={onBack} />
      
      <main className="container pb-6">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={exercise.image_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80'}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-white text-2xl md:text-3xl font-bold">{exercise.name}</h1>
          </div>
        </div>
        
        {/* Exercise Details */}
        <div className="mt-6 space-y-6">
          {/* Exercise Instructions */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Instructions</h2>
            <p className="text-muted-foreground">
              {exercise.description || 'No instructions available for this exercise.'}
            </p>
          </div>
          
          {/* Exercise Parameters */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Parameters</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Dumbbell size={16} />
                  <span className="text-sm">Sets</span>
                </div>
                <p className="text-xl font-bold">{sets}</p>
              </div>
              
              {reps ? (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Dumbbell size={16} />
                    <span className="text-sm">Reps</span>
                  </div>
                  <p className="text-xl font-bold">{reps}</p>
                </div>
              ) : (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="text-xl font-bold">{duration} sec</p>
                </div>
              )}
              
              {rest && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Rest</span>
                  </div>
                  <p className="text-xl font-bold">{rest} sec</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Video if available */}
          {exercise.video_url && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Video Guide</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe 
                  src={exercise.video_url} 
                  className="w-full h-full"
                  title={`${exercise.name} video guide`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          {/* Back button */}
          <div className="pt-4">
            <button
              onClick={onBack}
              className="fitness-btn-secondary w-full flex items-center justify-center gap-2 py-3"
            >
              <ArrowLeft size={18} />
              <span>Back to Exercise List</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ExerciseDetail;
