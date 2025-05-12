import React from 'react';
import { ArrowLeft, Clock, Dumbbell } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Exercise = Database['public']['Tables']['exercises']['Row'];
type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'] & {
  exercise: Exercise;
  is_title_section?: boolean;
  section_title?: string | null;
};

interface ExerciseDetailProps {
  workoutExercise: WorkoutExercise;
  onBack: () => void;
}

const ExerciseDetail = ({ workoutExercise, onBack }: ExerciseDetailProps) => {
  // If this is a title section or has no exercise data, go back
  if (workoutExercise.is_title_section || !workoutExercise.exercise) {
    onBack();
    return null;
  }
  
  const { exercise, sets, reps, duration, rest } = workoutExercise;
  const isMobile = useIsMobile();
  const { profile } = useProfile();
  
  // Helper function for profile avatar
  const getInitials = () => {
    if (!profile) return 'U';
    
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };
  
  // Helper function to format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return null;
    
    // If duration is a multiple of 60, display in minutes
    if (seconds % 60 === 0 && seconds >= 60) {
      return {
        value: seconds / 60,
        unit: 'min'
      };
    }
    
    // Otherwise display in seconds
    return {
      value: seconds,
      unit: 'seg'
    };
  };
  
  const formattedDuration = formatDuration(duration);
  
  return (
    <>
      {/* Custom header for workout detail pages */}
      <header className="sticky top-0 z-40 w-full bg-fitness-dark/95 backdrop-blur-lg border-b border-fitness-darkGray/50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Back button */}
            <button 
              onClick={onBack} 
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
            src={exercise.image_url || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80'}
            alt={exercise.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-fitness-orange text-2xl md:text-3xl font-bold">{exercise.name}</h1>
          </div>
        </div>
        
        {/* Exercise Details */}
        <div className="mt-6 space-y-6">
          {/* Exercise Instructions */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-fitness-orange">Instruções</h2>
            <p className="text-muted-foreground">
              {exercise.description || 'Nenhuma instrução disponível para este exercício.'}
            </p>
          </div>
          
          {/* Exercise Parameters */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-fitness-orange">Parâmetros</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Dumbbell size={16} />
                  <span className="text-sm">Séries</span>
                </div>
                <p className="text-xl font-bold">{sets}</p>
              </div>
              
              {reps ? (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Dumbbell size={16} />
                    <span className="text-sm">Repetições</span>
                  </div>
                  <p className="text-xl font-bold">{reps}</p>
                </div>
              ) : (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Duração</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xl font-bold">
                          {formattedDuration ? `${formattedDuration.value} ${formattedDuration.unit}` : "0 seg"}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {formattedDuration && formattedDuration.unit === 'min' 
                            ? `${formattedDuration.value * 60} segundos` 
                            : formattedDuration 
                              ? `${formattedDuration.value} segundos`
                              : "0 segundos"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              
              {rest && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Descanso</span>
                  </div>
                  <p className="text-xl font-bold">{rest} seg</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Video if available */}
          {exercise.video_url && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-fitness-orange">Guia em Vídeo</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe 
                  src={exercise.video_url} 
                  className="w-full h-full"
                  title={`${exercise.name} guia em vídeo`}
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
              <span>Voltar para Lista de Exercícios</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ExerciseDetail;
