import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Clock, Dumbbell, BarChart, Info, Check, HeartPulse
} from 'lucide-react';
import { useWorkout } from '@/hooks/useWorkouts';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import Shadcn Tabs components
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ExerciseDetail from '@/components/ExerciseDetail';
import { Button } from '@/components/ui/button';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('exercises');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  
  const { data: workout, isLoading, error } = useWorkout(id);
  
  const handleBackClick = () => {
    navigate(-1);
  };

  // Helper function for profile avatar
  const getInitials = () => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-green"></div>
        </div>
      </>
    );
  }

  if (error || !workout) {
    return (
      <>
        <div className="container p-4 text-center">
          <h2 className="text-xl font-bold mb-2">Treino não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O treino que você está procurando não existe ou foi removido.
          </p>
          <Link 
            to="/workouts" 
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fitness-green hover:bg-fitness-green/90"
          >
            Explorar Treinos
          </Link>
        </div>
      </>
    );
  }

  const handleWorkoutCompleted = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        toast.error("Você precisa estar logado para registrar um treino.");
        return;
      }
      
      // Record the workout in history
      const { error } = await supabase
        .from('user_workout_history')
        .insert({
          user_id: user.user.id,
          workout_id: workout.id,
          completed_at: new Date().toISOString(),
          duration: workout.duration,
          calories_burned: workout.calories
        });
      
      if (error) {
        console.error("Error recording workout:", error);
        toast.error("Erro ao registrar treino.");
        return;
      }
      
      toast.success("Treino marcado como concluído!");
      
      // Navigate to history page after short delay
      setTimeout(() => {
        navigate('/history');
      }, 1000);
      
    } catch (error) {
      console.error("Error completing workout:", error);
      toast.error("Erro ao registrar treino.");
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Custom header for workout detail pages */}
      <header className="sticky top-0 z-40 w-full bg-fitness-dark/95 backdrop-blur-lg border-b border-fitness-darkGray/50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Back button */}
            <button 
              onClick={handleBackClick} 
              className="p-2 rounded-full hover:bg-fitness-darkGray/60 active:scale-95 transition-all"
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M19 12H5M5 12L12 19M5 12L12 5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          
          {/* App Logo for Mobile (centered) */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 flex items-center ${!isMobile && 'hidden'}`}>
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/abe8bbb7-7e2f-4277-b5b0-1f923e57b6f7.png"
                alt="Mais Saúde Logo"
                className="h-10 w-10"
              />
              <span className="font-extrabold text-xl text-white">Mais Saúde</span>
            </Link>
          </div>

          {/* App Logo for Desktop (left aligned) */}
          {!isMobile && (
            <div className="flex-1 flex justify-center">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/abe8bbb7-7e2f-4277-b5b0-1f923e57b6f7.png"
                  alt="Mais Saúde Logo"
                  className="h-10 w-10"
                />
                <span className="font-extrabold text-xl text-white">Mais Saúde</span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            {/* Profile Icon */}
            <Link 
              to="/profile" 
              className="p-1 rounded-full hover:bg-fitness-darkGray/60 active:scale-95 transition-all"
            >
              <Avatar className="h-8 w-8 border-2 border-fitness-green">
                <AvatarImage 
                  src={profile?.avatar_url || ''} 
                  alt={`${profile?.first_name || 'Usuário'}'s profile`} 
                />
                <AvatarFallback className="bg-fitness-dark text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container pb-6">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={workout.image_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80'}
            alt={workout.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-fitness-orange text-2xl md:text-3xl font-bold">{workout.title}</h1>
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
        
        {/* Tabs using Shadcn UI Tabs - Updated with more modern and rounded styling */}
        <div className="mt-4">
          <Tabs defaultValue="exercises" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full justify-start bg-fitness-darkGray/30 p-1 rounded-xl overflow-hidden">
              <TabsTrigger 
                value="exercises" 
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-fitness-orange data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Exercícios
              </TabsTrigger>
              <TabsTrigger 
                value="overview" 
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-fitness-orange data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                Visão Geral
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="exercises" className="p-4 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4 text-fitness-orange">Lista de Exercícios</h2>
              
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
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-fitness-orange/20 flex items-center justify-center text-fitness-orange font-medium">
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-grow">
                          <h3 className="font-medium">{workoutExercise.exercise.name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {workoutExercise.sets} séries • {workoutExercise.reps ? `${workoutExercise.reps} repetições` : `${workoutExercise.duration} seg`}
                          </div>
                        </div>
                        <div className="text-fitness-orange">
                          <Info size={18} />
                        </div>
                      </button>
                    ))
                  }
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum exercício foi adicionado a este treino ainda.</p>
              )}

              {/* Single "Workout Completed" Button */}
              <div className="mt-6">
                <Button
                  onClick={handleWorkoutCompleted}
                  disabled={isSubmitting}
                  className="w-full fitness-btn-primary px-4 py-3 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <Check size={18} />
                  )}
                  <span>Treino Concluído!</span>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="overview" className="p-4 animate-fade-in">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-fitness-orange">Descrição</h2>
                  <p className="text-muted-foreground">{workout.description || 'Nenhuma descrição disponível.'}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-3 text-fitness-orange">Categoria</h2>
                  <div className="flex flex-wrap gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ 
                        backgroundColor: workout.category?.color || '#00CB7E',
                        color: 'white'
                      }}
                    >
                      {workout.category?.name || 'Sem categoria'}
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
