
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { 
  Clock, Dumbbell, BarChart, Play, Calendar, Info
} from 'lucide-react';
import { useWorkout } from '@/hooks/useWorkouts';
import { toast } from 'sonner';

// Import Shadcn Tabs components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExerciseDetail from '@/components/ExerciseDetail';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('exercises');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  
  const { data: workout, isLoading, error } = useWorkout(id);
  
  const handleBackClick = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <>
        <Header showBack onBackClick={handleBackClick} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
        </div>
      </>
    );
  }

  if (error || !workout) {
    return (
      <>
        <Header showBack onBackClick={handleBackClick} />
        <div className="container p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Workout not found</h2>
          <p className="text-muted-foreground mb-4">
            The workout you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/workouts" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fitness-green hover:bg-fitness-green/90"
          >
            Browse Workouts
          </Link>
        </div>
      </>
    );
  }

  const handleStartWorkout = () => {
    toast.info("This feature is coming soon!");
  }

  const handleScheduleWorkout = () => {
    toast.info("Scheduling feature is coming soon!");
  }

  const handleExerciseClick = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
  }

  const handleBackToExercises = () => {
    setSelectedExercise(null);
  }

  // If an exercise is selected, show its detail view
  if (selectedExercise) {
    const workoutExercise = workout.workout_exercises?.find(we => we.id === selectedExercise);
    if (workoutExercise) {
      return (
        <ExerciseDetail 
          workoutExercise={workoutExercise}
          onBack={handleBackToExercises}
        />
      );
    }
  }

  return (
    <>
      <Header showBack onBackClick={handleBackClick} />
      
      <main className="container pb-6">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={workout.image_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80'}
            alt={workout.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-white text-2xl md:text-3xl font-bold">{workout.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center text-white gap-1">
                <Clock size={14} />
                <span>{workout.duration} min</span>
              </div>
              <div className="flex items-center text-white gap-1">
                <Dumbbell size={14} />
                <span>{workout.level}</span>
              </div>
              <div className="flex items-center text-white gap-1">
                <BarChart size={14} />
                <span>{workout.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs using Shadcn UI Tabs */}
        <div className="mt-4">
          <Tabs defaultValue="exercises" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
              <TabsTrigger 
                value="exercises" 
                className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-fitness-green data-[state=active]:text-fitness-green rounded-none data-[state=active]:shadow-none"
              >
                Exercises
              </TabsTrigger>
              <TabsTrigger 
                value="overview" 
                className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-fitness-green data-[state=active]:text-fitness-green rounded-none data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="exercises" className="p-4 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Exercise List</h2>
              
              {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
                <div className="space-y-3">
                  {workout.workout_exercises
                    .sort((a, b) => a.order_position - b.order_position)
                    .map((workoutExercise, index) => (
                      <button 
                        key={workoutExercise.id}
                        onClick={() => handleExerciseClick(workoutExercise.id)}
                        className="w-full flex items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fitness-green/20 flex items-center justify-center text-fitness-green font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-grow">
                          <h3 className="font-medium">{workoutExercise.exercise.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {workoutExercise.sets} sets • {workoutExercise.reps ? `${workoutExercise.reps} reps` : `${workoutExercise.duration} sec`}
                          </div>
                        </div>
                        <div className="text-fitness-green">
                          <Info size={18} />
                        </div>
                      </button>
                    ))
                  }
                </div>
              ) : (
                <p className="text-muted-foreground">No exercises have been added to this workout yet.</p>
              )}

              {/* Action Buttons at the bottom */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={handleScheduleWorkout}
                  className="fitness-btn-secondary px-4 py-3 flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  <span>Schedule</span>
                </button>
                <button
                  onClick={handleStartWorkout}
                  className="fitness-btn-primary px-4 py-3 flex items-center justify-center gap-2"
                >
                  <Play size={18} />
                  <span>Start Workout</span>
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="p-4 animate-fade-in">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Description</h2>
                  <p className="text-muted-foreground">{workout.description || 'No description available.'}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-3">Category</h2>
                  <div className="flex flex-wrap gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: workout.category?.color || '#00CB7E',
                        color: 'white'
                      }}
                    >
                      {workout.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default WorkoutDetail;
