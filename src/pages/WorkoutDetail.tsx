
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { 
  Clock, Dumbbell, BarChart, Play, BookOpen, Calendar
} from 'lucide-react';
import { useWorkout } from '@/hooks/useWorkouts';
import { toast } from 'sonner';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
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
    // For now just show a toast, we'll implement this feature later
    toast.info("This feature is coming soon!");
  }

  const handleScheduleWorkout = () => {
    // For now just show a toast, we'll implement this feature later
    toast.info("Scheduling feature is coming soon!");
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
        
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'overview' 
                ? 'border-b-2 border-fitness-green text-fitness-green' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'exercises' 
                ? 'border-b-2 border-fitness-green text-fitness-green' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('exercises')}
          >
            Exercises
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'overview' ? (
            <div className="space-y-6 animate-fade-in">
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
              
              <div className="grid grid-cols-2 gap-4">
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
            </div>
          ) : (
            <div className="animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Exercise List</h2>
              
              {workout.workout_exercises && workout.workout_exercises.length > 0 ? (
                <div className="space-y-3">
                  {workout.workout_exercises
                    .sort((a, b) => a.order_position - b.order_position)
                    .map((workoutExercise, index) => (
                      <div key={workoutExercise.id} className="flex items-center p-3 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fitness-green/20 flex items-center justify-center text-fitness-green font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-grow">
                          <h3 className="font-medium">{workoutExercise.exercise.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {workoutExercise.sets} sets • {workoutExercise.reps ? `${workoutExercise.reps} reps` : `${workoutExercise.duration} sec`}
                          </div>
                        </div>
                        <button
                          onClick={() => toast.info(`Exercise details coming soon!`)}
                          className="p-2 text-fitness-green hover:bg-fitness-green/10 rounded-full"
                        >
                          <BookOpen size={18} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-muted-foreground">No exercises have been added to this workout yet.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default WorkoutDetail;
